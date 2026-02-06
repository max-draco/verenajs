/**
 * verenajs Docker Integration
 * Deploy and manage Docker containers from the Visual Builder
 *
 * Features:
 * - Dockerfile generation
 * - Docker Compose generation
 * - Container management
 * - Image building
 * - Multi-stage builds
 * - Environment configuration
 * - Health checks
 * - Volume management
 *
 * @version 2.0.0
 */

import { events } from './core.js';

// ============================================
// DOCKER CONFIG
// ============================================

const DockerDefaults = {
  nodeVersion: '20-alpine',
  port: 3000,
  workdir: '/app',
  npmRegistry: 'https://registry.npmjs.org',
  healthCheckPath: '/health',
  healthCheckInterval: '30s',
  healthCheckTimeout: '10s',
  healthCheckRetries: 3
};

// ============================================
// DOCKERFILE GENERATOR
// ============================================

class DockerfileGenerator {
  constructor(options = {}) {
    this.config = { ...DockerDefaults, ...options };
    this.instructions = [];
  }

  // Set base image
  from(image, alias = null) {
    this.instructions.push(`FROM ${image}${alias ? ` AS ${alias}` : ''}`);
    return this;
  }

  // Set working directory
  workdir(path) {
    this.instructions.push(`WORKDIR ${path}`);
    return this;
  }

  // Copy files
  copy(src, dest, options = {}) {
    let instruction = 'COPY';
    if (options.from) instruction += ` --from=${options.from}`;
    if (options.chown) instruction += ` --chown=${options.chown}`;
    this.instructions.push(`${instruction} ${src} ${dest}`);
    return this;
  }

  // Add files (with URL support)
  add(src, dest) {
    this.instructions.push(`ADD ${src} ${dest}`);
    return this;
  }

  // Run command
  run(command, options = {}) {
    if (Array.isArray(command)) {
      this.instructions.push(`RUN ${command.join(' && \\\n    ')}`);
    } else if (options.shell === false) {
      this.instructions.push(`RUN ["${command.split(' ').join('", "')}"]`);
    } else {
      this.instructions.push(`RUN ${command}`);
    }
    return this;
  }

  // Set command
  cmd(command) {
    if (Array.isArray(command)) {
      this.instructions.push(`CMD ["${command.join('", "')}"]`);
    } else {
      this.instructions.push(`CMD ${command}`);
    }
    return this;
  }

  // Set entrypoint
  entrypoint(command) {
    if (Array.isArray(command)) {
      this.instructions.push(`ENTRYPOINT ["${command.join('", "')}"]`);
    } else {
      this.instructions.push(`ENTRYPOINT ${command}`);
    }
    return this;
  }

  // Expose port
  expose(port) {
    this.instructions.push(`EXPOSE ${port}`);
    return this;
  }

  // Set environment variable
  env(key, value = null) {
    if (typeof key === 'object') {
      for (const [k, v] of Object.entries(key)) {
        this.instructions.push(`ENV ${k}=${v}`);
      }
    } else {
      this.instructions.push(`ENV ${key}=${value}`);
    }
    return this;
  }

  // Add ARG
  arg(name, defaultValue = null) {
    this.instructions.push(`ARG ${name}${defaultValue !== null ? `=${defaultValue}` : ''}`);
    return this;
  }

  // Add label
  label(key, value = null) {
    if (typeof key === 'object') {
      for (const [k, v] of Object.entries(key)) {
        this.instructions.push(`LABEL ${k}="${v}"`);
      }
    } else {
      this.instructions.push(`LABEL ${key}="${value}"`);
    }
    return this;
  }

  // Add volume
  volume(path) {
    if (Array.isArray(path)) {
      this.instructions.push(`VOLUME ["${path.join('", "')}"]`);
    } else {
      this.instructions.push(`VOLUME ${path}`);
    }
    return this;
  }

  // Set user
  user(user) {
    this.instructions.push(`USER ${user}`);
    return this;
  }

