default_schools <- function() {
  c("UCSB", "Northwestern")
}

format_category <- function(category) {
  tools::toTitleCase(gsub("_", " ", category))
}

criteria_override_allowed <- function(criteria) {
  criteria$category %in% c(
    "academic_fit",
    "environment_mental_health",
    "department_culture",
    "personal_life",
    "decision_risk"
  )
}

criteria_score_owner <- function(criteria) {
  ifelse(criteria_override_allowed(criteria), "camille_required", "research_baseline")
}

augment_criteria <- function(criteria) {
  criteria$override_allowed <- criteria_override_allowed(criteria)
  criteria$score_owner <- criteria_score_owner(criteria)
  criteria
}

paths_for <- function(root) {
  list(
    criteria = file.path(root, "data", "criteria.csv"),
    weights = file.path(root, "data", "weights.csv"),
    options = file.path(root, "data", "options.csv"),
    scenarios = file.path(root, "data", "scenarios.csv")
  )
}

empty_if_na <- function(x) {
  x[is.na(x)] <- ""
  x
}

normalize_logical <- function(x, default = FALSE) {
  if (is.logical(x)) {
    x[is.na(x)] <- default
    return(x)
  }

  values <- tolower(trimws(as.character(x)))
  out <- values %in% c("true", "t", "1", "yes", "y")
  out[values %in% c("", "na")] <- default
  out[is.na(values)] <- default
  out
}

read_csv_file <- function(path) {
  read.csv(path, stringsAsFactors = FALSE, na.strings = c("NA"))
}

load_criteria <- function(root) {
  path <- paths_for(root)$criteria
  if (!file.exists(path)) {
    stop(sprintf("Missing criteria file: %s", path), call. = FALSE)
  }

  criteria <- read_csv_file(path)
  criteria$dealbreaker_allowed <- normalize_logical(criteria$dealbreaker_allowed)
  criteria$higher_is_better <- normalize_logical(criteria$higher_is_better, TRUE)
  criteria$objective <- normalize_logical(criteria$objective)
  criteria$active <- normalize_logical(criteria$active, TRUE)
  augment_criteria(criteria)
}

load_scenarios <- function(root) {
  path <- paths_for(root)$scenarios
  if (!file.exists(path)) {
    stop(sprintf("Missing scenario file: %s", path), call. = FALSE)
  }

  read_csv_file(path)
}

