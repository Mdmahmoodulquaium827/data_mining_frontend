export const PREDICTION_CONFIG = {
  MODE: "mock",

  API_BASE_URL: "http://localhost:8001",

  ENDPOINTS: {
    price: "/api/v1/prediction/price",
    classification: "/api/v1/prediction/classify",
    clustering: "/api/v1/prediction/cluster",
    analytics: "/api/v1/prediction/analytics",
  },
};