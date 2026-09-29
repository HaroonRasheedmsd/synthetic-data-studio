# AI-Powered Synthetic Data Studio

## Problem
Data scarcity and privacy constraints slow down software development and testing.

## Features
- **Schema Inference:** AI interprets natural language to design relational database schemas.
- **Relational Generation:** Generates valid, realistic tabular data maintaining Foreign Key constraints.
- **Validation Engine:** DuckDB-powered quality reporting and validation on generated data.
- **Export:** Export to CSV, JSON, or a ready-to-use SQLite database.

## Architecture & Scalability
This project uses a decoupled React + FastAPI architecture.
**Note on Database Scalability:** We currently use SQLite (via SQLAlchemy) for lightweight, serverless app metadata management. Because we use SQLAlchemy's ORM, migrating to a production PostgreSQL database in the future is literally just a connection-string change in the environment variables.

*(Detailed documentation, architecture diagrams, and demo instructions will be added in Phase 14).*
