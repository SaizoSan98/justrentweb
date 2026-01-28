# JustRent - Tesztelési Jegyzőkönyv

Ez a dokumentum részletesen leírja, hogyan ellenőrizzük a rendszer egyes funkcióit a hibátlan működés biztosítása érdekében.

## 1. Kezdőlap (Landing Page)
- [ ] **Hero Szekció:** A főcím ("JUST RENT") és a háttérkép helyesen jelenik meg.
- [ ] **Kereső (Booking Engine):**
  - [ ] Alapértelmezett dátumok (ma + 1 nap) helyesek.
  - [ ] Múltbeli dátum nem választható.
  - [ ] "Show Cars" gomb átirányít a `/fleet` oldalra a megfelelő paraméterekkel.
- [ ] **Kiemelt Autók (Featured Vehicles):**
  - [ ] Csak az adminban "Featured"-nek jelölt autók jelennek meg (max 6 db).
  - [ ] Az autók adatai (név, ár, kategória) helyesek.
  - [ ] A "Details" gomb megnyitja a részletes nézetet.

## 2. Autópark (Fleet Page)
- [ ] **Lista betöltése:** Az összes "AVAILABLE" státuszú autó megjelenik.
- [ ] **Szűrők Működése:**
  - [ ] "Filters" gomb megnyitja a panelt.
  - [ ] Kategória szűrés (pl. SUV, Sedan) működik.
  - [ ] Váltó típus (Automatic/Manual) szűrés működik.
  - [ ] Ülések száma szűrés működik.
  - [ ] "Show X offers" gomb frissíti a listát.
  - [ ] "Clear all" gomb törli a szűrőket.
- [ ] **Kereső Sáv:** A dátumok módosítása frissíti az elérhetőséget és az árakat.

## 3. Részletes Nézet és Foglalás (Booking Flow)
- [ ] **Autó Részletek:**
  - [ ] Helyes képek, leírás és specifikációk (ülések, váltó, stb.).
  - [ ] "Or Similar" címke megjelenik, ha be van állítva.
- [ ] **Árkalkuláció:**
  - [ ] Napi ár x Napok száma helyes.
  - [ ] Sávos árazás (Pricing Tier) működik (hosszabb bérlés = alacsonyabb napi ár).
  - [ ] Extrák hozzáadása növeli az árat.
  - [ ] "Full Insurance" hozzáadása növeli az árat.
- [ ] **Checkout Oldal:**
  - [ ] Űrlap kitöltése (Név, Email, Telefon).
  - [ ] Céges számla esetén adószám mező kötelező.
  - [ ] Általános Szerződési Feltételek elfogadása kötelező.
  - [ ] "Confirm Booking" gomb létrehozza a foglalást.

## 4. Admin Felület (Háttérrendszer)
- [ ] **Bejelentkezés:** `admin@justrent.com` / `admin` adatokkal sikeres.
- [ ] **Dashboard:** Áttekintő adatok megjelennek.
- [ ] **Autók Kezelése (Fleet):**
  - [ ] Új autó hozzáadása működik (minden mező, képfeltöltés).
  - [ ] Autó szerkesztése működik.
  - [ ] "Is Featured" kapcsoló működik.
  - [ ] Árak és díjak (pl. Extra km ár) mentésre kerülnek.
- [ ] **Extrák Kezelése:**
  - [ ] Új extra létrehozása (Név, Ár, Ikon).
  - [ ] Meglévő extra szerkesztése és törlése.
- [ ] **Foglalások (Bookings):**
  - [ ] Lista megjelenik, szűrhető (Név, Dátum, Státusz).
  - [ ] Foglalás részletei megtekinthetők.
- [ ] **Felhasználók (Users):**
  - [ ] Lista megjelenik.
  - [ ] Jogosultság módosítása (Make Admin / Revoke Admin) működik.
  - [ ] Saját profil (Név, Email, Jelszó) szerkesztése működik.
- [ ] **Beállítások (Settings):**
  - [ ] Nyitvatartási idő beállítása mentésre kerül.

## 5. Rendszer Logika és Díjak
- [ ] **Munkaidőn túli díjak:**
  - [ ] Ha a felvétel/leadás a beállított nyitvatartáson kívül esik, a rendszer automatikusan felszámolja a díjat.
- [ ] **Pénznem és Nyelv:**
  - [ ] Minden ár EUR-ban (€) jelenik meg.
  - [ ] A felület nyelve angol.

## 6. Mobil Nézet (Responsiveness)
- [ ] **Mobil Menü:** A hamburger menü megnyílik és működik.
- [ ] **Kártyák:** Az autók kártyái helyesen tördelődnek mobilon.
- [ ] **Szűrő:** A szűrő panel mobilon is használható (teljes képernyős sheet).
