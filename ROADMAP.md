# 🚗 JustRent - Projekt Ütemterv (Roadmap)

Ez a dokumentum a **JustRent** autókölcsönző platform fejlesztési ütemtervét, technológiai hátterét és a részletes adminisztrációs terveket tartalmazza.

## 🎯 Projekt Vízió
Egy modern, prémium megjelenésű (Sixt-stílusú), Next.js alapú autókölcsönző rendszer. Fókuszban a gyors foglalás, a vizuális élmény és a rendkívül részletes, mindenre kiterjedő adminisztrációs felület.

## 🛠 Technológiai Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **UI Könyvtár:** Shadcn UI, Lucide Icons, **Custom Calendar & TimePicker**
- **Backend:** Next.js Server Actions
- **Adatbázis:** PostgreSQL (Neon.tech), Prisma ORM
- **Tárhely (Images):** Vercel Blob
- **Hosting:** Vercel

---

## 📅 Fejlesztési Fázisok

### ✅ 1. Fázis: Alapok és UI Keretrendszer (KÉSZ)
A vizuális alapok és a legfontosabb felhasználói felületek elkészültek.
- [x] **Projekt inicializálása:** Next.js, Tailwind, TypeScript.
- [x] **Design Rendszer:** Prémium fekete/fehér/piros színvilág.
- [x] **Landing Page:** Hero szekció (Unsplash képpel), Kereső sáv, About szekció.
- [x] **Booking Engine:**
    - Egyedi, robusztus **Naptár** komponens.
    - Prémium **Időválasztó** (TimePicker).
    - Keresési paraméterek szinkronizálása URL-ben.
- [x] **Fleet Page (Flotta):**
    - Autók listázása kártyákon.
    - Kereső integrálása.
    - Árak dinamikus számítása.
- [x] **Header & Auth UI:**
    - Letisztult fejléc.
    - AuthModal (Login/Register UI).
    - Header Login gomb (Valódi bejelentkezéssel).

### ✅ 2. Fázis: Adatbázis és Adminisztráció Alapok (KÉSZ)
- [x] **Admin Auth:** Biztonságos JWT alapú bejelentkezés, Middleware védelem.
- [x] **Admin Dashboard:** Vázszerkezet.
- [x] **Flotta Kezelés (CRUD):**
    - Autók listázása, létrehozása, szerkesztése, törlése.
    - **Képfeltöltés (Vercel Blob).**
    - **Dinamikus Árazás (Pricing Tiers):** Sávos árazás (1-7 nap, 8-14 nap, stb.) és Kaució kezelés.
- [x] **Felhasználó Kezelés:** Role alapú jogosultságkezelés (Admin/User).
- [x] **Demo Adatok Tisztítása:** Adatbázis előkészítése éles működésre.

### 🚧 3. Fázis: Részletes Autókezelés és Foglalási Rendszer (FOLYAMATBAN)

#### 3.1 Részletes Autó Adatlap (Admin)
Az autókhoz kapcsolódó minden adat részletes kezelése.

**1. Általános Adatok (General Tab):**
- **Category:** Kategória választása (pl. SUV, Sedan) - Admin által bővíthető lista.
- **Make & Model:** Márka és Modell választása listából (Minden ismert márka).
- **Technikai Adatok:**
  - Ülések száma (Select: 2, 4, 5, 7, 9)
  - Ajtók száma (Select: 2, 3, 4, 5)
  - Bőröndök száma (Number)
  - Váltó (Gearbox): Manual / Automatic (Keresőben is szűrhető!).
  - Üzemanyag típus (Fuel Type): Petrol, Diesel, Electric, Hybrid.
  - "Or similar" címke kapcsoló (Enable/Disable).

**2. Árak és Szabályok (Prices Tab):**
- **Rental / Day:** Alap napi bérleti díj.
- **Security Deposit:** Kaució összege.
- **Full Insurance:** Teljes biztosítás napi díja.
- **Nyitvatartáson kívüli díjak:**
  - Pickup After Business Hours Price.
  - Return After Business Hours Price.
  - (Ehhez szükséges egy globális "Opening Hours" beállítás az Admin Settings-ben).

**3. Attribútumok és Extrák (Attributes Tab):**
- **Attributes (Címkék):**
  - Daily Mileage (Napi km limit megjelenítése).
  - Air Conditioning (Yes/No).
  - Fuel Policy (pl. Full to Full).
- **Feature Lista:** Checkbox lista az autó felszereltségéről (Alloy Wheels, Bluetooth, CarPlay, Android Auto, Sunroof, stb.).

**4. Képek (Images Tab):**
- Több kép feltöltése (max 3-4 db), galéria nézet.

#### 3.2 Rendszer Beállítások (Settings)
- **Opening Hours:** Nyitvatartási idő beállítása (Kereső és árképzés miatt).
- **Categories:** Autó kategóriák kezelése.

#### 3.3 Checkout Oldal (Booking Page) (KÉSZ ✅)
A foglalás véglegesítése (`/checkout`).
- [x] **Booking Details Box (Sticky):** Szerkeszthető dátumok/helyszínek, automatikus újrakalkuláció.
- [x] **Extra Választó:** Admin által kezelt extrák (Napi/Alkalmi díj).
- [x] **Biztosítás:** Full Insurance választó.
- [x] **Fizetési Módok:** KP, Kártya, Prepayment (Coming Soon).
- [x] **Bérlő Adatai:** Személyes és Céges adatok (Számlázás).
- [x] **Jogi Nyilatkozatok:** Kötelező ÁSZF elfogadás.
- [x] **Foglalás Beküldés:** Adatbázisba mentés, Success oldal.

### 4. Fázis: Felhasználói Dashboard
- [ ] **Saját Foglalások:** Bejelentkezett felhasználó lássa a korábbi és aktív bérléseit.

### 5. Fázis: Kiegészítő Funkciók
- [ ] **Kárbejelentő:** Admin felületen sérülések rögzítése.
- [ ] **Többnyelvűség:** Teljes fordítás (EN, HU).
- [ ] **Valutaváltó:** HUF / EUR.
