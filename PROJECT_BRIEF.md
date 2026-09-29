# CONTEXT

## Event and Theme
I am competing in HackDataV2. The official theme is:
"Synthetic Data Platform: Realistic, privacy-safe tabular, relational and document data generated on demand."

The judging criteria emphasize system design, features, UI, AI, and solving the data scarcity/privacy problem.

## Hard Constraints
- Total development time: about 10 hours.
- Prefer free and open-source technologies. No microservices, Kubernetes, complex DevOps, custom ML model training, or unnecessary cloud infrastructure.
- Tools I have: Antigravity Pro (AI-assisted development), Google AI Pro / Student offer, and Google Cloud free credits.
- Stack preference: Python, FastAPI, React + Tailwind CSS (preferred over Streamlit; if you disagree, argue the case briefly), Pandas, NumPy, Faker, SDV (only where it truly helps), SQLite/DuckDB, Jinja2, ReportLab, and Gemini (only where AI is genuinely needed).

## Product Vision
"AI-Powered Synthetic Data Studio". Our differentiation is NOT inventing synthetic data. It is:
"From intent to validated synthetic environment."
Workflow: Describe → Understand → Plan → Generate → Stress-Test → Validate → Export.

One platform, one synthetic "world", many outputs: structured tables, a relational database, invoices, bank statements, edge-case datasets, and quality/privacy reports.

Core pipeline:
User Input → AI Schema Understanding → Generation Plan → User Configuration → Synthetic Data Generation → Edge-Case/Scenario Injection → Validation → Quality + Privacy-Risk Report → Preview → Export/API

## Official Requirements
1. Schema-aware generation, not random generation.
2. Infer tables, columns, types, and keys from a sample or schema.
3. Learn distributions, correlations, and foreign-key cardinalities.
4. AI generates realistic names/text and meaningful edge cases.
5. Validate referential integrity and statistical fidelity.
6. Export generated data.
7. Support tabular data.
8. Support relational structures.
9. Support document generation (invoices, bank statements).
10. One workspace to configure, preview, and export.
11. Configuration includes row count, random seed, locale/currency, privacy rules, and export options.

## Input Methods
- Upload CSV/sample data.
- Upload or write a schema.
- Natural-language description, e.g. "Generate a Pakistani e-commerce system with 5,000 customers, 20,000 orders and realistic invoices."

AI must infer: tables, columns, data types, primary keys, foreign keys, relationships, distributions, useful constraints, generation strategies, and edge cases.

## Generation Modes
1. TABULAR: numeric, categorical, dates, emails, names, addresses, text; configurable row count, seed, null rate, outlier rate.
2. RELATIONAL: e.g. Customers → Orders → Order Items → Payments. Requires PK/FK integrity, 1:1 and 1:N relationships, configurable cardinality, cross-table consistency, and calculated totals that reconcile.
3. DOCUMENTS: at minimum invoices and bank statements, generated from the SAME underlying synthetic data (never unrelated random documents).

## Multi-Language / Locale
Support English, Urdu, Arabic, Spanish, and Chinese, prioritizing what is practical in 10 hours. Language affects names, addresses, free text, document language, date formats, currency, and number formatting. The architecture must make adding a new language easy (e.g. a locale pack registry).

## Constraint Engine
Rules such as: age >= 18, salary > 0, order_total = sum(order_items), tax = percentage of subtotal, delivery_date >= order_date. Generated data must be validated against these rules.

## Scenario / Edge-Case Lab
Normal data, missing values, outliers, rare categories, boundary values, and custom edge cases.

## Quality Report (measurable where practical)
Statistical similarity/fidelity, correlation preservation, constraint compliance, referential integrity, null-rate accuracy, outlier-rate accuracy, duplicate indicators, generation summary.
Do NOT invent scientific guarantees or claim "100% privacy".

## Privacy
Include privacy-aware generation and a privacy-risk/duplicate check. Clearly distinguish four things: (1) synthetic generation, (2) privacy controls, (3) privacy-risk indicators, (4) formal privacy guarantees. Do NOT claim differential privacy unless it is genuinely implemented.

## AI Usage Rules
AI must NOT generate millions of structured rows individually. Bulk structured data comes from deterministic/statistical/open-source engines. AI is used for: schema interpretation, natural language → schema, generation planning, constraint extraction, realistic free-text, edge-case suggestions, explanations, and user assistance.

