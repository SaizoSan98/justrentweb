
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

### 3. Deposit Separation, Calendar UI Fix & Visual Enhancements - 2026.02.12
**Commit Hash:** `3f78149`
**Leírás:**
- **Deposit Leválasztás:** A deposit most már külön, a végösszeg alatt jelenik meg a Fleet kártyákon és a Checkout oldalon is.
- **Naptár UI Javítás:** Egységesített `FleetDatePicker` használata a `BookingEngine`-ben, a design a kért "pipe" elválasztós stílust követi.
- **Footer Info Frissítés:** Telefonszám (+36 20 404 8186), cím (2220 Vecsés, Dózsa György út 86.) és "Created by NixoVisual" link frissítve.
- **Visual Enhancements:** Márka logó overlay a kocsik képe mögött (Homepage & Fleet), Featured Badge (csillagos plecsni) a kiemelt autókon.

**Visszaállítási Parancs:**
```bash
git reset --hard 3f78149
```

*   [Hely a következő mentésnek...]
