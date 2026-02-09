
import fs from "fs"
import path from "path"

// MOCK DATA
const testCases = [
    { make: "Volkswagen", model: "T-Roc", expected: "VW T-ROC.webp" },
    { make: "Volkswagen", model: "T-Cross", expected: "VW T-CROSS.webp" },
    { make: "Volkswagen", model: "Golf", expected: "VW GOLF.webp" },
    { make: "Volkswagen", model: "Passat", expected: "VW PASSAT.webp" },
    { make: "Skoda", model: "Octavia", expected: "SKODA OCTAVIA.png.webp" },
    { make: "Kia", model: "Ceed", expected: "KIA CEED.webp" },
    { make: "Peugeot", model: "208", expected: "peugeot 208.png" },
    { make: "Mercedes", model: "GLB", expected: "glb.png" },
    { make: "Volkswagen", model: "Tiguan", expected: "VW TIGUAN.webp" },
    { make: "Seat", model: "Ateca", expected: "SEAT ATECA.webp" },
    { make: "Hyundai", model: "Tucson", expected: "HYUNDAI TUCSON.webp" },
    { make: "Nissan", model: "Qashqai", expected: "NISSAN QASHQAI.webp" },
    { make: "Mercedes", model: "GLC", expected: "mercedes glc.avif" },
    { make: "BMW", model: "X4", expected: "bmw x4.webp" },
    { make: "Seat", model: "Leon", expected: "SEAT LEON.webp" },
    { make: "Toyota", model: "Proace", expected: "toyota proace.jpg" }, // or TOYOTA PROACE 9sz..webp
    { make: "Ford", model: "Tourneo", expected: "FORD TOURNEO.webp" },
    { make: "Peugeot", model: "308", expected: "peugeot-308-sw-2021-gt-cumulus-grey.png" },
    { make: "Audi", model: "A6", expected: "AUDI A6.webp" }, // or Audi A6.jpg
    { make: "Skoda", model: "Superb", expected: "SKODA SUPERB.webp" },
    { make: "Toyota", model: "Yaris Cross", expected: "TOYOTA YARIS CROSS.webp" }
];

