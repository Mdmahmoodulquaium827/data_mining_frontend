export const modelMetrics = {
  regression: [
    {
      model: "Linear Regression",
      r2: -408.746,
      mae: 206566.71,
    },
    {
      model: "Random Forest",
      r2: 0.649,
      mae: 10361.57,
    },
  ],

  classification: [
    {
      model: "Logistic Regression",
      accuracy: 96.67,
    },
    {
      model: "Random Forest Classifier",
      accuracy: 96.67,
    },
  ],
};

export const clusterData = [
  { name: "Cluster 0", products: 42, averagePrice: 17833.05 },
  { name: "Cluster 1", products: 2, averagePrice: 61000 },
  { name: "Cluster 2", products: 16, averagePrice: 57374.38 },
];

export const classificationTargets = {
  AC: ["Inverter"],
  Mobile: ["Smartphone", "Wireless"],
  TV: ["Smart TV", "HD Display"],
  Laptop: ["Wireless"],
  Refrigerator: ["Inverter"],
};