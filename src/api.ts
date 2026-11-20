import * as keyService from './service/key'
import * as util from './util'
import type * as schema from './service/d1/schema'

const PROVIDER_CUSTOM_AUTH_HEADER: Record<string, string> = {
    'google-ai-studio': 'x-goog-api-key',
    anthropic: 'x-api-key',
    elevenlabs: 'x-api-key',
    'azure-openai': 'api-key',
    cartesia: 'X-API-Key'
}

function getAuthHeaderName(provider: string): string {
    return PROVIDER_CUSTOM_AUTH_HEADER[provider] || 'Authorization'
}

export async function handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const restResource = url.pathname.substring('/api/'.length) + url.search

    const provider = restResource.split('/')[0]
    const authKey = getAuthKey(request, provider)
    const realProviderAndModel = await extractRealProviderAndModel(request, restResource, provider)
    if (!realProviderAndModel) {
        return new Response('Not supported request: valid provider or model not found', { status: 400 })
    }

    if (!util.isApiRequestAllowed(authKey, env.AUTH_KEY, realProviderAndModel.provider, realProviderAndModel.model)) {
        return new Response('Invalid auth key', { status: 403 })
    }

    return await forward(request, env, ctx, restResource, realProviderAndModel.provider, realProviderAndModel.model)
}

async function extractRealProviderAndModel(
    request: Request,
    restResource: string,
    provider: string
): Promise<{ provider: string; model: string } | null> {
    const model = await extractModel(request, restResource)
    if (!model) {
        return null
    }

    if (provider === 'compat') {
        const firstSlashIndex = model.indexOf('/')
        if (firstSlashIndex === -1) {
            return null
        }

        const realProvider = model.substring(0, firstSlashIndex)
        let realModel = model.substring(firstSlashIndex + 1)

        if (!realProvider || !realModel) {
            return null
        }

        // Preserve full strings for providers that use namespace/slashes in model names
        if (realProvider === 'nvidia' || realProvider === 'custom-nvidia') {
            realModel = model
            return { provider: 'nvidia', model: realModel }
        }

        // 🚨 FIX: Strip the 'workers-ai/' prefix for Workers AI
        if (realProvider === 'workers-ai') {
            const strippedModel = model.replace(/^workers-ai\//, '');
            return { provider: 'workers-ai', model: strippedModel }
        }

        if (realProvider === 'openrouter') {
            return { provider: 'openrouter', model: model }
        }

        return { provider: realProvider, model: realModel }
    }

    return { provider, model }
}

async function extractModel(request: Request, restResource: string): Promise<string | null> {
    if (request.method === 'POST' && request.body) {
        const model = await extractModelFromBody(request)
        if (model) return model
    }

    return extractModelFromPath(restResource)
}

async function extractModelFromBody(request: Request): Promise<string | null> {
    try {
        const body = (await request.clone().json()) as { model: string }
        return body.model || null
    } catch {
        return null
    }
}

function extractModelFromPath(restResource: string): string | null {
    const parts = restResource.split('/models/')
    if (parts.length > 1) {
        return parts[1].split(':')[0]
    }

    return null
}

async function forward(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    restResource: string,
    provider: string,
    model: string
): Promise<Response> {
    const activeKeys = await keyService.listActiveKeysViaCache(env, provider)
    if (activeKeys.length === 0) {
        return new Response('No active keys available', { status: 503 })
    }

    const body = request.body ? await request.arrayBuffer() : null
    let finalBody = body;

    // --- BODY REWRITING FIXES ---
    if (body) {
        try {
            const text = new TextDecoder().decode(body);
            const jsonBody = JSON.parse(text);
            let modified = false;

            // 1. Google AI Studio: Strip 'store' because it rejects OpenAI params
            if (provider === 'google-ai-studio' && jsonBody.store !== undefined) {
                delete jsonBody.store;
                modified = true;
                console.log('Stripped "store" field for Google AI Studio');
            }

            // 2. Workers AI: Strip 'workers-ai/' prefix from the model name inside the JSON body
            if (provider === 'workers-ai' && typeof jsonBody.model === 'string' && jsonBody.model.startsWith('workers-ai/')) {
                jsonBody.model = jsonBody.model.replace(/^workers-ai\//, '');
                modified = true;
                console.log(`Stripped "workers-ai/" from body. New model: ${jsonBody.model}`);
            }

            if (modified) {
                finalBody = new TextEncoder().encode(JSON.stringify(jsonBody)).buffer;
            }
        } catch (e) {
            console.error(`Failed to parse/modify body for ${provider}:`, e);
        }
    }
    // ----------------------------

    // 🚨 FIX: Rewrite the URL for Workers AI to use the native endpoint
    let finalRestResource = restResource;
    if (provider === 'workers-ai' && restResource.startsWith('compat/')) {
        finalRestResource = 'workers-ai/v1/chat/completions';
    }

    const MAX_RETRIES = 3
    for (let i = 0; i < MAX_RETRIES; i++) {
        if (activeKeys.length === 0) {
            return new Response('No active keys available', { status: 503 })
        }

        const selectedKey = await selectKey(activeKeys, model)
        const reqToGateway = await makeGatewayRequest(
            request.method,
            request.headers,
            finalBody,
            env,
            finalRestResource,
            selectedKey.key,
            selectedKey.accountId
        )
        const respFromGateway = await fetch(reqToGateway)
        const status = respFromGateway.status
        switch (status) {
            case 400:
                if (!(await keyIsInvalid(respFromGateway, provider))) {
                    return respFromGateway
                }
            case 401:
            case 403:
                ctx.waitUntil(keyService.setKeyStatus(env, provider, selectedKey.id, 'blocked'))
                console.error(
                    `key ${selectedKey.key} is blocked due to ${respFromGateway.status} ${await respFromGateway.text()}`
                )
                if (activeKeys.length < 500) {
                    activeKeys.splice(activeKeys.indexOf(selectedKey), 1)
                }
                continue

            case 429:
                const sec = await analyze429CooldownSeconds(env, respFromGateway, provider, selectedKey.key)
                ctx.waitUntil(keyService.setKeyModelCooldownIfAvailable(env, selectedKey.id, provider, model, sec))
                console.warn(
                    `key ${selectedKey.key} is cooling down for model ${model} due to 429 ${await respFromGateway.text()}`
                )
                if (activeKeys.length < 500) {
                    activeKeys.splice(activeKeys.indexOf(selectedKey), 1)
                }
                continue

            case 500:
            case 502:
            case 503:
            case 504:
                console.error(`gateway returned 5xx ${await respFromGateway.text()}`)
                await new Promise(r => setTimeout(r, 1000))
                continue
        }

        if (status / 100 === 2) {
            consecutive429Count.delete(selectedKey.id)
        } else {
            console.error(`gateway returned ${status}`)
        }
        return respFromGateway
    }

    return new Response('Internal server error after retries', { status: 500 })
}

function getAuthKey(request: Request, provider: string): string {
    if (provider === 'google-ai-studio') {
        const key = new URL(request.url).searchParams.get('key')
        if (key) {
            return key
        }
    }
    return getAuthKeyFromHeader(request, provider)
}

function getAuthKeyFromHeader(request: Request, provider: string): string {
    const h = getAuthHeaderName(provider)
    let v = request.headers.get(h)
    if (!v) {
        return ''
    }
    let key = v
    if (h === 'Authorization') {
        key = v.replace(/^Bearer\s+/, '')
    }
    return key
}

async function selectKey(keys: schema.Key[], model: string): Promise<schema.Key> {
    let selectedKey = tryRandomSelect(keys, model)
    if (selectedKey) {
        return selectedKey
    }
    return selectFromAllKeys(keys, model)
}

function tryRandomSelect(keys: schema.Key[], model: string): schema.Key | null {
    const now = Date.now() / 1000
    const maxAttempts = 10
    for (let i = 0; i < maxAttempts; i++) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)]
        const coolingEnd = randomKey.modelCoolings?.[model]?.end_at
        if (!coolingEnd || coolingEnd < now) {
            console.info(`selected a key ${randomKey.key} to try; count: ${i + 1}`)
            return randomKey
        }
    }
    return null
}

