const UCSB_GRAD_OVERVIEW = 'https://www.polsci.ucsb.edu/graduate-program'
const UCSB_PROSPECTIVE = 'https://www.polsci.ucsb.edu/graduate-program/prospective-students'
const UCSB_METHODS = 'https://www.polsci.ucsb.edu/research-areas/methods'
const UCSB_ENVIRONMENT = 'https://www.polsci.ucsb.edu/research-areas/politics-environment'
const UCSB_IDENTITIES = 'https://www.polsci.ucsb.edu/research-areas/politics-identities'
const UCSB_FACULTY = 'https://www.polsci.ucsb.edu/people'
const UCSB_PLACEMENTS = 'https://www.polsci.ucsb.edu/graduate-program/recent-placements'
const UCSB_FELLOWSHIPS = 'https://www.polsci.ucsb.edu/graduate-program/fellowship-and-grant-opportunities'
const UCSB_HOUSING_RATES = 'https://www.housing.ucsb.edu/apply/rates'
const UCSB_SAN_CLEMENTE = 'https://www.housing.ucsb.edu/housing-options/options-filter/san-clemente-villages'
const UCSB_CAPS = 'https://caps.sa.ucsb.edu/'

const NU_GRAD_OVERVIEW = 'https://polisci.northwestern.edu/graduate/'
const NU_PROGRAM_OVERVIEW = 'https://polisci.northwestern.edu/graduate/program-overview.html'
const NU_FINANCIAL_SUPPORT = 'https://polisci.northwestern.edu/graduate/prospective/financial-support.html'
const NU_FUNDING = 'https://www.tgs.northwestern.edu/funding/'
const NU_FUNDING_FAQ = 'https://www.tgs.northwestern.edu/funding/about-graduate-funding/funding-faqs.html'
const NU_FELLOWSHIPS = 'https://polisci.northwestern.edu/graduate/current-students/fellowships-and-grants.html'
const NU_METHODS = 'https://polisci.northwestern.edu/graduate/program-areas/methods.html'
const NU_SUBFIELDS = 'https://polisci.northwestern.edu/research/subfield-specialties/index.html'
const NU_CONFLICT = 'https://polisci.northwestern.edu/research/subfield-specialties/conflict-studies.html'
const NU_FACULTY = 'https://polisci.northwestern.edu/people/core-faculty/index.html'
const NU_PLACEMENTS = 'https://polisci.northwestern.edu/graduate/phd-placements/phd-placements.html'
const NU_HOUSING = 'https://www.northwestern.edu/living/graduate-housing/index.html'
const NU_HOUSING_RATES = 'https://www.northwestern.edu/living/graduate-housing/graduate-residence-hall-information/graduate-housing-rent-rates.html'
const NU_HOUSING_FAQ = 'https://www.northwestern.edu/living/graduate-housing/graduate-housing-faqs.html'
const NU_HEALTH = 'https://www.tgs.northwestern.edu/services-support/community-resources/health-wellness-services/index.html'

export const ACTIVE_CRITERIA = new Set([
  'research_fit_primary',
  'advisor_fit_best',
  'advisor_depth',
  'advisor_personality',
  'general_stress_culture',
  'anxiety_fit',
  'overall_emotional_sustainability',
  'intimidation_vs_support',
  'lifestyle_fit',
  'overall_livability',
  'reliance_on_single_professor',
  'confidence_against_regret',
  'annual_stipend_value',
  'funding_guarantee_years',
  'fellowship_generosity',
  'additional_fellowship_support',
  'teaching_load_sustainability',
  'summer_funding',
  'travel_research_funding',
  'health_insurance',
  'housing_cost',
  'housing_security',
  'overall_cost_of_living',
  'ability_to_save',
  'financial_stress_risk',
  'methods_training',
  'interdisciplinary_opportunities',
  'teaching_training',
  'access_to_mental_health_support',
  'placement_strength',
  'prestige_brand',
  'publication_support',
  'external_network_access',
  'known_vs_unknown',
  'switching_cost_acceptance_status',
])

