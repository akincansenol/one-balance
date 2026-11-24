import { STYLES } from "./styles"
import * as keyService from './service/key'
import * as util from './util'
import type * as schema from './service/d1/schema'

const PROVIDER_CONFIGS = {
    'google-ai-studio': {
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'from-blue-50 to-indigo-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/ai-studio-google/default.svg'
    },
    'google-vertex-ai': {
        color: 'from-blue-600 to-cyan-500',
        bgColor: 'from-blue-50 to-cyan-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/google-cloud/default.svg'
    },
    anthropic: {
        color: 'from-orange-500 to-amber-600',
        bgColor: 'from-orange-50 to-amber-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/anthropic/default.svg'
    },
    'azure-openai': {
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'from-blue-50 to-cyan-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/azure-azure-openai/default.svg'
    },
    'aws-bedrock': {
        color: 'from-orange-500 to-yellow-500',
        bgColor: 'from-orange-50 to-yellow-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/bedrock-aws/default.svg'
    },
    cartesia: {
        color: 'from-purple-500 to-pink-500',
        bgColor: 'from-purple-50 to-pink-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/cartesia/default.svg'
    },
    cerebras: {
        color: 'from-red-500 to-orange-500',
        bgColor: 'from-red-50 to-orange-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/cerebras/default.svg'
    },
    cohere: {
        color: 'from-green-500 to-emerald-600',
        bgColor: 'from-green-50 to-emerald-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/cohere/default.svg'
    },
    deepseek: {
        color: 'from-indigo-500 to-blue-600',
        bgColor: 'from-indigo-50 to-blue-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/deepseek/default.svg'
    },
    elevenlabs: {
        color: 'from-pink-500 to-rose-600',
        bgColor: 'from-pink-50 to-rose-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/elevenlabs/default.svg'
    },
    grok: {
        color: 'from-slate-700 to-gray-900',
        bgColor: 'from-slate-50 to-gray-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/grok/default.svg'
    },
    groq: {
        color: 'from-orange-500 to-red-500',
        bgColor: 'from-orange-50 to-red-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/groq/default.svg'
    },
    huggingface: {
        color: 'from-yellow-500 to-amber-500',
        bgColor: 'from-yellow-50 to-amber-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/huggingface/default.svg'
    },
    mistral: {
        color: 'from-blue-500 to-indigo-500',
        bgColor: 'from-blue-50 to-indigo-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mistral/default.svg'
    },
    openai: {
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'from-emerald-50 to-teal-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/openai/default.svg'
    },
    openrouter: {
        color: 'from-purple-500 to-violet-600',
        bgColor: 'from-purple-50 to-violet-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/openrouter/default.svg'
    },
    'perplexity-ai': {
        color: 'from-cyan-500 to-blue-500',
        bgColor: 'from-cyan-50 to-blue-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/perplexity/default.svg'
    },
    replicate: {
        color: 'from-gray-700 to-slate-900',
        bgColor: 'from-gray-50 to-slate-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/replicate/default.svg'
    },
    // --- New Providers ---
    nvidia: {
        color: 'from-green-500 to-emerald-600',
        bgColor: 'from-green-50 to-emerald-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/nvidia-badge/default.svg'
    },
    'workers-ai': {
        color: 'from-orange-400 to-yellow-500',
        bgColor: 'from-orange-50 to-yellow-50',
        iconUrl: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/cloudflare/default.svg'
    }
} as const

const PROVIDERS = Object.keys(PROVIDER_CONFIGS)

function htmlResponse(html: string, extraHeaders?: Headers): Response {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'text/html;charset=UTF-8');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  return new Response(html, { headers });
}

export async function handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (pathname === '/login' && request.method === 'POST') {
        return handleLogin(request, env)
    }

    if (pathname === '/logout' && request.method === 'GET') {
        return handleLogout(request)
    }

    if (pathname.startsWith('/keys') || pathname === '/') {
        return handleKeys(request, env)
    }

    return new Response('Not Found', { status: 404 })
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
    const formData = await request.formData()
    const submittedToken = formData.get('csrf_token')
    if (!safeEqual(submittedToken, getCookie(request, 'csrf_token'))) {
        return new Response('Invalid CSRF token', { status: 403 })
    }
    const key = formData.get('auth_key') as string

    if (util.isWebUiRequestAllowed(key, env.AUTH_KEY)) {
        const headers = new Headers()
        headers.append('Set-Cookie', `auth_key=${key}; HttpOnly; Path=/; SameSite=Strict; Max-Age=2147483647`)
        headers.append('Set-Cookie', 'csrf_token=; Path=/; SameSite=Strict; Secure; Max-Age=0')
        headers.set('Location', '/keys')
        return new Response(null, { status: 302, headers })
    }

    return new Response('Invalid key', { status: 403 })
}

