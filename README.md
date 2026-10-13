# TrustLens — Hospital AI Assistant

Authoritative clinical document knowledge assistant with rigorous provenance, deterministic precedence adjudication, and autonomous clinical silence.

## Team Folders & Code Ownership

| Folder / Path | Primary Owner | Role & Responsibility |
| :--- | :--- | :--- |
| `app/` (pages, layouts), `components/` | **Ajay** | **Frontend** (everything clinicians see, bedside UI, interaction states) |
| `app/api/ask/`, `app/api/upload/`, `lib/ai/` | **Sujal** | **AI Engine** (retrieval, answers, claim grounding, LLM provider abstraction) |
| `app/api/documents/`, `app/api/dashboard/`, `app/api/evidence/`, `lib/db/`, `lib/rules/`, `supabase/` | **Sujan** | **Data & Rules** (the referee, 5-tier authority ladder, schema, database, audit evidence) |
| `lib/contract.ts`, `lib/mock/`, `lib/constants.ts` | **Shared** | **Core Contract** (Change **only** if all three members agree) |

---

## 5-Tier Authority Precedence Ladder

1. **Tier 1:** Regulatory Statutes (Supreme Authority)
2. **Tier 2:** Clinical Guidelines (National Benchmarks)
3. **Tier 3:** Payer Rules (Binding Prior Authorization)
4. **Tier 4:** Institutional SOPs (Hospital Operational Protocols)
5. **Tier 5:** Department Memos / Bylaws (Informational Floor Guidance)

---

## Getting Started

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
