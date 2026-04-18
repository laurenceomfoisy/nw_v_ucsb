#!/usr/bin/env Rscript

root <- getwd()

source(file.path(root, "R", "data_io.R"), local = TRUE)
source(file.path(root, "R", "prompts.R"), local = TRUE)
source(file.path(root, "R", "scoring.R"), local = TRUE)
source(file.path(root, "R", "report.R"), local = TRUE)

print_help <- function() {
  cat(
    paste(
      "Usage:",
      "  Rscript cli.R init",
      "  Rscript cli.R review-criteria [category]",
      "  Rscript cli.R set-weights [category]",
      "  Rscript cli.R score <school> [category]",
      "  Rscript cli.R compare [scenario]",
      "  Rscript cli.R scenario <scenario>",
      "  Rscript cli.R report [output_path]",
      "",
      "Examples:",
      "  Rscript cli.R review-criteria academic_fit",
      "  Rscript cli.R score UCSB funding_material",
      "  Rscript cli.R compare wellbeing",
      sep = "\n"
    )
  )
}

print_compare <- function(result) {
  cat(sprintf("Scenario: %s\n", result$scenario))
  cat(sprintf("Compared schools: %s vs %s\n\n", result$schools[[1]], result$schools[[2]]))

  if (nrow(result$overall) == 0 || all(is.na(result$overall$overall_score))) {
    cat("No criteria have scores for both schools yet.\n")
    cat("Use `Rscript cli.R score UCSB` and `Rscript cli.R score Northwestern` to enter ratings.\n")
    cat(sprintf("Comparable coverage: %.1f%%\n", 100 * result$coverage))
    return(invisible(NULL))
  }

  cat("Overall scores\n")
  print(data.frame(
    school = result$overall$school,
    overall_score = sprintf("%.2f", result$overall$overall_score),
    stringsAsFactors = FALSE
  ), row.names = FALSE)
  cat(sprintf("Comparable coverage: %.1f%%\n\n", 100 * result$coverage))

  cat("Category breakdown\n")
  category_table <- data.frame(
    category = format_category(result$category_summary$category),
    school = result$category_summary$school,
    score = sprintf("%.2f", result$category_summary$score),
    criteria_scored = result$category_summary$criteria_scored,
    total_criteria = result$category_summary$total_criteria,
    stringsAsFactors = FALSE
  )
  print(category_table, row.names = FALSE)

  if (nrow(result$drivers) > 0) {
    cat("\nTop drivers\n")
    driver_table <- data.frame(
      criterion = result$drivers$label,
      leading_school = result$drivers$leading_school,
      gap = sprintf("%.2f", result$drivers$score_gap),
      stringsAsFactors = FALSE
    )
    print(driver_table, row.names = FALSE)
  }

  if (nrow(result$dealbreakers) > 0) {
    cat("\nPotential dealbreaker warnings\n")
    warning_table <- data.frame(
      school = result$dealbreakers$school,
      criterion = result$dealbreakers$label,
      score = sprintf("%.1f", result$dealbreakers$score),
      note = result$dealbreakers$note,
      stringsAsFactors = FALSE
    )
    print(warning_table, row.names = FALSE)
  }

  if (nrow(result$missing) > 0) {
    cat("\nHighest-weight missing criteria\n")
    missing_table <- head(result$missing[order(-result$missing$effective_weight), c("label", "category", "effective_weight")], 10)
    names(missing_table) <- c("criterion", "category", "effective_weight")
    missing_table$category <- format_category(missing_table$category)
    missing_table$effective_weight <- sprintf("%.2f", missing_table$effective_weight)
    print(missing_table, row.names = FALSE)
  }
}

args <- commandArgs(trailingOnly = TRUE)

if (length(args) == 0) {
  print_help()
  quit(status = 0)
}

command <- args[[1]]
invisible(bootstrap_state(root))

state <- function() load_state(root)

if (identical(command, "init")) {
  synced <- bootstrap_state(root)
  cat("Project data is ready.\n")
  cat(sprintf("Criteria: %s rows\n", nrow(synced$criteria)))
  cat(sprintf("Weights: %s rows\n", nrow(synced$weights)))
  cat(sprintf("Options: %s rows\n", nrow(synced$options)))
  cat(sprintf("Scenarios: %s rows\n", nrow(synced$scenarios)))
} else if (identical(command, "review-criteria")) {
  current <- state()
  category <- if (length(args) >= 2) args[[2]] else NULL
  print_criteria_review(current$criteria, category)
} else if (identical(command, "set-weights")) {
  current <- state()
  category <- if (length(args) >= 2) args[[2]] else NULL
  updated <- prompt_weights(current$criteria, current$weights, category)
  save_weights(root, updated)
  cat("Weights saved to data/weights.csv\n")
} else if (identical(command, "score")) {
  if (length(args) < 2) {
    stop("Usage: Rscript cli.R score <school> [category]", call. = FALSE)
  }

  current <- state()
  school <- args[[2]]
  schools <- default_schools()[default_schools() %in% unique(current$options$school)]

  if (!(school %in% schools)) {
    stop(sprintf("Unknown school '%s'. Available schools: %s", school, paste(schools, collapse = ", ")), call. = FALSE)
  }

  category <- if (length(args) >= 3) args[[3]] else NULL
  updated <- prompt_scores_for_school(school, current$criteria, current$options, category)
  save_options(root, updated)
  cat(sprintf("Saved scores for %s to data/options.csv\n", school))
} else if (identical(command, "compare")) {
  current <- state()
  scenario <- if (length(args) >= 2) args[[2]] else "balanced"
  result <- compare_schools(current$criteria, current$weights, current$options, current$scenarios, scenario)
  print_compare(result)
} else if (identical(command, "scenario")) {
  if (length(args) < 2) {
    stop("Usage: Rscript cli.R scenario <scenario>", call. = FALSE)
  }

  current <- state()
  result <- compare_schools(current$criteria, current$weights, current$options, current$scenarios, args[[2]])
  print_compare(result)
} else if (identical(command, "report")) {
  output_path <- if (length(args) >= 2) args[[2]] else file.path(root, "outputs", "decision_report.md")
  write_report(root, output_path)
  cat(sprintf("Report written to %s\n", output_path))
} else {
  print_help()
  stop(sprintf("Unknown command '%s'", command), call. = FALSE)
}
