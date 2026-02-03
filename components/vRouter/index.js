// Enhanced Router — Guards · Lazy Loading · History · Query Params
class Router {
    constructor({
        defaultRoute = 'home',
        rootSelector = '#app',
        headerConfig = {},
        mode = 'hash',
        guards = {}
    }) {
        this.routes = {};
        this.previousRoute = null;
        this.defaultRoute = defaultRoute;
        this.rootElement = document.querySelector(rootSelector);
        this.headerConfig = headerConfig;
        this.mode = mode;

        this.history = [];
        this.maxHistorySize = 50;
        this.currentHistoryIndex = -1;

        this.beforeEachGuards = [];
        this.afterEachGuards = [];

        this.currentRoute = null;
        this.routeState = {};
        this.lazyLoadedModules = new Map();

        this.setupDOM();
        this.contentElement = document.getElementById('content');

        this.setupEventListeners();

        window.addEventListener('DOMContentLoaded', () => {
            const initialRoute = this.getRouteFromURL() || this.defaultRoute;
            this.loadRoute(initialRoute);
        });
    }

    getRouteFromURL() {
        if (this.mode === 'hash') {
            return window.location.hash.slice(1).split('?')[0];
        }
        return window.location.pathname.slice(1);
    }

    getQueryParams() {
        const params = {};
        const queryString = window.location.search.slice(1);
        if (!queryString) return params;
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        return params;
    }

    beforeEach(guard) {
        if (typeof guard === 'function') this.beforeEachGuards.push(guard);
    }

    afterEach(guard) {
        if (typeof guard === 'function') this.afterEachGuards.push(guard);
    }

