# tabPagExt - Tableau Pagination Extension

## Project Purpose
A minimal Python-based local development scaffold for a Tableau Dashboard Extension providing pagination capabilities.

## Current Lightweight Python Approach
This project uses Python's built-in `http.server` for local static file serving during development. Node.js and npm are intentionally NOT part of this initial setup. No package installation or virtual environment is required.

## Project Structure
```
tabPagExt/
├── extension/
│   └── pagination.trex
├── src/
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── .env.example
├── .gitignore
└── README.md
```

## Configuration
- Copy `.env.example` to `.env` locally as needed. `.env` is environment-specific and must not be committed.

## Windows / Tableau Desktop Testing
When testing in Tableau Desktop on Windows, ensure the local development server is reachable and update the source URL in `extension/pagination.trex` accordingly if running outside Google Cloud Shell.
