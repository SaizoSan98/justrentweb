# Vercel Környezeti Változók (Environment Variables)

A projekted helyes működéséhez a Vercel felületén (Settings -> Environment Variables) az alábbi kulcs-érték párokat kell beállítanod.

## 1. Adatbázis (Neon.tech)
Ezt a **Neon.tech** konzoljáról kapod meg, amikor létrehozol egy új projektet.
*   **Kulcs:** `DATABASE_URL`
*   **Érték:** `postgresql://neondb_owner:...........@ep-cool-....neon.tech/neondb?sslmode=require`
    *   *Hol találod:* Neon Dashboard -> "Connection Details" doboz. Válaszd a "Prisma" tabot, ha van, de a sima Postgres URL is jó.

## 2. Képtárolás (Vercel Blob)
Ezt a **Vercel** "Storage" fülén kapod meg, ha hozzáadsz egy új Blob tárolót a projekthez.
*   **Kulcs:** `BLOB_READ_WRITE_TOKEN`
*   **Érték:** `vercel_blob_rw_................`
    *   *Hol találod:* Vercel Projekt -> Storage -> Create Database -> Vercel Blob -> "Connect" gomb után megjelenik a token.

## 3. (Opcionális/Később) Autentikáció (NextAuth)
Ha majd bekapcsoljuk a bejelentkezést, ezek kellenek majd:
*   `AUTH_SECRET`: Egy hosszú véletlenszerű string (generálható terminálban: `openssl rand -base64 32`).
*   `AUTH_URL`: A domained címe (pl. `https://justrentweb.vercel.app` vagy lokálisan `http://localhost:3000`).

---

### ⚠️ Fontos lépések most:
1.  Menj a **Neon.tech**-re, regisztrálj/lépj be.
2.  Hozz létre egy új projektet (pl. "justrent-db").
3.  Másold ki a `Connection String`-et.
4.  Menj a **Vercel** projektedhez -> Settings -> Environment Variables.
5.  Add hozzá: `DATABASE_URL` = (a kód, amit másoltál).
6.  Menj a Vercel "Storage" fülre, hozz létre egy Blob-ot, és a kapott tokent is add hozzá env varként.
