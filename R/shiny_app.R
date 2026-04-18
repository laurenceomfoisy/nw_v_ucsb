school_key <- function(school) {
  tolower(gsub("[^a-zA-Z0-9]+", "_", school))
}

weight_input_id <- function(criterion_id) {
  paste0("weight__", criterion_id)
}

subjective_answered_input_id <- function(criterion_id) {
  paste0("subjective_answered__", criterion_id)
}

subjective_score_input_id <- function(school, criterion_id) {
  paste0("subjective_score__", school_key(school), "__", criterion_id)
}

subjective_confidence_input_id <- function(criterion_id) {
  paste0("subjective_confidence__", criterion_id)
}

subjective_note_input_id <- function(criterion_id) {
  paste0("subjective_note__", criterion_id)
}

school_badge_class <- function(school) {
  paste0("school-badge-", school_key(school))
}

subjective_completion <- function(options, criteria) {
  subjective_ids <- criteria$criterion_id[criteria$score_owner == "camille_required"]
  if (length(subjective_ids) == 0) {
    return(list(answered = 0, total = 0, share = 1))
  }

  rows <- options[options$criterion_id %in% subjective_ids, , drop = FALSE]
  answered_ids <- unique(rows$criterion_id[rows$camille_answered])
  list(
    answered = length(answered_ids),
    total = length(subjective_ids),
    share = length(answered_ids) / length(subjective_ids)
  )
}

weight_completion <- function(weights) {
  if (nrow(weights) == 0) {
    return(list(nonzero = 0, total = 0, share = 0))
  }

  nonzero <- sum(weights$user_weight > 0)
  list(nonzero = nonzero, total = nrow(weights), share = nonzero / nrow(weights))
}

format_score_source <- function(origin) {
  ifelse(
    origin == "camille_required",
    "Camille",
    ifelse(origin == "research_baseline", "Research baseline", ifelse(origin == "legacy_manual", "Legacy", "Missing"))
  )
}

subjective_card_ui <- function(row, options) {
  ucsb_row <- options[options$school == "UCSB" & options$criterion_id == row$criterion_id, , drop = FALSE][1, ]
  nw_row <- options[options$school == "Northwestern" & options$criterion_id == row$criterion_id, , drop = FALSE][1, ]

  context_bits <- c()
  if (nzchar(ucsb_row$known_fact)) {
    context_bits <- c(context_bits, sprintf("UCSB: %s", ucsb_row$known_fact))
  }
  if (nzchar(nw_row$known_fact)) {
    context_bits <- c(context_bits, sprintf("Northwestern: %s", nw_row$known_fact))
  }
  if (length(context_bits) == 0) {
    context_bits <- c("No seeded context note yet for this subjective criterion.")
  }

  div(
    class = "survey-card",
    tags$h3(row$label),
    tags$p(class = "question-copy", row$description),
    div(
      class = "context-box",
      tags$strong("Context already built into the tool"),
      tags$ul(lapply(context_bits, tags$li))
    ),
    checkboxInput(
      inputId = subjective_answered_input_id(row$criterion_id),
      label = "I have answered this question for both schools",
      value = isTRUE(ucsb_row$camille_answered)
    ),
    fluidRow(
      column(
        6,
        div(
          class = paste("school-mini-card", school_badge_class("UCSB")),
          tags$h4("UCSB"),
          sliderInput(
            inputId = subjective_score_input_id("UCSB", row$criterion_id),
            label = "Score",
            min = 0,
            max = 10,
            value = if (!is.na(ucsb_row$user_score)) ucsb_row$user_score else 5,
            step = 0.5,
            width = "100%"
          )
        )
      ),
      column(
        6,
        div(
          class = paste("school-mini-card", school_badge_class("Northwestern")),
          tags$h4("Northwestern"),
          sliderInput(
            inputId = subjective_score_input_id("Northwestern", row$criterion_id),
            label = "Score",
            min = 0,
            max = 10,
            value = if (!is.na(nw_row$user_score)) nw_row$user_score else 5,
            step = 0.5,
            width = "100%"
          )
        )
      )
    ),
    sliderInput(
      inputId = subjective_confidence_input_id(row$criterion_id),
      label = "How confident is Camille in this judgment?",
      min = 0,
      max = 1,
      value = if (!is.na(ucsb_row$user_confidence)) ucsb_row$user_confidence else 0.7,
      step = 0.05,
      width = "100%"
    ),
    textAreaInput(
      inputId = subjective_note_input_id(row$criterion_id),
      label = "Optional note",
      value = if (nzchar(ucsb_row$user_note)) ucsb_row$user_note else "",
      rows = 2,
      width = "100%",
      placeholder = "Short note about why these two scores feel right"
    )
  )
}

