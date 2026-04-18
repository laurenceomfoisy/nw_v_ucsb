clamp_score <- function(x, lower = 0, upper = 10) {
  pmax(lower, pmin(upper, x))
}

scenario_multipliers <- function(scenarios, scenario_name, categories) {
  if (!(scenario_name %in% scenarios$scenario)) {
    available <- paste(sort(unique(scenarios$scenario)), collapse = ", ")
    stop(sprintf("Unknown scenario '%s'. Available scenarios: %s", scenario_name, available), call. = FALSE)
  }

  scenario_rows <- scenarios[scenarios$scenario == scenario_name, , drop = FALSE]
  multipliers <- setNames(rep(1, length(categories)), categories)
  matched <- match(categories, scenario_rows$category)
  has_match <- !is.na(matched)
  multipliers[has_match] <- scenario_rows$multiplier[matched[has_match]]
  multipliers
}

prepare_compare_frame <- function(criteria, weights, options, scenarios, scenario_name) {
  active_criteria <- criteria[criteria$active, , drop = FALSE]
  options <- resolve_option_scores(options, criteria)
  schools <- default_schools()[default_schools() %in% unique(options$school)]

  if (length(schools) != 2) {
    stop("The comparison workflow currently expects exactly two schools.", call. = FALSE)
  }

  synced_weights <- sync_weights(weights, active_criteria)
  multipliers <- scenario_multipliers(scenarios, scenario_name, unique(active_criteria$category))

  base_frame <- active_criteria[, c("criterion_id", "category", "label", "description", "default_weight")]
  base_frame <- merge(base_frame, synced_weights, by = "criterion_id", all.x = TRUE, sort = FALSE)
  base_frame$effective_weight <- base_frame$user_weight * multipliers[base_frame$category]

  school_a <- options[options$school == schools[[1]], c("criterion_id", "score", "confidence", "dealbreaker", "note", "known_fact")]
  school_b <- options[options$school == schools[[2]], c("criterion_id", "score", "confidence", "dealbreaker", "note", "known_fact")]

  names(school_a) <- c("criterion_id", "score_a", "confidence_a", "dealbreaker_a", "note_a", "known_fact_a")
  names(school_b) <- c("criterion_id", "score_b", "confidence_b", "dealbreaker_b", "note_b", "known_fact_b")

  frame <- merge(base_frame, school_a, by = "criterion_id", all.x = TRUE, sort = FALSE)
  frame <- merge(frame, school_b, by = "criterion_id", all.x = TRUE, sort = FALSE)

  frame$paired <- !is.na(frame$score_a) & !is.na(frame$score_b)
  frame$confidence_a[is.na(frame$confidence_a)] <- 0.5
  frame$confidence_b[is.na(frame$confidence_b)] <- 0.5
  frame$adjusted_score_a <- clamp_score(frame$score_a - 1.5 * (1 - frame$confidence_a))
  frame$adjusted_score_b <- clamp_score(frame$score_b - 1.5 * (1 - frame$confidence_b))
  frame$score_gap <- frame$adjusted_score_a - frame$adjusted_score_b
  frame$contribution_gap <- frame$effective_weight * frame$score_gap
  frame
}

weighted_score <- function(scores, weights) {
  valid <- !is.na(scores) & !is.na(weights) & weights > 0
  if (!any(valid)) {
    return(NA_real_)
  }
  weighted.mean(scores[valid], weights[valid])
}

category_summary <- function(frame, schools) {
  categories <- unique(frame$category)
  out <- list()

  for (cat_name in categories) {
    subset_rows <- frame[frame$category == cat_name, , drop = FALSE]
    paired_rows <- subset_rows[subset_rows$paired, , drop = FALSE]
    total_criteria <- nrow(subset_rows)
    criteria_scored <- nrow(paired_rows)

    out[[length(out) + 1]] <- data.frame(
      category = cat_name,
      school = schools[[1]],
      score = weighted_score(paired_rows$adjusted_score_a, paired_rows$effective_weight),
      criteria_scored = criteria_scored,
      total_criteria = total_criteria,
      stringsAsFactors = FALSE
    )
    out[[length(out) + 1]] <- data.frame(
      category = cat_name,
      school = schools[[2]],
      score = weighted_score(paired_rows$adjusted_score_b, paired_rows$effective_weight),
      criteria_scored = criteria_scored,
      total_criteria = total_criteria,
      stringsAsFactors = FALSE
    )
  }

  do.call(rbind, out)
}

dealbreaker_warnings <- function(options, criteria, threshold = 6) {
  options <- resolve_option_scores(options, criteria)
  merged <- merge(
    options,
    criteria[, c("criterion_id", "label")],
    by = "criterion_id",
    all.x = TRUE,
    sort = FALSE
  )

  merged$dealbreaker <- normalize_logical(merged$dealbreaker)
  warnings <- merged[merged$dealbreaker & !is.na(merged$score) & merged$score < threshold, c("school", "criterion_id", "label", "score", "note")]
  warnings[order(warnings$school, warnings$score), , drop = FALSE]
}

compare_schools <- function(criteria, weights, options, scenarios, scenario_name = "balanced") {
  options <- resolve_option_scores(options, criteria)
  frame <- prepare_compare_frame(criteria, weights, options, scenarios, scenario_name)
  schools <- default_schools()[default_schools() %in% unique(options$school)]
  paired_rows <- frame[frame$paired, , drop = FALSE]

  overall <- data.frame(
    school = schools,
    overall_score = c(
      weighted_score(paired_rows$adjusted_score_a, paired_rows$effective_weight),
      weighted_score(paired_rows$adjusted_score_b, paired_rows$effective_weight)
    ),
    stringsAsFactors = FALSE
  )

  drivers <- paired_rows[order(-abs(paired_rows$contribution_gap)), c("criterion_id", "label", "score_gap")]
  if (nrow(drivers) > 0) {
    drivers$leading_school <- ifelse(drivers$score_gap >= 0, schools[[1]], schools[[2]])
    drivers$score_gap <- abs(drivers$score_gap)
    drivers <- head(drivers, 10)
  }

  missing <- frame[!frame$paired, c("criterion_id", "label", "category", "effective_weight")]

  list(
    scenario = scenario_name,
    schools = schools,
    frame = frame,
    coverage = if (nrow(frame) == 0) 0 else nrow(paired_rows) / nrow(frame),
    overall = overall,
    category_summary = category_summary(frame, schools),
    drivers = drivers,
    missing = missing,
    dealbreakers = dealbreaker_warnings(options, criteria)
  )
}