## API Fallback / Rotation
Design a provider abstraction supporting multiple legitimate AI providers/keys. If one hits its allowed quota or rate limit: detect the failure → automatically use the next configured provider/key → continue where technically safe → show status in logs/UI. Never bypass provider restrictions or quotas illegally.

## UI/UX
Polished but achievable within 10 hours: modern dashboard, clear navigation, generation wizard, drag-and-drop upload, schema visualization, generation-plan preview, configuration panel, live data preview, progress indicator, quality report with charts, document preview, export center, API section, helpful empty/loading/error states, and responsive layout. A judge must understand the product within 30 seconds.

## Quality Bar
The architecture must be technically correct, implementable in about 10 hours, modular, testable, demo-friendly, low-cost/free, explainable as scalable, and aligned with the HackDataV2 judging criteria.

---

# ROLE

You are simultaneously:
- A World-Class AI Product Architect (system design, product thinking, judge-focused positioning).
- A Senior Software Engineer (Python/FastAPI/React/Tailwind, data engineering, synthetic data).
- An Elite Programming Mentor who teaches an absolute beginner patiently and never assumes prior knowledge.

Make concrete technical decisions. Do not give generic startup advice. Prefer a working, polished, judge-ready product over unnecessary complexity.

---

# ACTION

Complete these in order.

## Part A: The 20 Architecture Deliverables
1. Recommended complete architecture.
2. Component/module diagram (ASCII or Mermaid).
3. Technology selection with reasons (include a short React+Tailwind+FastAPI vs Streamlit verdict).
4. Database design.
5. API design (endpoints, request/response shapes).
6. AI architecture.
7. Synthetic-data generation architecture.
8. Validation architecture.
9. Privacy architecture.
10. Multi-language architecture.
11. API fallback architecture.
12. UI/UX page structure.
13. Exact MVP features for 10 hours.
14. Features to postpone.
15. Recommended implementation order (with hour estimates).
16. Demo flow for judges.
17. Main technical risks and solutions.
18. Testing strategy.
19. Deployment strategy.
20. A final concise architecture a coding agent can implement.

## Part B: Step-by-Step Code Delivery
After Part A, deliver the full working project file by file, following the implementation order from item 15. Start with the foundational starter boilerplate (backend + frontend that run together), then add features one phase at a time: schema inference → generation engine → constraints → edge-case lab → validation and quality report → privacy check → documents (invoice + bank statement PDFs) → locale packs → AI provider fallback → UI pages → export center.

Work in phases. At the end of each phase, stop, summarize what works, tell me how to test it, and wait for me to say "continue". This keeps every code block complete and avoids truncation.

---

# FORMAT

- Begin with Part A as numbered sections matching the 20 items above.
- Then show a full project tree (folders and files) with a one-line purpose for each file.
- Then deliver code file by file. For each file use this layout:
  1. File path (as a heading).
  2. "Why this file exists": a plain-English explanation of the design decision.
  3. "How it works": a short walkthrough.
  4. The complete code block (one file per block, never merged).
  5. "How to test this file": a concrete command or action.
- Keep modules small and separated: backend (routers, services, engines, validators, ai providers, locales, documents), frontend (pages, components, api client), and tests.
- Use tables for comparisons, Mermaid or ASCII for diagrams, and fenced code blocks with the language tag for all code.

---

# TONE

Professional, highly educational, patient, encouraging, and clear. Define jargon the first time it appears (e.g. "foreign key", "seed", "CORS"). Celebrate small wins, and warn about common beginner mistakes before they happen. Be honest: never overstate privacy or statistical claims.

---

# MANDATORY EXECUTION RULES (STRICTLY FOLLOW)

## 1. Framework Structure (CRAFT)
Your entire response must stay organized around the CRAFT framework: Context (HackDataV2 theme, 10-hour limit, product vision), Role (World-Class AI Product Architect, Software Engineer, and Elite Programming Mentor), Action (the 20 architectural elements plus step-by-step code files), Format (file-by-file, modular layout), and Tone (professional, educational, patient, encouraging, clear).

## 2. Beginner Development and Step-by-Step Explanation
Treat me as an ABSOLUTE BEGINNER.
- Before writing any code, explain the "Why" and the "How" behind every architecture decision and file layout choice.
- Give a clear, chronological, numbered guide of exactly what I must do to set up my computer and run the code (installing Python, Node.js, and any other tools, in order).
- Write fully complete, functional code blocks. NO placeholders, NO "TODO", NO "rest of code here", NO skipped lines.

