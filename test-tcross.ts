
import fs from "fs"
import path from "path"

// MOCK DATA
const make = "Volkswagen";
const model = "T-Cross";
const expectedFile = "VW T-CROSS.webp";

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

    console.log("--- DEBUG INFO ---");
    console.log(`Make: ${make} -> ${normalizedMake}`);
    console.log(`Model: ${model} -> ${normalizedModel} (Hyphens: ${modelWithHyphens})`);

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
        'cross', 'sport', 'awd', '4wd', 'ev', 'electric', 'estate', 'combi', 'avant', 'touring',
        'active', 'style', 'ambition', 'business', 'elegance', 'r-line', 'gt-line', 'amg'
    ];

    let cleanModel = normalizedModel;
    
    // Aggressive Make Stripping
    const allMakes = [normalizedMake, ...(makeAliases[normalizedMake] || [])];
    allMakes.sort((a, b) => b.length - a.length);

    console.log(`Stripping makes: ${allMakes.join(', ')}`);

    for (const m of allMakes) {
        if (cleanModel.startsWith(m)) {
            cleanModel = cleanModel.substring(m.length).trim();
            break; 
        }
    }
    
    console.log(`Clean Model: ${cleanModel}`);

    const modelTokens = cleanModel.split(' ')
        .map(t => t.trim())
        .filter(t => t.length > 0 && !technicalWords.includes(t));

    console.log(`Tokens: ${modelTokens.join(', ')}`);

    const mergedModel = modelTokens.join('');

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

        if (fileHasOtherMake) {
             if (file === expectedFile) console.log(`[WARNING] Expected file ${file} rejected due to conflicting make!`);
             continue;
        }

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
             if (file === expectedFile) console.log(`Matched via Hyphen Check!`);
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

        if (file === expectedFile || file === "VW PASSAT.webp") {
            console.log(`File: ${file} | Score: ${score}`);
        }

        if (score > bestScore) {
            bestScore = score;
            bestFile = file;
        }
    }

    console.log(`Best Match: ${bestFile} (Score: ${bestScore})`);
    return bestFile ? `/carpictures/${bestFile}` : null;
  } catch (e) {
    console.error("Image matching error:", e)
    return null
  }
}

findMatchingImage(make, model);
