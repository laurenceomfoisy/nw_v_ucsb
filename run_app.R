if (!requireNamespace("shiny", quietly = TRUE)) {
  stop("Package 'shiny' is required. Install it with install.packages('shiny').", call. = FALSE)
}

shiny::runApp(getwd(), launch.browser = interactive())