async function handleKeys(request: Request, env: Env): Promise<Response> {
    const authResult = checkAuth(request, env)
    if (authResult) {
        return authResult
    }

    const parseResult = parseKeysRequest(request)
    if (!parseResult.provider) {
        return htmlResponse(providersPage())
    }

    if (request.method === 'POST') {
        return await handleKeysPost(request, env, parseResult)
    }

    return await handleKeysGet(env, parseResult)
}

function checkAuth(request: Request, env: Env): Response | null {
    const authKey = getCookie(request, 'auth_key') || ''

    if (!util.isWebUiRequestAllowed(authKey, env.AUTH_KEY)) {
        const csrfToken = generateCsrfToken()
        const headers = new Headers({
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'no-store'
        })
        headers.append('Set-Cookie', `csrf_token=${csrfToken}; Path=/; SameSite=Strict; Secure; Max-Age=600`)
        return htmlResponse(loginPage(csrfToken), headers)
    }

    return null
}

function parseKeysRequest(request: Request) {
    const url = new URL(request.url)
    const pathname = url.pathname
    const providerMatch = pathname.match(/^\/keys\/([a-zA-Z0-9_-]+)/)

    return {
        provider: providerMatch?.[1] || '',
        q: url.searchParams.get('q') || '',
        status: url.searchParams.get('status') || 'active',
        page: parseInt(url.searchParams.get('page') || '1', 10),
        pageSize: 20,
        sortBy: url.searchParams.get('sort_by') || '',
        sortOrder: url.searchParams.get('sort_order') || 'desc'
    }
}

async function handleKeysPost(
    request: Request,
    env: Env,
    params: ReturnType<typeof parseKeysRequest>
): Promise<Response> {
    const formData = await request.formData()
    const action = formData.get('action')

    if (action === 'add') {
        const keysStr = formData.get('keys') as string
        const remark = formData.get('remark') as string
        const accountId = formData.get('account_id') as string // <-- Add this
        const keys = keysStr
            .split(/[\n,]/)
            .map(k => k.trim())
            .filter(Boolean)
        await keyService.addKeys(
            env,
            keys.map(key => ({ key, provider: params.provider, remark, accountId }))
        )
    } else if (action === 'unblock') {
        const keyIds = formData.getAll('key_id') as string[]
        if (keyIds.length > 0) {
            await keyService.updateKeysStatus(env, keyIds, 'active')
        }
    } else if (action === 'unblock-all-blocked') {
        await keyService.updateKeysStatusByStatus(env, params.provider, 'blocked', 'active')
    } else if (action === 'delete') {
        const keyIds = formData.getAll('key_id') as string[]
        await keyService.delKeys(env, keyIds)
    } else if (action === 'delete-all-blocked') {
        await keyService.delKeysByStatus(env, params.provider, 'blocked')
    } else if (action === 'delete-all-active') {
        await keyService.delKeysByStatus(env, params.provider, 'active')
    }

    const redirectParams = new URLSearchParams()
    redirectParams.set('status', params.status)
    if (params.q) {
        redirectParams.set('q', params.q)
    }
    if (params.sortBy) {
        redirectParams.set('sort_by', params.sortBy)
        redirectParams.set('sort_order', params.sortOrder)
    }

    const headers = new Headers({ Location: `/keys/${params.provider}?${redirectParams.toString()}` })
    return new Response(null, { status: 303, headers })
}

async function handleKeysGet(env: Env, params: ReturnType<typeof parseKeysRequest>): Promise<Response> {
    const { keys, total } = await keyService.listKeys(
        env,
        params.provider,
        params.status,
        params.q,
        params.page,
        params.pageSize,
        params.sortBy,
        params.sortOrder
    )

    return htmlResponse(
        keysListPage(
            params.provider,
            params.status,
            params.q,
            keys,
            total,
            params.page,
            params.pageSize,
            params.sortBy,
            params.sortOrder
        ),
    )
}

