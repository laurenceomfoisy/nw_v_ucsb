library(shiny)

root <- getwd()

source(file.path(root, "R", "data_io.R"), local = TRUE)
source(file.path(root, "R", "scoring.R"), local = TRUE)
source(file.path(root, "R", "report.R"), local = TRUE)
source(file.path(root, "R", "shiny_app.R"), local = TRUE)

build_decision_survey_app(root)