seed_option_assessments <- function() {
  data.frame(
    school = c(
      "UCSB", "UCSB", "UCSB", "UCSB", "UCSB", "UCSB", "UCSB", "UCSB", "UCSB", "UCSB", "UCSB",
      "Northwestern", "Northwestern", "Northwestern", "Northwestern", "Northwestern", "Northwestern", "Northwestern", "Northwestern"
    ),
    criterion_id = c(
      "annual_stipend_value",
      "additional_fellowship_support",
      "housing_cost",
      "housing_security",
      "faculty_enthusiasm_for_camille",
      "faculty_warmth",
      "anxiety_fit",
      "general_stress_culture",
      "known_vs_unknown",
      "switching_cost_acceptance_status",
      "advisor_fit_best",
      "annual_stipend_value",
      "advisor_fit_best",
      "prestige_brand",
      "general_stress_culture",
      "known_vs_unknown",
      "late_offer_process_confidence",
      "switching_cost_acceptance_status",
      "faculty_enthusiasm_for_camille"
    ),
    known_fact = c(
      "Chancellor's Fellowship provides 32500 USD per year with teaching required in three years.",
      "Kent Jennings fellowship adds 6000 USD one time.",
      "Guaranteed housing for two years at 950 USD per month.",
      "Campus housing is guaranteed for two years.",
      "Faculty flew her out and many professors wanted to meet her.",
      "The department gave her a lot of attention and warmth during recruitment.",
      "The calmer UCSB environment may help an anxious workaholic sustain the PhD.",
      "UCSB is described as calmer and more chill.",
      "She was admitted early after an interview and has had more time to learn about the program.",
      "She has already accepted the UCSB offer so switching has some process cost.",
      "Northwestern appears to have the stronger best-fit professor, implying UCSB may be somewhat weaker on top advisor fit.",
      "Funding is 47000 USD per year guaranteed.",
      "One professor appears better aligned with her research interests but also felt intimidating.",
      "Northwestern is perceived as more prestigious.",
      "The environment looks less chill and potentially higher pressure.",
      "She was admitted from the waitlist after the April 15 deadline and is being urged to decide quickly.",
      "The late offer gives less time and less process clarity than UCSB.",
      "Choosing Northwestern now would require backing out after already accepting UCSB.",
      "Northwestern did not recruit with the same visible intensity as UCSB based on the current context."
    ),
    baseline_score = c(
      5.5, 7.0, 8.5, 9.0, 9.0, 8.5, 8.0, 8.0, 8.5, 9.0, 6.0,
      8.5, 8.5, 8.5, 4.5, 4.5, 3.5, 3.0, 5.0
    ),
    baseline_confidence = c(
      0.95, 0.8, 0.95, 0.95, 0.9, 0.75, 0.55, 0.6, 0.85, 0.7, 0.4,
      0.95, 0.6, 0.75, 0.55, 0.75, 0.8, 0.75, 0.45
    ),
    baseline_note = c(
      "Baseline score reflects a materially smaller guaranteed stipend than Northwestern even with the fellowship support mentioned.",
      "The one-time Kent Jennings support improves short-run slack but does not change the recurring stipend structure.",
      "Guaranteed campus housing at 950 USD per month is a major advantage on affordability.",
      "Two years of guaranteed housing materially reduces early-program housing risk.",
      "Recruitment energy strongly suggests the department sees Camille as a priority admit.",
      "Faculty warmth baseline is high because the recruitment process appears unusually attentive and affirming.",
      "This is a research baseline only; Camille should validate whether the calmer setting would genuinely help her anxiety.",
      "Current context points to a calmer program culture than Northwestern, but this should still be stress-tested by Camille.",
      "UCSB has lower uncertainty because Camille interacted with the program earlier and more extensively.",
      "Staying with UCSB appears administratively much easier than reversing course after already accepting the offer.",
      "No evidence suggests UCSB is a bad fit, but Northwestern seems stronger on the single best-match professor.",
      "The guaranteed stipend is materially stronger on its face.",
      "Northwestern appears stronger on best-match adviser alignment, though the evidence is still limited to one salient impression.",
      "Prestige appears meaningfully stronger at Northwestern in the current context.",
      "Current context suggests a higher-pressure environment that may be less sustainable day to day.",
      "The late waitlist offer leaves more uncertainty and less accumulated information.",
      "The process itself inspires less confidence because of the late timing and urgency.",
      "Switching into Northwestern now appears administratively and emotionally harder than simply staying with UCSB.",
      "Northwestern may still value Camille, but the visible recruitment signal is weaker than UCSB's current signal."
    ),
    baseline_source = rep("user_context", 19),
    source = rep("user_context", 19),
    stringsAsFactors = FALSE
  )
}

default_weights <- function(criteria) {
  data.frame(
    criterion_id = criteria$criterion_id,
    user_weight = criteria$default_weight,
    stringsAsFactors = FALSE
  )
}

default_options <- function(criteria, schools = default_schools()) {
  template <- expand.grid(
    school = schools,
    criterion_id = criteria$criterion_id,
    stringsAsFactors = FALSE,
    KEEP.OUT.ATTRS = FALSE
  )

  template$score <- NA_real_
  template$confidence <- NA_real_
  template$dealbreaker <- FALSE
  template$note <- ""
  template$known_fact <- ""
  template$source <- ""
  template$baseline_score <- NA_real_
  template$baseline_confidence <- NA_real_
  template$baseline_note <- ""
  template$baseline_source <- ""
  template$user_override <- FALSE
  template$camille_answered <- FALSE
  template$user_score <- NA_real_
  template$user_confidence <- NA_real_
  template$user_note <- ""
  template$score_origin <- "unscored"

  seeds <- seed_option_assessments()
  key_template <- paste(template$school, template$criterion_id, sep = "::")
  key_seed <- paste(seeds$school, seeds$criterion_id, sep = "::")
  idx <- match(key_template, key_seed)
  has_seed <- !is.na(idx)

  template$known_fact[has_seed] <- seeds$known_fact[idx[has_seed]]
  template$source[has_seed] <- seeds$source[idx[has_seed]]
  template$baseline_score[has_seed] <- seeds$baseline_score[idx[has_seed]]
  template$baseline_confidence[has_seed] <- seeds$baseline_confidence[idx[has_seed]]
  template$baseline_note[has_seed] <- seeds$baseline_note[idx[has_seed]]
  template$baseline_source[has_seed] <- seeds$baseline_source[idx[has_seed]]
  resolve_option_scores(template, criteria)
}

