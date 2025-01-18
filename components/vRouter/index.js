// Updated Router Class with Enhanced Header and Routing Features
class Router {
    constructor({ defaultRoute = 'home', rootSelector = '#app', headerConfig = {} }) {
        this.routes = {};
        this.previousRoute = null;
        this.defaultRoute = defaultRoute;
        this.rootElement = document.querySelector(rootSelector);
        this.headerConfig = headerConfig; // Store header configuration

        this.setupDOM();
        this.setupStyles();
        this.contentElement = document.getElementById('content');
        this.backButton = document.getElementById('backButton');
        this.headerTitle = document.getElementById('headerTitle');

        this.setupEventListeners();

        window.addEventListener('DOMContentLoaded', () => {
            const initialRoute = window.location.hash.slice(1) || this.defaultRoute;
            this.loadRoute(initialRoute); // Load the route on initial load
        });
    }

    setupDOM() {
        const htmlStructure = `
        <header class="app-header">
            <div id="headerTitle" class="header-title">
                <h1>${this.headerConfig.title || ''}</h1>
            </div>
            <button id="backButton" class="back-button" disabled>⬅</button>
        </header>
        <main id="content" class="content-area"></main>
    `;
    this.rootElement.innerHTML = htmlStructure;
    
    // Safety checks and enhanced functionality
    const headerElement = document.querySelector('.app-header');
    const headerTitleElement = document.querySelector('#headerTitle');
    
    if (this.headerConfig.hideHeader) {
        if (headerElement) {
            headerElement.style.display = 'none';
        } else {
            console.warn('Header element not found in the DOM.');
        }
    }
    
    if (headerTitleElement && this.headerConfig.title) {
        const titleElement = headerTitleElement.querySelector('h1');
        if (titleElement) {
            titleElement.textContent = this.headerConfig.title;
        } else {
            console.warn('Title element not found in the DOM.');
        }
    } else if (!headerTitleElement) {
        console.warn('Header title container not found in the DOM.');
    }
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            body {
                margin: 0;
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                overflow: hidden;
            }
            .app-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #282c34;
                color: white;
                padding: 1rem;
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
            }

            .header-title h1 {
                margin: 0;
                font-size: 1.5rem;
                text-align: center;
                flex-grow: 1;
            }

            .back-button {
                background-color: transparent;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                color: #282c34;
                cursor: pointer;
                font-size: 1rem;
                transition: background-color 0.3s ease;
                opacity: 0.7;
            }

            .back-button:hover {
                background-color: transparent;
                opacity: 1;
            }

            .back-button:disabled {
                background-color: transparent;
                cursor: not-allowed;
                opacity: 0.5;
            }

            .content-area {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 0rem;
                min-height: calc(100vh - 64px);
                background-color: #ffffff;
                border-radius: 0px;
                margin: 0rem;
            }

            .view {
                text-align: center;
            }

            button {
                margin-top: 1rem;
                background-color: #282c34;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            button:hover {
                background-color: rgb(215, 215, 215);
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        if (this.backButton) {
            this.backButton.addEventListener('click', () => this.navigateBack());
        }

        window.addEventListener('hashchange', () => {
            const route = window.location.hash.slice(1);
            this.loadRoute(route); // Load the route based on the updated hash
        });
    }

    addRoute(route, { content, onLoad = null, headerConfig = {} }) {
        // Ensure that the content is a DOM element
        if (!(content instanceof HTMLElement)) {
            console.error("Content must be a DOM element.");
            return;
        }

        this.routes[route] = { content, onLoad, headerConfig };
    }

    loadRoute(route) {
        const routeData = this.routes[route];

        if (routeData) {
            // Clear existing content
            this.contentElement.innerHTML = '';
            // Append the new content element
            this.contentElement.appendChild(routeData.content);

            if (routeData.onLoad) {
                routeData.onLoad();
            }

            // Update header based on route configuration
            const { headerConfig } = routeData;
            if (headerConfig) {
                this.updateHeader(headerConfig);
            }

            this.updateBackButtonState();
            this.previousRoute = route;
        } else {
            this.contentElement.innerHTML = `
                <div class="view">
                    <h2>404 - Not Found</h2>
                    <p>Route does not exist.</p>
                </div>`;
        }
    }

    navigateTo(route) {
        window.location.hash = route;
    }

    navigateBack() {
        if (this.previousRoute) {
            const backRoute = this.routes[this.previousRoute] ? this.previousRoute : this.defaultRoute;
            this.navigateTo(backRoute);
        }
    }

    updateBackButtonState() {
        this.backButton.disabled = window.location.hash.slice(1) === this.defaultRoute;
    }

    updateHeader({ hideHeader, title }) {
        const headerElement = document.querySelector('.app-header');
        if (hideHeader) {
            headerElement.style.display = 'none';
        } else {
            headerElement.style.display = 'flex';
        }

        if (title) {
            this.headerTitle.querySelector('h1').textContent = title;
        }
    }
}

// Export the Router class
export default Router;
