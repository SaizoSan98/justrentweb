
export const BRAND_LOGOS: Record<string, string> = {
  // Simple Icons slugs (default behavior in BrandStrip)
  "audi": "audi",
  "bmw": "bmw",
  "mercedes-benz": "mercedes",
  "mercedes": "mercedes",
  "volkswagen": "volkswagen",
  "vw": "volkswagen",
  "toyota": "toyota",
  "ford": "ford",
  "honda": "honda",
  "hyundai": "hyundai",
  "kia": "kia",
  "volvo": "volvo",
  "skoda": "skoda",
  "seat": "seat",
  "cupra": "cupra", // specific URL might be better if simpleicons doesn't have it, but it likely does or we use fallback
  "opel": "opel",
  "fiat": "fiat",
  "renault": "renault",
  "peugeot": "peugeot",
  "citroen": "citroen",
  "citroën": "citroen",
  "nissan": "nissan",
  "mazda": "mazda",
  "suzuki": "suzuki",
  "tesla": "tesla",
  "porsche": "porsche",
  "land rover": "landrover",
  "range rover": "landrover", // Fallback to Land Rover as they are the same company/brand family
  "jaguar": "jaguar",
  "lexus": "lexus",
  "mini": "mini",
  "jeep": "jeep",
  "dacia": "dacia",
  
  // Custom URLs for brands not in Simple Icons or where specific version is preferred
  "omoda": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Omoda_wordmark.svg",
}

export function getBrandLogo(make: string): string {
  const normalizedMake = make.toLowerCase().trim()
  
  // Check direct match
  if (BRAND_LOGOS[normalizedMake]) {
    const logo = BRAND_LOGOS[normalizedMake]
    if (logo.startsWith("http")) return logo
    return `https://cdn.simpleicons.org/${logo}/000000`
  }

  // Check for partial matches or specific overrides
  if (normalizedMake.includes("mercedes")) return `https://cdn.simpleicons.org/mercedes/000000`
  if (normalizedMake.includes("land rover") || normalizedMake.includes("range rover")) return `https://cdn.simpleicons.org/landrover/000000`
  if (normalizedMake.includes("vw") || normalizedMake.includes("volkswagen")) return `https://cdn.simpleicons.org/volkswagen/000000`
  
  // Default fallback (maybe a generic car icon or empty)
  return ""
}
