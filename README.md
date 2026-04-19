# Northwestern vs UCSB

React app for comparing Northwestern and UCSB for a Political Science PhD.

## Product Shape

- Four-step survey flow: intro, subjective review, importance survey, results.
- Objective criteria are already seeded from the project data.
- Subjective criteria are prefilled with suggested starting values so the app works immediately.
- Results include overall recommendation, category breakdown, top drivers, and a detailed criterion table.
- Survey edits persist in the browser with `localStorage`.
- A markdown report can be downloaded directly from the results screen.

## Development

Install dependencies:

```bash
npm install
```

Start the app locally:

```bash
npm run dev
```

Validate the seeded data:

```bash
npm run validate
```

Build the production site:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Data

The app reads its seed data from:

- `public/data/criteria.csv`
- `public/data/options.csv`
- `public/data/weights.csv`

Those CSVs provide:

- the criterion list
- the seeded objective baselines
- the prefilled subjective starting values
- the default weights

## Deployment

GitHub Pages deployment is configured through `.github/workflows/deploy-pages.yml`.

The Vite base path is set for deployment to the `nw_v_ucsb.github.io` repository under the `nw-v-ucsb` organization.
