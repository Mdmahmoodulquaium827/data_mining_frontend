export const PREDICTION_CONFIG = {
  MODE: "api",

  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",

  ENDPOINTS: {
    price: "/api/v1/prediction/price",
    classification: "/api/v1/prediction/classify",
    clustering: "/api/v1/prediction/cluster",
    analytics: "/api/v1/mining/analytics",
    mining: "/api/v1/mining/mine",
    status: "/api/v1/mining/status",
    products: "/api/v1/product",
    sites: "/api/v1/product/sites",
    deleteSite: "/api/v1/product/site",
    features: "/api/v1/prediction/features",
  },
};
