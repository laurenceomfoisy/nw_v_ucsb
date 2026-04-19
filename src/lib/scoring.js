import { CATEGORY_COPY, getPlainExplanation } from './content.js'
import { SCHOOL_ORDER } from './data.js'

function clampScore(value, minimum = 0, maximum = 10) {
  return Math.min(maximum, Math.max(minimum, value))
}

function weightedMean(items, valueKey, weightKey) {
  let numerator = 0
  let denominator = 0

  for (const item of items) {
    const value = item[valueKey]
    const weight = item[weightKey]
    if (value == null || weight == null || weight <= 0) {
      continue
    }
    numerator += value * weight
    denominator += weight
  }

  return denominator === 0 ? null : numerator / denominator
}

export function resolveOption(option) {
  if (option.scoreOwner === 'camille_required') {
    return {
      score: option.userScore ?? option.baselineScore,
      confidence: option.userConfidence ?? option.baselineConfidence,
      source: 'Survey',
      note: option.userNote || option.baselineNote,
    }
  }

  return {
    score: option.baselineScore,
    confidence: option.baselineConfidence,
    source: 'Research baseline',
    note: option.baselineNote,
  }
}

function buildDetailRows(criteria, weights, options) {
  const optionMap = new Map(options.map((option) => [option.key, option]))
  const weightMap = new Map(weights.map((weight) => [weight.criterionId, weight.userWeight]))

  return criteria.map((criterion) => {
    const ucsb = resolveOption(optionMap.get(`UCSB::${criterion.criterionId}`))
    const northwestern = resolveOption(optionMap.get(`Northwestern::${criterion.criterionId}`))
    return {
      criterionId: criterion.criterionId,
      category: criterion.category,
      categoryLabel: CATEGORY_COPY[criterion.category],
      label: criterion.label,
      description: criterion.description,
      plainExplanation: getPlainExplanation(criterion),
      weight: weightMap.get(criterion.criterionId) ?? criterion.defaultWeight,
      ucsbScore: ucsb.score,
      ucsbConfidence: ucsb.confidence,
      ucsbSource: ucsb.source,
      ucsbNote: ucsb.note,
      northwesternScore: northwestern.score,
      northwesternConfidence: northwestern.confidence,
      northwesternSource: northwestern.source,
      northwesternNote: northwestern.note,
      gap: ucsb.score - northwestern.score,
    }
  })
}

export function buildComparison(criteria, weights, options) {
  const detailRows = buildDetailRows(criteria, weights, options)
  const frame = detailRows.map((row) => {
    const adjustedUcsb = clampScore(row.ucsbScore - 1.5 * (1 - row.ucsbConfidence))
    const adjustedNorthwestern = clampScore(row.northwesternScore - 1.5 * (1 - row.northwesternConfidence))
    return {
      ...row,
      paired: row.ucsbScore != null && row.northwesternScore != null,
      adjustedUcsb,
      adjustedNorthwestern,
      scoreGap: adjustedUcsb - adjustedNorthwestern,
      contributionGap: row.weight * (adjustedUcsb - adjustedNorthwestern),
    }
  })

  const pairedRows = frame.filter((row) => row.paired)
  const overall = [
    { school: SCHOOL_ORDER[0], overallScore: weightedMean(pairedRows, 'adjustedUcsb', 'weight') },
    { school: SCHOOL_ORDER[1], overallScore: weightedMean(pairedRows, 'adjustedNorthwestern', 'weight') },
  ]

  const categorySummary = Object.values(
    frame.reduce((accumulator, row) => {
      accumulator[row.category] ??= {
        category: row.category,
        schoolScores: {
          UCSB: [],
          Northwestern: [],
        },
        totalCriteria: 0,
        criteriaScored: 0,
      }

      const bucket = accumulator[row.category]
      bucket.totalCriteria += 1
      if (row.paired) {
        bucket.criteriaScored += 1
        bucket.schoolScores.UCSB.push(row)
        bucket.schoolScores.Northwestern.push(row)
      }
      return accumulator
    }, {}),
  ).flatMap((bucket) => {
    return [
      {
        category: bucket.category,
        school: 'UCSB',
        score: weightedMean(bucket.schoolScores.UCSB, 'adjustedUcsb', 'weight'),
        criteriaScored: bucket.criteriaScored,
        totalCriteria: bucket.totalCriteria,
      },
      {
        category: bucket.category,
        school: 'Northwestern',
        score: weightedMean(bucket.schoolScores.Northwestern, 'adjustedNorthwestern', 'weight'),
        criteriaScored: bucket.criteriaScored,
        totalCriteria: bucket.totalCriteria,
      },
    ]
  })

  const drivers = pairedRows
    .slice()
    .sort((left, right) => Math.abs(right.contributionGap) - Math.abs(left.contributionGap))
    .slice(0, 10)
    .map((row) => ({
      criterionId: row.criterionId,
      label: row.label,
      leadingSchool: row.scoreGap >= 0 ? 'UCSB' : 'Northwestern',
      scoreGap: Math.abs(row.scoreGap),
      contributionGap: Math.abs(row.contributionGap),
    }))

  const missing = frame.filter((row) => !row.paired)

  return {
    overall,
    coverage: frame.length === 0 ? 0 : pairedRows.length / frame.length,
    categorySummary,
    drivers,
    missing,
    detailRows: frame,
  }
}

export function createMarkdownReport(comparison) {
  const overall = comparison.overall
  const winner = overall.reduce((best, current) => {
    if (!best || (current.overallScore ?? -Infinity) > (best.overallScore ?? -Infinity)) {
      return current
    }
    return best
  }, null)

  const lines = [
    '# Camille Decision Report',
    '',
    `Generated on ${new Date().toISOString()}.`,
    '',
    'This report combines research-baseline scores for objective criteria with prefilled or edited survey scores for subjective criteria.',
    '',
    '## Overall Recommendation',
    '',
    winner ? `Current recommendation: **${winner.school}** has the higher weighted overall score.` : 'No recommendation available.',
    '',
    ...overall.map((row) => `- ${row.school}: ${row.overallScore?.toFixed(2) ?? 'NA'}`),
    '',
    `Coverage: ${(comparison.coverage * 100).toFixed(1)}%`,
    '',
    '## Category Breakdown',
    '',
    '| Category | School | Score | Criteria Scored | Total Criteria |',
    '| --- | --- | ---: | ---: | ---: |',
    ...comparison.categorySummary.map(
      (row) =>
        `| ${row.category.replaceAll('_', ' ')} | ${row.school} | ${row.score?.toFixed(2) ?? '-'} | ${row.criteriaScored} | ${row.totalCriteria} |`,
    ),
    '',
    '## Top Drivers',
    '',
    ...(comparison.drivers.length > 0
      ? comparison.drivers.map(
          (driver) =>
            `- ${driver.leadingSchool} leads on **${driver.label}** by ${driver.scoreGap.toFixed(2)} adjusted score points.`,
        )
      : ['- No strong driver list is available yet.']),
    '',
    '## Criterion-Level Detail',
    '',
    '| Category | Criterion | Weight | UCSB Score | UCSB Source | Northwestern Score | Northwestern Source |',
    '| --- | --- | ---: | ---: | --- | ---: | --- |',
    ...comparison.detailRows.map(
      (row) =>
        `| ${row.category.replaceAll('_', ' ')} | ${row.label} | ${row.weight.toFixed(1)} | ${row.ucsbScore.toFixed(1)} | ${row.ucsbSource} | ${row.northwesternScore.toFixed(1)} | ${row.northwesternSource} |`,
    ),
    '',
  ]

  return lines.join('\n')
}