## 3. Explicit Code Documentation
Document intensely. Every single line of code, every function, and every configuration block must have a highly descriptive, simple, plain-English comment explaining exactly what it does. Assume the reader has never programmed before.

## 4. Antigravity and Environment Instructions
I am using Antigravity Pro for AI-assisted development, with Python, FastAPI, and React + Tailwind CSS. You must provide:
- Exact terminal setup commands: create and activate a virtual environment (for Windows, macOS, and Linux), pip installs (with a complete requirements.txt), npm installs,---

# ADDITIONAL REQUIREMENTS (v2): GITHUB WORKFLOW, DEPLOYMENT, TOOLS, AND GUIDED STEPS

## A. Antigravity Behaviour (overrides "print code in chat")
- I am working inside Antigravity with an empty workspace folder open.
- Create the real files directly in the workspace using the exact project tree. Also show each file's explanation ("Why / How / How to test") in the chat.
- Do not run any terminal command without telling me first what it does in plain English. I will approve each command.
- Before starting, create a Planning artifact (task list + implementation plan) and wait for my approval.
- Work in phases and stop after every phase. Wait for me to say "continue".

## B. Professional GitHub Workflow (teach me as an absolute beginner)
Give me a numbered, chronological guide. For EACH step say: WHERE (which app/terminal/website), WHAT (the exact command or click), HOW (a plain-English explanation of what it does), and WHAT I SEE if it worked, plus what to do if it fails.

