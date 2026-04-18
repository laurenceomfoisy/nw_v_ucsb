write_report <- function(root, output_path, state = NULL) {
  if (is.null(state)) {
    state <- load_state(root)
  }
  state$options <- resolve_option_scores(state$options, state$criteria)
  balanced <- compare_schools(state$criteria, state$weights, state$options, state$scenarios, "balanced")
  known_facts <- state$options[nzchar(state$options$known_fact), c("school", "criterion_id", "known_fact")]
  known_facts <- unique(known_facts)
  camille_rows <- state$options[state$options$camille_answered & !is.na(state$options$user_score), c("school", "criterion_id", "user_score", "user_note")]
  camille_rows <- merge(camille_rows, state$criteria[, c("criterion_id", "label")], by = "criterion_id", all.x = TRUE, sort = FALSE)
  detail_rows <- merge(
    state$criteria[, c("criterion_id", "category", "label")],
    state$weights,
    by = "criterion_id",
    all.x = TRUE,
    sort = FALSE
  )
  ucsb <- state$options[state$options$school == "UCSB", c("criterion_id", "score", "score_origin")]
  northwestern <- state$options[state$options$school == "Northwestern", c("criterion_id", "score", "score_origin")]
  names(ucsb) <- c("criterion_id", "ucsb_score", "ucsb_source")
  names(northwestern) <- c("criterion_id", "northwestern_score", "northwestern_source")
  detail_rows <- merge(detail_rows, ucsb, by = "criterion_id", all.x = TRUE, sort = FALSE)
  detail_rows <- merge(detail_rows, northwestern, by = "criterion_id", all.x = TRUE, sort = FALSE)
  detail_rows$ucsb_source <- ifelse(detail_rows$ucsb_source == "camille_required", "Camille", ifelse(detail_rows$ucsb_source == "research_baseline", "Research baseline", "Missing"))
  detail_rows$northwestern_source <- ifelse(detail_rows$northwestern_source == "camille_required", "Camille", ifelse(detail_rows$northwestern_source == "research_baseline", "Research baseline", "Missing"))

  lines <- c(
    "# Camille Decision Report",
    "",
    sprintf("Generated on %s.", format(Sys.time(), "%Y-%m-%d %H:%M:%S")),
    "",
    "This report uses research baseline scores on research-heavy criteria. Subjective criteria only count after Camille answers them in the survey.",
    "",
    "## Current Comparison",
    ""
  )

  if (all(is.na(balanced$overall$overall_score))) {
    lines <- c(
      lines,
      "No criteria have been scored for both schools yet.",
      "Open the Shiny survey and either add more research baseline scores or confirm personal overrides so both schools have enough overlap.",
      ""
    )
  } else {
    winner_index <- which.max(balanced$overall$overall_score)
    winner <- balanced$overall$school[winner_index]
    score_text <- paste(
      sprintf("- %s: %.2f", balanced$overall$school, balanced$overall$overall_score),
      collapse = "\n"
    )

    lines <- c(
      lines,
      sprintf("Current leader under the balanced scenario: **%s**.", winner),
      "",
      score_text,
      "",
      sprintf("Comparable coverage: %.1f%% of the criteria.", 100 * balanced$coverage),
      "",
      "### Category Breakdown",
      "",
      "| Category | School | Score | Criteria Scored | Total Criteria |",
      "| --- | --- | ---: | ---: | ---: |"
    )

    category_lines <- apply(balanced$category_summary, 1, function(row) {
      sprintf(
        "| %s | %s | %s | %s | %s |",
        format_category(row[["category"]]),
        row[["school"]],
        ifelse(is.na(row[["score"]]), "-", sprintf("%.2f", as.numeric(row[["score"]]))),
        row[["criteria_scored"]],
        row[["total_criteria"]]
      )
    })
    lines <- c(lines, category_lines, "")

    if (nrow(balanced$drivers) > 0) {
      lines <- c(lines, "### Top Drivers", "")
      for (i in seq_len(nrow(balanced$drivers))) {
        row <- balanced$drivers[i, ]
        lines <- c(lines, sprintf("- %s currently leads on **%s** by %.2f adjusted score points.", row$leading_school, row$label, row$score_gap))
      }
      lines <- c(lines, "")
    }
  }

  lines <- c(lines, "## Camille Answers On Subjective Criteria", "")
  if (nrow(camille_rows) == 0) {
    lines <- c(lines, "No Camille-required subjective answers have been entered yet.", "")
  } else {
    for (i in seq_len(nrow(camille_rows))) {
      row <- camille_rows[i, ]
      note_text <- if (nzchar(row$user_note)) paste0(" Note: ", row$user_note) else ""
      lines <- c(lines, sprintf("- %s: %s answered as %.1f.%s", row$school, row$label, row$user_score, note_text))
    }
    lines <- c(lines, "")
  }

  if (nrow(balanced$dealbreakers) > 0) {
    lines <- c(lines, "## Dealbreaker Warnings", "")
    for (i in seq_len(nrow(balanced$dealbreakers))) {
      row <- balanced$dealbreakers[i, ]
      note_text <- if (nzchar(row$note)) paste0(" Note: ", row$note) else ""
      lines <- c(lines, sprintf("- %s: %s scored %.1f.%s", row$school, row$label, row$score, note_text))
    }
    lines <- c(lines, "")
  }

  if (nrow(balanced$missing) > 0) {
    lines <- c(lines, "## Highest-Weight Missing Criteria", "")
    missing_rows <- head(balanced$missing[order(-balanced$missing$effective_weight), ], 15)
    for (i in seq_len(nrow(missing_rows))) {
      row <- missing_rows[i, ]
      lines <- c(lines, sprintf("- %s (%s) weight %.2f", row$label, format_category(row$category), row$effective_weight))
    }
    lines <- c(lines, "")
  }

  lines <- c(
    lines,
    "## Criterion-Level Detail",
    "",
    "| Category | Criterion | Weight | UCSB Score | UCSB Source | Northwestern Score | Northwestern Source |",
    "| --- | --- | ---: | ---: | --- | ---: | --- |"
  )

  detail_rows <- detail_rows[order(detail_rows$category, -detail_rows$user_weight, detail_rows$label), , drop = FALSE]
  for (i in seq_len(nrow(detail_rows))) {
    row <- detail_rows[i, ]
    lines <- c(
      lines,
      sprintf(
        "| %s | %s | %.1f | %s | %s | %s | %s |",
        format_category(row$category),
        row$label,
        row$user_weight,
        ifelse(is.na(row$ucsb_score), "-", sprintf("%.1f", row$ucsb_score)),
        row$ucsb_source,
        ifelse(is.na(row$northwestern_score), "-", sprintf("%.1f", row$northwestern_score)),
        row$northwestern_source
      )
    )
  }
  lines <- c(lines, "")

  if (nrow(known_facts) > 0) {
    lines <- c(lines, "## Seeded Facts", "")
    for (school in unique(known_facts$school)) {
      lines <- c(lines, sprintf("### %s", school), "")
      school_facts <- known_facts[known_facts$school == school, , drop = FALSE]
      for (i in seq_len(nrow(school_facts))) {
        lines <- c(lines, sprintf("- %s", school_facts$known_fact[i]))
      }
      lines <- c(lines, "")
    }
  }

  writeLines(lines, output_path)
}
