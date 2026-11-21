/**
 * Utility to export product datasets to a structured .csv file in the browser
 */
export function exportProductsToCSV(products, filename = "mined_products.csv") {
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new Error("No products available to export.");
  }

  const headers = [
    "Product Name",
    "Brand",
    "Price (BDT)",
    "Original Price",
    "Price Imputed",
    "Cluster Segment",
    "Source Domain",
    "Source URL",
    "Availability",
    "Rating Average",
    "Rating Count",
    "Gaming Flag",
    "SSD Flag",
    "Touchscreen Flag",
    "OLED Flag",
    "Smart Flag",
    "Inverter Flag",
    "Wireless Flag",
    "HD Flag",
    "Specifications",
    "Description",
    "Image URL",
    "Product Slug",
    "Mined Date",
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = products.map((p) => {
    const attrs = p.attributes || {};
    const rating = p.rating || {};
    const primaryImg = (p.images && p.images[0]?.url) || p.image || "";
    const sourceUrl = (p.sources && p.sources[0]?.url) || "";
    const sourceDomain = attrs.source_domain || (p.sources && p.sources[0]?.name) || "";
    const specsStr = p.specifications ? JSON.stringify(p.specifications) : "";

    return [
      p.name || "",
      p.brand || "Unknown",
      p.price !== undefined && p.price !== null ? p.price : "",
      attrs.original_price !== undefined && attrs.original_price !== null ? attrs.original_price : "",
      attrs.price_imputed ? "TRUE" : "FALSE",
      attrs.segment || "Cluster 0",
      sourceDomain,
      sourceUrl,
      attrs.availability || "InStock",
      rating.average !== undefined ? rating.average : 0,
      rating.count !== undefined ? rating.count : 0,
      attrs.is_gaming ? "TRUE" : "FALSE",
      attrs.has_ssd ? "TRUE" : "FALSE",
      attrs.is_touchscreen ? "TRUE" : "FALSE",
      attrs.is_oled ? "TRUE" : "FALSE",
      attrs.is_smart ? "TRUE" : "FALSE",
      attrs.is_inverter ? "TRUE" : "FALSE",
      attrs.is_wireless ? "TRUE" : "FALSE",
      attrs.is_hd ? "TRUE" : "FALSE",
      specsStr,
      p.description || "",
      primaryImg,
      p.productSlug || "",
      p.createdAt ? new Date(p.createdAt).toISOString() : "",
    ];
  });

  // UTF-8 BOM (\uFEFF) ensures proper rendering in Microsoft Excel and Google Sheets
  const csvContent =
    "\uFEFF" +
    [
      headers.map(escapeCSV).join(","),
      ...rows.map((r) => r.map(escapeCSV).join(",")),
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
