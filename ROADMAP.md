# 🚗 JustRent - Projekt Ütemterv (Roadmap)

Ez a dokumentum a **JustRent** autókölcsönző platform fejlesztési ütemtervét, technológiai hátterét és a részletes adminisztrációs terveket tartalmazza.

## 🎯 Projekt Vízió
Egy modern, prémium megjelenésű (Sixt-stílusú), Next.js alapú autókölcsönző rendszer. Fókuszban a gyors foglalás, a vizuális élmény és a rendkívül részletes, mindenre kiterjedő adminisztrációs felület.

## 🛠 Technológiai Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **UI Könyvtár:** Shadcn UI, Lucide Icons, **Custom Calendar & TimePicker**
- **Backend:** Next.js Server Actions
- **Adatbázis:** PostgreSQL (Neon.tech), Prisma ORM
- **Tárhely (Images):** Vercel Blob / Külső URL-ek
- **Hosting:** Vercel

---

## 📅 Fejlesztési Fázisok

### ✅ 1. Fázis: Alapok és UI Keretrendszer (KÉSZ)
A vizuális alapok és a legfontosabb felhasználói felületek elkészültek.
- [x] **Projekt inicializálása:** Next.js, Tailwind, TypeScript.
- [x] **Design Rendszer:** Prémium fekete/fehér/piros színvilág.
- [x] **Landing Page:** Hero szekció (Unsplash képpel), Kereső sáv, About szekció.
- [x] **Booking Engine:**
    - Egyedi, robusztus **Naptár** komponens (Grid alapú, nem esik szét).
    - Prémium **Időválasztó** (TimePicker) görgethető listával.
    - Keresési paraméterek szinkronizálása URL-ben.
- [x] **Fleet Page (Flotta):**
    - Autók listázása kártyákon.
    - Kereső integrálása a flotta oldalra is.
    - Árak dinamikus számítása a kiválasztott időszak alapján.
- [x] **Header & Auth:**
    - Letisztult fejléc (CTA gombok nélkül).
    - **AuthModal:** Bejelentkezés/Regisztráció váltófüllel, prémium popup.
    - Nyelvválasztó (vizuális).

### 🚧 2. Fázis: Adatbázis és Adminisztráció (KÖVETKEZŐ LÉPÉS)
A rendszer "lelke". Az admin felületnek teljes kontrollt kell biztosítania a flotta és az árazás felett.

#### 2.1 Admin Dashboard Tervezése (`/admin`)
- **Dashboard Home:** Gyors áttekintés (Aktív bérlések, Mai átvételek/visszavételek, Bevételek).
- **Védett útvonalak:** Csak admin jogosultsággal elérhető felület.

#### 2.2 Részletes Flotta Kezelés (Car Management)
Minden autóhoz részletes adatlap tartozik, amit az admin szerkeszthet:
- **Alapadatok:** Márka, Modell, Évjárat, Kategória (SUV, Sedan, stb.), Rendszám, Alvázszám (VIN).
- **Specifikációk:** Ülések, Ajtók, Váltó (Man/Auto), Üzemanyag, Motor méret/erő.
- **Média:** Főkép és Galéria feltöltése (Drag & drop).
- **Státusz:** Elérhető, Karbantartás alatt, Szervizben, Kiadva.

#### 2.3 Intelligens Árazási Rendszer (Pricing Engine)
Az admin itt tudja finomhangolni a bevételeket:
- **Alapár (Base Price):** Napi bérleti díj.
- **Időtartam Kedvezmények (Duration Tiers):**
    - 1-3 nap: 100% ár
    - 4-7 nap: -10%
    - 8-30 nap: -20%
    - 30+ nap: Egyedi ár
- **Szezonális Árazás:** Kiemelt időszakok (Karácsony, Nyár) szorzói.
- **Fizetési Mód Árazás:** "Pay at Pickup" felár (pl. +10%) vs. "Prepay" (Online fizetés) kedvezmény.

#### 2.4 Extrák és Opciók Kezelése (Add-ons)
Az admin hozhat létre és árazhat be extrákat:
- **Tételek:** Gyerekülés, GPS, Hólánc, Tetőbox.
- **Szolgáltatások:** Határátlépési engedély, Sofőrszolgálat.
- **Biztosítások:** Alap, Medium, Premium csomagok (önrész csökkentés).
- **Kaució (Deposit):** Kategóriánként vagy autónként állítható összeg.

#### 2.5 Kilométer Limit (Mileage Policy)
- **Csomagok:**
    - Limitált: Napi X km (pl. 200km) benne van az árban.
    - Túlfutás díja: X Ft / km.
    - Korlátlan: Fix felár/nap ellenében.

### � 3. Fázis: Foglalási Folyamat és Checkout
- [ ] **Részletes Autó Oldal:** Dinamikus adatlap a fenti adatok alapján.
- [ ] **Kosár és Checkout:**
    - Extrák kiválasztása.
    - Végösszeg számítása (Napok * Ár + Extrák + ÁFA).
    - Fizetési kapu integráció (Stripe).
- [ ] **Foglalás Kezelés:** Admin jóváhagyás, Visszaigazoló e-mail.

### 🔮 4. Fázis: Kiegészítő Funkciók
- [ ] **Kárbejelentő:** Admin felületen sérülések rögzítése (Kép + Leírás).
- [ ] **Többnyelvűség:** Teljes fordítás (EN, HU, HE) - i18n.
- [ ] **Valutaváltó:** HUF / EUR / USD árak kijelzése.

---

## � Fejlesztői Jegyzetek
- **Naptár:** A saját fejlesztésű `src/components/ui/calendar.tsx` a standard, ezt kell használni mindhol.
- **Képek:** Jelenleg külső URL-eket használunk, de a feltöltés funkcióhoz Vercel Blob vagy AWS S3 integráció szükséges majd.
- **Auth:** A jelenlegi `AuthModal` csak UI, be kell kötni a NextAuth-ot a valódi működéshez.