const LOGO = "https://cdn.jsdelivr.net/gh/akincansenol/eplani-landing@main/eplani.svg";

export function generateCsrfToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}

export function safeEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.byteLength !== y.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < x.byteLength; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export function themeToggleButton(): string {
  return `<button type="button" onclick="toggleTheme()" aria-label="Toggle dark mode" title="Toggle dark mode" class="theme-toggle">
    <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path stroke-linecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"></path></svg>
    <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"></path></svg>
  </button>`;
}

export function buildHeader(): string {
  return `
    <header class="app-header">
        <div class="app-header-inner">
            <a href="/" class="brand" aria-label="EPLANI Balance"><img src="${LOGO}" alt="EPLANI"></a>
            <div class="header-actions">
                ${themeToggleButton()}
                <a href="/logout" class="btn btn-ghost">Sign out</a>
            </div>
        </div>
    </header>
    `;
}

export function buildGuestHeader(): string {
  return `<div class="guest-corner">${themeToggleButton()}</div>`;
}

export function layout(content: string, options: { signOut?: boolean; authPage?: boolean } = {}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; img-src 'self' data: https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'">
        <title>EPLANI Balance</title>
        <link rel="icon" href="${LOGO}">
        <script src="https://cdn.tailwindcss.com"><\/script>
        <script>try { tailwind.config = { darkMode: "class" }; } catch (e) {}<\/script>
        <script>
            (function () {
                try {
                    var stored = localStorage.getItem("theme");
                    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
                    if (dark) document.documentElement.classList.add("dark");
                } catch (e) {}
            })();
        <\/script>
        <style>${STYLES}</style>
        <script>
            function toggleTheme() {
                var dark = document.documentElement.classList.toggle("dark");
                try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
            }
            function copyToClipboard(text, element) {
                navigator.clipboard.writeText(text).then(function () {
                    const tooltip = element.parentElement.querySelector('.copy-tooltip');
                    const originalBg = element.className;
                    element.className = originalBg.replace('bg-gray-100', 'bg-green-100').replace('border-gray-200', 'border-green-300');
                    tooltip.classList.remove('opacity-0');
                    tooltip.classList.add('opacity-100');
                    setTimeout(function () {
                        element.className = originalBg;
                        tooltip.classList.remove('opacity-100');
                        tooltip.classList.add('opacity-0');
                    }, 1500);
                }).catch(function () {
                    console.error('Failed to copy text');
                });
            }
        <\/script>
    </head>
    <body class="${options.authPage ? 'auth-body' : ''}">
        ${options.signOut ? buildHeader() : buildGuestHeader()}
        <main class="page">${content}</main>
    </body>
    </html>
    `;
}

export function loginPage(csrfToken: string): string {
  const content = `
    <div class="auth-wrap">
        <div class="auth-card">
            <div class="auth-brand">
                <img src="${LOGO}" alt="EPLANI">
                <span class="auth-org">Creative Technologies</span>
            </div>
            <h1 class="auth-title">Log in to AI Gateway</h1>
            <form action="/login" method="POST">
                <input type="hidden" name="csrf_token" value="${csrfToken}">
                <div>
                    <label for="auth_key" class="field-label">Authentication key</label>
                    <input type="password" id="auth_key" name="auth_key" autocomplete="current-password" class="input-field" placeholder="Enter your auth key" required autofocus>
                </div>
                <button type="submit" class="btn-primary">Sign in</button>
            </form>
            <div class="auth-footer">
                <p>Authorized personnel only. All access attempts are monitored and logged.</p>
                <p class="auth-copy">© EPLANI A.Ş. · eplani.com.tr</p>
            </div>
        </div>
    </div>
    `;
  return layout(content, { authPage: true });
}

export function providersPage(): string {
  const providerLinks = PROVIDERS.map((p) => {
    const config = PROVIDER_CONFIGS[p as keyof typeof PROVIDER_CONFIGS];
    return `
        <a href="/keys/${p}?status=active" class="provider-card">
            <span class="provider-icon"><img src="${config.iconUrl}" alt="" loading="lazy" onerror="this.style.display='none'"></span>
            <span class="provider-name">${p}</span>
            <svg class="provider-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
        </a>`;
  }).join("");

  const content = `
    <div class="page-head">
        <h1 class="page-title">Providers</h1>
        <p class="page-sub">Choose a provider to manage its API keys.</p>
    </div>
    <div class="provider-grid">${providerLinks}</div>
    `;
  return layout(content, { signOut: true });
}

export function handleLogout(_request: Request): Response {
  const headers = new Headers();
  headers.append("Set-Cookie", "auth_key=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0");
  headers.append("Set-Cookie", "csrf_token=; Path=/; SameSite=Strict; Secure; Max-Age=0");
  headers.set("Location", "/");
  return new Response(null, { status: 302, headers });
}
function keysListPage(
    provider: string,
    currentStatus: string,
    q: string,
    keys: schema.Key[],
    total: number,
    page: number,
    pageSize: number,
    sortBy: string,
    sortOrder: string
): string {
    const content = `
        ${buildBreadcrumb(provider)}
        ${buildKeysTable(provider, currentStatus, q, keys, total, page, pageSize, sortBy, sortOrder)}
        ${buildAddKeysForm(provider, currentStatus, q, page, sortBy, sortOrder)}
        ${buildModelCoolingsModal()}
        ${buildModalScript()}
    `

    return layout(content)
}

function buildBreadcrumb(provider: string): string {
    return `
        <div class="mb-8">
            <nav class="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <a href="/" class="hover:text-blue-600 transition-colors duration-200 font-medium">Providers</a>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <span class="text-gray-900 font-semibold">${provider}</span>
            </nav>
        </div>
    `
}

function buildKeysTable(
    provider: string,
    currentStatus: string,
    q: string,
    keys: schema.Key[],
    total: number,
    page: number,
    pageSize: number,
    sortBy: string,
    sortOrder: string
): string {
    const statusTabs = buildStatusTabs(provider, currentStatus, q, sortBy, sortOrder)
    const keyRows = buildKeyRows(keys)
    const paginationControls = buildPaginationControls(
        provider,
        currentStatus,
        q,
        page,
        pageSize,
        total,
        sortBy,
        sortOrder
    )

    return `
        <div class="glass-card bg-white/80 rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8 max-w-5xl mx-auto backdrop-blur-xl">
            <form method="POST">
                ${buildTableHeader(provider, currentStatus, q, statusTabs, sortBy, sortOrder)}
                ${buildTableContent(keyRows, provider, currentStatus, q, sortBy, sortOrder)}
                ${buildTableFooter(total, paginationControls)}
            </form>
            ${buildSearchForm(provider, currentStatus)}
        </div>
    `
}

function buildStatusTabs(
    provider: string,
    currentStatus: string,
    q: string,
    sortBy: string,
    sortOrder: string
): string {
    const statuses = ['active', 'blocked']
    return statuses
        .map(s => {
            const isActive = s === currentStatus
            const activeClasses = isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-600'
                : 'bg-white/80 text-gray-800 hover:bg-white border border-gray-300 hover:border-gray-400'
            const link = buildPageLink(provider, s, q, 1, 20, sortBy, sortOrder)
            return `<a href="${link}" class="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeClasses}">${s.charAt(0).toUpperCase() + s.slice(1)}</a>`
        })
        .join('')
}

function buildKeyRows(keys: schema.Key[]): string {
    if (keys.length === 0) {
        return buildEmptyState()
    }

    return keys
        .map(k => {
            const usedTime = formatUsedTime(k.createdAt)
            const totalCoolingTime = formatCoolingTime(k.totalCoolingSeconds)
            const modelCoolingsJson = JSON.stringify(k.modelCoolings || {}).replace(/"/g, '&quot;')

            return `
            <tr class="group hover:bg-blue-100/60 even:bg-slate-100/40 odd:bg-white/60 transition-all duration-300 hover:shadow-md backdrop-blur-sm border-b border-gray-300/50">
                <td class="p-4">
                    <input type="checkbox" name="key_id" value="${k.id}"
                           class="h-4 w-4 text-blue-600 bg-white border-gray-500 rounded focus:ring-blue-500 focus:ring-2 transition-colors backdrop-blur-sm">
                </td>
                <td class="p-4">
                    ${buildCopyableKey(k.key)}
                </td>
                <td class="p-4 text-sm text-slate-700 font-medium">${k.remark || ''}</td>
                <td class="p-4">
                    <span class="text-sm text-slate-800 cursor-pointer hover:text-blue-700 transition-colors duration-200 font-medium px-2 py-1 rounded-md hover:bg-blue-100/80 backdrop-blur-sm"
                          onclick="showModelCoolings('${modelCoolingsJson}', '${k.key.substring(0, 20)}...')"
                          title="Click to view model cooling details">${totalCoolingTime}</span>
                </td>
                <td class="p-4 text-sm text-slate-700 font-medium">${usedTime}</td>
            </tr>
        `
        })
        .join('')
}

function buildEmptyState(): string {
    return `
        <tr>
            <td colspan="4" class="text-center p-12 text-gray-700 bg-slate-100/40 backdrop-blur-sm">
                <div class="flex flex-col items-center gap-3">
                    <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="font-medium">No keys found</p>
                </div>
            </td>
        </tr>
    `
}

function buildCopyableKey(key: string): string {
    const displayKey = `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
    return `
        <div class="relative inline-block">
            <code class="px-3 py-2 bg-slate-200/80 border border-slate-300/70 rounded-lg text-sm font-mono text-slate-900 cursor-pointer hover:bg-slate-300/80 hover:border-slate-400/70 transition-all duration-200 inline-block group-hover:shadow-sm backdrop-blur-sm"
                  onclick="copyToClipboard('${key.replace(/'/g, "\\'")}', this)"
                  title="Click to copy">
                <span class="font-mono">${displayKey}</span>
            </code>
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-700 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none transition-opacity duration-300 whitespace-nowrap copy-tooltip backdrop-blur-sm">
                Copied!
            </div>
        </div>
    `
}

