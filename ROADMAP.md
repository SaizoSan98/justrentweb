# 🚗 JustRent - Projekt Ütemterv (Roadmap)

Ez a dokumentum a **JustRent** autókölcsönző platform fejlesztési ütemtervét, technológiai hátterét és a következő lépéseket tartalmazza.

## 🎯 Projekt Vízió
Egy modern, prémium megjelenésű, Next.js alapú autókölcsönző rendszer létrehozása, amely gyors foglalást, átlátható adminisztrációt és megbízható működést kínál. A design a "sixt.hu" prémium stílusát követi.

## 🛠 Technológiai Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **UI Könyvtár:** Shadcn UI, Lucide Icons
- **Backend:** Next.js Server Actions
- **Adatbázis:** PostgreSQL (Neon.tech), Prisma ORM
- **Tárhely (Images):** Vercel Blob
- **Hosting:** Vercel

---

## 📅 Fejlesztési Fázisok

### ✅ 1. Fázis: Alapok és Prototípus (KÉSZ)
A projekt technikai alapjainak lerakása és a vizuális keretrendszer kialakítása.
- [x] **Projekt inicializálása:** Next.js, Tailwind, TypeScript beállítása.
- [x] **Design Rendszer:** Színek (Zinc/Orange), betűtípusok, Shadcn UI komponensek (Button, Card, Input).
- [x] **Adatbázis Tervezés:** Prisma séma elkészítése (`User`, `Car`, `Booking`, `DamageReport`).
- [x] **Landing Page:** Hero szekció, "About", "Fleet" teaser, Footer.
- [x] **UI Komponensek:** Booking Engine (Kereső) és Admin Calendar (Naptár) vizuális vázlata.

### 🚧 2. Fázis: Adatbázis és Adminisztráció (KÖVETKEZŐ LÉPÉS)
Az alkalmazás "agyának" beüzemelése. Valós adatok kezelése a statikus mockupok helyett.
- [ ] **Adatbázis Kapcsolat:** Neon.tech PostgreSQL összekötése, Prisma migrációk lefuttatása.
- [ ] **Seed Adatok:** Kezdeti autók és teszt felhasználók feltöltése az adatbázisba.
- [ ] **Admin Dashboard Layout:** Védett útvonalak (`/admin`) kialakítása.
- [ ] **Flotta Kezelés (CRUD):**
    - Autók listázása táblázatban.
    - Új autó felvétele űrlap (Képfeltöltés Vercel Blob-ba).
    - Autó szerkesztése és törlése.
- [ ] **Interaktív Naptár:** A `AdminCalendar` komponens bekötése a valós foglalási adatokhoz.

### 🔜 3. Fázis: Foglalási Folyamat (User Flow)
A látogatók számára elérhető funkciók implementálása.
- [ ] **Kereső Logika:** A főoldali kereső összekötése az adatbázissal (szűrés dátum és helyszín szerint).
- [ ] **Autó Részletező Oldal:** Egyedi oldal minden autónak (`/cars/[id]`), specifikációkkal és galériával.
- [ ] **Checkout Folyamat:**
    - Foglalási összesítő.
    - Felhasználói adatok bekérése.
    - Stripe fizetési integráció (először Test módban).
- [ ] **Visszaigazolás:** Sikeres foglalás oldal és e-mail értesítés (opcionális: Resend).

### 🔮 4. Fázis: Haladó Funkciók és Finomhangolás
A rendszer üzleti értékének növelése extra funkciókkal.
- [ ] **Autentikáció:** NextAuth.js (v5) bevezetése (Google login + Email/Jelszó).
- [ ] **Jogosultságkezelés:** Admin vs. User szerepkörök érvényesítése (Middleware védelem).
- [ ] **Kárbejelentő Modul:** Admin felületen sérülések rögzítése fotókkal (Vercel Blob).
- [ ] **Mobil Optimalizálás:** Teljes körű reszponzivitás ellenőrzése.
- [ ] **SEO és Performance:** Meta tag-ek beállítása, képek optimalizálása (`next/image`).

---

## 🚀 Telepítési Útmutató (Deployment)

1. **Adatbázis:** Neon.tech projekt létrehozása -> Connection string másolása `.env`-be.
2. **Migráció:** `npx prisma migrate dev --name init`
3. **GitHub:** Kód feltöltése a tárolóba.
4. **Vercel:** Projekt importálása, környezeti változók beállítása (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`).

## 📝 Megjegyzések
- A designnál a "Dark Mode" az alapértelmezett a prémium érzet miatt.
- A képek tárolása kritikus pont, a Vercel Blob a leggyorsabb megoldás Next.js-hez.