resolve_option_scores <- function(options, criteria = NULL) {
  if (!("baseline_score" %in% names(options))) {
    options$baseline_score <- NA_real_
  }
  if (!("baseline_confidence" %in% names(options))) {
    options$baseline_confidence <- NA_real_
  }
  if (!("baseline_note" %in% names(options))) {
    options$baseline_note <- ""
  }
  if (!("baseline_source" %in% names(options))) {
    options$baseline_source <- ""
  }
  if (!("user_override" %in% names(options))) {
    options$user_override <- FALSE
  }
  if (!("user_score" %in% names(options))) {
    options$user_score <- NA_real_
  }
  if (!("user_confidence" %in% names(options))) {
    options$user_confidence <- NA_real_
  }
  if (!("user_note" %in% names(options))) {
    options$user_note <- ""
  }
  if (!("score_origin" %in% names(options))) {
    options$score_origin <- "unscored"
  }
  if (!("camille_answered" %in% names(options))) {
    options$camille_answered <- FALSE
  }

  options$baseline_note <- empty_if_na(options$baseline_note)
  options$baseline_source <- empty_if_na(options$baseline_source)
  options$user_note <- empty_if_na(options$user_note)
  options$note <- empty_if_na(options$note)
  options$known_fact <- empty_if_na(options$known_fact)
  options$source <- empty_if_na(options$source)
  options$user_override <- normalize_logical(options$user_override)
  options$camille_answered <- normalize_logical(options$camille_answered)

  if (!is.null(criteria)) {
    criteria <- augment_criteria(criteria)
    idx <- match(options$criterion_id, criteria$criterion_id)
    options$score_owner <- criteria$score_owner[idx]
  } else if (!("score_owner" %in% names(options))) {
    options$score_owner <- "research_baseline"
  }

  use_camille <- options$score_owner == "camille_required" & options$camille_answered & !is.na(options$user_score)
  force_missing <- options$score_owner == "camille_required" & !use_camille
  use_baseline <- options$score_owner != "camille_required" & !is.na(options$baseline_score)
  use_legacy <- options$score_owner != "camille_required" & !use_baseline & !is.na(options$score)

  options$score_origin <- ifelse(
    use_camille,
    "camille_required",
    ifelse(use_baseline, "research_baseline", ifelse(use_legacy, "legacy_manual", "unscored"))
  )

  options$score <- ifelse(
    use_camille,
    options$user_score,
    ifelse(force_missing, NA_real_, ifelse(use_baseline, options$baseline_score, options$score))
  )

  options$confidence <- ifelse(
    use_camille,
    options$user_confidence,
    ifelse(force_missing, NA_real_, ifelse(use_baseline, options$baseline_confidence, options$confidence))
  )

  options$note <- ifelse(
    use_camille & nzchar(options$user_note),
    options$user_note,
    ifelse(force_missing, options$user_note, ifelse(use_baseline & nzchar(options$baseline_note), options$baseline_note, options$note))
  )

  options$source <- ifelse(
    use_camille,
    "camille_required",
    ifelse(force_missing, "camille_required", ifelse(use_baseline & nzchar(options$baseline_source), options$baseline_source, options$source))
  )

  options
}

sync_weights <- function(weights, criteria) {
  synced <- default_weights(criteria)

  if (nrow(weights) == 0) {
    return(synced)
  }

  idx <- match(synced$criterion_id, weights$criterion_id)
  has_match <- !is.na(idx)
  synced$user_weight[has_match] <- weights$user_weight[idx[has_match]]
  synced
}

