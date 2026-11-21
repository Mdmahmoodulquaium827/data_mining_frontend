import { PREDICTION_CONFIG } from "@/config/predictionConfig";

const apiService = {
  async post(endpoint, payload) {
    const response = await fetch(
      `${PREDICTION_CONFIG.API_BASE_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "API request failed");
    }

    const res = await response.json();
    return res.data !== undefined ? res.data : res;
  },

  async get(endpoint, query = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(
      `${PREDICTION_CONFIG.API_BASE_URL}${endpoint}${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`GET request failed: ${response.statusText}`);
    }

    const res = await response.json();
    return res.data !== undefined ? res.data : res;
  },

  async delete(endpoint) {
    const response = await fetch(
      `${PREDICTION_CONFIG.API_BASE_URL}${endpoint}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Delete request failed");
    }

    const res = await response.json();
    return res.data !== undefined ? res.data : res;
  },

  // Prediction & Classification
  predictPrice(product) {
    return this.post(PREDICTION_CONFIG.ENDPOINTS.price, product);
  },

  classifyProduct(product) {
    return this.post(PREDICTION_CONFIG.ENDPOINTS.classification, product);
  },

  clusterProduct(product) {
    return this.post(PREDICTION_CONFIG.ENDPOINTS.clustering, product);
  },

  // Mining Engine APIs
  startMining(targetUrl, maxProducts = 30, features = null) {
    return this.post(PREDICTION_CONFIG.ENDPOINTS.mining, { targetUrl, maxProducts, features });
  },

  getMiningStatus() {
    return this.get(PREDICTION_CONFIG.ENDPOINTS.status);
  },

  getAnalytics() {
    return this.get(PREDICTION_CONFIG.ENDPOINTS.analytics);
  },

  // Product Catalog APIs
  getProducts(filters = {}) {
    return this.get(PREDICTION_CONFIG.ENDPOINTS.products, filters);
  },

  getProductById(id) {
    return this.get(`${PREDICTION_CONFIG.ENDPOINTS.products}/${id}`);
  },

  getProductBySlug(slug) {
    return this.get(`${PREDICTION_CONFIG.ENDPOINTS.products}/slug/${slug}`);
  },

  // Site Management APIs
  getMinedSites() {
    return this.get(PREDICTION_CONFIG.ENDPOINTS.sites);
  },

  deleteSiteProducts(domain) {
    return this.delete(`${PREDICTION_CONFIG.ENDPOINTS.deleteSite}/${encodeURIComponent(domain)}`);
  },

  clearAllProducts() {
    return this.delete(`${PREDICTION_CONFIG.ENDPOINTS.deleteSite}/all`);
  },

  // Classification Features Autocomplete
  getClassificationFeatures() {
    return this.get(PREDICTION_CONFIG.ENDPOINTS.features);
  },
};

const predictionService = apiService;

export default predictionService;
