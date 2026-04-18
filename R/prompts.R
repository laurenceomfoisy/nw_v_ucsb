format_category <- function(category) {
  tools::toTitleCase(gsub("_", " ", category))
}

display_value <- function(value, digits = NULL) {
  if (length(value) == 0 || is.na(value) || identical(value, "")) {
    return("blank")
  }

  if (!is.null(digits) && is.numeric(value)) {
    return(formatC(value, format = "f", digits = digits))
  }

  as.character(value)
}

ask_number <- function(prompt, min_value, max_value, allow_blank = TRUE) {
  repeat {
    response <- readline(prompt)
    response <- trimws(response)

    if (response == "" && allow_blank) {
      return(NA_real_)
    }

    value <- suppressWarnings(as.numeric(response))
    if (!is.na(value) && value >= min_value && value <= max_value) {
      return(value)
    }

    cat(sprintf("Enter a number between %s and %s or leave blank.\n", min_value, max_value))
  }
}

ask_nonnegative_number <- function(prompt, allow_blank = TRUE) {
  repeat {
    response <- readline(prompt)
    response <- trimws(response)

    if (response == "" && allow_blank) {
      return(NA_real_)
    }

    value <- suppressWarnings(as.numeric(response))
    if (!is.na(value) && value >= 0) {
      return(value)
    }

    cat("Enter a non-negative number or leave blank.\n")
  }
}

ask_yes_no <- function(prompt, allow_blank = TRUE) {
  repeat {
    response <- tolower(trimws(readline(prompt)))

    if (response == "" && allow_blank) {
      return(NA)
    }
    if (response %in% c("y", "yes")) {
      return(TRUE)
    }
    if (response %in% c("n", "no")) {
      return(FALSE)
    }

    cat("Enter y or n or leave blank.\n")
  }
}

ask_text <- function(prompt, allow_blank = TRUE) {
  response <- readline(prompt)
  response <- trimws(response)
  if (response == "" && allow_blank) {
    return(NA_character_)
  }
  response
}

print_criteria_review <- function(criteria, category = NULL) {
  filtered <- criteria[criteria$active, , drop = FALSE]

  if (!is.null(category)) {
    filtered <- filtered[filtered$category == category, , drop = FALSE]
    if (nrow(filtered) == 0) {
      stop(sprintf("Unknown category '%s'", category), call. = FALSE)
    }
  }

  cat(sprintf("Loaded %s active criteria across %s categories.\n\n", nrow(filtered), length(unique(filtered$category))))

  categories <- unique(filtered$category)
  for (cat_name in categories) {
    cat(sprintf("[%s]\n", format_category(cat_name)))
    subset_rows <- filtered[filtered$category == cat_name, , drop = FALSE]
    for (i in seq_len(nrow(subset_rows))) {
      row <- subset_rows[i, ]
      cat(sprintf("- %s (default weight %.1f)\n", row$label, row$default_weight))
      cat(sprintf("  %s\n", row$description))
    }
    cat("\n")
  }
}

prompt_weights <- function(criteria, weights, category = NULL) {
  filtered <- criteria[criteria$active, , drop = FALSE]

  if (!is.null(category)) {
    filtered <- filtered[filtered$category == category, , drop = FALSE]
    if (nrow(filtered) == 0) {
      stop(sprintf("Unknown category '%s'", category), call. = FALSE)
    }
  }

  updated <- weights
  idx_weights <- match(filtered$criterion_id, updated$criterion_id)
  categories <- unique(filtered$category)

  for (cat_name in categories) {
    cat(sprintf("\n[%s]\n", format_category(cat_name)))
    rows <- filtered[filtered$category == cat_name, , drop = FALSE]
    for (i in seq_len(nrow(rows))) {
      row <- rows[i, ]
      weight_row <- idx_weights[filtered$criterion_id == row$criterion_id][1]
      current_weight <- updated$user_weight[weight_row]

      cat(sprintf("\n%s\n", row$label))
      cat(sprintf("%s\n", row$description))
      cat(sprintf("Current weight: %s | Default weight: %s\n", display_value(current_weight, 1), display_value(row$default_weight, 1)))
      new_weight <- ask_nonnegative_number("New weight (blank keeps current): ")
      if (!is.na(new_weight)) {
        updated$user_weight[weight_row] <- new_weight
      }
    }
  }

  updated
}

prompt_scores_for_school <- function(school, criteria, options, category = NULL) {
  filtered <- criteria[criteria$active, , drop = FALSE]

  if (!is.null(category)) {
    filtered <- filtered[filtered$category == category, , drop = FALSE]
    if (nrow(filtered) == 0) {
      stop(sprintf("Unknown category '%s'", category), call. = FALSE)
    }
  }

  updated <- options
  school_rows <- updated$school == school
  keys <- paste(updated$school, updated$criterion_id, sep = "::")

  for (cat_name in unique(filtered$category)) {
    cat(sprintf("\n[%s: %s]\n", school, format_category(cat_name)))
    rows <- filtered[filtered$category == cat_name, , drop = FALSE]

    for (i in seq_len(nrow(rows))) {
      row <- rows[i, ]
      option_index <- match(paste(school, row$criterion_id, sep = "::"), keys)
      option_row <- updated[option_index, ]

      cat(sprintf("\n%s\n", row$label))
      cat(sprintf("%s\n", row$description))

      if (nzchar(option_row$known_fact)) {
        cat(sprintf("Known fact: %s\n", option_row$known_fact))
      }

      cat(sprintf(
        "Current values -> score: %s | confidence: %s | dealbreaker: %s\n",
        display_value(option_row$score, 1),
        display_value(option_row$confidence, 2),
        ifelse(option_row$dealbreaker, "yes", "no")
      ))

      if (nzchar(option_row$note)) {
        cat(sprintf("Current note: %s\n", option_row$note))
      }

      score <- ask_number("Score 0-10 (blank keeps current): ", 0, 10)
      confidence <- ask_number("Confidence 0-1 (blank keeps current): ", 0, 1)
      if (row$dealbreaker_allowed) {
        dealbreaker <- ask_yes_no("Flag as dealbreaker? y/n (blank keeps current): ")
      } else {
        dealbreaker <- NA
      }
      note <- ask_text("Note (blank keeps current): ")

      if (!is.na(score)) {
        updated$score[option_index] <- score
      }
      if (!is.na(confidence)) {
        updated$confidence[option_index] <- confidence
      }
      if (!is.na(dealbreaker)) {
        updated$dealbreaker[option_index] <- dealbreaker
      }
      if (!is.na(note)) {
        updated$note[option_index] <- note
      }
    }
  }

  updated
}