function buildPaginationControls(
    provider: string,
    currentStatus: string,
    q: string,
    page: number,
    pageSize: number,
    total: number,
    sortBy: string,
    sortOrder: string
): string {
    const numPages = Math.ceil(total / pageSize)
    if (numPages <= 1) {
        return ''
    }

    const pageNumbers = generatePageNumbers(page, numPages)
    const prevPage = Math.max(1, page - 1)
    const nextPage = Math.min(numPages, page + 1)
    const prevDisabled = page <= 1
    const nextDisabled = page >= numPages

    const items = [
        buildPaginationButton('prev', prevPage, prevDisabled, provider, currentStatus, q, sortBy, sortOrder),
        ...pageNumbers.map(p => buildPageNumberButton(p, page, provider, currentStatus, q, sortBy, sortOrder)),
        buildPaginationButton('next', nextPage, nextDisabled, provider, currentStatus, q, sortBy, sortOrder)
    ]

    return items.join('')
}

function generatePageNumbers(currentPage: number, totalPages: number): (number | string)[] {
    const window = 2
    const pagesToShow = new Set<number>()

    pagesToShow.add(1)
    pagesToShow.add(totalPages)

    for (let i = Math.max(1, currentPage - window); i <= Math.min(totalPages, currentPage + window); i++) {
        pagesToShow.add(i)
    }

    const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b)
    const pageItems: (number | string)[] = []
    let lastPage = 0

    for (const p of sortedPages) {
        if (lastPage > 0 && p > lastPage + 1) {
            pageItems.push('...')
        }
        pageItems.push(p)
        lastPage = p
    }

    return pageItems
}

