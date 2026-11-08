import { PREDICTION_CONFIG } from "@/config/predictionConfig";

const mockService = {
  async predictPrice(product) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      predicted_price: 45000,
      model: "Random Forest Regressor",
      mode: "demo",
    };
  },

  async classifyProduct(product) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const description = product.description.toLowerCase();

    let predictedClass = "Not identified";

    if (product.target === "Inverter") {
      predictedClass = description.includes("inverter")
        ? "Inverter"
        : "Non-Inverter";
    }

    if (product.target === "Smartphone") {
      predictedClass = description.includes("smart")
        ? "Smartphone"
        : "Non-Smartphone";
    }

    if (product.target === "Wireless") {
      predictedClass = /wireless|wifi|wi-fi|bluetooth/.test(description)
        ? "Wireless"
        : "Non-Wireless";
    }

    if (product.target === "Smart TV") {
      predictedClass = description.includes("smart")
        ? "Smart TV"
        : "Non-Smart TV";
    }

    if (product.target === "HD Display") {
      predictedClass = /4k|uhd|fhd|1080p|hd/.test(description)
        ? "HD Display"
        : "Non-HD Display";
    }

    return {
      predicted_class: predictedClass,
      model: "Demo Classification",
      mode: "demo",
    };
  },

  async clusterProduct(product) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      cluster: 0,
      cluster_name: "Cluster 0",
      mode: "demo",
    };
  },
};

const apiService = {
  async request(endpoint, payload) {
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
      throw new Error("Prediction API request failed");
    }

    return response.json();
  },

  predictPrice(product) {
    return this.request(PREDICTION_CONFIG.ENDPOINTS.price, product);
  },

  classifyProduct(product) {
    return this.request(
      PREDICTION_CONFIG.ENDPOINTS.classification,
      product
    );
  },

  clusterProduct(product) {
    return this.request(
      PREDICTION_CONFIG.ENDPOINTS.clustering,
      product
    );
  },
};

const predictionService =
  PREDICTION_CONFIG.MODE === "mock"
    ? mockService
    : apiService;

export default predictionService;