weight_card_ui <- function(row, weight) {
  div(
    class = "survey-card compact-card",
    tags$h3(row$label),
    tags$p(class = "question-copy", row$description),
    sliderInput(
      inputId = weight_input_id(row$criterion_id),
      label = "How important is this in Camille's overall decision?",
      min = 0,
      max = 10,
      value = weight,
      step = 0.5,
      width = "100%"
    ),
    tags$p(class = "muted-copy", "Set to 0 if this should not affect the final decision.")
  )
}

build_details_table <- function(state, result) {
  options <- resolve_option_scores(state$options, state$criteria)

  ucsb <- options[options$school == "UCSB", c("criterion_id", "score", "score_origin")]
  nw <- options[options$school == "Northwestern", c("criterion_id", "score", "score_origin")]
  names(ucsb) <- c("criterion_id", "ucsb_score", "ucsb_source")
  names(nw) <- c("criterion_id", "nw_score", "nw_source")

  details <- merge(
    state$criteria[, c("criterion_id", "category", "label")],
    state$weights,
    by = "criterion_id",
    all.x = TRUE,
    sort = FALSE
  )
  details <- merge(details, ucsb, by = "criterion_id", all.x = TRUE, sort = FALSE)
  details <- merge(details, nw, by = "criterion_id", all.x = TRUE, sort = FALSE)
  details$category <- format_category(details$category)
  details$ucsb_source <- format_score_source(details$ucsb_source)
  details$nw_source <- format_score_source(details$nw_source)
  details$gap <- details$ucsb_score - details$nw_score

  details[order(details$category, -details$user_weight, details$label), c(
    "category", "label", "user_weight", "ucsb_score", "ucsb_source", "nw_score", "nw_source", "gap"
  )]
}

