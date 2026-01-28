export const CAR_MAKES = [
  "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Toyota", "Ford", "Honda", "Hyundai", "Kia", "Volvo", 
  "Skoda", "Seat", "Opel", "Fiat", "Renault", "Peugeot", "Citroen", "Nissan", "Mazda", "Suzuki", 
  "Tesla", "Porsche", "Land Rover", "Jaguar", "Lexus", "Mini", "Jeep", "Dacia"
]

// Mapping common models to makes for better UX
export const CAR_MODELS: Record<string, string[]> = {
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "e-tron"],
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "iX", "i4"],
  "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "EQA", "EQC", "EQE", "EQS"],
  "Volkswagen": ["Polo", "Golf", "Passat", "Arteon", "T-Roc", "Tiguan", "Touareg", "ID.3", "ID.4", "ID.5", "Caddy", "Multivan"],
  "Toyota": ["Yaris", "Corolla", "Camry", "C-HR", "RAV4", "Highlander", "Land Cruiser", "Hilux", "Prius"],
  "Ford": ["Fiesta", "Focus", "Mondeo", "Puma", "Kuga", "Explorer", "Mustang", "Transit", "Ranger"],
  "Skoda": ["Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq"],
  "Opel": ["Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Zafira"],
  "Kia": ["Picanto", "Rio", "Ceed", "Xceed", "Sportage", "Sorento", "Niro", "EV6"],
  "Hyundai": ["i10", "i20", "i30", "Kona", "Tucson", "Santa Fe", "Ioniq 5"],
  "Volvo": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
  "Suzuki": ["Swift", "Vitara", "S-Cross", "Jimny"],
  "Dacia": ["Sandero", "Logan", "Duster", "Jogger"],
  // Default fallback for others
  "Other": []
}

export const CAR_FEATURES = [
  "Air Conditioning",
  "Navigation System",
  "Bluetooth",
  "Apple CarPlay",
  "Android Auto",
  "Cruise Control",
  "Parking Sensors",
  "Reverse Camera",
  "Heated Seats",
  "Leather Seats",
  "Sunroof",
  "Alloy Wheels",
  "USB Port",
  "Isofix",
  "Keyless Entry",
  "Start-Stop System",
  "4x4 / AWD",
  "Tow Bar",
  "Roof Rack"
]

export const FUEL_POLICIES = [
  { value: "FULL_TO_FULL", label: "Full to Full" },
  { value: "SAME_TO_SAME", label: "Same to Same" },
  { value: "FULL_TO_EMPTY", label: "Full to Empty" }
]