  // Health check
  healthcheck(options) {
    const parts = ['HEALTHCHECK'];
    if (options.interval) parts.push(`--interval=${options.interval}`);
    if (options.timeout) parts.push(`--timeout=${options.timeout}`);
    if (options.retries) parts.push(`--retries=${options.retries}`);
    if (options.startPeriod) parts.push(`--start-period=${options.startPeriod}`);
    parts.push(`CMD ${options.cmd}`);
    this.instructions.push(parts.join(' '));
    return this;
  }

  // Add comment
  comment(text) {
    this.instructions.push(`# ${text}`);
    return this;
  }

  // Add blank line
  blank() {
    this.instructions.push('');
    return this;
  }

  // Build the Dockerfile content
  build() {
    return this.instructions.join('\n');
  }

  // Reset instructions
  reset() {
    this.instructions = [];
    return this;
  }
}

// ============================================
// DOCKER COMPOSE GENERATOR
// ============================================

class DockerComposeGenerator {
  constructor(version = '3.8') {
    this.version = version;
    this.services = {};
    this.networks = {};
    this.volumes = {};
    this.secrets = {};
    this.configs = {};
  }

  // Add service
  addService(name, config) {
    this.services[name] = {
      image: config.image,
      build: config.build,
      container_name: config.containerName,
      ports: config.ports,
      environment: config.environment,
      env_file: config.envFile,
      volumes: config.volumes,
      networks: config.networks,
      depends_on: config.dependsOn,
      restart: config.restart || 'unless-stopped',
      command: config.command,
      healthcheck: config.healthcheck,
      labels: config.labels,
      deploy: config.deploy
    };

    // Remove undefined values
    Object.keys(this.services[name]).forEach(key => {
      if (this.services[name][key] === undefined) {
        delete this.services[name][key];
      }
    });

    return this;
  }

  // Add network
  addNetwork(name, config = {}) {
    this.networks[name] = {
      driver: config.driver || 'bridge',
      external: config.external,
      ipam: config.ipam
    };

    Object.keys(this.networks[name]).forEach(key => {
      if (this.networks[name][key] === undefined) {
        delete this.networks[name][key];
      }
    });

    return this;
  }

  // Add volume
  addVolume(name, config = {}) {
    this.volumes[name] = config.external ? { external: true } : (config.driver ? { driver: config.driver } : {});
    return this;
  }

  // Add secret
  addSecret(name, config) {
    this.secrets[name] = {
      file: config.file,
      external: config.external
    };

    Object.keys(this.secrets[name]).forEach(key => {
      if (this.secrets[name][key] === undefined) {
        delete this.secrets[name][key];
      }
    });

    return this;
  }

  // Build YAML content
  build() {
    const compose = {
      version: this.version
    };

    if (Object.keys(this.services).length > 0) {
      compose.services = this.services;
    }

    if (Object.keys(this.networks).length > 0) {
      compose.networks = this.networks;
    }

    if (Object.keys(this.volumes).length > 0) {
      compose.volumes = this.volumes;
    }

    if (Object.keys(this.secrets).length > 0) {
      compose.secrets = this.secrets;
    }

    return this.toYaml(compose);
  }