Cover, in this order:
1. Install and verify Git (`git --version`), and set `git config --global user.name` and `user.email`.
2. Create a GitHub account (if needed) and a new EMPTY repository named `synthetic-data-studio` on github.com (public, no auto-generated README, so nothing conflicts).
3. Authenticate safely (GitHub CLI `gh auth login`, or a Personal Access Token). Warn me never to paste tokens into the chat.
4. `git init`, connect the remote (`git remote add origin ...`), and make the first commit.
5. Create these files BEFORE the first commit: `.gitignore` (Python, Node, `.env`, `venv`, `node_modules`, generated data/output folders), `README.md`, `.env.example` (fake placeholder keys only), and `LICENSE` (MIT).
6. Branching model (simple for a hackathon): `main` = always working/demo-ready; `develop` = integration; `feature/<name>` = one branch per phase (e.g. `feature/schema-inference`). Explain each branch's purpose.
7. Commit convention: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`). Show good and bad commit message examples. Commit after every working phase.
8. Pull Request routine per phase: push the feature branch → open a Pull Request on GitHub → read the diff → merge into `develop` → pull locally → delete the merged branch. If there are teammates, explain code review and merge conflicts, and how to resolve a conflict step by step.
9. GitHub Actions CI: create `.github/workflows/ci.yml` that runs backend tests (pytest) and a frontend build on every push and pull request. Explain how to read a green tick vs a red cross and how to fix a failure.
10. Secrets safety: explain why `.env` must never be committed, how to check (`git status`, `git diff --staged`), and what to do if a key was committed by mistake (revoke/rotate the key first, then clean up).
11. Tag a release at the end (`v1.0.0-hackathon`) and write a professional README (problem, features, architecture diagram, setup, demo screenshots, honest limitations).
12. A "daily routine cheat sheet" table: pull → branch → code → test → commit → push → PR → merge.
13. Beginner mistakes: committing to main by accident, forgetting to pull, giant commits, leaked keys, detached HEAD, "rejected non-fast-forward". Give the fix for each.

## C. Explicit Deployment Guide (free tier)
Choose free/low-cost hosting and explain WHY. Recommended default (you may propose a better free option with reasons):
- Frontend (React build): Vercel or Netlify (free tier), connected to the GitHub repo.
- Backend (FastAPI): Render web service (free tier) or Hugging Face Spaces with Docker. Mention Google Cloud Run as an optional alternative that needs a billing account.
- Warn me about free-tier cold starts (the backend sleeps after inactivity) and tell me to open the backend URL a few minutes before the demo to wake it.
- Warn me that free hosting filesystems are temporary: do not rely on saved files; generate in memory or on demand, and use SQLite only for non-critical metadata.

Give a numbered guide with WHERE / WHAT / HOW for:
1. Prepare the backend for production: `requirements.txt` with pinned versions, a start command (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`), a `Dockerfile` (with every line commented), a `/health` endpoint, and CORS reading allowed origins from an environment variable.
2. Prepare the frontend: the API base URL from an environment variable (`VITE_API_URL`), `npm run build`, and a local production test with `npm run preview`.
3. Deploy the backend: exact clicks on the hosting website (create account → New Web Service → connect GitHub repo → set root directory, build command, start command → add environment variables such as `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, `ALLOWED_ORIGINS`) → wait for deploy → open `/health` and `/docs` to confirm.
4. Deploy the frontend: exact clicks (import repo → framework preset → set `VITE_API_URL` to the backend URL → deploy) → open the live URL.
5. Connect them: update `ALLOWED_ORIGINS` on the backend to the frontend URL, redeploy, and fix CORS errors if they appear (show how to read the browser console).
6. Auto-deploy: explain that pushing to `main` triggers redeploy, and how to roll back to a previous deploy.
7. Post-deploy checklist: run the full demo flow on the live URL, test on a phone, test with a fresh browser, confirm no keys are visible in the frontend code or network tab.
8. Fallback plan: a local demo recording (screen capture video) and a `docker compose up` local option in case the internet or free hosting fails during judging.

## D. Tools Inventory (give me a table, and tell me exactly when to install each one)
Table columns: Tool | Purpose | Free? | Where to get it | When needed | How to verify installed.
Include at least: Antigravity, Git, GitHub (+ GitHub CLI), Python 3.11+, pip/venv, Node.js LTS + npm, Vite, React, Tailwind CSS, FastAPI, Uvicorn, Pandas, NumPy, Faker, SDV (optional), DuckDB/SQLite, Jinja2, ReportLab, pytest, Docker Desktop (optional), Gemini API key (Google AI Studio), Vercel/Netlify, Render/Hugging Face, and a screen recorder (OBS or built-in) for the backup demo video.

## E. "What Do I Do If Something Is Needed" Rule
At every step, if I must do something outside the code (create an account, get an API key, click a button on a website, install software, change a setting), say so in a clearly marked box:

  YOUR ACTION NEEDED:
  - Where: ...
  - What to do: ...
  - What you should see: ...
  - If it does not work: ...

Never assume I have an account, key, or tool. Ask me to confirm before continuing.
For the Gemini key: explain step by step how to create one in Google AI Studio, how to put it in a local `.env` file, how to add a second key for the fallback system, and remind me that all use must follow the provider's terms and quotas.

## F. Updated Phase Plan (each phase = one branch + one commit set + one PR)
Phase 0: Tools install, GitHub repo, first commit, `.gitignore`, CI skeleton
Phase 1: Starter boilerplate (FastAPI health + React/Tailwind page), verify both run together
Phase 2: Schema inference → Phase 3: Generation engine → Phase 4: Constraints
Phase 5: Edge-case lab → Phase 6: Validation and quality report → Phase 7: Privacy check
Phase 8: Documents (invoice + bank statement) → Phase 9: Locale packs → Phase 10: AI provider fallback
Phase 11: UI pages polish → Phase 12: Export center and API section
Phase 13: Deployment (backend, then frontend, then connect) → Phase 14: README, demo script, backup video, release tag

At the end of each phase, output this checklist:
  1. What works now
  2. How I test it (exact commands or clicks)
  3. Git commands to commit, push, and open the PR (exact commands)
  4. YOUR ACTION NEEDED items (if any)
  5. Say "continue" to move to the next phase

## G. Final Deliverables
- A working live URL, a public GitHub repo with clean commit history, a professional README, a green CI badge, a 2-minute demo script, and a backup demo video plan.
- Remain honest: no "100% privacy" claims, no differential-privacy claims, and no invented statistics anywhere in the app, the README, or the demo script. and Tailwind setup.
- Clear instructions to run the FastAPI backend and the React frontend at the same time (two terminals, exact commands, ports, and how to confirm both are running, including CORS configuration).
- A foundational starter boilerplate (a minimal FastAPI app with a health-check endpoint and a React+Tailwind page that calls it) that honors this runtime environment so it runs on the first try.
- Tips on using Antigravity effectively with this project (e.g. how to structure prompts per phase, and how to verify generated code).

