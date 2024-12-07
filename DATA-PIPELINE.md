# Data Pipeline

## Overview
- Data is collected from multiple APIs and streamed into a Kafka cluster.
- Preprocessed using Apache Spark before storing in a PostgreSQL database.

## Diagram
```mermaid
graph TD
A[Data Source] --> B[Kafka Cluster]
B --> C[Preprocessing (Spark)]
C --> D[PostgreSQL]
