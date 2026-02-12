
# 🛡️ Biztonsági Mentések és Visszaállítási Útmutató (Backup Instructions)

Ez a fájl tartalmazza a projekt kritikus mérföldköveit és a visszaállításukhoz szükséges parancsokat. Ha bármi elromlana, innen tudod visszaállítani a stabil állapotokat.

## 📌 Stabil Állapotok (Milestones)

### 1. Renteon Strict Sync (Validált Adatokkal) - 2026.02.12
**Commit Hash:** `89117ab`
**Leírás:**
- Ez az állapot tartalmazza a `strict-sync.ts` scriptet, ami csak a Renteon által validált (árazott) autókat tölti be.
- Az adatbázis tiszta, nincsenek benne "szemét" adatok.
- A Renteon API kapcsolat stabil.
- Tartalmazza az elemző scripteket (`analyze-renteon.ts`, `query-specific-date.ts`, `raw-renteon-dump.ts`).

**Visszaállítási Parancs:**
```bash
git reset --hard 89117ab
```
*Figyelem: Ez a parancs töröl minden módosítást, ami ezen commit óta történt!*

---

## 🛠️ Hogyan használd a visszaállítást?

1.  **Ellenőrizd a jelenlegi állapotot:**
    ```bash
    git status
    ```

2.  **Ha vissza akarsz állni egy korábbi pontra (pl. a fenti stabil állapotra):**
    ```bash
    git reset --hard <COMMIT_HASH>
    # Példa: git reset --hard 89117ab
    ```

3.  **Ha csak meg akarod nézni a korábbi állapotot (de nem akarod törölni a mostanit):**
    ```bash
    git checkout <COMMIT_HASH>
    # Példa: git checkout 89117ab
    ```
    *(Visszatérés a legfrissebb állapothoz: `git checkout main`)*

---

### 2. Live Search Fix (Strict Pricing) - 2026.02.12
**Commit Hash:** `1bfd1f5`
**Leírás:**
- Javítva a Flotta oldali élő keresés árazása: mostantól a Renteon által visszaadott pontos árat mutatja a lista, felülírva a statikus adatbázis árazást.
- A Homepage és Fleet page kereső integrációja ellenőrizve.

**Visszaállítási Parancs:**
```bash
git reset --hard 1bfd1f5
```

## 📝 Következő Mentések Helye
Ide írd majd be az újabb stabil pontokat a fejlesztés során.

*   [Hely a következő mentésnek...]