function selectFromAllKeys(keys: schema.Key[], model: string): schema.Key {
    const now = Date.now() / 1000
    const availableKeys = []
    let bestCoolingKey: schema.Key | null = null
    let earliestCooldownEnd = Infinity

    for (const key of keys) {
        const coolingEnd = key.modelCoolings?.[model]?.end_at
        if (!coolingEnd || coolingEnd < now) {
            availableKeys.push(key)
        } else if (coolingEnd < earliestCooldownEnd) {
            earliestCooldownEnd = coolingEnd
            bestCoolingKey = key
        }
    }

    if (availableKeys.length > 0) {
        const selectedKey = availableKeys[Math.floor(Math.random() * availableKeys.length)]
        console.info(`selected available key ${selectedKey.key} after full scan`)
        return selectedKey
    }

    console.warn(`selected a cooling key ${bestCoolingKey?.key} to try`)
    return bestCoolingKey!
}

// Add this helper function at the bottom of api.ts or above makeGatewayRequest
async function generateStableCacheKey(body: ArrayBuffer | null): Promise<string | null> {
    if (!body) return null;
    try {
        // Decode the body to a string
        const bodyText = new TextDecoder().decode(body);
        // Hash it
        const msgBuffer = new TextEncoder().encode(bodyText);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
        return null;
    }
}

