import { useEffect, useMemo, useState } from 'react'
import { CATEGORY_COPY, getPlainExplanation, getWeightGuidance } from './lib/content'
import { loadPersistedState, loadSeedData, mergePersistedState, persistState, SCHOOL_ORDER } from './lib/data'
import { buildComparison, createMarkdownReport } from './lib/scoring'

const STEP_LABELS = ['Intro', 'Subjective Review', 'Importance Survey', 'Results']

function formatCategory(category) {
  return category
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatScore(value) {
  return Number.isFinite(value) ? value.toFixed(2) : 'NA'
}

function ProgressSteps({ step }) {
  return (
    <div className="progress-strip">
      {STEP_LABELS.map((label, index) => (
        <div key={label} className={`progress-step ${step === index ? 'active' : ''}`}>
          <span className="progress-index">{index + 1}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function SummaryPill({ label, value }) {
  return (
    <div className="summary-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Hero({ coverage, subjectiveCount }) {
  return (
    <section className="hero-card">
      <div>
        <p className="eyebrow">Political Science PhD Decision Tool</p>
        <h1>Northwestern vs UCSB</h1>
        <p className="hero-copy">
          A guided decision survey for Camille. High-signal objective criteria are now pre-scored from official
          program, funding, housing, and placement information. Only the most personal or judgment-heavy dimensions
          remain in the review section.
        </p>
      </div>
      <div className="hero-pills">
        <SummaryPill label="Ready-to-use coverage" value={`${(coverage * 100).toFixed(0)}%`} />
        <SummaryPill label="Personal review questions" value={subjectiveCount} />
        <SummaryPill label="Flow" value="4 steps" />
      </div>
    </section>
  )
}

function SchoolSlider({ school, value, onChange }) {
  return (
    <div className={`school-panel ${school.toLowerCase()}`}>
      <div className="school-panel-header">
        <h4>{school}</h4>
        <span>{Number(value).toFixed(1)} / 10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="0.5"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

function SubjectiveCard({ criterion, values, onScoreChange, onConfidenceChange, onNoteChange }) {
  return (
    <article className="survey-card">
      <div className="card-topline">
        <span className="category-tag">{formatCategory(criterion.category)}</span>
        <span className="muted-tag">Prefilled subjective field</span>
      </div>
      <h3>{criterion.label}</h3>
      <p className="card-description">{criterion.description}</p>

      <div className="info-box soft">
        <strong>What this means</strong>
        <p>{getPlainExplanation(criterion)}</p>
      </div>

      {values.context.length > 0 && (
        <div className="info-box accent">
          <strong>Context already built into the tool</strong>
          <ul>
            {values.context.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="school-grid">
        {SCHOOL_ORDER.map((school) => (
          <SchoolSlider
            key={school}
            school={school}
            value={values.scores[school]}
            onChange={(nextValue) => onScoreChange(criterion.criterionId, school, nextValue)}
          />
        ))}
      </div>

      <div className="confidence-block">
        <div className="confidence-header">
          <strong>How confident is Camille in this judgment?</strong>
          <span>{values.confidence.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={values.confidence}
          onChange={(event) => onConfidenceChange(criterion.criterionId, Number(event.target.value))}
        />
      </div>

      <label className="textarea-block">
        <span>Optional note</span>
        <textarea
          rows="3"
          value={values.note}
          placeholder="Short note about why these suggested scores feel right or should be changed"
          onChange={(event) => onNoteChange(criterion.criterionId, event.target.value)}
        />
      </label>
    </article>
  )
}

function WeightCard({ criterion, value, onChange }) {
  return (
    <article className="survey-card compact">
      <div className="card-topline">
        <span className="category-tag">{formatCategory(criterion.category)}</span>
      </div>
      <h3>{criterion.label}</h3>
      <p className="card-description">{criterion.description}</p>

      <div className="info-box soft">
        <strong>What this means</strong>
        <p>{getPlainExplanation(criterion)}</p>
      </div>

      <div className="info-box muted">
        <strong>How to set the weight</strong>
        <p>{getWeightGuidance(criterion)}</p>
      </div>

      <div className="confidence-block">
        <div className="confidence-header">
          <strong>How important is this in the final decision?</strong>
          <span>{Number(value).toFixed(1)} / 10</span>
        </div>
        <input type="range" min="0" max="10" step="0.5" value={value} onChange={(event) => onChange(criterion.criterionId, Number(event.target.value))} />
      </div>
    </article>
  )
}

function ResultCard({ school, score, recommendation }) {
  return (
    <div className={`result-card ${school.toLowerCase()}`}>
      <span className="result-kicker">{recommendation}</span>
      <h3>{school}</h3>
      <div className="result-score">{formatScore(score)}</div>
    </div>
  )
}

function ResultsTable({ rows }) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Criterion</th>
            <th>Weight</th>
            <th>UCSB</th>
            <th>Source</th>
            <th>Northwestern</th>
            <th>Source</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.criterionId}>
              <td>{formatCategory(row.category)}</td>
              <td>
                <strong>{row.label}</strong>
                <div className="table-subtext">{row.plainExplanation}</div>
                {(row.ucsbNote || row.northwesternNote) && (
                  <details className="evidence-details">
                    <summary>Why these baseline scores?</summary>
                    <div className="evidence-copy">
                      <strong>UCSB:</strong> {row.ucsbNote}
                    </div>
                    <div className="evidence-copy">
                      <strong>Northwestern:</strong> {row.northwesternNote}
                    </div>
                  </details>
                )}
              </td>
              <td>{row.weight.toFixed(1)}</td>
              <td>{row.ucsbScore.toFixed(1)}</td>
              <td>{row.ucsbSource}</td>
              <td>{row.northwesternScore.toFixed(1)}</td>
              <td>{row.northwesternSource}</td>
              <td>{row.gap.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  useEffect(() => {
    let active = true

    loadSeedData()
      .then((seed) => {
        if (!active) {
          return
        }
        const merged = mergePersistedState(seed, loadPersistedState())
        setState(merged)
        setStatus('ready')
      })
      .catch((error) => {
        if (!active) {
          return
        }
        setStatus('error')
        setErrorMessage(error.message)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (state) {
      persistState({ options: state.options, weights: state.weights })
    }
  }, [state])

  const comparison = useMemo(() => {
    if (!state) {
      return null
    }
    return buildComparison(state.criteria, state.weights, state.options)
  }, [state])

  const subjectiveCriteria = useMemo(() => {
    return state?.criteria.filter((criterion) => criterion.active && criterion.reviewRequired) ?? []
  }, [state])

  const groupedSubjective = useMemo(() => {
    return subjectiveCriteria.reduce((accumulator, criterion) => {
      accumulator[criterion.category] ??= []
      accumulator[criterion.category].push(criterion)
      return accumulator
    }, {})
  }, [subjectiveCriteria])

  const groupedAllCriteria = useMemo(() => {
    return (state?.criteria ?? []).filter((criterion) => criterion.active).reduce((accumulator, criterion) => {
      accumulator[criterion.category] ??= []
      accumulator[criterion.category].push(criterion)
      return accumulator
    }, {})
  }, [state])

  const subjectiveReviewCount = subjectiveCriteria.length

  function updateOption(criterionId, school, updater) {
    setState((current) => {
      if (!current) {
        return current
      }
      return {
        ...current,
        options: current.options.map((option) => {
          if (option.criterionId !== criterionId || option.school !== school) {
            return option
          }
          return updater(option)
        }),
      }
    })
  }

  function updateSubjectiveScore(criterionId, school, value) {
    updateOption(criterionId, school, (option) => ({
      ...option,
      userScore: value,
      camilleAnswered: true,
    }))
  }

  function updateSubjectiveConfidence(criterionId, value) {
    setState((current) => {
      if (!current) {
        return current
      }
      return {
        ...current,
        options: current.options.map((option) =>
          option.criterionId === criterionId ? { ...option, userConfidence: value, camilleAnswered: true } : option,
        ),
      }
    })
  }

  function updateSubjectiveNote(criterionId, value) {
    setState((current) => {
      if (!current) {
        return current
      }
      return {
        ...current,
        options: current.options.map((option) =>
          option.criterionId === criterionId ? { ...option, userNote: value, camilleAnswered: true } : option,
        ),
      }
    })
  }

  function updateWeight(criterionId, value) {
    setState((current) => {
      if (!current) {
        return current
      }
      return {
        ...current,
        weights: current.weights.map((weight) =>
          weight.criterionId === criterionId ? { ...weight, userWeight: value } : weight,
        ),
      }
    })
  }

  function getSubjectiveValues(criterionId) {
    const criterionOptions = state.options.filter((option) => option.criterionId === criterionId)
    return {
      scores: Object.fromEntries(criterionOptions.map((option) => [option.school, option.userScore ?? option.baselineScore])),
      confidence: criterionOptions[0]?.userConfidence ?? 0.55,
      note: criterionOptions[0]?.userNote ?? '',
      context: criterionOptions.filter((option) => option.knownFact).map((option) => `${option.school}: ${option.knownFact}`),
    }
  }

  function downloadReport() {
    const content = createMarkdownReport(comparison)
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'camille-decision-report.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (status === 'loading') {
    return (
      <main className="app-shell loading-state">
        <div className="loading-card">Loading the survey and seeded comparison data...</div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="app-shell loading-state">
        <div className="loading-card error-card">
          <h2>The app could not load its seed data.</h2>
          <p>{errorMessage}</p>
        </div>
      </main>
    )
  }

  const overall = comparison.overall
  const recommendedSchool = overall.reduce((best, current) => {
    if (!best || current.overallScore > best.overallScore) {
      return current
    }
    return best
  }, null)?.school

  return (
    <main className="app-shell">
      <Hero coverage={comparison.coverage} subjectiveCount={subjectiveReviewCount} />
      <ProgressSteps step={step} />

      {step === 0 && (
        <section className="section-card intro-card">
          <div className="section-header">
            <h2>How this survey works</h2>
            <p>
              The app already contains seeded scores for objective criteria like stipend size, housing, and prestige.
              Subjective criteria are also prefilled with starting values so Camille can get to a recommendation fast.
            </p>
          </div>

          <div className="intro-grid">
            <div className="info-box soft">
              <strong>Step 1</strong>
              <p>Review only the highest-leverage personal judgments. If a suggested answer looks wrong, change it.</p>
            </div>
            <div className="info-box soft">
              <strong>Step 2</strong>
              <p>Set the importance of each criterion in the final choice.</p>
            </div>
            <div className="info-box soft">
              <strong>Step 3</strong>
              <p>Read the results sheet with the overall recommendation, drivers, criterion details, and research-backed baseline scores.</p>
            </div>
          </div>

          <div className="section-actions end">
            <button className="primary-button" type="button" onClick={() => setStep(1)}>
              Start review
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="section-card">
          <div className="section-header">
            <h2>Subjective review</h2>
            <p>
              These are the dimensions where Camille's own judgment matters most. Everything here starts from a suggested
              value, but this section is intentionally much shorter than before because the more objective criteria are now
              pre-scored from program research.
            </p>
          </div>

          {Object.entries(groupedSubjective).map(([category, criteria]) => (
            <section key={category} className="category-section">
              <div className="category-heading">
                <h3>{formatCategory(category)}</h3>
                <p>{CATEGORY_COPY[category]}</p>
              </div>
              <div className="card-stack">
                {criteria.map((criterion) => (
                  <SubjectiveCard
                    key={criterion.criterionId}
                    criterion={criterion}
                    values={getSubjectiveValues(criterion.criterionId)}
                    onScoreChange={updateSubjectiveScore}
                    onConfidenceChange={updateSubjectiveConfidence}
                    onNoteChange={updateSubjectiveNote}
                  />
                ))}
              </div>
            </section>
          ))}

          <div className="section-actions between">
            <button className="secondary-button" type="button" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="primary-button" type="button" onClick={() => setStep(2)}>
              Continue to weights
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="section-card">
          <div className="section-header">
            <h2>Importance survey</h2>
            <p>
              Now ignore which school is ahead on each criterion. Answer only one question: how much should this matter
              in Camille&apos;s overall decision? The weighting section covers the curated active criteria only, so the model
              is trying to avoid false precision on weakly grounded dimensions.
            </p>
          </div>

          {Object.entries(groupedAllCriteria).map(([category, criteria]) => (
            <section key={category} className="category-section">
              <div className="category-heading">
                <h3>{formatCategory(category)}</h3>
                <p>{CATEGORY_COPY[category]}</p>
              </div>
              <div className="card-stack compact-stack">
                {criteria.map((criterion) => {
                  const currentWeight = state.weights.find((weight) => weight.criterionId === criterion.criterionId)?.userWeight ??
                    criterion.defaultWeight
                  return <WeightCard key={criterion.criterionId} criterion={criterion} value={currentWeight} onChange={updateWeight} />
                })}
              </div>
            </section>
          ))}

          <div className="section-actions between">
            <button className="secondary-button" type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="primary-button" type="button" onClick={() => setStep(3)}>
              See results
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="section-card results-card-shell">
          <div className="section-header">
            <h2>Results sheet</h2>
            <p>
              This combines official-source baselines for objective criteria, the reviewed personal judgments for the key
              subjective criteria, and the weights from the importance survey.
            </p>
          </div>

          <div className="recommendation-banner">
            <strong>Current recommendation</strong>
            <p>{recommendedSchool} has the higher weighted overall score in the current survey state.</p>
          </div>

          <div className="results-grid">
            <ResultCard
              school="UCSB"
              score={overall.find((row) => row.school === 'UCSB')?.overallScore}
              recommendation={recommendedSchool === 'UCSB' ? 'Current leader' : 'Comparison score'}
            />
            <ResultCard
              school="Northwestern"
              score={overall.find((row) => row.school === 'Northwestern')?.overallScore}
              recommendation={recommendedSchool === 'Northwestern' ? 'Current leader' : 'Comparison score'}
            />
          </div>

          <div className="results-panels">
            <div className="panel-card">
              <h3>Category breakdown</h3>
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>School</th>
                      <th>Score</th>
                      <th>Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.categorySummary.map((row) => (
                      <tr key={`${row.category}-${row.school}`}>
                        <td>{formatCategory(row.category)}</td>
                        <td>{row.school}</td>
                        <td>{formatScore(row.score)}</td>
                        <td>
                          {row.criteriaScored} / {row.totalCriteria}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel-card">
              <h3>Top drivers</h3>
              <ul className="driver-list">
                {comparison.drivers.map((driver) => (
                  <li key={driver.criterionId}>
                    <strong>{driver.leadingSchool}</strong> leads on <strong>{driver.label}</strong> by{' '}
                    {driver.scoreGap.toFixed(2)} adjusted score points.
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel-card detail-panel">
            <h3>Criterion-level detail</h3>
            <ResultsTable rows={comparison.detailRows} />
          </div>

          <div className="section-actions between">
            <button className="secondary-button" type="button" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="primary-button" type="button" onClick={downloadReport}>
              Download report
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
