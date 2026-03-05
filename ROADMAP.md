# JustRent Development Roadmap

## 1. Phase: Alapok és UI (Kész) ✅
- [x] Projekt inicializálása (Next.js 15, Tailwind, Shadcn UI)
- [x] Landing Page (Hero, About, Footer)
- [x] Fleet Page alapstruktúra
- [x] Autó kártyák és részletes nézet (Dialog)
- [x] Foglalási motor (BookingEngine) komponens

## 2. Phase: Adatbázis és Admin Alapok (Kész) ✅
- [x] Prisma séma tervezés (User, Car, Booking, stb.)
- [x] Neon.tech PostgreSQL integráció
- [x] Admin felület váz (Layout, Sidebar)
- [x] Autók kezelése (CRUD)
- [x] Képfeltöltés (Vercel Blob)
- [x] Extrák kezelése (CRUD + Ikonok)

## 3. Phase: Üzleti Logika és Keresés (Kész) ✅
- [x] Dinamikus árazás (Pricing Tiers)
- [x] Sávos árak implementálása
- [x] Kereső és Szűrők (FleetFilters)
- [x] Nyitvatartási idő és After Hours díjak
- [x] Featured Vehicles (Kiemelt autók) funkció

## 4. Phase: Foglalás és Felhasználók (Kész) ✅
- [x] Checkout folyamat (Űrlap, Összegzés)
- [x] Foglalás mentése adatbázisba
- [x] Admin Foglalások lista (Szűrés, Keresés)
- [x] Admin Felhasználók kezelése (Role management)
- [x] Admin Profil szerkesztése

## 5. Phase: Finomhangolás és Tesztelés (Folyamatban) 🔄
- [x] Pénznem átállítása EUR-ra
- [x] UI csiszolás (Login gomb, Admin üdvözlés)
- [x] Demo adatok törlése, tiszta adatbázis
- [x] Admin UI egységesítés (Header integráció)
- [x] Fleet szűrő UI modernizálása (Sticky bar, Quick toggles)
- [x] Jármű létrehozás (CarForm) javítása (State-alapú adatkezelés, Validáció, Visszajelzések)
- [x] Képfeltöltés stabilizálása (Vercel Blob + Helyi Fallback)
- [x] Tesztelési jegyzőkönyv (TESTING_GUIDE.md)
- [x] Email értesítések (Resend/SendGrid)
- [x] Többnyelvűség (i18n) teljes implementációja (fordítások folyamatban)
- [x] Globális lebegő WhatsApp gomb (szöveges címke, pulse animáció)
- [x] Honeypot spam védelem a kapcsolatfelvételi űrlapokhoz
- [x] Héber fordítás (home/fleet komponensek)
- [x] Auth hibakezelés javítása (AuthModal crash fix)
- [ ] Végső tesztelés és hibajavítás
- [ ] Élesítés (Deployment)

## 6. Phase: Landing Page & Branding (Folyamatban) 🔄
- [x] Partners Strip – prémium logó sáv hozzáadása a Hero alá
- [x] Partner logók frissítése (DiscoverCars, CarFlexi, Localrent, EconomyBookings)
- [x] Hero–PartnersStrip vizuális átmenet javítása (seamless fehér háttér)
- [ ] Landing page további vizuális finomhangolás
- [ ] SEO meta tagek és Open Graph adatok

## Következő Lépések (Future)
- [ ] Online fizetés (Stripe) integráció

