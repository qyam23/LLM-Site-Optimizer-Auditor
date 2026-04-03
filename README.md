# LLM Site Optimizer Auditor

A professional auditing tool designed to analyze websites for AI discoverability, SEO structure, and semantic clarity. This application helps developers and site owners optimize their content for LLM (Large Language Model) ingestion.

## Features

- **Website Crawler**: Deep analysis of internal pages, heading hierarchies, and metadata.
- **AI Readiness Audit**: Checks for `llms.txt`, machine-readable documentation, and semantic structure.
- **SEO Technical Audit**: Evaluates titles, descriptions, canonicals, and robots meta.
- **Repository Analysis**: Inspects GitHub repositories to detect tech stacks and documentation gaps.
- **Markdown Report Generation**: Generates a professional, structured report ready for ChatGPT or other AI tools.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Motion (Framer Motion).
- **Backend**: Node.js, Express, Cheerio (for crawling/parsing), Playwright (for browser-rendered fallback).
- **Icons**: Lucide React.

## How to Run Locally

1. **Clone the repository** (or download the source).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Install Playwright Browsers** (Required for browser-rendered fallback):
   ```bash
   npx playwright install chromium
   ```
4. **Start the application**:
   ```bash
   npm run dev
   ```
5. **Access the UI**: Open your browser to `http://localhost:3000`.

## Usage

1. Enter a **Website URL** (required).
2. Optionally enter a **GitHub Repository URL** (e.g., `owner/repo`).
3. Configure crawl depth and audit options.
4. Click **Start Audit**.
5. Once complete, review the findings in the dashboard.
6. Click **Export MD** to download the professional Markdown report.
