# NW vs UCSB Decision Tool

Survey-style R software to help Camille compare Northwestern and UCSB across a large decision checklist.

## What it does

- Seeds an extensive criteria library covering academic fit funding mental health department culture career outcomes personal life and decision risk.
- Stores school-specific research baseline scores, notes, and seeded facts.
- Uses a simple linear survey flow instead of multiple dashboards.
- Requires Camille to answer the more subjective criteria herself before they count in the comparison.
- Lets Camille set weights through a dedicated importance survey.
- Tracks confidence for uncertain judgments.
- Flags low-scoring dealbreakers.
- Generates a markdown report in `outputs/`.

## Files

- `app.R`: Shiny app entry point.
- `run_app.R`: simple script that launches the Shiny app.
- `cli.R`: the original terminal workflow if you still want it later.
- `R/data_io.R`: file loading seeding and syncing.
- `R/prompts.R`: terminal prompts used by the optional CLI.
- `R/scoring.R`: comparison logic and scenario weighting.
- `R/report.R`: markdown report generation.
- `R/shiny_app.R`: survey UI and Shiny server logic.
- `data/criteria.csv`: exhaustive criteria list.
- `data/scenarios.csv`: scenario multipliers.
- `data/weights.csv`: generated user weights.
- `data/options.csv`: research baseline scores, Camille overrides, notes, and dealbreakers.

## Run the UI

From the repo root run either:

```bash
Rscript run_app.R
```

or:

```bash
R -e "shiny::runApp()"
```

Then follow the steps in the app:

- Step 1: short intro explaining the survey.
- Step 2: Camille answers the subjective criteria herself.
- Step 3: Camille answers the importance survey to create the weights.
- Step 4: the app shows one detailed results sheet.

From the results screen Camille can:

- go back and edit answers
- download a markdown report

## Optional CLI

The terminal workflow is still available in `cli.R`.

Initialize or resync generated files:

```bash
Rscript cli.R init
```

Review criteria:

```bash
Rscript cli.R review-criteria
Rscript cli.R review-criteria academic_fit
```

## Scoring approach

- Each criterion gets a weight.
- Each school now has a research baseline score from `0` to `10` when one is available.
- Each baseline score gets a confidence from `0` to `1`.
- Subjective criteria do not count until Camille explicitly marks them as answered and gives her own score.
- The comparison uses Camille's score on required subjective criteria and the research baseline on research-heavy criteria.
- The importance survey creates the weights for the final calculation.
- The tool applies a small uncertainty penalty to low-confidence scores.
- Comparison only uses criteria scored for both schools so the result stays fair.
- Dealbreaker warnings appear when a criterion is flagged as a dealbreaker and scored below `6`.

## Current limitation

- The current seeded baseline is still mostly based on the context you provided in chat rather than full external-source research across every criterion.
- The app is now structured for that fuller research workflow, but the baseline should still be expanded and tightened over time.

## Suggested workflow

1. Run `Rscript run_app.R`.
2. Complete the subjective-score section.
3. Complete the importance survey.
4. Read the final results sheet.
5. Download the markdown report if wanted.