async function makeGatewayRequest(
    method: string,
    headers: Headers,
    body: ArrayBuffer | null,
    env: Env,
    restResource: string,
    key: string,
    accountId?: string
): Promise<Request> {
    const newHeaders = new Headers(headers)
    newHeaders.delete('content-length')

    setAuthHeader(newHeaders, restResource, key)

    // 🚨 CACHE FIX: Set a stable cache key based on the request body
    if (body) {
        const cacheKey = await generateStableCacheKey(body);
        if (cacheKey) {
            newHeaders.set('cf-aig-cache-key', cacheKey);
        }
    }

    let url = ''

    // Bypass AI Gateway for cross-account Workers AI keys
    if (restResource.startsWith('workers-ai/') && accountId) {
        url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`
    } else {
        if (accountId) {
            newHeaders.set('cf-account-id', accountId)
        }
        if (env.CF_AIG_TOKEN) {
            newHeaders.set('cf-aig-authorization', `Bearer ${env.CF_AIG_TOKEN}`)
        }

        const selected = selectGateway(env)
        let base = await env.AI.gateway(selected).getUrl()
        if (!base.endsWith('/')) {
            base += '/'
        }
        url = `${base}${restResource}`
    }

    return new Request(url, {
        method: method,
        headers: newHeaders,
        body: body,
        redirect: 'follow'
    })
}

function selectGateway(env: Env): string {
    const gateways = env.AI_GATEWAY.split(',').map(s => s.trim())
    const selected = gateways[Math.floor(Math.random() * gateways.length)]
    console.info(`selected gateway ${selected}`)
    return selected
}

function setAuthHeader(headers: Headers, restResource: string, key: string) {
    const provider = restResource.split('/')[0]
    let v = key
    const h = getAuthHeaderName(provider)
    if (h == 'Authorization') {
        v = `Bearer ${key}`
    }
    headers.set(h, v)
}

async function keyIsInvalid(respFromGateway: Response, provider: string): Promise<boolean> {
    if (provider !== 'google-ai-studio') {
        return false
    }
    if (respFromGateway.status !== 400) {
        return false
    }
    try {
        const body = await respFromGateway.clone().json()
        const detail = getGoogleAiStudioErrorDetail(body, 'type.googleapis.com/google.rpc.ErrorInfo')
        return detail?.reason === 'API_KEY_INVALID'
    } catch {
        return false
    }
}

let consecutive429Count: Map<string, number> = new Map()

async function analyze429CooldownSeconds(
    env: Env,
    respFromGateway: Response,
    provider: string,
    key: string
): Promise<number> {
    const count = (consecutive429Count.get(key) || 0) + 1
    consecutive429Count.set(key, count)

    if (count >= Number(env.CONSECUTIVE_429_THRESHOLD)) {
        consecutive429Count.delete(key)
        console.error(`key ${key} triggered long cooldown after ${env.CONSECUTIVE_429_THRESHOLD} consecutive 429s`)
        return untilResetForDay(provider)
    }

    return untilReset(respFromGateway, provider)
}

function untilResetForDay(provider: string): number {
    if (provider === 'google-ai-studio') {
        return util.getSecondsUntilMidnightPT()
    }
    if (provider === 'openrouter' || provider === 'workers-ai') {
        return util.getSecondsUntilMidnightUTC()
    }
    return 24 * 60 * 60
}

async function untilReset(respFromGateway: Response, provider: string): Promise<number> {
    if (provider === 'google-ai-studio') {
        return untilResetForGoogleAiStudio(respFromGateway)
    }
    if (provider === 'openrouter') {
        return untilResetForOpenrouter(respFromGateway)
    }
    return 65
}

async function untilResetForGoogleAiStudio(respFromGateway: Response): Promise<number> {
    try {
        const errorBody = await respFromGateway.clone().json()
        const quotaFailureDetail = getGoogleAiStudioErrorDetail(
            errorBody,
            'type.googleapis.com/google.rpc.QuotaFailure'
        )
        if (quotaFailureDetail) {
            const violations = quotaFailureDetail.violations || []
            for (const violation of violations) {
                if (violation.quotaId === 'GenerateRequestsPerDayPerProjectPerModel-FreeTier') {
                    return util.getSecondsUntilMidnightPT()
                }
            }
        }

        const retryInfoDetail = getGoogleAiStudioErrorDetail(errorBody, 'type.googleapis.com/google.rpc.RetryInfo')
        if (retryInfoDetail && retryInfoDetail.retryDelay) {
            const retrySeconds = parseInt(retryInfoDetail.retryDelay.replace('s', ''))
            return retrySeconds + 2
        }
    } catch (error) {
        console.error('failed to parse google-ai-studio 429 response, fallback to 65 seconds', error)
    }
    return 65
}

async function untilResetForOpenrouter(respFromGateway: Response): Promise<number> {
    try {
        const resetHeader = respFromGateway.headers.get('X-RateLimit-Reset')
        if (resetHeader) {
            const resetTime = parseInt(resetHeader)
            const now = Date.now()
            if (resetTime > now) {
                const cooldownSeconds = Math.floor((resetTime - now) / 1000) + 5
                return cooldownSeconds
            }
        }
    } catch (error) {
        console.error('failed to parse openrouter 429 response, fallback to 65 seconds', error)
    }
    return 65
}

function getGoogleAiStudioErrorDetail(body: any, type: string): any | null {
    let errorBody = body
    if (Array.isArray(body) && body.length > 0) {
        errorBody = body[0]
    }
    const details = errorBody.error?.details || []
    for (const detail of details) {
        if (detail['@type'] === type) {
            return detail
        }
    }
    return null
}
