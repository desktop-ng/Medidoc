export const HEALTH_CONDITIONS = [
  "anxiety_disorder",
  "breastfeeding",
  "clinical_depression",
  "depression_anxiety_medication",
  "diabetes",
  "diagnosed_infertility",
  "endometriosis",
  "history_of_miscarriages",
  "history_of_gestational_diabetes",
  "history_of_gestational_hypertension",
  "iui",
  "ivf",
  "menopause",
  "pcos",
  "past_cancer_treatment",
  "postpartum_depression",
  "pre_diabetes",
  "uterine_fibroids"
] as const;

export type HealthCondition = (typeof HEALTH_CONDITIONS)[number];