  // Convert object to YAML
  toYaml(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${this.toYaml(item, indent + 2)}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else if (typeof value === 'object') {
        yaml += `${spaces}${key}:\n${this.toYaml(value, indent + 1)}`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  }
}

// ============================================
// PROJECT TEMPLATES
// ============================================

const ProjectTemplates = {
  // Standard verenajs app
  verenajs: (config) => {
    const dockerfile = new DockerfileGenerator(config);

    dockerfile
      .comment('Build stage')
      .from(`node:${config.nodeVersion || '20-alpine'}`, 'builder')
      .workdir('/app')
      .blank()
      .comment('Install dependencies')
      .copy('package*.json', './')
      .run('npm ci --only=production')
      .blank()
      .comment('Copy source')
      .copy('.', '.')
      .blank()
      .comment('Build')
      .run('npm run build')
      .blank()
      .comment('Production stage')
      .from(`node:${config.nodeVersion || '20-alpine'}`)
      .workdir('/app')
      .blank()
      .comment('Copy built assets')
      .copy('--from=builder /app/dist', './dist')
      .copy('--from=builder /app/node_modules', './node_modules')
      .copy('package*.json', './')
      .blank()
      .env('NODE_ENV', 'production')
      .expose(config.port || 3000)
      .blank()
      .healthcheck({
        interval: '30s',
        timeout: '10s',
        retries: 3,
        cmd: `wget --quiet --tries=1 --spider http://localhost:${config.port || 3000}/health || exit 1`
      })
      .blank()
      .cmd(['node', 'dist/server.js']);

    return dockerfile.build();
  },

  // Static site (SPA)
  static: (config) => {
    const dockerfile = new DockerfileGenerator(config);

    dockerfile
      .comment('Build stage')
      .from(`node:${config.nodeVersion || '20-alpine'}`, 'builder')
      .workdir('/app')
      .copy('package*.json', './')
      .run('npm ci')
      .copy('.', '.')
      .run('npm run build')
      .blank()
      .comment('Production stage with Nginx')
      .from('nginx:alpine')
      .copy('--from=builder /app/dist', '/usr/share/nginx/html')
      .copy('nginx.conf', '/etc/nginx/nginx.conf')
      .expose(80)
      .cmd(['nginx', '-g', 'daemon off;']);

    return dockerfile.build();
  },

  // Full-stack with API
  fullstack: (config) => {
    const dockerfile = new DockerfileGenerator(config);

    dockerfile
      .comment('Dependencies stage')
      .from(`node:${config.nodeVersion || '20-alpine'}`, 'deps')
      .workdir('/app')
      .copy('package*.json', './')
      .run('npm ci')
      .blank()
      .comment('Build stage')
      .from(`node:${config.nodeVersion || '20-alpine'}`, 'builder')
      .workdir('/app')
      .copy('--from=deps /app/node_modules', './node_modules')
      .copy('.', '.')
      .run('npm run build')
      .blank()
      .comment('Production stage')
      .from(`node:${config.nodeVersion || '20-alpine'}`)
      .workdir('/app')
      .copy('--from=builder /app/dist', './dist')
      .copy('--from=deps /app/node_modules', './node_modules')
      .copy('package*.json', './')
      .blank()
      .env({
        NODE_ENV: 'production',
        PORT: config.port || 3000
      })
      .user('node')
      .expose(config.port || 3000)
      .cmd(['node', 'dist/server.js']);

    return dockerfile.build();
  },

  // Development
  development: (config) => {
    const dockerfile = new DockerfileGenerator(config);

    dockerfile
      .from(`node:${config.nodeVersion || '20-alpine'}`)
      .workdir('/app')
      .blank()
      .comment('Install dependencies')
      .copy('package*.json', './')
      .run('npm install')
      .blank()
      .comment('Copy source')
      .copy('.', '.')
      .blank()
      .env('NODE_ENV', 'development')
      .expose(config.port || 3000)
      .cmd(['npm', 'run', 'dev']);

    return dockerfile.build();
  }
};

// ============================================
// DOCKER COMPOSE TEMPLATES
// ============================================

const ComposeTemplates = {
  // Basic app
  basic: (config) => {
    const compose = new DockerComposeGenerator();

    compose.addService('app', {
      build: {
        context: '.',
        dockerfile: 'Dockerfile'
      },
      ports: [`${config.port || 3000}:${config.port || 3000}`],
      environment: config.environment || {},
      restart: 'unless-stopped'
    });

    return compose.build();
  },

  // App with database
  withDatabase: (config) => {
    const compose = new DockerComposeGenerator();

    compose
      .addService('app', {
        build: {
          context: '.',
          dockerfile: 'Dockerfile'
        },
        ports: [`${config.port || 3000}:${config.port || 3000}`],
        environment: {
          DATABASE_URL: 'postgresql://postgres:postgres@db:5432/app',
          ...config.environment
        },
        dependsOn: ['db'],
        restart: 'unless-stopped',
        networks: ['app-network']
      })
      .addService('db', {
        image: 'postgres:15-alpine',
        environment: {
          POSTGRES_USER: 'postgres',
          POSTGRES_PASSWORD: 'postgres',
          POSTGRES_DB: 'app'
        },
        volumes: ['db-data:/var/lib/postgresql/data'],
        networks: ['app-network'],
        restart: 'unless-stopped'
      })
      .addNetwork('app-network')
      .addVolume('db-data');

    return compose.build();
  },

  // Full stack with Redis
  fullStack: (config) => {
    const compose = new DockerComposeGenerator();

    compose
      .addService('app', {
        build: {
          context: '.',
          dockerfile: 'Dockerfile'
        },
        ports: [`${config.port || 3000}:${config.port || 3000}`],
        environment: {
          DATABASE_URL: 'postgresql://postgres:postgres@db:5432/app',
          REDIS_URL: 'redis://redis:6379',
          ...config.environment
        },
        dependsOn: ['db', 'redis'],
        restart: 'unless-stopped',
        networks: ['app-network']
      })
      .addService('db', {
        image: 'postgres:15-alpine',
        environment: {
          POSTGRES_USER: 'postgres',
          POSTGRES_PASSWORD: 'postgres',
          POSTGRES_DB: 'app'
        },
        volumes: ['db-data:/var/lib/postgresql/data'],
        networks: ['app-network'],
        restart: 'unless-stopped'
      })
      .addService('redis', {
        image: 'redis:7-alpine',
        volumes: ['redis-data:/data'],
        networks: ['app-network'],
        restart: 'unless-stopped'
      })
      .addService('nginx', {
        image: 'nginx:alpine',
        ports: ['80:80', '443:443'],
        volumes: ['./nginx.conf:/etc/nginx/nginx.conf'],
        dependsOn: ['app'],
        networks: ['app-network'],
        restart: 'unless-stopped'
      })
      .addNetwork('app-network')
      .addVolume('db-data')
      .addVolume('redis-data');

    return compose.build();
  }
};

// ============================================
// DOCKER MANAGER
// ============================================

class DockerManager {
  constructor() {
    this.projects = new Map();
    this.deployments = new Map();
  }

