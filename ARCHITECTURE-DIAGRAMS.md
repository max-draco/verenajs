# Architecture Diagrams

## Microservices Architecture
```mermaid
graph TD
UI[Frontend] --> API[Backend API]
API --> DB[Database]
API --> Cache[Redis Cache]
