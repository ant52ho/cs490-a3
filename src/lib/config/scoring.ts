export const MATCH_WEIGHTS = {
  skillFit: 0.4,
  availability: 0.3,
  workload: 0.3,
} as const;

export const VARIANCE_THRESHOLD_PCT = 10;

export const UTILIZATION_THRESHOLDS = {
  underutilized: 40,
  healthy: 75,
  overloaded: 100,
} as const;

export const BENCH_RISK_THRESHOLD = 30;
export const BENCH_RISK_WEEKS = 4;
export const BURNOUT_THRESHOLD = 100;
export const BURNOUT_WEEKS = 3;