  // Generate project files
  generateProject(name, config) {
    const template = config.template || 'verenajs';
    const dockerfileGenerator = ProjectTemplates[template];
    const composeGenerator = ComposeTemplates[config.composeTemplate || 'basic'];

    if (!dockerfileGenerator) {
      throw new Error(`Unknown Docker template: ${template}`);
    }

    const project = {
      name,
      config,
      files: {
        'Dockerfile': dockerfileGenerator(config),
        'docker-compose.yml': composeGenerator(config),
        '.dockerignore': this.generateDockerignore(),
        'nginx.conf': this.generateNginxConfig(config)
      },
      createdAt: Date.now()
    };

    this.projects.set(name, project);
    events.emit('docker:project-generated', { name, config });

    return project;
  }

  // Generate .dockerignore
  generateDockerignore() {
    return `# Dependencies
node_modules
npm-debug.log

# Build
dist
build
.next
.nuxt

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Test
coverage
.nyc_output

# Docker
Dockerfile*
docker-compose*
.docker

# Documentation
docs
*.md
!README.md

# Misc
*.log
tmp
temp
`;
  }

  // Generate Nginx config
  generateNginxConfig(config) {
    const port = config.port || 3000;
    return `
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml;

    # Upstream
    upstream app {
        server app:${port};
    }

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Static files
        location /static/ {
            alias /app/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Health check
        location /health {
            access_log off;
            proxy_pass http://app;
        }

        # API
        location /api/ {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket
        location /ws/ {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # Default - serve SPA
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
`;
  }

  // Generate CI/CD config
  generateCIConfig(platform, config) {
    switch (platform) {
      case 'github':
        return this.generateGitHubActions(config);
      case 'gitlab':
        return this.generateGitLabCI(config);
      case 'jenkins':
        return this.generateJenkinsfile(config);
      default:
        throw new Error(`Unknown CI platform: ${platform}`);
    }
  }

  // GitHub Actions
  generateGitHubActions(config) {
    return `name: Build and Deploy

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /app
            docker compose pull
            docker compose up -d
`;
  }

  // GitLab CI
  generateGitLabCI(config) {
    return `stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

test:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npm test
  cache:
    paths:
      - node_modules/

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
    - master

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
  script:
    - ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "
        cd /app &&
        docker compose pull &&
        docker compose up -d
      "
  only:
    - main
    - master
  environment:
    name: production
`;
  }

