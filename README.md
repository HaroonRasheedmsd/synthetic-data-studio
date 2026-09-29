<div align="center">
  <img src="./frontend/public/vite.svg" width="80" alt="Logo" />
  <h1>Synthetic Data Studio</h1>
  <p><strong>HackDataV2 Official Submission</strong></p>
  <p><em>Realistic, privacy-safe tabular, relational, and document data generated on demand.</em></p>
</div>

<hr />

## 🏆 The Problem
In modern software development and testing, relying on real production databases exposes companies to massive **PII (Personally Identifiable Information) leakage risks** and compliance violations (GDPR/HIPAA). Conversely, relying on simple fake data scripts results in flat, unrealistic datasets that fail to stress-test complex relational joins or edge cases.

## 💡 The Solution
**Synthetic Data Studio** is a privacy-safe, AI-powered generation platform. You describe your business domain in plain English (or upload a sample CSV), and our platform orchestrates a **Modular 3-Engine Architecture** to synthesize millions of mathematically perfect, realistic records.

---

## ⚙️ Modular 3-Engine Architecture

This project is not a simple LLM wrapper. The AI is only used for *Schema Inference*, while the heavy lifting is completely decoupled into three deterministic engines:

1. **Tabular Engine:** Leverages localized Faker algorithms to generate realistic names, addresses, and localized currencies (supporting 🇺🇸, 🇬🇧, 🇵🇰, 🇸🇦, 🇪🇸, 🇨🇳).
2. **Relational Engine:** Maps multi-table graphs in memory to ensure rigid **1:N Primary Key / Foreign Key integrity**, ensuring zero orphan records.
3. **Document Engine:** Auto-detects the data domain (e.g., E-Commerce vs. Banking) and compiles synthetic transactional data into pixel-perfect **HTML/PDF Invoices and Bank Statements**.

---

## ✨ Key Features (Hackathon Matrix)

- **AI Schema Inference:** Gemini AI parses natural language (or mathematically profiles uploaded CSVs to learn min/max/mean distributions) and constructs a rigid `GenerationPlan`.
- **Business Constraints Engine:** Uses a Pandas-powered validation layer to evaluate AI-generated business rules (e.g., `age >= 18`) and reports constraint violations.
- **Scenario Lab (Edge Cases):** Sliders allow you to inject `Null Rates`, `Anomalies (10x multipliers)`, and `Exact Duplicates` into the data stream to stress-test your data pipelines.
- **Privacy Guaranteed:** A post-generation Privacy Risk Assessment mathematically proves that identifier leakage risk is Low, as no real PII is passed through the pipeline.
- **Export Center:** Download individual tables as CSVs, native PDFs, or package the entire environment into a **ZIP Bundle** containing data, reports, and documents.
- **Zero-Shot Quick Starts:** Pre-configured architectures (E-Commerce, Banking, Healthcare, Education) allow deterministic, instant Generation Plans without waiting for AI inference.

---

## 🚀 Quick Start Guide

This project is built using a decoupled **FastAPI (Python)** backend and a **React + Vite (Tailwind V4)** frontend.

### 1. Start the Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*The API will be available at `http://localhost:8000`*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The UI will be available at `http://localhost:5173`*

---

## 🧪 Recommended Judge Demo Flow

1. Open the UI and click the **E-Commerce Quick Start** template on the Home page.
2. Note the generated **ER Diagram** showing `customers ━━(1:N)━━▶ orders`.
3. In the **Edge Case Lab**, slide the *Missing Value Rate* to ~5% to simulate real-world messy data.
4. Click **Generate & Validate**.
5. Observe the **Validation Report** confirming 100% Referential Integrity, despite the injected nulls.
6. Scroll down to view the relational tabular datasets.
7. Scroll to the bottom to view the **Document Engine** output (pixel-perfect HTML invoices mathematically tied to the generated orders).
8. Click **Export to PDF** on an invoice, or click **Download ZIP Bundle** at the top to receive the full packaged ecosystem.

---
*Built with ❤️ for HackDataV2.*
