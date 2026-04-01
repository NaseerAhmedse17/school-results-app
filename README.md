## School Test Results App

Teacher-facing web app to record student test results, validate inputs (client + server), store records in MongoDB, and review/edit/delete results in a clean dashboard UI.

### Tech stack

- **Frontend**: Next.js (App Router) + React + TypeScript + Material UI
- **Backend**: Next.js **Route Handlers** (Node.js runtime) + TypeScript  
  - Runs inside Next.js under `src/app/api/*`
  - Uses `NextRequest`/`NextResponse` to implement REST-style endpoints
- **Database**: MongoDB Atlas + Mongoose (ODM)

### Features (requirements)

- **Mandatory fields**: Full name, Marks, Fee paid
- **Client-side validation (JavaScript)**:
  - On submit, if required fields are missing → **centered validation dialog** listing the missing fields
  - Marks must be a **whole number between 1 and 100** → shown in the same validation dialog
- **Server-side validation**: API rejects invalid payloads with `fieldErrors` (shown inline under fields)
- **Pass/Fail/Fee rules**:
  - Marks `< 60` → **Fail**
  - Marks `>= 60` and fee paid → **Pass**
  - Marks `>= 60` and fee not paid → **Pay fees to check result**
- **Grid**:
  - Checkbox multi-select (page-only select all)
  - Multi-delete with confirmation dialog
  - Edit loads the record back into the form
- **Feedback**: top-right toast messages for success/error

### Getting started (local)

1. Install dependencies.

```bash
npm install
```

2. Create environment file.

```bash
cp .env.example .env
```

3. Set `MONGODB_URI` in `.env` (and optionally `MONGODB_DB`).

4. Start the dev server.

```bash
npm run dev
```

Open `http://localhost:3000`.

### Environment variables

- **`MONGODB_URI`** (required): MongoDB connection string
- **`MONGODB_DB`** (optional): database name override

Notes:
- `.env` is **gitignored** by default (see `.gitignore`).

### Scripts

- **`npm run dev`**: start dev server
- **`npm run lint`**: ESLint
- **`npm run build`**: production build
- **`npm start`**: run production server

### API

- **`GET /api/results`**: list results
- **`POST /api/results`**: create result
- **`PUT /api/results/[id]`**: update result
- **`DELETE /api/results`**: delete many results with body `{ "ids": ["..."] }`

Error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "…",
    "fieldErrors": {
      "fullName": "…",
      "marks": "…",
      "feePaid": "…"
    }
  }
}
```

### Code structure (separation of concerns)

- **Frontend UI**
  - `src/components/ResultsPageClient.tsx`: thin page composition
  - `src/components/ResultsForm.tsx`: form UI + submit-time JS validation dialog
  - `src/components/ResultsTable.tsx`: table/grid UI
  - `src/components/results/*`: small presentational components (hero/footer/toast/dialog/cards/chips)
  - `src/hooks/useResultsPage.ts`: client state + fetch calls for create/update/delete/refresh
- **Backend API**
  - `src/app/api/results/route.ts`, `src/app/api/results/[id]/route.ts`: route handlers (parse → validate → repo/service → response)
  - `src/lib/api/errors.ts`: shared error helpers
- **Data layer**
  - `src/lib/db/mongo.ts`: connection (cached)
  - `src/lib/results/resultModel.ts`: Mongoose schema/model
  - `src/lib/results/resultRepository.ts`: CRUD functions (DB-only)
  - `src/lib/results/resultValidation.ts`: request validation (server)
  - `src/lib/results/resultService.ts`: domain mapping (status + list DTOs)

### Project walkthrough (end-to-end)

- **SSR page load**
  - `src/app/page.tsx` loads initial data from MongoDB (via service layer) and renders `ResultsPageClient`.
- **Client page controller**
  - `src/hooks/useResultsPage.ts` owns client state (results list, selection, editing state) and calls the API routes (`fetch`).
- **Create / update flow**
  - UI: `ResultsForm` validates required fields + marks (1–100) on submit with a centered dialog.
  - API: `POST /api/results` or `PUT /api/results/[id]` validates again server-side and saves via repository.
- **List flow**
  - UI refresh calls `GET /api/results`.
  - API lists results and maps DB records to list DTOs (status label, ISO dates).
- **Multi-delete flow**
  - UI selects IDs in `ResultsTable`, confirms in `DeleteRecordsDialog`.
  - API: `DELETE /api/results` deletes many by IDs.

### Folder structure (complete)

```text
school-results-app/
  .gitignore
  README.md
  package.json
  tsconfig.json
  public/
  src/
    app/
      api/
        results/
          [id]/
            route.ts
          route.ts
      globals.css
      layout.tsx
      page.tsx
      favicon.ico
    components/
      AppProviders.tsx
      ResultsForm.tsx
      ResultsPageClient.tsx
      ResultsTable.tsx
      results/
        DashboardHero.tsx
        DeleteRecordsDialog.tsx
        MobileResultCard.tsx
        ResultStatusChip.tsx
        ResultsPageFooter.tsx
        ResultsToast.tsx
    hooks/
      useResultsPage.ts
    lib/
      api/
        client.ts
        errors.ts
      db/
        mongo.ts
      results/
        clientApi.ts
        contracts.ts
        fieldErrors.ts
        resultModel.ts
        resultRepository.ts
        resultService.ts
        resultValidation.ts
      ui/
        snackbar.ts
    styles/
      theme.ts
```

### Naming conventions used (and to keep following)

- **React components**: `PascalCase.tsx` (e.g. `ResultsTable.tsx`, `DashboardHero.tsx`)
- **Hooks**: `useXxx.ts` in `src/hooks/` (e.g. `useResultsPage.ts`)
- **Libraries / utilities**: `camelCase.ts` in `src/lib/**` (e.g. `resultService.ts`, `fieldErrors.ts`)
- **Routes** (Next.js App Router): `route.ts` under the folder that defines the path
- **Types**:
  - Domain contracts in `src/lib/results/contracts.ts` (`ResultListItem`, `ResultFormValues`, etc.)
- **Exports/imports**
  - Use path aliases `@/…` (already used across the project)
  - Prefer `type` imports for types (`import type { … } from …`)

### Constraints / out of scope (per requirements)

- **Teacher authentication**: the provided requirements did not include login/authentication for teachers, so it is **not implemented** in this project.
- **Unique student records**: we could enforce uniqueness (e.g., by a `rollId` or student identifier), but the requirements did not define a `rollId` (or any unique student key). Therefore, the app currently treats each submission as a **separate record**.

### Deployment (Vercel CLI)

Install/verify CLI:

```bash
npx vercel --version
```

Link project (creates `.vercel/`):

```bash
npx vercel link --yes
```

Add env vars (recommended: set for all environments):

```bash
npx vercel env add MONGODB_URI production
npx vercel env add MONGODB_URI preview
npx vercel env add MONGODB_URI development
```

Deploy to production:

```bash
npx vercel --prod --yes
```

### MongoDB Atlas note (common production issue)

If the deployed API returns a Mongo error like “Could not connect to any servers…”, your Atlas cluster likely blocks Vercel’s IPs.

Fix in Atlas:
- Go to **Network Access** and allow the correct IP range, or temporarily allow `0.0.0.0/0` (less secure).