function buildPaginationButton(
    type: 'prev' | 'next',
    targetPage: number,
    disabled: boolean,
    provider: string,
    status: string,
    q: string,
    sortBy: string,
    sortOrder: string
): string {
    const icon =
        type === 'prev'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>'

    const link = buildPageLink(provider, status, q, targetPage, 20, sortBy, sortOrder)

    const baseClasses = 'p-2 rounded-lg text-sm font-medium transition-all duration-200'
    const disabledClasses = 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 pointer-events-none'
    const enabledClasses =
        'bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 hover:border-gray-400 shadow-sm'

    return `
        <a href="${disabled ? '#' : link}"
                class="${baseClasses} ${disabled ? disabledClasses : enabledClasses}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${icon}
            </svg>
        </a>
    `
}

function buildPageNumberButton(
    pageItem: number | string,
    currentPage: number,
    provider: string,
    status: string,
    q: string,
    sortBy: string,
    sortOrder: string
): string {
    if (typeof pageItem === 'string') {
        return `<span class="px-3 py-2 text-sm font-medium text-gray-500">...</span>`
    }

    const isCurrent = pageItem === currentPage
    const link = buildPageLink(provider, status, q, pageItem, 20, sortBy, sortOrder)

    const baseClasses = 'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200'
    const currentClasses =
        'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-600 pointer-events-none'
    const otherClasses =
        'bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 hover:border-gray-400 shadow-sm'

    return `
        <a href="${isCurrent ? '#' : link}"
                class="${baseClasses} ${isCurrent ? currentClasses : otherClasses}">
            ${pageItem}
        </a>
    `
}

