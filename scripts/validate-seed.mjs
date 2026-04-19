import { readFile } from 'node:fs/promises'
import { parseCsv } from '../src/lib/csv.js'
import { hydrateSeedData } from '../src/lib/data.js'
import { buildComparison } from '../src/lib/scoring.js'

const [criteriaCsv, optionsCsv, weightsCsv] = await Promise.all([
  readFile(new URL('../public/data/criteria.csv', import.meta.url), 'utf8'),
  readFile(new URL('../public/data/options.csv', import.meta.url), 'utf8'),
  readFile(new URL('../public/data/weights.csv', import.meta.url), 'utf8'),
])

const state = hydrateSeedData({
  criteriaRows: parseCsv(criteriaCsv),
  optionRows: parseCsv(optionsCsv),
  weightRows: parseCsv(weightsCsv),
})

const comparison = buildComparison(state.criteria, state.weights, state.options)

if (state.criteria.length < 10) {
  throw new Error('Criteria seed did not load correctly.')
}

if (state.options.length !== state.criteria.length * 2) {
  throw new Error('Options seed is incomplete.')
}

const activeCriteria = state.criteria.filter((criterion) => criterion.active)
if (activeCriteria.length < 20) {
  throw new Error('Too few active criteria remain in the curated model.')
}

if (!comparison.overall.every((row) => Number.isFinite(row.overallScore))) {
  throw new Error('Overall scores did not resolve to finite values.')
}

if (comparison.coverage < 0.99) {
  throw new Error(`Coverage too low: ${comparison.coverage}`)
}

console.log('seed validation passed')
