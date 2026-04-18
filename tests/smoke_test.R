root <- getwd()

library(shiny)

source(file.path(root, "R", "data_io.R"), local = TRUE)
source(file.path(root, "R", "scoring.R"), local = TRUE)
source(file.path(root, "R", "report.R"), local = TRUE)
source(file.path(root, "R", "shiny_app.R"), local = TRUE)

state <- load_state(root)
app <- build_decision_survey_app(root)

stopifnot(inherits(app, "shiny.appobj"))

subjective_ids <- state$criteria$criterion_id[state$criteria$score_owner == "camille_required"]
stopifnot(length(subjective_ids) > 0)

subjective_rows <- state$options$criterion_id %in% subjective_ids
state$options$camille_answered[subjective_rows] <- TRUE
state$options$user_confidence[subjective_rows] <- 0.8
state$options$user_note[subjective_rows] <- "Smoke test response"

ucsb_rows <- state$options$school == "UCSB" & subjective_rows
nw_rows <- state$options$school == "Northwestern" & subjective_rows

state$options$user_score[ucsb_rows] <- 7.0
state$options$user_score[nw_rows] <- 6.0
state$options <- resolve_option_scores(state$options, state$criteria)

result <- compare_schools(state$criteria, state$weights, state$options, state$scenarios, "balanced")

stopifnot(nrow(result$overall) == 2)
stopifnot(all(!is.na(result$overall$overall_score)))
stopifnot(result$coverage > 0)

report_path <- tempfile(fileext = ".md")
write_report(root, report_path, state)
report_lines <- readLines(report_path, warn = FALSE)

stopifnot(any(grepl("# Camille Decision Report", report_lines, fixed = TRUE)))
stopifnot(any(grepl("## Criterion-Level Detail", report_lines, fixed = TRUE)))

cat("smoke test passed\n")