function buildPageLink(
    provider: string,
    status: string,
    q: string,
    page: number,
    pageSize: number,
    sortBy: string,
    sortOrder: string
): string {
    const params = new URLSearchParams()
    params.set('status', status)
    if (q) {
        params.set('q', q)
    }
    if (sortBy) {
        params.set('sort_by', sortBy)
        params.set('sort_order', sortOrder)
    }
    if (page > 1) {
        params.set('page', String(page))
    }
    return `/keys/${provider}?${params.toString()}`
}

function formatUsedTime(createdAt: Date | string): string {
    const date = new Date(createdAt)
    const now = Date.now() / 1000
    const usedSeconds = now - date.getTime() / 1000
    const days = Math.floor(usedSeconds / 86400)
    const hours = Math.floor((usedSeconds % 86400) / 3600)
    const minutes = Math.floor((usedSeconds % 3600) / 60)

    if (days > 0) {
        return `${days}d${hours}h`
    }
    if (hours > 0) {
        return `${hours}h${minutes}m`
    }
    return `${minutes}m`
}

function formatCoolingTime(totalSeconds: number): string {
    if (totalSeconds === 0) return '-'

    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (days > 0) {
        return `${days}d${hours}h`
    }
    if (hours > 0) {
        return `${hours}h${minutes}m`
    }
    return `${minutes}m`
}

function buildTableHeader(
    provider: string,
    currentStatus: string,
    q: string,
    statusTabs: string,
    sortBy: string,
    sortOrder: string
): string {
    const isBlocked = currentStatus === 'blocked'

    const bulkActionButton = isBlocked
        ? `
        <button type="submit" name="action" value="unblock-all-blocked"
                class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5 border border-blue-600">
            Unblock ALL Blocked
        </button>
    `
        : `
        <button type="submit" name="action" value="delete-all-active"
                onclick="return confirm('Are you sure you want to delete ALL active keys? This action cannot be undone.')"
                class="px-4 py-2.5 bg-red-800 hover:bg-red-900 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-800/25 hover:-translate-y-0.5 border border-red-800">
            Delete ALL Active
        </button>
    `

    const selectedActionButton = isBlocked
        ? `
        <button type="submit" name="action" value="unblock"
                class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5 border border-blue-600">
            Unblock Selected
        </button>
        <button type="submit" name="action" value="delete"
                class="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25 hover:-translate-y-0.5 border border-red-600">
            Delete Selected
        </button>
    `
        : `
        <button type="submit" name="action" value="delete"
                class="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25 hover:-translate-y-0.5 border border-red-600">
            Delete Selected
        </button>
    `

    return `
        <div class="p-6 border-b border-gray-200/60 bg-white/30 backdrop-blur-sm">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div class="flex gap-2">${statusTabs}</div>
                    <div class="flex items-center">
                        <div class="relative">
                            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <input form="search-form" type="search" name="q" value="${q}"
                                   placeholder="Search keys..."
                                   class="input-field w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none text-sm shadow-sm">
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    ${selectedActionButton}
                    ${bulkActionButton}
                </div>
            </div>
        </div>
    `
}

function getSortParamsForNextLink(column: string, currentSortBy: string, currentSortOrder: string) {
    let nextSortOrder = 'desc'
    if (currentSortBy === column) {
        nextSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc'
    }
    return { sortBy: column, sortOrder: nextSortOrder }
}

