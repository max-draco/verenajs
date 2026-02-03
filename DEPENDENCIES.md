# Dependencies

## Core Libraries
- **React**: v18.0.0 (Frontend Framework)
- **Express**: v4.17.1 (Backend Framework)
- **PostgreSQL**: v14.0 (Database)

## Custom Dependencies
- **Custom Logger**: A lightweight, thread-safe logging utility.

## Dependency Graph
```mermaid
graph TD
A[App] --> B[Frontend (React)]
A --> C[Backend (Express)]
C --> D[Database (PostgreSQL)]
