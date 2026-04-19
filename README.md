# Northwestern vs UCSB

React app for comparing Northwestern and UCSB for a Political Science PhD.

## Product Shape

- Four-step survey flow: intro, subjective review, importance survey, results.
- High-signal objective criteria are pre-scored from official program, funding, housing, methods, wellness, and placement information.
- Only a shorter set of high-leverage personal judgments remains in the review section.
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
- the seeded starting option rows
- the default weights

The app also applies a curated research-baseline layer from `src/lib/researchProfiles.js`, which overrides placeholder values for the active objective criteria.

## Deployment

GitHub Pages deployment is configured through `.github/workflows/deploy-pages.yml`.

The app is configured for deployment to the root org site at `https://nw-v-ucsb.github.io/` from the `nw-v-ucsb.github.io` repository under the `nw-v-ucsb` organization.