function buildTableContent(
    keyRows: string,
    provider: string,
    currentStatus: string,
    q: string,
    sortBy: string,
    sortOrder: string
): string {
    const coolingSortParams = getSortParamsForNextLink('totalCoolingSeconds', sortBy, sortOrder)
    const coolingLink = buildPageLink(
        provider,
        currentStatus,
        q,
        1,
        20,
        coolingSortParams.sortBy,
        coolingSortParams.sortOrder
    )

    const usedTimeSortParams = getSortParamsForNextLink('createdAt', sortBy, sortOrder)
    const usedTimeLink = buildPageLink(
        provider,
        currentStatus,
        q,
        1,
        20,
        usedTimeSortParams.sortBy,
        usedTimeSortParams.sortOrder
    )

    return `
        <div class="overflow-x-auto">
            <table class="w-full table-fixed">
                <colgroup>
                    <col class="w-12">
                    <col class="w-64">
                    <col class="w-48">
                    <col class="w-32">
                    <col class="w-24">
                </colgroup>
                <thead>
                    <tr class="bg-gradient-to-r from-slate-100/90 to-gray-100/90 border-b border-gray-400/80 backdrop-blur-sm">
                        <th class="p-4 text-left">
                            <input type="checkbox"
                                   onchange="document.querySelectorAll('[name=key_id]').forEach(c => c.checked = this.checked)"
                                   class="h-4 w-4 text-blue-600 bg-white border-gray-500 rounded focus:ring-blue-500 transition-colors backdrop-blur-sm">
                        </th>
                        <th class="p-4 text-left font-semibold text-slate-800 text-sm tracking-wide">API Key</th>
                        <th class="p-4 text-left font-semibold text-slate-800 text-sm tracking-wide">Remark</th>
                        <th class="p-4 text-left font-semibold text-slate-800 text-sm tracking-wide">
                            <a href="${coolingLink}" class="flex items-center gap-2 hover:text-blue-700 transition-colors duration-200">
                                <span>Cooling Time</span>
                                ${getSortIcon('totalCoolingSeconds', sortBy, sortOrder)}
                            </a>
                        </th>
                        <th class="p-4 text-left font-semibold text-slate-800 text-sm tracking-wide">
                            <a href="${usedTimeLink}" class="flex items-center gap-2 hover:text-blue-700 transition-colors duration-200">
                                <span>Used Time</span>
                                ${getSortIcon('createdAt', sortBy, sortOrder)}
                            </a>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-300/60">
                    ${keyRows}
                </tbody>
            </table>
        </div>
    `
}

function buildTableFooter(total: number, paginationControls: string): string {
    if (total === 0) {
        return ''
    }

    if (!paginationControls) {
        return `
        <div class="flex justify-center items-center p-6 border-t border-gray-300/80 bg-gray-100/60 backdrop-blur-sm">
            <div class="px-4 py-2 rounded-xl bg-white/90 text-gray-800 text-sm font-semibold border border-gray-300/80 shadow-sm backdrop-blur-sm">
                ${total}
            </div>
        </div>
    `
    }

    return `
        <div class="flex justify-center items-center p-6 border-t border-gray-300/80 bg-gray-100/60 backdrop-blur-sm">
            <div class="flex items-center gap-2 p-3 bg-white/90 rounded-xl border border-gray-300/80 shadow-sm backdrop-blur-sm">
                ${paginationControls}
                <div class="h-6 w-px bg-gray-300/80"></div>
                <div class="px-3 text-gray-600 text-sm font-semibold">
                    ${total}
                </div>
            </div>
        </div>
    `
}

function buildSearchForm(provider: string, currentStatus: string): string {
    return `
        <form id="search-form" method="GET" action="/keys/${provider}" class="hidden">
            <input type="hidden" name="status" value="${currentStatus}">
        </form>
    `
}

function buildAddKeysForm(
    provider: string,
    currentStatus: string,
    q: string,
    page: number,
    sortBy: string,
    sortOrder: string
): string {
    return `
        <div class="glass-card bg-white/80 rounded-3xl shadow-xl p-6 border border-gray-200 max-w-5xl mx-auto">
            <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-blue-100 rounded-xl border border-blue-200">
                    <svg class="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-gray-900">Add New Keys</h2>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="add">

                <!-- 1. Restored API Keys Textarea -->
                <div class="mb-6">
                    <label class="block text-gray-800 text-sm font-semibold mb-3">API Keys</label>
                    <textarea name="keys"
                              class="input-field w-full p-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none font-mono text-sm resize-none shadow-sm"
                              rows="4"
                              placeholder="Enter API keys, one per line or separated by commas"></textarea>
                </div>

                <!-- 2. Account ID -->
                <div class="mb-6">
                    <label class="block text-gray-800 text-sm font-semibold mb-3">Account ID (Optional for Workers AI)</label>
                    <input name="account_id"
                              class="input-field w-full p-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none text-sm shadow-sm"
                              placeholder="e.g., b1c654771e27c8bd47252c1fbc242a62"/>
                </div>

                <!-- 3. Remark -->
                <div class="mb-6">
                    <label class="block text-gray-800 text-sm font-semibold mb-3">Remark</label>
                    <input name="remark"
                              class="input-field w-full p-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none text-sm shadow-sm"
                              placeholder="Enter remark for these keys (optional)"/>
                </div>

                <div class="flex justify-end">
                    <button type="submit"
                            formaction="/keys/${provider}${buildPageLink(provider, currentStatus, q, page, 20, sortBy, sortOrder)}"
                            class="btn-primary px-6 py-3 text-white font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200">
                        Add Keys
                    </button>
                </div>
            </form>
        </div>
    `
}

