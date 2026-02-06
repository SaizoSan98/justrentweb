
export const BRAND_LOGOS: Record<string, string> = {
  // Simple Icons slugs (default behavior in BrandStrip)
  "audi": "audi",
  "bmw": "bmw",
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
  "jaguar": "jaguar",
  "lexus": "lexus",
  "mini": "mini",
  "jeep": "jeep",
  "dacia": "dacia",
  "chevrolet": "chevrolet",
  "subaru": "subaru",
  "mitsubishi": "mitsubishi",
  "infiniti": "infiniti",
  "acura": "acura",
  "alfa romeo": "alfaromeo",
  "ferrari": "ferrari",
  "lamborghini": "lamborghini",
  "maserati": "maserati",
  "bentley": "bentley",
  "rolls-royce": "rollsroyce",
  "aston martin": "astonmartin",
  "mclaren": "mclaren",
  "bugatti": "bugatti",
  "lotus": "lotus",
  "saab": "saab",
  "smart": "smart",
  "lancia": "lancia",
  "chrysler": "chrysler",
  "dodge": "dodge",
  "ram": "ram",
  "cadillac": "cadillac",
  "buick": "buick",
  "gmc": "gmc",
  "lincoln": "lincoln",
  "polestar": "polestar",
  "byd": "byd",
  "mg": "mg",
  "geely": "geely",
  "nio": "nio",
  "xpeng": "xpeng",
  "lucid": "lucid",
  "rivian": "rivian",
  "iveco": "iveco",
  "man": "man",
  "scania": "scania",
  "daf": "daf",
  
  // Custom URLs for brands not in Simple Icons or where specific version is preferred
  "omoda": "/omoda.png",
  "mercedes": "/mercedes.png",
  "mercedes-benz": "/mercedes.png",
  "land rover": "/rangerover.png",
  "range rover": "/rangerover.png",
}

export function getBrandLogo(make: string): string {
  const normalizedMake = make.toLowerCase().trim()
  
  // Check direct match
  if (BRAND_LOGOS[normalizedMake]) {
    const logo = BRAND_LOGOS[normalizedMake]
    if (logo.startsWith("http") || logo.startsWith("/")) return logo
    return `https://cdn.simpleicons.org/${logo}/000000`
  }

  // Check for partial matches or specific overrides
  if (normalizedMake.includes("mercedes")) return "/mercedes.png"
  if (normalizedMake.includes("land rover") || normalizedMake.includes("range rover")) return "/rangerover.png"
  if (normalizedMake.includes("omoda")) return "/omoda.png"
  if (normalizedMake.includes("vw") || normalizedMake.includes("volkswagen")) return `https://cdn.simpleicons.org/volkswagen/000000`
  
  // Default fallback (maybe a generic car icon or empty)
  return ""
}