sync_options <- function(options, criteria, schools = default_schools()) {
  synced <- default_options(criteria, schools)

  if (nrow(options) == 0) {
    return(synced)
  }

  if (!("dealbreaker" %in% names(options))) {
    options$dealbreaker <- FALSE
  }
  if (!("note" %in% names(options))) {
    options$note <- ""
  }
  if (!("known_fact" %in% names(options))) {
    options$known_fact <- ""
  }
  if (!("source" %in% names(options))) {
    options$source <- ""
  }
  if (!("baseline_score" %in% names(options))) {
    options$baseline_score <- NA_real_
  }
  if (!("baseline_confidence" %in% names(options))) {
    options$baseline_confidence <- NA_real_
  }
  if (!("baseline_note" %in% names(options))) {
    options$baseline_note <- ""
  }
  if (!("baseline_source" %in% names(options))) {
    options$baseline_source <- ""
  }
  if (!("user_override" %in% names(options))) {
    options$user_override <- FALSE
  }
  if (!("user_score" %in% names(options))) {
    options$user_score <- NA_real_
  }
  if (!("user_confidence" %in% names(options))) {
    options$user_confidence <- NA_real_
  }
  if (!("user_note" %in% names(options))) {
    options$user_note <- ""
  }
  if (!("camille_answered" %in% names(options))) {
    options$camille_answered <- FALSE
  }
  if (!("score_origin" %in% names(options))) {
    options$score_origin <- ""
  }

  options$note <- empty_if_na(options$note)
  options$known_fact <- empty_if_na(options$known_fact)
  options$source <- empty_if_na(options$source)
  options$baseline_note <- empty_if_na(options$baseline_note)
  options$baseline_source <- empty_if_na(options$baseline_source)
  options$user_note <- empty_if_na(options$user_note)
  options$dealbreaker <- normalize_logical(options$dealbreaker)
  options$user_override <- normalize_logical(options$user_override)
  options$camille_answered <- normalize_logical(options$camille_answered)

  key_synced <- paste(synced$school, synced$criterion_id, sep = "::")
  key_options <- paste(options$school, options$criterion_id, sep = "::")
  idx <- match(key_synced, key_options)
  has_match <- !is.na(idx)

  synced$score[has_match] <- options$score[idx[has_match]]
  synced$confidence[has_match] <- options$confidence[idx[has_match]]
  synced$dealbreaker[has_match] <- options$dealbreaker[idx[has_match]]
  synced$note[has_match] <- options$note[idx[has_match]]
  synced$baseline_score[has_match] <- options$baseline_score[idx[has_match]]
  synced$baseline_confidence[has_match] <- options$baseline_confidence[idx[has_match]]
  synced$baseline_note[has_match] <- options$baseline_note[idx[has_match]]
  synced$baseline_source[has_match] <- options$baseline_source[idx[has_match]]
  synced$user_override[has_match] <- options$user_override[idx[has_match]]
  synced$camille_answered[has_match] <- options$camille_answered[idx[has_match]]
  synced$user_score[has_match] <- options$user_score[idx[has_match]]
  synced$user_confidence[has_match] <- options$user_confidence[idx[has_match]]
  synced$user_note[has_match] <- options$user_note[idx[has_match]]

  existing_fact <- options$known_fact[idx[has_match]]
  fact_target <- synced$known_fact[has_match]
  synced$known_fact[has_match] <- ifelse(nzchar(existing_fact), existing_fact, fact_target)

  existing_source <- options$source[idx[has_match]]
  source_target <- synced$source[has_match]
  synced$source[has_match] <- ifelse(nzchar(existing_source), existing_source, source_target)

  resolve_option_scores(synced, criteria)
}

save_weights <- function(root, weights) {
  write.csv(weights, paths_for(root)$weights, row.names = FALSE, na = "")
}

save_criteria <- function(root, criteria) {
  write.csv(criteria, paths_for(root)$criteria, row.names = FALSE, na = "")
}

save_options <- function(root, options) {
  write.csv(options, paths_for(root)$options, row.names = FALSE, na = "")
}

load_weights <- function(root, criteria) {
  path <- paths_for(root)$weights
  if (!file.exists(path)) {
    weights <- default_weights(criteria)
    save_weights(root, weights)
    return(weights)
  }

  weights <- read_csv_file(path)
  sync_weights(weights, criteria)
}

load_options <- function(root, criteria, schools = default_schools()) {
  path <- paths_for(root)$options
  if (!file.exists(path)) {
    options <- default_options(criteria, schools)
    save_options(root, options)
    return(options)
  }

  options <- read_csv_file(path)
  sync_options(options, criteria, schools)
}

bootstrap_state <- function(root) {
  dirs <- c(file.path(root, "data"), file.path(root, "R"), file.path(root, "outputs"))
  for (dir_path in dirs) {
    if (!dir.exists(dir_path)) {
      dir.create(dir_path, recursive = TRUE)
    }
  }

  criteria <- load_criteria(root)
  scenarios <- load_scenarios(root)
  weights <- load_weights(root, criteria)
  options <- load_options(root, criteria, default_schools())

  save_weights(root, weights)
  save_options(root, options)

  list(criteria = criteria, weights = weights, options = options, scenarios = scenarios)
}

load_state <- function(root) {
  bootstrap_state(root)
}
