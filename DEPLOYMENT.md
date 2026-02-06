# Deployment Guide

Complete guide to deploying verenajs applications.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Web Deployment](#web-deployment)
- [Docker Deployment](#docker-deployment)
- [Visual Builder Deployment](#visual-builder-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Configuration](#cicd-configuration)
- [Mobile Deployment](#mobile-deployment)
- [Desktop Deployment](#desktop-deployment)

---

## Prerequisites

- Node.js 18+
- npm 9+ or yarn
- Docker (for containerized deployments)
- Git

---

## Web Deployment

### Build for Production

```bash
npm run build
```

This generates optimized bundles in the `dist/` directory.

### Static Hosting (Netlify, Vercel, GitHub Pages)

1. Build your app:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting provider.

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### GitHub Pages
```bash
npm run build
npm install -g gh-pages
gh-pages -d dist
```

---

## Docker Deployment

### Using Visual Builder

The Visual Builder includes a built-in Docker deployment feature:

1. Open the Visual Builder (Ctrl+B)
2. Click "Deploy" in the toolbar
3. Select "Docker"
4. Configure your deployment settings
5. Click "Generate" to create Dockerfile and docker-compose.yml

### Programmatic Docker Setup

```javascript
import {
  DockerfileGenerator,
  DockerComposeGenerator
} from 'verenajs/core/docker-integration';

// Generate Dockerfile
const dockerfile = new DockerfileGenerator();
const dockerfileContent = dockerfile.generate({
  type: 'verenajs',
  nodeVersion: '20-alpine',
  port: 3000
});

// Generate docker-compose.yml
const compose = new DockerComposeGenerator();
const composeContent = compose.generate({
  template: 'basic',
  port: 3000
});
```

### Manual Docker Setup

#### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Build and Run

```bash
# Build the image
docker build -t my-verenajs-app .

# Run the container
docker run -d -p 80:80 my-verenajs-app

# Or use Docker Compose
docker-compose up -d
```

---

## Visual Builder Deployment

### Export from Visual Builder

1. Open the Visual Builder
2. Design your application
3. Click "Export" in the toolbar
4. Choose export format (verenajs, React, Vue, HTML)
5. Click "Deploy" for direct deployment options

### Deployment Options from Builder

| Option | Description |
|--------|-------------|
| Docker | Generate Dockerfile and deploy |
| Kubernetes | Generate K8s manifests |
| Netlify | Deploy to Netlify |
| Vercel | Deploy to Vercel |
| Download | Download source code |

### Builder Deploy API

```javascript
import { createAdvancedBuilder, builderState } from 'verenajs/builder';
import { DockerfileGenerator } from 'verenajs/core/docker-integration';

// Get current builder state
const tree = builderState.componentTree;

// Generate production code
const code = generateCode(tree, 'verenajs');

// Generate Docker deployment
const docker = new DockerfileGenerator();
const dockerfile = docker.generate({
  type: 'verenajs',
  port: 3000
});
```

---

## Kubernetes Deployment

### Generate K8s Manifests

```javascript
import { KubernetesGenerator } from 'verenajs/core/docker-integration';

const k8s = new KubernetesGenerator();

const manifests = k8s.generate({
  name: 'my-verenajs-app',
  namespace: 'production',
  replicas: 3,
  port: 3000,
  resources: {
    requests: { cpu: '250m', memory: '256Mi' },
    limits: { cpu: '500m', memory: '512Mi' }
  },
  ingress: {
    host: 'app.example.com',
    tls: true
  },
  autoscaling: {
    minReplicas: 3,
    maxReplicas: 10,
    targetCPU: 70
  }
});
```

### Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n production

# View logs
kubectl logs -f deployment/my-verenajs-app -n production
```

### Helm Chart

```yaml
# values.yaml
replicaCount: 3

image:
  repository: my-registry/my-verenajs-app
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  hosts:
    - host: app.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

---

## CI/CD Configuration

### GitHub Actions

```javascript
import { CICDGenerator } from 'verenajs/core/docker-integration';

const cicd = new CICDGenerator();
const workflow = cicd.generateGitHubActions({
  branches: ['main', 'develop'],
  registry: 'ghcr.io',
  imageName: 'my-org/my-app'
});
```

#### Example Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Build Docker image
        run: docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/${{ github.repository }}:${{ github.sha }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:20-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npm test

deploy:
  stage: deploy
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
```

---

## Mobile Deployment

### iOS Deployment

```bash
# Build for iOS
npm run build:mobile

# Open in Xcode
npx cap open ios
```

In Xcode:
1. Select your team for signing
2. Choose a target device
3. Archive for App Store submission

### Android Deployment

```bash
# Build for Android
npm run build:mobile

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Generate signed APK/Bundle
2. Upload to Google Play Console

---

## Desktop Deployment

### Electron

```bash
# Build for all platforms
npm run build:desktop

# Build for specific platform
npm run build:desktop:mac
npm run build:desktop:win
npm run build:desktop:linux
```

### Qt

For Qt desktop applications:

1. Build the web assets
2. Configure Qt WebEngine
3. Package with Qt tools

See [ARCHITECTURE.md](ARCHITECTURE.md) for Qt bridge details.

---

## Environment Variables

### Production Environment

```bash
# .env.production
NODE_ENV=production
API_URL=https://api.example.com
ANALYTICS_ID=UA-XXXXX
```

### Docker Environment

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - NODE_ENV=production
      - API_URL=${API_URL}
```

---

## Performance Optimization

### Bundle Optimization

```javascript
// webpack.config.js
export default {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        verenajs: {
          test: /[\\/]node_modules[\\/]verenajs[\\/]/,
          name: 'verenajs',
          chunks: 'all',
        }
      }
    }
  }
};
```

### Caching Strategy

```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Monitoring

### Health Check Endpoint

```javascript
// Add to your app
const healthEndpoint = () => {
  return {
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  };
};
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1
```

---

## Next Steps

- Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Check [SECURITY.md](SECURITY.md) for security best practices
- See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
