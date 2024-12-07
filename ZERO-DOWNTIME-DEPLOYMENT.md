# Zero Downtime Deployment

## Strategy Overview
- **Blue-Green Deployment**: Live traffic is shifted between two environments.
- **Canary Releases**: New versions are rolled out incrementally to monitor real-time performance.

## Technical Stack
- Load Balancer: **NGINX**
- CI/CD: **GitHub Actions + Docker + Kubernetes**
- Rollback Strategy: Automatic rollback if error rate > 0.05%.

## Workflow Diagram
```mermaid
graph TD
A[Code Push] --> B[Build Docker Image]
B --> C[Deploy to Green]
C --> D[Monitor Traffic]
D --> E[Switch Traffic to Green]