// Copy-paste the logic from actions.ts
function findMatchingImage(make: string, model: string): string | null {
  try {
    const dir = path.join(process.cwd(), 'public', 'carpictures')
    if (!fs.existsSync(dir)) return null
    
    const files = fs.readdirSync(dir)
    
    // Normalize: lowercase, remove accents, handle special chars
    const normalize = (str: string, keepHyphens: boolean = false, isFilename: boolean = false) => {
        let s = str.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\(.*\)/g, '') // Remove (8s) etc
        
        if (isFilename) {
            s = s.replace(/\.[^/.]+$/, "") // Remove extension only if it's a filename
        }

        s = s.trim();

        if (!keepHyphens) {
            s = s.replace(/-/g, ' ').replace(/_/g, ' ');
        }
        return s;
    }

    const normalizedMake = normalize(make);
    const normalizedModel = normalize(model);
    const modelWithHyphens = normalize(model, true);

    // Known Makes to prevent cross-brand matching
    const knownMakes = [
        'audi', 'bmw', 'mercedes', 'benz', 'vw', 'volkswagen', 'skoda', 'seat', 'toyota', 'volvo',
        'ford', 'fiat', 'peugeot', 'citroen', 'renault', 'hyundai', 'kia', 'mazda', 'nissan',
        'opel', 'suzuki', 'tesla', 'honda', 'jeep', 'land rover', 'range rover', 'mini', 'porsche',
        'lexus', 'jaguar', 'alfa romeo', 'dacia', 'chevrolet', 'mitsubishi', 'subaru', 'omoda',
        'cupra', 'smart', 'saab', 'lancia', 'chrysler', 'dodge', 'ram', 'infiniti', 'acura'
    ];

    const makeAliases: Record<string, string[]> = {
        'volkswagen': ['vw'],
        'vw': ['volkswagen'],
        'mercedes benz': ['mercedes', 'merc', 'benz'],
        'mercedes': ['mercedes benz', 'merc', 'benz'],
        'bmw': ['bmw'],
        'toyota': ['toyota'],
        'citroen': ['citroen'],
        'skoda': ['skoda'],
        'land rover': ['range rover'],
        'range rover': ['land rover']
    };

    const technicalWords = [
        '1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0', '2.2', '2.5', '3.0', '4.0', '5.0',
        'tsi', 'tdi', 'dsg', '4motion', '4matic', 'cdi', 'tfsi', 'sb', 'sportback', 
        'hybrid', 'phev', 'mhev', 'auto', 'manual', 'sw', 'class', 'bluehdi', 'crdi',
        'sport', 'awd', '4wd', 'ev', 'electric', 'estate', 'combi', 'avant', 'touring',
        'active', 'style', 'ambition', 'business', 'elegance', 'r-line', 'gt-line', 'amg',
        'hev', 'sd', 'dig-t', 't-gdi', 'dct' // Added based on user examples
    ];

    let cleanModel = normalizedModel;
    
    // Aggressive Make Stripping
    const allMakes = [normalizedMake, ...(makeAliases[normalizedMake] || [])];
    allMakes.sort((a, b) => b.length - a.length);

    for (const m of allMakes) {
        if (cleanModel.startsWith(m)) {
            cleanModel = cleanModel.substring(m.length).trim();
            break; 
        }
    }
    
    const modelTokens = cleanModel.split(' ')
        .map(t => t.trim())
        .filter(t => t.length > 0 && !technicalWords.includes(t));

    const mergedModel = modelTokens.join('');

    // Special Handling for "Class" cars
    let classSearch = "";
    if (normalizedMake.includes("mercedes") || normalizedMake.includes("benz")) {
        const firstToken = modelTokens[0];
        if (firstToken && firstToken.length === 1 && /^[a-z]$/.test(firstToken)) {
            classSearch = `${firstToken} class`;
        }
    }
    
    let seriesSearch = "";
    if (normalizedMake.includes("bmw")) {
        const firstToken = modelTokens[0];
        if (firstToken && /^\d/.test(firstToken)) {
            const series = firstToken[0];
            seriesSearch = `${series} series`;
        }
    }

    // Scoring System
    let bestFile: string | null = null;
    let bestScore = 0;

    for (const file of files) {
        const normalizedFile = normalize(file, false, true);
        const fileWithHyphens = normalize(file, true, true);
        let score = 0;

        // 1. CHECK FOR CONFLICTING MAKE
        const fileHasOtherMake = knownMakes.some(knownMake => {
            if (normalizedFile.includes(knownMake)) {
                if (normalizedMake.includes(knownMake)) return false;
                if ((makeAliases[normalizedMake] || []).some(alias => alias.includes(knownMake) || knownMake.includes(alias))) return false;
                return true; 
            }
            return false;
        });

        if (fileHasOtherMake) continue;

        // 2. CHECK FOR OUR MAKE (Bonus)
        const hasMyMake = normalizedFile.includes(normalizedMake) || (makeAliases[normalizedMake] || []).some(a => normalizedFile.includes(a));
        if (hasMyMake) score += 20;

        // 3. MODEL MATCHING

        const tokenSequence = modelTokens.join(' '); 
        const tokenSequenceNoSpace = modelTokens.join(''); 
        
        if (normalizedFile === cleanModel) score += 100;
        else if (normalizedFile.includes(tokenSequence)) score += 90;
        else if (normalizedFile.includes(tokenSequenceNoSpace)) score += 90;
        else if (fileWithHyphens.includes(modelWithHyphens.replace(normalizedMake, '').trim())) {
             score += 90;
        }
        else if (normalizedFile.includes(cleanModel)) score += 80;
        else if (cleanModel.includes(normalizedFile) && normalizedFile.length > 2) score += 60;
        else {
            let tokenMatches = 0;
            for (const token of modelTokens) {
                if (normalizedFile.includes(token)) {
                    const regex = new RegExp(`\\b${token}\\b`);
                    if (regex.test(normalizedFile)) {
                         tokenMatches += 15;
                    } else {
                         tokenMatches += 10;
                    }
                }
            }
            if (tokenMatches > 0) score += tokenMatches;
        }

        // Bonus for Class/Series match
        if (classSearch && normalizedFile.includes(classSearch)) score += 50;
        if (seriesSearch && normalizedFile.includes(seriesSearch)) score += 50;
        
        // BMW Special
        if (normalizedMake.includes("bmw") && modelTokens[0]?.startsWith("3") && normalizedFile.includes("bmw 3")) score += 50;
        if (normalizedMake.includes("bmw") && modelTokens[0]?.startsWith("5") && normalizedFile.includes("bmw 5")) score += 50;
        if (normalizedMake.includes("bmw") && modelTokens[0]?.startsWith("x") && normalizedFile.includes(`bmw ${modelTokens[0]}`)) score += 50;

        if (score > bestScore) {
            bestScore = score;
            bestFile = file;
        }
    }

    return bestFile ? `/carpictures/${bestFile}` : null;
  } catch (e) {
    console.error("Image matching error:", e)
    return null
  }
}

// RUN TESTS
console.log("Running Tests...");
testCases.forEach(tc => {
    const result = findMatchingImage(tc.make, tc.model);
    const passed = result && result.includes(tc.expected.replace('???', 'XXXX')); // Loose check
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${tc.make} ${tc.model}`);
    console.log(`   Expected: ${tc.expected}`);
    console.log(`   Got:      ${result ? result.split('/').pop() : 'null'}`);
    console.log("------------------------------------------------");
});
