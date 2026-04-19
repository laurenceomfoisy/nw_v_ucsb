export const CATEGORY_COPY = {
  academic_fit: 'How strong the program looks as an intellectual home for Camille and her research.',
  funding_material: 'How financially workable and materially secure the program looks in daily life.',
  environment_mental_health: 'How sustainable the place looks for anxiety, burnout risk, and ordinary emotional life.',
  department_culture: 'How the people, expectations, and social atmosphere of the department feel in practice.',
  career_outcomes: 'How well the program seems positioned to support long-run career options and academic credibility.',
  personal_life: 'How livable the place feels outside work, including everyday quality of life.',
  decision_risk: 'How much uncertainty, fragility, or regret risk still sits inside the decision.'
}

export const PLAIN_EXPLANATIONS = {
  advisor_depth:
    'If the first-choice adviser is unavailable or turns out to be a bad fit, are there several other professors who could step in? A high score means Camille would still have good adviser options.',
  advisor_fit_best:
    'This is about the single strongest adviser match in the department. A high score means there is at least one professor who feels like an unusually good fit for Camille\'s work.',
  advisor_fit_second:
    'This asks whether there is a strong second option behind the best adviser. A high score means the choice does not depend on one person only.',
  advisor_personality:
    'This is not about research fit alone. It asks whether likely advisers seem constructive, humane, and manageable to work with over many years.',
  mentoring_reputation:
    'This asks what kind of mentor faculty are known to be in practice, not just how impressive they are on paper.',
  intellectual_community:
    'This means the everyday intellectual atmosphere: seminars, conversations, workshops, and whether Camille would feel surrounded by stimulating people.',
  methods_training:
    'This is about whether the program can teach the methods Camille actually needs for her research, whether quantitative, qualitative, formal, historical, or mixed.',
  labor_vs_training_balance:
    'This asks whether the PhD feels like serious scholarly training or mostly like the department using graduate students as labor.',
  teaching_load_sustainability:
    'This is about whether the teaching obligations are manageable enough that Camille can still make progress on her own research and stay healthy.',
  financial_stress_risk:
    'This rolls up whether money would be a chronic source of anxiety. A high score means finances are likely to feel stable enough to focus on the PhD.',
  general_stress_culture:
    'This is the overall pressure level of the place. A high score means the day-to-day atmosphere seems sustainable rather than constantly intense.',
  anxiety_fit:
    'This asks specifically whether the environment is likely to help or hurt Camille\'s anxiety. A high score means it seems emotionally protective rather than destabilizing.',
  workaholism_sustainability:
    'This asks whether the program is likely to calm Camille\'s unhealthy work habits or make them worse. A high score means the culture is less likely to feed overwork.',
  overall_emotional_sustainability:
    'This is the big-picture mental-health question: can Camille realistically imagine lasting there for five to seven years without burning out?',
  cohort_collegiality:
    'This means whether fellow graduate students seem supportive and decent to one another, rather than cutthroat or isolating.',
  intimidation_vs_support:
    'This asks whether the people and atmosphere feel encouraging or intimidating. A high score means Camille would more often feel supported than intimidated.',
  toxic_competitiveness_risk:
    'This asks whether the culture seems driven by unhealthy status games. A high score means that kind of toxicity looks less likely.',
  placement_strength:
    'This means the real job outcomes of recent students. A high score means the program tends to place students well in the kinds of jobs Camille would want.',
  niche_reputation:
    'This is not overall prestige. It means reputation specifically among scholars in Camille\'s exact research area.',
  letter_writer_strength:
    'This asks whether faculty there are likely to be credible, influential letter writers for the job market.',
  external_network_access:
    'This means access to workshops, conferences, and outside scholars who could matter for Camille\'s future career.',
  career_optionality:
    'This asks whether the training would keep doors open both inside and outside academia.',
  overall_livability:
    'This is the everyday life test: could Camille actually imagine living there in a stable, human way beyond just academic prestige?',
  known_vs_unknown:
    'This asks how much of the decision is based on real information rather than projection. A high score means Camille knows what she is getting into.',
  reliance_on_single_professor:
    'This asks whether the whole choice depends too much on one professor. A high score means the option is safer because it does not collapse if one person leaves or disappoints.',
  confidence_against_regret:
    'This asks whether Camille is likely to feel at peace with the choice later, rather than replaying the decision with regret.',
  late_offer_process_confidence:
    'This is about whether the admissions process itself inspires trust. A high score means the way the offer happened feels orderly and reassuring.',
  switching_cost_acceptance_status:
    'This asks how hard it would be to change course now that UCSB has already been accepted. A high score means switching would be easy; a low score means it would be messy or costly.',
  decision_reversibility:
    'This asks how easy it would be to recover if the choice turns out wrong. A high score means there is more room to pivot or repair the decision later.'
}

export const WEIGHT_GUIDANCE = {
  academic_fit:
    'Give this a high weight if it could strongly affect dissertation quality, advising, or the core intellectual fit of the PhD.',
  funding_material:
    'Give this a high weight if it could strongly affect financial security, housing, or whether daily life feels materially stable.',
  environment_mental_health:
    'Give this a high weight if it could strongly affect anxiety, burnout risk, or whether Camille can stay healthy through the PhD.',
  department_culture:
    'Give this a high weight if day-to-day treatment, support, or intimidation would heavily shape whether the program is sustainable.',
  career_outcomes:
    'Give this a high weight if long-run academic reputation, placement, and career opportunities should dominate the choice.',
  personal_life:
    'Give this a high weight if ordinary life outside work will strongly influence whether Camille can do good academic work.',
  decision_risk:
    'Give this a high weight if uncertainty, regret, or dependence on fragile assumptions should carry a lot of influence in the final choice.'
}

export function getPlainExplanation(criterion) {
  return (
    PLAIN_EXPLANATIONS[criterion.criterionId] ??
    `${criterion.description} A higher score means this looks better for Camille.`
  )
}

export function getWeightGuidance(criterion) {
  return WEIGHT_GUIDANCE[criterion.category] ?? 'Higher weight means this matters more in the final recommendation.'
}
