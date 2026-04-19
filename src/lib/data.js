import { parseCsv } from './csv.js'

export const SCHOOL_ORDER = ['UCSB', 'Northwestern']

const SUBJECTIVE_CATEGORIES = new Set([
  'academic_fit',
  'environment_mental_health',
  'department_culture',
  'personal_life',
  'decision_risk',
])

const LOCAL_STORAGE_KEY = 'nw-v-ucsb-react-survey-v1'

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value
  }
  if (value == null || value === '') {
    return fallback
  }
  return ['true', 't', '1', 'yes', 'y'].includes(String(value).trim().toLowerCase())
}

function toNumber(value, fallback = null) {
  if (value == null || value === '') {
    return fallback
  }
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

function deriveScoreOwner(category) {
  return SUBJECTIVE_CATEGORIES.has(category) ? 'camille_required' : 'research_baseline'
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function normalizeCriteriaRow(row) {
  return {
    criterionId: row.criterion_id,
    category: row.category,
    label: row.label,
    description: row.description,
    defaultWeight: toNumber(row.default_weight, 0),
    dealbreakerAllowed: toBoolean(row.dealbreaker_allowed),
    higherIsBetter: toBoolean(row.higher_is_better, true),
    objective: toBoolean(row.objective),
    active: toBoolean(row.active, true),
    scoreOwner: deriveScoreOwner(row.category),
  }
}

function buildCriteriaMap(criteria) {
  return Object.fromEntries(criteria.map((criterion) => [criterion.criterionId, criterion]))
}

function normalizeOptionRow(row, criteriaMap) {
  const criterion = criteriaMap[row.criterion_id]
  const scoreOwner = row.score_owner || criterion.scoreOwner
  const baselineScore = toNumber(row.baseline_score, 5)
  const baselineConfidence = toNumber(row.baseline_confidence, 0.25)
  const subjectiveDefaultConfidence = clamp(baselineConfidence || 0.55, 0.45, 0.85)
  const userScore =
    scoreOwner === 'camille_required'
      ? toNumber(row.user_score, baselineScore)
      : toNumber(row.user_score, null)

  return {
    key: `${row.school}::${row.criterion_id}`,
    school: row.school,
    criterionId: row.criterion_id,
    scoreOwner,
    scoreOrigin: row.score_origin || (scoreOwner === 'camille_required' ? 'camille_required' : 'research_baseline'),
    knownFact: row.known_fact || '',
    baselineScore,
    baselineConfidence,
    baselineNote:
      row.baseline_note ||
      'No criterion-specific evidence was loaded for this item yet, so the app keeps a neutral starting score that should be improved with more research later.',
    baselineSource: row.baseline_source || 'neutral_placeholder',
    userScore,
    userConfidence:
      scoreOwner === 'camille_required'
        ? toNumber(row.user_confidence, subjectiveDefaultConfidence)
        : toNumber(row.user_confidence, null),
    userNote:
      row.user_note ||
      (scoreOwner === 'camille_required'
        ? 'Prefilled starting value from the tool. Camille can keep it or change it if it feels off.'
        : ''),
    camilleAnswered: scoreOwner === 'camille_required' ? true : toBoolean(row.camille_answered),
    dealbreaker: toBoolean(row.dealbreaker),
  }
}

function normalizeWeightRow(row, criteriaMap) {
  const criterion = criteriaMap[row.criterion_id]
  return {
    criterionId: row.criterion_id,
    userWeight: toNumber(row.user_weight, criterion?.defaultWeight ?? 0),
  }
}

export function hydrateSeedData({ criteriaRows, optionRows, weightRows }) {
  const criteria = criteriaRows.map(normalizeCriteriaRow)
  const criteriaMap = buildCriteriaMap(criteria)
  const optionMap = new Map(
    optionRows.map((row) => {
      const normalized = normalizeOptionRow(row, criteriaMap)
      return [normalized.key, normalized]
    }),
  )

  const options = []
  for (const criterion of criteria) {
    for (const school of SCHOOL_ORDER) {
      const key = `${school}::${criterion.criterionId}`
      options.push(
        optionMap.get(key) ?? {
          key,
          school,
          criterionId: criterion.criterionId,
          scoreOwner: criterion.scoreOwner,
          scoreOrigin: criterion.scoreOwner === 'camille_required' ? 'camille_required' : 'research_baseline',
          knownFact: '',
          baselineScore: 5,
          baselineConfidence: 0.25,
          baselineNote:
            'No criterion-specific evidence was loaded for this item yet, so the app keeps a neutral starting score that should be improved with more research later.',
          baselineSource: 'neutral_placeholder',
          userScore: criterion.scoreOwner === 'camille_required' ? 5 : null,
          userConfidence: criterion.scoreOwner === 'camille_required' ? 0.55 : null,
          userNote:
            criterion.scoreOwner === 'camille_required'
              ? 'Prefilled starting value from the tool. Camille can keep it or change it if it feels off.'
              : '',
          camilleAnswered: criterion.scoreOwner === 'camille_required',
          dealbreaker: false,
        },
      )
    }
  }

  const weightMap = new Map(weightRows.map((row) => [row.criterion_id, normalizeWeightRow(row, criteriaMap)]))
  const weights = criteria.map((criterion) => {
    return (
      weightMap.get(criterion.criterionId) ?? {
        criterionId: criterion.criterionId,
        userWeight: criterion.defaultWeight,
      }
    )
  })

  return { criteria, options, weights }
}

async function fetchText(path) {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`)
  }
  return response.text()
}

export async function loadSeedData(baseUrl = import.meta.env.BASE_URL) {
  const [criteriaCsv, optionsCsv, weightsCsv] = await Promise.all([
    fetchText(`${baseUrl}data/criteria.csv`),
    fetchText(`${baseUrl}data/options.csv`),
    fetchText(`${baseUrl}data/weights.csv`),
  ])

  return hydrateSeedData({
    criteriaRows: parseCsv(criteriaCsv),
    optionRows: parseCsv(optionsCsv),
    weightRows: parseCsv(weightsCsv),
  })
}

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function persistState(snapshot) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snapshot))
}

export function mergePersistedState(seed, persisted) {
  if (!persisted) {
    return seed
  }

  const optionMap = new Map((persisted.options ?? []).map((option) => [`${option.school}::${option.criterionId}`, option]))
  const weightMap = new Map((persisted.weights ?? []).map((weight) => [weight.criterionId, weight]))

  return {
    criteria: seed.criteria,
    options: seed.options.map((option) => {
      const persistedOption = optionMap.get(option.key)
      return persistedOption
        ? {
            ...option,
            userScore: persistedOption.userScore ?? option.userScore,
            userConfidence: persistedOption.userConfidence ?? option.userConfidence,
            userNote: persistedOption.userNote ?? option.userNote,
            camilleAnswered: persistedOption.camilleAnswered ?? option.camilleAnswered,
            dealbreaker: persistedOption.dealbreaker ?? option.dealbreaker,
          }
        : option
    }),
    weights: seed.weights.map((weight) => {
      const persistedWeight = weightMap.get(weight.criterionId)
      return persistedWeight ? { ...weight, userWeight: persistedWeight.userWeight } : weight
    }),
  }
}