    addToHistory(route, state = {}) {
        if (this.currentHistoryIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentHistoryIndex + 1);
        }
        this.history.push({ route, state, timestamp: Date.now() });
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.currentHistoryIndex++;
        }
    }

    getHistory() { return [...this.history]; }
    clearHistory() { this.history = []; this.currentHistoryIndex = -1; }

    setupDOM() {
        this.rootElement.innerHTML = `<main id="content" style="width:100%;min-height:100vh;background:var(--bg,#0b0b0c);"></main>`;
    }

    setupEventListeners() {
        if (this.mode === 'hash') {
            window.addEventListener('hashchange', () => {
                const route = window.location.hash.slice(1).split('?')[0];
                this.loadRoute(route, this.getState(route));
            });
        } else {
            window.addEventListener('popstate', (event) => {
                const route = window.location.pathname.slice(1);
                this.loadRoute(route, event.state || {});
            });
        }
    }

    /**
     * @param {string} route
     * @param {Object} options
     * @param {HTMLElement} [options.content]
     * @param {Function} [options.lazy]
     * @param {Function} [options.onLoad]
     * @param {Object} [options.headerConfig]
     * @param {Function} [options.beforeEnter]
     */
    addRoute(route, options = {}) {
        const { content, lazy, onLoad = null, headerConfig = {}, beforeEnter = null } = options;
        if (!content && !lazy) {
            console.error(`Route "${route}" needs content or lazy.`);
            return;
        }
        if (content && !(content instanceof HTMLElement)) {
            console.error(`Content for route "${route}" must be an HTMLElement.`);
            return;
        }
        this.routes[route] = { content, lazy, onLoad, headerConfig, beforeEnter, isLazy: !!lazy };
    }

    async loadRoute(route, state = {}) {
        const routeData = this.routes[route];
        if (!routeData) { this.show404(route); return; }

        const from = this.currentRoute;
        const to = route;
        const queryParams = this.getQueryParams();
        const ctx = { to, from, state, query: queryParams, abort: false };

        for (const guard of this.beforeEachGuards) {
            await this.runGuard(guard, ctx);
            if (ctx.abort) return;
        }

        if (routeData.beforeEnter) {
            await this.runGuard(routeData.beforeEnter, ctx);
            if (ctx.abort) return;
        }

        this.routeState[route] = state;

        try {
            let content = routeData.content;
            if (routeData.isLazy && !content) {
                content = await this.lazyLoadRoute(route, routeData);
            }
            if (!content) throw new Error(`No content for "${route}"`);

            this.contentElement.innerHTML = '';
            this.contentElement.appendChild(content);
            this.currentRoute = route;

            if (routeData.onLoad) routeData.onLoad(content, { state, query: queryParams });

            this.addToHistory(route, state);
            this.previousRoute = from;

            for (const guard of this.afterEachGuards) {
                await this.runGuard(guard, { to, from, state, query: queryParams });
            }
        } catch (error) {
            console.error(`Error loading "${route}":`, error);
            this.showError(route, error);
        }
    }

    async runGuard(guard, context) {
        return new Promise((resolve) => {
            const next = (shouldAbort = false) => { context.abort = !!shouldAbort; resolve(); };
            const result = guard(context.to, context.from, next, context);
            if (result instanceof Promise) {
                result.then(() => resolve()).catch(() => { context.abort = true; resolve(); });
            } else if (result !== undefined) {
                context.abort = !result;
                resolve();
            }
        });
    }

    async lazyLoadRoute(route, routeData) {
        if (this.lazyLoadedModules.has(route)) return this.lazyLoadedModules.get(route);
        const module = await routeData.lazy();
        let content = module.default || module.content;
        if (typeof content === 'function') content = content(this.contentElement);
        if (!content) throw new Error(`Lazy module for "${route}" must export default or content`);
        this.lazyLoadedModules.set(route, content);
        routeData.content = content;
        return content;
    }

    show404(route) {
        this.contentElement.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:16px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size:48px;color:#f59e0b;"></i>
                <h2 style="margin:0;color:#f6f6f7;">404 — Not Found</h2>
                <p style="color:#717179;margin:0;">Route "${route}" does not exist.</p>
                <button onclick="window.location.hash='${this.defaultRoute}'" style="margin-top:8px;padding:10px 24px;background:#60a5fa;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:600;">Go Home</button>
            </div>`;
    }

    showError(route, error) {
        this.contentElement.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:16px;">
                <i class="fa-solid fa-circle-exclamation" style="font-size:48px;color:#ef4444;"></i>
                <h2 style="margin:0;color:#f6f6f7;">Error Loading Route</h2>
                <p style="color:#717179;margin:0;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top:8px;padding:10px 24px;background:#60a5fa;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:600;">Reload</button>
            </div>`;
    }

    navigateTo(route, state = {}, query = {}) {
        const qs = Object.keys(query).length
            ? '?' + Object.entries(query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
            : '';
        if (this.mode === 'hash') {
            window.location.hash = route + qs;
        } else {
            window.history.pushState(state, '', `/${route}${qs}`);
            this.loadRoute(route, state);
        }
    }

    replace(route, state = {}, query = {}) {
        const qs = Object.keys(query).length
            ? '?' + Object.entries(query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
            : '';
        if (this.mode === 'hash') {
            window.location.replace(`#${route}${qs}`);
        } else {
            window.history.replaceState(state, '', `/${route}${qs}`);
            this.loadRoute(route, state);
        }
    }

    navigateBack() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            const item = this.history[this.currentHistoryIndex];
            this.navigateTo(item.route, item.state);
        } else {
            window.history.back();
        }
    }

    navigateForward() {
        if (this.currentHistoryIndex < this.history.length - 1) {
            this.currentHistoryIndex++;
            const item = this.history[this.currentHistoryIndex];
            this.navigateTo(item.route, item.state);
        } else {
            window.history.forward();
        }
    }

    getState(route = null) {
        return this.routeState[route || this.currentRoute] || {};
    }

    setState(state, route = null) {
        const r = route || this.currentRoute;
        this.routeState[r] = { ...this.routeState[r], ...state };
    }
}

export default Router;