export const REVIEW_CRITERIA = new Set([
  'research_fit_primary',
  'advisor_fit_best',
  'advisor_depth',
  'advisor_personality',
  'general_stress_culture',
  'anxiety_fit',
  'overall_emotional_sustainability',
  'intimidation_vs_support',
  'lifestyle_fit',
  'overall_livability',
  'reliance_on_single_professor',
  'confidence_against_regret',
])

function profile({ score, confidence, note, source, knownFact = '' }) {
  return { score, confidence, note, source, knownFact }
}

export const ASSESSMENTS = {
  annual_stipend_value: {
    UCSB: profile({
      score: 6.1,
      confidence: 0.92,
      note: 'The guaranteed annual funding is materially below Northwestern even before accounting for Evanston housing costs.',
      source: `${UCSB_PROSPECTIVE} | user_offer_context`,
      knownFact: 'UCSB offers five-year funding, and Camille reports a Chancellor\'s Fellowship of $32,500 per year plus a one-time $6,000 Jennings fellowship.',
    }),
    Northwestern: profile({
      score: 9.5,
      confidence: 0.96,
      note: 'Northwestern\'s official 2026-27 PhD minimum annual stipend is $47,748, well above UCSB\'s offer.',
      source: `${NU_FUNDING} | ${NU_FINANCIAL_SUPPORT}`,
      knownFact: 'Northwestern lists a PhD minimum annual stipend of $47,748 for 2026-27 and $46,356 for 2025-26.',
    }),
  },
  funding_guarantee_years: {
    UCSB: profile({
      score: 9.0,
      confidence: 0.94,
      note: 'UCSB explicitly says all students receive five-year financial aid packages.',
      source: UCSB_PROSPECTIVE,
      knownFact: 'UCSB states that all political science PhD students receive five-year financial aid packages.',
    }),
    Northwestern: profile({
      score: 9.0,
      confidence: 0.97,
      note: 'Northwestern explicitly guarantees a minimum of five years of PhD funding.',
      source: `${NU_GRAD_OVERVIEW} | ${NU_FUNDING_FAQ}`,
      knownFact: 'Northwestern states that humanities and social science PhD students receive 20 quarters, or five full years, of funding.',
    }),
  },
  fellowship_generosity: {
    UCSB: profile({
      score: 7.4,
      confidence: 0.74,
      note: 'The fellowship support is meaningful, but the user-provided package still requires three TA years.',
      source: 'user_offer_context',
      knownFact: 'Camille reports a Chancellor\'s Fellowship with teaching required in three of the funded years.',
    }),
    Northwestern: profile({
      score: 8.6,
      confidence: 0.88,
      note: 'Northwestern provides a first-year University Fellowship and a second non-teaching year that students can choose when to use.',
      source: `${NU_FINANCIAL_SUPPORT} | ${NU_PROGRAM_OVERVIEW}`,
      knownFact: 'Northwestern says first-year support is a University Fellowship and that students have two funded years not requiring teaching, one mandatory in year one and one flexible later.',
    }),
  },
  additional_fellowship_support: {
    UCSB: profile({
      score: 8.8,
      confidence: 0.82,
      note: 'The Jennings fellowship clearly improves the short-run package even though it is one-time rather than recurring.',
      source: `${UCSB_FELLOWSHIPS} | user_offer_context`,
      knownFact: 'The Political Science department lists the Kent Jennings Fellowship as an admissions award; Camille reports that it adds $6,000 one time.',
    }),
    Northwestern: profile({
      score: 5.0,
      confidence: 0.55,
      note: 'No comparable admissions add-on beyond the standard guaranteed funding was identified in the official material reviewed.',
      source: `${NU_FINANCIAL_SUPPORT} | ${NU_FELLOWSHIPS}`,
      knownFact: 'Northwestern highlights internal grants and fellowships but not a known admissions add-on comparable to Camille\'s Jennings fellowship.',
    }),
  },
  teaching_load_sustainability: {
    UCSB: profile({
      score: 6.6,
      confidence: 0.72,
      note: 'Three TA years in a lower-stipend package create a real work burden, even if that burden is common in PhD training.',
      source: 'user_offer_context',
      knownFact: 'Camille reports that UCSB requires TA work for three of the funded years.',
    }),
    Northwestern: profile({
      score: 8.1,
      confidence: 0.86,
      note: 'Northwestern requires instructional work in at least one academic quarter, but the overall funding model gives more non-teaching flexibility.',
      source: `${NU_PROGRAM_OVERVIEW} | ${NU_FINANCIAL_SUPPORT}`,
      knownFact: 'Northwestern requires work in some instructional capacity for at least one academic quarter and supports the first year through a fellowship.',
    }),
  },
  summer_funding: {
    UCSB: profile({
      score: 7.6,
      confidence: 0.66,
      note: 'The reported package is annual, but the official pages reviewed do not spell out the quarter-by-quarter summer structure as clearly as Northwestern does.',
      source: `${UCSB_PROSPECTIVE} | user_offer_context`,
      knownFact: 'Camille reports annual fellowship funding at UCSB, and UCSB guarantees five-year packages.',
    }),
    Northwestern: profile({
      score: 9.2,
      confidence: 0.95,
      note: 'Northwestern explicitly states that PhD students are paid year-round, including the summer quarter.',
      source: `${NU_FINANCIAL_SUPPORT} | ${NU_FUNDING_FAQ}`,
      knownFact: 'Northwestern describes fall, winter, spring, and summer funding quarters and says PhD students are paid year-round while registered full-time.',
    }),
  },
  travel_research_funding: {
    UCSB: profile({
      score: 7.1,
      confidence: 0.8,
      note: 'UCSB has real opportunities, but the documented internal amounts are more modest than Northwestern\'s package.',
      source: `${UCSB_FELLOWSHIPS} | ${UCSB_METHODS}`,
      knownFact: 'UCSB lists a doctoral travel grant, Broom Center research/travel grants, and up to $500 in departmental support for summer methods training travel.',
    }),
    Northwestern: profile({
      score: 9.2,
      confidence: 0.96,
      note: 'Northwestern documents multiple layers of internal support for conference travel, research travel, language training, and dissertation travel.',
      source: `${NU_FELLOWSHIPS} | ${NU_FINANCIAL_SUPPORT}`,
      knownFact: 'Northwestern lists conference travel grants up to $800, graduate research grants up to $3,000, summer language grants up to $2,000, and Buffett dissertation travel awards up to $5,000.',
    }),
  },
  health_insurance: {
    UCSB: profile({
      score: 7.0,
      confidence: 0.52,
      note: 'UCSB almost certainly provides graduate health support through standard UC systems, but the department pages reviewed did not specify the package clearly enough to rate this with high confidence.',
      source: `${UCSB_PROSPECTIVE} | ${UCSB_CAPS}`,
      knownFact: 'UCSB clearly offers graduate-accessible counseling and wellbeing services, but the exact department-specific insurance subsidy was not plainly stated on the pages reviewed.',
    }),
    Northwestern: profile({
      score: 9.0,
      confidence: 0.96,
      note: 'Northwestern explicitly says guaranteed PhD funding covers the annual health insurance premium and health services fee.',
      source: `${NU_FINANCIAL_SUPPORT} | ${NU_FUNDING_FAQ}`,
      knownFact: 'Northwestern says PhD funding covers tuition, stipend, health services fees, and the annual health insurance premium.',
    }),
  },
  housing_cost: {
    UCSB: profile({
      score: 8.8,
      confidence: 0.94,
      note: 'The official San Clemente graduate housing rates and the user-reported $950 figure both point to unusually good on-campus graduate pricing for UCSB.',
      source: `${UCSB_HOUSING_RATES} | ${UCSB_SAN_CLEMENTE}`,
      knownFact: 'UCSB lists San Clemente graduate housing at $860 per month for a 4-bedroom unit and $985 per month for a 2-bedroom unit, with utilities included.',
    }),
    Northwestern: profile({
      score: 7.1,
      confidence: 0.94,
      note: 'Northwestern graduate housing is viable, but it is notably more expensive than UCSB\'s on-campus graduate options.',
      source: `${NU_HOUSING_RATES} | ${NU_HOUSING_FAQ}`,
      knownFact: 'Northwestern lists graduate housing annual totals from about $14,895 for a Garrett efficiency studio to over $23,500 for a McManus one-bedroom, inclusive of utilities.',
    }),
  },
  housing_security: {
    UCSB: profile({
      score: 8.5,
      confidence: 0.86,
      note: 'Officially, new single graduate students get priority for San Clemente; in Camille\'s actual offer context, housing is even stronger because she reports a two-year guarantee.',
      source: `${UCSB_SAN_CLEMENTE} | user_offer_context`,
      knownFact: 'San Clemente gives new single graduate students priority consideration, and Camille reports two years of guaranteed housing.',
    }),
    Northwestern: profile({
      score: 5.7,
      confidence: 0.92,
      note: 'Northwestern graduate housing exists, but assignments are first-come, first-served rather than guaranteed.',
      source: `${NU_HOUSING_FAQ} | ${NU_HOUSING}`,
      knownFact: 'Northwestern says graduate housing applications are processed first-come, first-served and assignments are not guaranteed.',
    }),
  },
  overall_cost_of_living: {
    UCSB: profile({
      score: 6.9,
      confidence: 0.68,
      note: 'Santa Barbara is expensive in general, but the graduate-housing situation materially offsets that pressure during the early years.',
      source: `${UCSB_HOUSING_RATES} | ${UCSB_SAN_CLEMENTE}`,
      knownFact: 'UCSB\'s official graduate housing rates are relatively favorable, but the stipend itself remains much lower than Northwestern\'s.',
    }),
    Northwestern: profile({
      score: 7.8,
      confidence: 0.75,
      note: 'Evanston housing is not cheap, but the much higher stipend appears to leave more room after core costs.',
      source: `${NU_FUNDING} | ${NU_HOUSING_RATES}`,
      knownFact: 'Northwestern couples a much higher stipend with graduate housing options that include utilities, which improves overall spending power despite higher nominal rent.',
    }),
  },
  ability_to_save: {
    UCSB: profile({
      score: 5.7,
      confidence: 0.72,
      note: 'Saving looks possible only with disciplined spending and favorable housing; the stipend is not large relative to California living costs.',
      source: `${UCSB_HOUSING_RATES} | user_offer_context`,
      knownFact: 'UCSB\'s housing helps, but the annual stipend is substantially smaller than Northwestern\'s.',
    }),
    Northwestern: profile({
      score: 8.0,
      confidence: 0.82,
      note: 'The larger guaranteed stipend creates more room for savings or a buffer against shocks.',
      source: `${NU_FUNDING} | ${NU_HOUSING_RATES}`,
      knownFact: 'Northwestern\'s stipend is above $46k and many graduate housing costs remain below roughly one-third of that annual amount on a monthly basis.',
    }),
  },
  financial_stress_risk: {
    UCSB: profile({
      score: 6.3,
      confidence: 0.76,
      note: 'UCSB looks workable, but the lower stipend means money is more likely to remain a live constraint.',
      source: `${UCSB_PROSPECTIVE} | ${UCSB_HOUSING_RATES} | user_offer_context`,
      knownFact: 'UCSB combines five-year funding with helpful graduate housing, but the annual stipend is still notably below Northwestern\'s.',
    }),
    Northwestern: profile({
      score: 8.2,
      confidence: 0.85,
      note: 'Northwestern\'s larger stipend and comprehensive funding model should reduce day-to-day money pressure relative to UCSB.',
      source: `${NU_FUNDING} | ${NU_FINANCIAL_SUPPORT}`,
      knownFact: 'Northwestern fully funds PhD students for at least five years with tuition coverage and a much higher stipend floor.',
    }),
  },
  methods_training: {
    UCSB: profile({
      score: 8.2,
      confidence: 0.9,
      note: 'UCSB has strong methods requirements, additional quantitative training, and affiliated summer-methods opportunities.',
      source: `${UCSB_METHODS} | ${UCSB_GRAD_OVERVIEW}`,
      knownFact: 'UCSB requires research design and two statistical-methods courses, offers QMSS emphasis training, and highlights advanced quantitative and qualitative methods support.',
    }),
    Northwestern: profile({
      score: 9.4,
      confidence: 0.95,
      note: 'Northwestern has one of the clearer documented methodological training structures, with a full methods field and advanced offerings.',
      source: `${NU_METHODS} | ${NU_SUBFIELDS}`,
      knownFact: 'Northwestern offers a methods field plus advanced courses in causal inference, experiments, qualitative methods, machine learning, Bayesian analysis, panel methods, and more.',
    }),
  },
  interdisciplinary_opportunities: {
    UCSB: profile({
      score: 8.6,
      confidence: 0.9,
      note: 'UCSB looks unusually strong for environmental and identity-related cross-campus work.',
      source: `${UCSB_GRAD_OVERVIEW} | ${UCSB_ENVIRONMENT} | ${UCSB_IDENTITIES}`,
      knownFact: 'UCSB explicitly links Political Science to the Bren School, Environmental Studies, Geography, and a wide range of identity-related departments and emphases.',
    }),
    Northwestern: profile({
      score: 9.0,
      confidence: 0.94,
      note: 'Northwestern has broad interdisciplinary infrastructure, including Buffett, IPR, EDGS, Critical Theory, and statistics pathways.',
      source: `${NU_GRAD_OVERVIEW} | ${NU_SUBFIELDS}`,
      knownFact: 'Northwestern highlights the Buffett Institute, IPR, EDGS, CHSS, Critical Theory, and a statistics master\'s as interdisciplinary resources for political science graduate students.',
    }),
  },
  teaching_training: {
    UCSB: profile({
      score: 7.1,
      confidence: 0.62,
      note: 'UCSB clearly gives substantial teaching exposure, but the public pages reviewed emphasize the TA role more than formal pedagogical training.',
      source: `${UCSB_GRAD_OVERVIEW} | user_offer_context`,
      knownFact: 'Camille\'s UCSB package includes three TA years, and the department publishes a TA handbook.',
    }),
    Northwestern: profile({
      score: 8.4,
      confidence: 0.78,
      note: 'Northwestern combines required instructional experience with explicit teaching-development infrastructure such as the Searle Center.',
      source: `${NU_PROGRAM_OVERVIEW} | ${NU_FINANCIAL_SUPPORT}`,
      knownFact: 'Northwestern requires teaching in at least one academic quarter and highlights teaching-skill development through the Searle Center and departmental opportunities.',
    }),
  },
  access_to_mental_health_support: {
    UCSB: profile({
      score: 8.7,
      confidence: 0.9,
      note: 'UCSB has a robust counseling system with short-term counseling, group counseling, telehealth, and 24/7 availability.',
      source: UCSB_CAPS,
      knownFact: 'UCSB CAPS says all registered students are eligible and lists 24/7 availability, short-term counseling, group counseling, teletherapy, and multiple support pathways.',
    }),
    Northwestern: profile({
      score: 9.0,
      confidence: 0.93,
      note: 'Northwestern appears especially strong on the breadth of mental-health access, combining CAPS with TimelyCare and wider TGS support resources.',
      source: `${NU_HEALTH} | https://wellness.northwestern.edu/mental-emotional-health/counseling/`,
      knownFact: 'Northwestern lists CAPS, workshops, drop-in consultations, support groups, and free TimelyCare virtual mental-health services for students.',
    }),
  },
  placement_strength: {
    UCSB: profile({
      score: 7.6,
      confidence: 0.88,
      note: 'UCSB\'s placement record is solid and varied, but it is not as concentrated at top research universities as Northwestern\'s recent list.',
      source: UCSB_PLACEMENTS,
      knownFact: 'UCSB lists recent placements across tenure-track jobs, postdocs, policy work, data science, and strong regional academic outcomes.',
    }),
    Northwestern: profile({
      score: 9.2,
      confidence: 0.9,
      note: 'Northwestern advertises and documents a stronger recent elite-placement profile.',
      source: `${NU_GRAD_OVERVIEW} | ${NU_PLACEMENTS}`,
      knownFact: 'Northwestern highlights recent placements at places such as Johns Hopkins, Michigan, Chicago, Penn, William & Mary, Arizona, and Tulane.',
    }),
  },
  prestige_brand: {
    UCSB: profile({
      score: 7.6,
      confidence: 0.78,
      note: 'UCSB is a respected public research university, but it does not carry Northwestern\'s general brand prestige in political science hiring markets.',
      source: `${UCSB_GRAD_OVERVIEW} | ${UCSB_PLACEMENTS}`,
      knownFact: 'UCSB has a strong department with distinctive strengths, though the broader prestige signal is usually perceived as below Northwestern.',
    }),
    Northwestern: profile({
      score: 9.4,
      confidence: 0.82,
      note: 'Northwestern carries a stronger institutional brand and is widely perceived as the more prestigious of the two options.',
      source: `${NU_GRAD_OVERVIEW} | ${NU_PLACEMENTS}`,
      knownFact: 'Northwestern combines a strong private-university brand with a documented high-end placement record.',
    }),
  },
  publication_support: {
    UCSB: profile({
      score: 8.0,
      confidence: 0.84,
      note: 'UCSB explicitly structures the second-year workshop toward producing a paper ready for journal submission in the third year.',
      source: UCSB_GRAD_OVERVIEW,
      knownFact: 'UCSB says the second-year research workshop aims to produce a paper ready for journal submission in the third year.',
    }),
    Northwestern: profile({
      score: 8.5,
      confidence: 0.84,
      note: 'Northwestern explicitly mentions support for publishing and grant-writing as part of its professional development infrastructure.',
      source: `${NU_GRAD_OVERVIEW} | ${NU_FELLOWSHIPS}`,
      knownFact: 'Northwestern says it provides workshops on publishing, grant-writing, dissertation prospectus development, and conference participation.',
    }),
  },
  external_network_access: {
    UCSB: profile({
      score: 8.1,
      confidence: 0.82,
      note: 'UCSB offers strong network access through its cross-campus environmental and identity clusters, but Northwestern\'s institutional web is broader.',
      source: `${UCSB_ENVIRONMENT} | ${UCSB_IDENTITIES} | ${UCSB_FELLOWSHIPS}`,
      knownFact: 'UCSB connects political science doctoral students to interdisciplinary workshops, cross-campus collaborators, and external methods programs.',
    }),
    Northwestern: profile({
      score: 9.1,
      confidence: 0.9,
      note: 'Northwestern looks especially strong on institutional networks through Buffett, IPR, EDGS, field specialties, and Chicago-area academic density.',
      source: `${NU_GRAD_OVERVIEW} | ${NU_SUBFIELDS} | ${NU_FELLOWSHIPS}`,
      knownFact: 'Northwestern ties graduate students into major institutes, multiple specialty clusters, and substantial conference/research travel support.',
    }),
  },
  known_vs_unknown: {
    UCSB: profile({
      score: 9.1,
      confidence: 0.88,
      note: 'UCSB is simply the better-known option because Camille was admitted early, visited, and had extensive direct contact.',
      source: 'user_context',
      knownFact: 'Camille was admitted to UCSB early, visited, and received substantial attention from faculty before already accepting the offer.',
    }),
    Northwestern: profile({
      score: 4.6,
      confidence: 0.88,
      note: 'Northwestern remains much more uncertain because the offer came very late and with less accumulated interaction time.',
      source: 'user_context',
      knownFact: 'Northwestern admitted Camille from the waitlist after the April 15 deadline and pushed for a quick decision.',
    }),
  },
  switching_cost_acceptance_status: {
    UCSB: profile({
      score: 9.8,
      confidence: 0.94,
      note: 'Staying with the already-accepted offer is administratively simple.',
      source: 'user_context',
      knownFact: 'Camille has already accepted the UCSB offer.',
    }),
    Northwestern: profile({
      score: 2.7,
      confidence: 0.94,
      note: 'Switching now would require backing out after already accepting UCSB, which introduces real administrative and emotional cost.',
      source: 'user_context',
      knownFact: 'Choosing Northwestern would require undoing an already-accepted UCSB commitment.',
    }),
  },
  research_fit_primary: {
    UCSB: profile({
      score: 7.0,
      confidence: 0.45,
      note: 'UCSB has clear strengths and breadth, but the user context suggests Northwestern may have the sharper top-line fit to Camille\'s main research agenda.',
      source: `${UCSB_GRAD_OVERVIEW} | ${UCSB_ENVIRONMENT} | ${UCSB_IDENTITIES} | user_context`,
      knownFact: 'UCSB has distinctive strengths in environmental politics and the politics of identity, plus broad training in the traditional subfields.',
    }),
    Northwestern: profile({
      score: 8.5,
      confidence: 0.55,
      note: 'The user context suggests Northwestern may align more closely with Camille\'s current research interests, especially through one professor.',
      source: `${NU_GRAD_OVERVIEW} | ${NU_SUBFIELDS} | user_context`,
      knownFact: 'Northwestern advertises broad subfield specialties and Camille reported one professor there as more closely aligned with her research.',
    }),
  },
  advisor_fit_best: {
    UCSB: profile({
      score: 6.7,
      confidence: 0.48,
      note: 'The evidence does not suggest a bad match at UCSB, but Northwestern appears to have the stronger single best-fit adviser option.',
      source: `${UCSB_FACULTY} | user_context`,
      knownFact: 'UCSB has multiple engaged faculty, but the user context points to Northwestern as having the stronger best-match professor.',
    }),
    Northwestern: profile({
      score: 8.8,
      confidence: 0.56,
      note: 'Northwestern currently looks stronger on the one-adviser-best-fit dimension, although the interaction described was also somewhat intimidating.',
      source: `${NU_FACULTY} | user_context`,
      knownFact: 'Camille reported that one Northwestern professor looked more closely aligned with her research interests.',
    }),
  },
  advisor_depth: {
    UCSB: profile({
      score: 7.4,
      confidence: 0.62,
      note: 'UCSB has a mid-sized department with around twenty-five listed faculty and distinctive clusters in environment and identity.',
      source: `${UCSB_FACULTY} | ${UCSB_ENVIRONMENT} | ${UCSB_IDENTITIES}`,
      knownFact: 'UCSB lists about twenty-five faculty members and explicitly documents multiple faculty in environmental politics and politics of identity.',
    }),
    Northwestern: profile({
      score: 8.8,
      confidence: 0.74,
      note: 'Northwestern appears deeper overall, with a larger core faculty roster and more formalized specialty clusters.',
      source: `${NU_FACULTY} | ${NU_SUBFIELDS}`,
      knownFact: 'Northwestern lists roughly thirty-eight core faculty and a broad set of subfield specialties and regional expertise areas.',
    }),
  },
  advisor_personality: {
    UCSB: profile({
      score: 8.4,
      confidence: 0.5,
      note: 'UCSB faculty interactions appear much warmer and more affirming from the information available so far.',
      source: 'user_context',
      knownFact: 'Camille reports that UCSB faculty gave her unusual warmth and attention during recruitment.',
    }),
    Northwestern: profile({
      score: 5.6,
      confidence: 0.5,
      note: 'The fit may be academically strong, but the described interaction with the best-aligned Northwestern professor felt intimidating rather than easy.',
      source: 'user_context',
      knownFact: 'Camille reported that the most aligned Northwestern professor also felt intimidating.',
    }),
  },
  general_stress_culture: {
    UCSB: profile({
      score: 8.5,
      confidence: 0.58,
      note: 'Everything in the current evidence points to UCSB feeling calmer and less relentlessly high-pressure.',
      source: 'user_context',
      knownFact: 'The current context repeatedly describes UCSB as calmer, more chill, and likely more sustainable day to day.',
    }),
    Northwestern: profile({
      score: 4.7,
      confidence: 0.58,
      note: 'Northwestern currently reads as the more intense and prestige-driven environment.',
      source: 'user_context',
      knownFact: 'The current context describes Northwestern as more prestigious but less chill and potentially more stressful.',
    }),
  },
  anxiety_fit: {
    UCSB: profile({
      score: 8.6,
      confidence: 0.48,
      note: 'Given Camille\'s anxiety and relationship to work, UCSB currently looks like the more protective environment.',
      source: 'user_context',
      knownFact: 'Camille is described as anxious and prone to overwork, and UCSB is described as calmer and more supportive.',
    }),
    Northwestern: profile({
      score: 4.5,
      confidence: 0.48,
      note: 'Northwestern\'s higher-pressure feel could be costly for Camille specifically even if it carries prestige advantages.',
      source: 'user_context',
      knownFact: 'The combination of a late, pressured offer and a more intimidating interaction raises concern for anxiety fit.',
    }),
  },
  overall_emotional_sustainability: {
    UCSB: profile({
      score: 8.0,
      confidence: 0.46,
      note: 'UCSB currently looks easier to imagine living through for five to seven years without burning out.',
      source: 'user_context',
      knownFact: 'UCSB combines strong recruitment warmth, calmer atmosphere, and stable graduate housing.',
    }),
    Northwestern: profile({
      score: 5.7,
      confidence: 0.46,
      note: 'Northwestern may still be worth the pressure, but the current evidence makes long-run emotional sustainability more uncertain.',
      source: 'user_context',
      knownFact: 'Northwestern offers more money and prestige, but the current context raises repeated concerns about intensity and anxiety fit.',
    }),
  },
  intimidation_vs_support: {
    UCSB: profile({
      score: 8.7,
      confidence: 0.52,
      note: 'UCSB currently looks more supportive than intimidating.',
      source: 'user_context',
      knownFact: 'Camille reports that UCSB faculty were warm, responsive, and eager to meet her.',
    }),
    Northwestern: profile({
      score: 5.2,
      confidence: 0.52,
      note: 'Northwestern may still be manageable, but the salient interaction described so far landed on the intimidating side.',
      source: 'user_context',
      knownFact: 'Camille described a key Northwestern professor as intimidating.',
    }),
  },
  lifestyle_fit: {
    UCSB: profile({
      score: 8.4,
      confidence: 0.44,
      note: 'UCSB\'s climate, beach setting, and calmer pace likely fit a steadier routine, though this remains personal.',
      source: `${UCSB_SAN_CLEMENTE} | user_context`,
      knownFact: 'UCSB graduate housing is adjacent to campus and the area is described as calmer and easier to decompress in.',
    }),
    Northwestern: profile({
      score: 6.4,
      confidence: 0.44,
      note: 'Northwestern offers Evanston and Chicago access, but the overall rhythm may feel more demanding and urban-intense.',
      source: `${NU_HOUSING} | user_context`,
      knownFact: 'Northwestern graduate housing is near campus and Chicago is accessible, but the atmosphere appears less calm in the user context.',
    }),
  },
  overall_livability: {
    UCSB: profile({
      score: 8.5,
      confidence: 0.5,
      note: 'UCSB currently looks more livable as an everyday place to be a graduate student rather than only a prestigious academic address.',
      source: `${UCSB_SAN_CLEMENTE} | user_context`,
      knownFact: 'UCSB offers on-campus graduate housing, nearby outdoor space, and a calmer overall setting.',
    }),
    Northwestern: profile({
      score: 6.7,
      confidence: 0.5,
      note: 'Northwestern appears livable, but less obviously easy in the daily sense than UCSB.',
      source: `${NU_HOUSING} | user_context`,
      knownFact: 'Northwestern has real graduate housing options and strong university resources, but the overall environment looks more intense.',
    }),
  },
  reliance_on_single_professor: {
    UCSB: profile({
      score: 7.7,
      confidence: 0.62,
      note: 'UCSB looks less dependent on one intimidating star match because the department has strong, visible buy-in from multiple faculty.',
      source: `${UCSB_FACULTY} | user_context`,
      knownFact: 'The UCSB recruitment process involved multiple faculty actively pursuing Camille.',
    }),
    Northwestern: profile({
      score: 5.3,
      confidence: 0.62,
      note: 'The Northwestern case currently seems to lean more heavily on one especially aligned professor, which raises fragility risk.',
      source: `${NU_FACULTY} | user_context`,
      knownFact: 'The strongest positive signal for Northwestern in the current context is one especially well-aligned professor.',
    }),
  },
  confidence_against_regret: {
    UCSB: profile({
      score: 7.8,
      confidence: 0.45,
      note: 'Because the offer is already accepted and the environment looks supportive, UCSB may be easier to live with psychologically even if it is not the flashier option.',
      source: 'user_context',
      knownFact: 'UCSB has already been accepted, and the department invested heavily in recruiting Camille.',
    }),
    Northwestern: profile({
      score: 6.6,
      confidence: 0.45,
      note: 'Northwestern could reduce prestige-related regret but might increase lived-experience regret if the environment proves too intense.',
      source: 'user_context',
      knownFact: 'Northwestern brings clear prestige and funding upside, but the current evidence also raises multiple sustainability concerns.',
    }),
  },
}
