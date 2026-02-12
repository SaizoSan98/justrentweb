
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

### 4. FINAL - Mobile Fixes & Deposit Alignment - 2026.02.12
**Commit Hash:** `189a4de`
**Leírás:**
- **Mobile UI Fixes:**
  - `BookingEngine`: "Budapest Airport" felirat középre igazítva mobilon.
  - `FleetDatePicker`: Mobil nézetben 1 hónap látható, lapozó gombokkal, dupla "X" eltávolítva.
  - `FleetCard`: A "Security Deposit" szöveg nem csúszik össze a "Book Now" gombbal (flex layout javítás).
- **Funkcionális Javítás:** Dátumváltáskor az időpont nem ugrik vissza 00:00-ra, hanem megmarad.
- **Állapot:** Ez a végleges, átadásra kész verzió (FINAL).

**Visszaállítási Parancs:**
```bash
git reset --hard 189a4de
```

### 5. ULTRA STRICT SYNC & Featured Fix - 2026.02.12
**Commit Hash:** `5e4e6fd`
**Leírás:**
- **Adatbázis Tisztítás:** Törölve minden fallback/dummy generálási logika. A rendszer CSAK a Renteon API-ból származó, validált (árazott, biztosított, SIPP-kódolt) autókat engedi be.
- **Eredmény:** Pontosan 22 valid autó az adatbázisban.
- **Featured Limit:** A főoldali kiemelt autók száma 4-ről 6-ra növelve.
- **Biztonság:** A `prisma/seed.ts` megtisztítva a demo autóktól.

**Visszaállítási Parancs:**
```bash
git reset --hard 5e4e6fd
```

*   [Hely a következő mentésnek...]