function buildModelCoolingsModal(): string {
    return `
        <div id="modelCoolingsModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm hidden items-center justify-center z-50" onclick="closeModal(event)">
            <div class="glass-card bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-2xl w-full mx-6 max-h-[80vh] overflow-hidden" onclick="event.stopPropagation()">
                <div class="p-6 border-b border-gray-200 bg-white/80">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold text-gray-900">Model Cooling Details</h3>
                        <button onclick="closeModal()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">Key: <span id="modalKeyName" class="font-mono"></span></p>
                </div>
                <div class="p-6 overflow-y-auto max-h-96">
                    <div id="modelCoolingsTable"></div>
                </div>
            </div>
        </div>
    `
}

function buildModalScript(): string {
    return `
        <script>
            function showModelCoolings(modelCoolingsJson, keyName) {
                const modalKeyName = document.getElementById('modalKeyName');
                const modalTable = document.getElementById('modelCoolingsTable');
                const modal = document.getElementById('modelCoolingsModal');

                modalKeyName.textContent = keyName;

                try {
                    const modelCoolings = JSON.parse(modelCoolingsJson);
                    const now = Date.now() / 1000;

                    if (Object.keys(modelCoolings).length === 0) {
                        modalTable.innerHTML = '<p class="text-gray-600 text-center py-8">No model cooling data available</p>';
                    } else {
                        const rows = Object.entries(modelCoolings).map(([model, cooling]) => {
                            const isAvailable = cooling.end_at < now;
                            const remainingTime = isAvailable ? '-' : formatTime(cooling.end_at - now);
                            const totalTime = formatTime(cooling.total_seconds);
                            const statusClass = isAvailable ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
                            const status = isAvailable ? 'available' : 'cooling';

                            return \`
                                <tr class="border-b border-gray-200">
                                    <td class="p-3 font-mono text-sm">\${model}</td>
                                    <td class="p-3 text-sm">\${totalTime}</td>
                                    <td class="p-3 text-sm">\${remainingTime}</td>
                                    <td class="p-3">
                                        <span class="px-2 py-1 rounded-lg text-xs font-medium \${statusClass}">\${status}</span>
                                    </td>
                                </tr>
                            \`;
                        }).join('');

                        modalTable.innerHTML = \`
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-gray-200 bg-gray-50">
                                        <th class="p-3 text-left font-semibold text-gray-900">Model</th>
                                        <th class="p-3 text-left font-semibold text-gray-900">Total Cooling Time</th>
                                        <th class="p-3 text-left font-semibold text-gray-900">Remaining Time</th>
                                        <th class="p-3 text-left font-semibold text-gray-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${rows}
                                </tbody>
                            </table>
                        \`;
                    }
                } catch (e) {
                    modalTable.innerHTML = '<p class="text-red-600 text-center py-8">Error parsing model cooling data</p>';
                }

                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }

            function closeModal(event) {
                if (!event || event.target === event.currentTarget) {
                    const modal = document.getElementById('modelCoolingsModal');
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
            }

            function formatTime(seconds) {
                if (seconds <= 0) return '-';

                const days = Math.floor(seconds / 86400);
                const hours = Math.floor((seconds % 86400) / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);

                if (days > 0) {
                    return \`\${days}d\${hours}h\`;
                }
                if (hours > 0) {
                    return \`\${hours}h\${minutes}m\`;
                }
                return \`\${minutes}m\`;
            }
        </script>
    `
}

function getSortIcon(column: string, sortBy: string, sortOrder: string): string {
    if (sortBy !== column) {
        return `<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
        </svg>`
    }
    return sortOrder === 'asc'
        ? `<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4"></path>
        </svg>`
        : `<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H7"></path>
        </svg>`
}