build_decision_survey_app <- function(root) {
  initial <- load_state(root)

  ui <- fluidPage(
    tags$head(
      tags$title("Camille PhD Decision Survey"),
      tags$style(HTML(
        "
        body {
          background: #f5f7fb;
          color: #16233a;
          font-family: Inter, Arial, sans-serif;
        }
        .app-shell {
          max-width: 1080px;
          margin: 0 auto;
          padding: 28px 16px 48px;
        }
        .hero {
          padding: 24px;
          border-radius: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #edf3ff 100%);
          box-shadow: 0 18px 42px rgba(30, 47, 84, 0.08);
          margin-bottom: 18px;
        }
        .hero h1 {
          margin: 0 0 10px;
          font-size: 30px;
          font-weight: 800;
        }
        .hero p {
          margin: 0;
          max-width: 820px;
          color: #44556d;
          line-height: 1.55;
        }
        .progress-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }
        .progress-step {
          padding: 12px 14px;
          border-radius: 14px;
          background: #e8edf7;
          color: #4e6079;
          font-weight: 700;
          text-align: center;
        }
        .progress-step.active {
          background: #203a68;
          color: #ffffff;
        }
        .section-shell {
          padding: 22px;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 18px 42px rgba(30, 47, 84, 0.08);
        }
        .section-shell h2 {
          margin-top: 0;
          margin-bottom: 8px;
          font-size: 26px;
          font-weight: 800;
        }
        .section-intro {
          color: #4c5d75;
          margin-bottom: 18px;
        }
        .survey-card {
          padding: 18px;
          border: 1px solid #e2e8f2;
          border-radius: 18px;
          background: #fbfcff;
          margin-bottom: 16px;
        }
        .compact-card {
          background: #ffffff;
        }
        .survey-card h3 {
          margin-top: 0;
          margin-bottom: 6px;
          font-size: 20px;
          font-weight: 750;
        }
        .survey-card h4 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 18px;
          font-weight: 700;
        }
        .question-copy {
          color: #56687f;
          margin-bottom: 14px;
        }
        .context-box {
          margin-bottom: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #eef4ff;
          color: #2a456a;
        }
        .context-box ul {
          margin: 8px 0 0;
          padding-left: 18px;
        }
        .school-mini-card {
          padding: 14px;
          border-radius: 14px;
          color: #ffffff;
          min-height: 150px;
        }
        .school-badge-ucsb {
          background: linear-gradient(135deg, #0e6ba8 0%, #0a9eb3 100%);
        }
        .school-badge-northwestern {
          background: linear-gradient(135deg, #4e2a84 0%, #7555a5 100%);
        }
        .category-header {
          margin: 28px 0 12px;
          font-size: 22px;
          font-weight: 800;
        }
        .nav-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .nav-row .btn,
        .nav-row .btn-default {
          min-width: 140px;
          border-radius: 12px;
          border: 0;
          padding: 10px 16px;
          font-weight: 700;
        }
        .nav-row .btn-default {
          background: #203a68;
          color: #ffffff;
        }
        .status-pill {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 999px;
          background: #edf2fa;
          color: #4f617a;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 18px;
        }
        .result-card {
          padding: 18px;
          border-radius: 18px;
          color: #ffffff;
        }
        .result-card.ucsb {
          background: linear-gradient(135deg, #0e6ba8 0%, #0a9eb3 100%);
        }
        .result-card.northwestern {
          background: linear-gradient(135deg, #4e2a84 0%, #7555a5 100%);
        }
        .result-card .small {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.9;
        }
        .result-card .big {
          font-size: 34px;
          font-weight: 800;
          margin-top: 8px;
        }
        .result-card .meta {
          margin-top: 8px;
          opacity: 0.95;
        }
        .muted-copy {
          color: #697a91;
          margin-bottom: 0;
        }
        .table {
          background: #ffffff;
        }
        @media (max-width: 800px) {
          .progress-strip,
          .results-grid {
            grid-template-columns: 1fr;
          }
        }
        "
      ))
    ),
    div(
      class = "app-shell",
      div(
        class = "hero",
        tags$h1("Camille PhD Decision Survey"),
        tags$p("This is a simple four-step survey. Objective criteria are already pre-scored inside the tool. Camille only has to score the subjective questions herself, then answer the importance survey, then read the final results sheet.")
      ),
      uiOutput("progress_ui"),
      uiOutput("step_ui")
    )
  )

  server <- function(input, output, session) {
    step <- reactiveVal(1)
    rv <- reactiveValues(
      criteria = initial$criteria,
      weights = initial$weights,
      options = initial$options,
      scenarios = initial$scenarios
    )

    current_criteria <- reactive({
      criteria <- augment_criteria(rv$criteria)
      criteria$active[] <- TRUE
      criteria
    })

    current_weights <- reactive({
      weights <- sync_weights(rv$weights, current_criteria())
      for (i in seq_len(nrow(weights))) {
        current_value <- input[[weight_input_id(weights$criterion_id[i])]]
        if (!is.null(current_value)) {
          weights$user_weight[i] <- current_value
        }
      }
      weights
    })

    current_options_raw <- reactive({
      criteria <- current_criteria()
      options <- sync_options(rv$options, criteria, default_schools())
      subjective_rows <- criteria[criteria$score_owner == "camille_required", , drop = FALSE]

      for (i in seq_len(nrow(subjective_rows))) {
        criterion_id <- subjective_rows$criterion_id[i]
        answered <- input[[subjective_answered_input_id(criterion_id)]]
        ucsb_score <- input[[subjective_score_input_id("UCSB", criterion_id)]]
        nw_score <- input[[subjective_score_input_id("Northwestern", criterion_id)]]
        confidence <- input[[subjective_confidence_input_id(criterion_id)]]
        note <- input[[subjective_note_input_id(criterion_id)]]

        rows <- options$criterion_id == criterion_id
        if (!is.null(answered)) {
          options$camille_answered[rows] <- isTRUE(answered)
        }
        if (!is.null(note)) {
          options$user_note[rows] <- note
        }

        if (isTRUE(options$camille_answered[rows][1])) {
          options$user_score[options$school == "UCSB" & rows] <- ucsb_score
          options$user_score[options$school == "Northwestern" & rows] <- nw_score
          options$user_confidence[rows] <- confidence
        } else {
          options$user_score[rows] <- NA_real_
          options$user_confidence[rows] <- NA_real_
        }
      }

      options
    })

    current_state <- reactive({
      options <- resolve_option_scores(current_options_raw(), current_criteria())
      list(
        criteria = current_criteria(),
        weights = current_weights(),
        options = options,
        scenarios = rv$scenarios
      )
    })

    current_result <- reactive({
      state <- current_state()
      compare_schools(state$criteria, state$weights, state$options, state$scenarios, "balanced")
    })

    save_current_state <- function() {
      state <- current_state()
      save_criteria(root, state$criteria)
      save_weights(root, state$weights)
      save_options(root, state$options)
      rv$criteria <- state$criteria
      rv$weights <- state$weights
      rv$options <- state$options
      invisible(state)
    }

    missing_subjective_labels <- reactive({
      state <- current_state()
      subjective <- state$criteria[state$criteria$score_owner == "camille_required", c("criterion_id", "label"), drop = FALSE]
      answered_rows <- state$options[state$options$school == "UCSB", c("criterion_id", "camille_answered"), drop = FALSE]
      merged <- merge(subjective, answered_rows, by = "criterion_id", all.x = TRUE, sort = FALSE)
      merged$label[!merged$camille_answered]
    })

    output$progress_ui <- renderUI({
      labels <- c("1. Intro", "2. Subjective Scores", "3. Importance Survey", "4. Results")
      div(
        class = "progress-strip",
        lapply(seq_along(labels), function(i) {
          div(class = paste("progress-step", if (step() == i) "active" else ""), labels[[i]])
        })
      )
    })

    output$step_ui <- renderUI({
      state <- current_state()
      criteria <- state$criteria
      options <- state$options
      weights <- state$weights
      result <- current_result()

      if (step() == 1) {
        completion <- subjective_completion(options, criteria)
        div(
          class = "section-shell",
          tags$h2("How this survey works"),
          tags$p(class = "section-intro", "The tool already contains baseline scores for objective criteria like stipend level, housing affordability, and prestige. Camille only needs to answer the subjective questions herself, then say how important each criterion is overall."),
          div(class = "status-pill", sprintf("Subjective questions answered so far: %s / %s", completion$answered, completion$total)),
          tags$ul(
            tags$li("Step 2 asks Camille to rate both schools on the criteria that depend on her own feelings or judgment."),
            tags$li("Step 3 asks how important each criterion is in the overall decision. A weight of 0 means it should not matter."),
            tags$li("Step 4 shows one detailed results sheet with the final recommendation, category breakdown, top drivers, and criterion-level details.")
          ),
          div(
            class = "nav-row",
            tags$span(),
            actionButton("next_from_intro", "Start survey")
          )
        )
      } else if (step() == 2) {
        subjective_rows <- criteria[criteria$score_owner == "camille_required", , drop = FALSE]
        completion <- subjective_completion(options, criteria)
        div(
          class = "section-shell",
          tags$h2("Subjective scores"),
          tags$p(class = "section-intro", "For each question, Camille should score both schools herself. These are the criteria where the tool should not pretend to know the answer objectively."),
          div(class = "status-pill", sprintf("Completed: %s / %s subjective questions", completion$answered, completion$total)),
          lapply(unique(subjective_rows$category), function(category) {
            rows <- subjective_rows[subjective_rows$category == category, , drop = FALSE]
            tagList(
              tags$div(class = "category-header", format_category(category)),
              lapply(seq_len(nrow(rows)), function(i) subjective_card_ui(rows[i, ], options))
            )
          }),
          div(
            class = "nav-row",
            actionButton("back_to_intro", "Back"),
            actionButton("next_to_weights", "Continue to importance survey")
          )
        )
      } else if (step() == 3) {
        div(
          class = "section-shell",
          tags$h2("Importance survey"),
          tags$p(class = "section-intro", "Now ignore which school is better on each criterion and answer only one question: how much should this matter in Camille's final decision?"),
          lapply(unique(criteria$category), function(category) {
            rows <- criteria[criteria$category == category, , drop = FALSE]
            tagList(
              tags$div(class = "category-header", format_category(category)),
              lapply(seq_len(nrow(rows)), function(i) {
                row <- rows[i, ]
                weight <- weights$user_weight[weights$criterion_id == row$criterion_id][1]
                weight_card_ui(row, weight)
              })
            )
          }),
          div(
            class = "nav-row",
            actionButton("back_to_subjective", "Back"),
            actionButton("next_to_results", "See results")
          )
        )
      } else {
        completion <- weight_completion(weights)
        overall <- result$overall
        winner <- if (all(is.na(overall$overall_score))) NA_character_ else overall$school[which.max(overall$overall_score)]
        details <- build_details_table(state, result)

        div(
          class = "section-shell",
          tags$h2("Results sheet"),
          tags$p(class = "section-intro", "This sheet combines objective baseline scores, Camille's required subjective answers, and the weights from the importance survey."),
          div(class = "status-pill", sprintf("Criteria with non-zero weight: %s / %s", completion$nonzero, completion$total)),
          if (all(is.na(overall$overall_score))) {
            tags$p("There is still not enough overlapping data to compute a final comparison." )
          } else {
            tagList(
              tags$p(sprintf("Current recommendation: %s has the higher weighted overall score.", winner)),
              div(
                class = "results-grid",
                div(
                  class = "result-card ucsb",
                  tags$div(class = "small", "Overall score"),
                  tags$div(class = "big", sprintf("%.2f", overall$overall_score[overall$school == "UCSB"])),
                  tags$div(class = "meta", sprintf("Coverage %.1f%%", 100 * result$coverage))
                ),
                div(
                  class = "result-card northwestern",
                  tags$div(class = "small", "Overall score"),
                  tags$div(class = "big", sprintf("%.2f", overall$overall_score[overall$school == "Northwestern"])),
                  tags$div(class = "meta", sprintf("Coverage %.1f%%", 100 * result$coverage))
                )
              )
            )
          },
          tags$h3("Category breakdown"),
          tableOutput("results_category_table"),
          tags$h3("Top drivers"),
          uiOutput("results_drivers_ui"),
          tags$h3("Criterion details"),
          tableOutput("results_details_table"),
          div(
            class = "nav-row",
            actionButton("back_to_weights", "Back"),
            downloadButton("download_report", "Download detailed report")
          )
        )
      }
    })

    output$results_category_table <- renderTable({
      result <- current_result()
      summary <- result$category_summary
      summary$category <- format_category(summary$category)
      summary$score <- ifelse(is.na(summary$score), "-", sprintf("%.2f", summary$score))
      summary
    }, striped = TRUE, bordered = TRUE, width = "100%")

    output$results_drivers_ui <- renderUI({
      result <- current_result()
      if (nrow(result$drivers) == 0) {
        return(tags$p("No strong driver list is available yet because too many criteria are still unresolved."))
      }

      tags$ul(
        lapply(seq_len(nrow(result$drivers)), function(i) {
          row <- result$drivers[i, ]
          tags$li(sprintf("%s leads on %s by %.2f adjusted points.", row$leading_school, row$label, row$score_gap))
        })
      )
    })

    output$results_details_table <- renderTable({
      details <- build_details_table(current_state(), current_result())
      details$user_weight <- sprintf("%.1f", details$user_weight)
      details$ucsb_score <- ifelse(is.na(details$ucsb_score), "-", sprintf("%.1f", details$ucsb_score))
      details$nw_score <- ifelse(is.na(details$nw_score), "-", sprintf("%.1f", details$nw_score))
      details$gap <- ifelse(is.na(details$gap), "-", sprintf("%.1f", details$gap))
      names(details) <- c("Category", "Criterion", "Weight", "UCSB Score", "UCSB Source", "Northwestern Score", "Northwestern Source", "Gap (UCSB-NW)")
      details
    }, striped = TRUE, bordered = TRUE, width = "100%")

    observeEvent(input$next_from_intro, {
      step(2)
    })

    observeEvent(input$back_to_intro, {
      step(1)
    })

    observeEvent(input$next_to_weights, {
      missing_labels <- missing_subjective_labels()
      if (length(missing_labels) > 0) {
        showNotification(
          sprintf("Please answer all subjective questions before continuing. Remaining: %s", paste(head(missing_labels, 4), collapse = ", ")),
          type = "error",
          duration = 7
        )
        return()
      }
      save_current_state()
      step(3)
    })

    observeEvent(input$back_to_subjective, {
      step(2)
    })

    observeEvent(input$next_to_results, {
      save_current_state()
      step(4)
    })

    observeEvent(input$back_to_weights, {
      step(3)
    })

    output$download_report <- downloadHandler(
      filename = function() {
        paste0("camille-decision-report-", Sys.Date(), ".md")
      },
      content = function(file) {
        state <- save_current_state()
        write_report(root, file, state)
      }
    )
  }

  shinyApp(ui = ui, server = server)
}