  // Jenkinsfile
  generateJenkinsfile(config) {
    return `pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'myapp'
        DOCKER_TAG = "\${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    docker.build("\${DOCKER_IMAGE}:\${DOCKER_TAG}")
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    docker.withRegistry('https://registry.example.com', 'docker-credentials') {
                        docker.image("\${DOCKER_IMAGE}:\${DOCKER_TAG}").push()
                        docker.image("\${DOCKER_IMAGE}:\${DOCKER_TAG}").push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['server-ssh-key']) {
                    sh '''
                        ssh user@server "
                            cd /app
                            docker compose pull
                            docker compose up -d
                        "
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
`;
  }

  // Get project
  getProject(name) {
    return this.projects.get(name);
  }

  // List projects
  listProjects() {
    return Array.from(this.projects.values());
  }

  // Download project as zip
  async downloadProject(name) {
    const project = this.projects.get(name);
    if (!project) throw new Error(`Project ${name} not found`);

    // In a real implementation, this would use a library like JSZip
    // For now, return the files object
    return project.files;
  }
}

// ============================================
// KUBERNETES CONFIG GENERATOR
// ============================================

class KubernetesGenerator {
  constructor() {
    this.manifests = [];
  }

  // Generate deployment
  addDeployment(name, config) {
    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name,
        labels: { app: name }
      },
      spec: {
        replicas: config.replicas || 1,
        selector: {
          matchLabels: { app: name }
        },
        template: {
          metadata: {
            labels: { app: name }
          },
          spec: {
            containers: [{
              name,
              image: config.image,
              ports: [{ containerPort: config.port || 3000 }],
              env: Object.entries(config.env || {}).map(([name, value]) => ({ name, value })),
              resources: config.resources || {
                limits: { cpu: '500m', memory: '512Mi' },
                requests: { cpu: '250m', memory: '256Mi' }
              },
              livenessProbe: {
                httpGet: { path: '/health', port: config.port || 3000 },
                initialDelaySeconds: 30,
                periodSeconds: 10
              },
              readinessProbe: {
                httpGet: { path: '/health', port: config.port || 3000 },
                initialDelaySeconds: 5,
                periodSeconds: 5
              }
            }]
          }
        }
      }
    };

    this.manifests.push(deployment);
    return this;
  }

  // Generate service
  addService(name, config) {
    const service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name,
        labels: { app: name }
      },
      spec: {
        type: config.type || 'ClusterIP',
        ports: [{
          port: config.port || 80,
          targetPort: config.targetPort || 3000
        }],
        selector: { app: name }
      }
    };

    this.manifests.push(service);
    return this;
  }

  // Generate ingress
  addIngress(name, config) {
    const ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name,
        annotations: {
          'kubernetes.io/ingress.class': 'nginx',
          ...config.annotations
        }
      },
      spec: {
        rules: [{
          host: config.host,
          http: {
            paths: [{
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: config.serviceName,
                  port: { number: config.port || 80 }
                }
              }
            }]
          }
        }]
      }
    };

    if (config.tls) {
      ingress.spec.tls = [{
        hosts: [config.host],
        secretName: `${name}-tls`
      }];
    }

    this.manifests.push(ingress);
    return this;
  }

  // Build all manifests
  build() {
    return this.manifests.map(m => this.toYaml(m)).join('\n---\n');
  }

  // Convert to YAML (simplified)
  toYaml(obj, indent = 0) {
    return JSON.stringify(obj, null, 2)
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/,/g, '')
      .replace(/"/g, '');
  }
}

// ============================================
// GLOBAL INSTANCES
// ============================================

const dockerManager = new DockerManager();

// ============================================
// EXPORTS
// ============================================

export {
  DockerfileGenerator,
  DockerComposeGenerator,
  DockerManager,
  KubernetesGenerator,
  ProjectTemplates,
  ComposeTemplates,
  dockerManager
};

export default {
  DockerfileGenerator,
  DockerComposeGenerator,
  DockerManager,
  KubernetesGenerator,
  dockerManager
};
