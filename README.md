# Smooth by June — Website

Website voor **Smooth by June**, een professionele laserontharing praktijk in Geel (België), gerund door June Goris — opgeleide verpleegkundige en laserspecialist.

Gebouwd door [AlexWeb](https://alexweb.be) · Alexander Joossens

---

## 🌐 Live URLs

| URL | Status |
|---|---|
| `https://www.smoothbyjune.be` | ✅ Hoofddomein |
| `https://smoothbyjune.be` | ✅ Redirect → www |
| `https://smoothbyjune-production.up.railway.app` | ✅ Railway fallback URL |

---

## 🛠 Tech stack

| Laag | Technologie |
|---|---|
| Frontend | HTML5 · CSS3 · Vanilla JS |
| Backend | Node.js · Express |
| E-mail | Nodemailer (via Cloud86 SMTP) |
| Hosting | Railway |
| Domain & DNS | Cloud86 |
| Versiebeheer | GitHub |

---

## 📁 Projectstructuur

```
smoothbyjune/
├── server.js                  ← Express server + e-mailroutes + www-redirect
├── package.json               ← Dependencies + start script
├── railway.toml               ← Railway deploy configuratie
├── .env.example               ← Template voor environment variables
├── .gitignore
├── README.md
│
├── index.html                 ← Homepage
├── over-mij.html
├── laserontharing.html
├── behandelingen-prijzen.html
├── voorbereiding-nazorg.html
├── afspraak-maken.html        ← Afspraakformulier (POST /api/booking)
├── contact.html               ← Contactformulier (POST /api/contact)
└── privacy.html
│
└── assets/
    ├── css/
    │   ├── global.css         ← Variabelen, reset, typografie, utilities
    │   └── components.css     ← Alle UI-componenten
    ├── js/
    │   └── main.js            ← Nav, scroll-reveal, FAQ-accordion, cookies
    └── img/
        └── logo.svg
```

---

## 🚀 Deployment — hoe het werkt

### Automatische deploy via GitHub → Railway

```
Jij pusht code naar GitHub (main branch)
        ↓
Railway detecteert de push automatisch
        ↓
Railway bouwt de app (Railpack builder, Node.js 18)
        ↓
Railway start de server met: node server.js
        ↓
Site is live
```

**Elke push naar `main` triggert automatisch een nieuwe deploy.**

### Lokaal draaien

```bash
# 1. Clone de repo
git clone https://github.com/alexanderjoossens/smoothbyjune.git
cd smoothbyjune

# 2. Installeer dependencies
npm install

# 3. Maak .env aan
cp .env.example .env
# Vul SMTP_PASS in met het wachtwoord van info@smoothbyjune.be

# 4. Start de server
npm start
# → http://localhost:5050
```

---

## 🔌 Poorten — uitleg

Dit is een veelvoorkomende bron van verwarring. Hier is hoe het precies werkt:

### Lokaal (jouw PC)
```
npm start → server luistert op poort 5050
→ bezoek http://localhost:5050
```

### Op Railway (productie)
```
Railway injecteert automatisch: process.env.PORT = 8080
→ server luistert op poort 8080 (niet 5050)
→ Railway routeert extern verkeer naar die poort
```

### Waarom werkt dit automatisch?

In `server.js` staat:
```js
const PORT = process.env.PORT || 5050;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => { ... });
```

- `process.env.PORT` → Railway vult dit automatisch in (8080)
- `|| 5050` → fallback als je lokaal draait zonder Railway
- `0.0.0.0` → **cruciaal voor Railway**: luistert op alle netwerkinterfaces
  zodat Railway's router van buiten de container kan verbinden.
  Zonder dit (`localhost` of `127.0.0.1`) werkt Railway NIET —
  dan blokkeert de app extern verkeer.

### Poortinstellingen in Railway dashboard

Railway → smoothbyjune → Settings → Networking:
- **Laat het poortveld leeg** → Railway gebruikt automatisch 8080
- Zodra je het leeg maakt, toont Railway automatisch "8080 (node)" → dit is correct

---

## 🌍 DNS-setup — Cloud86

### Overzicht van alle DNS-records

| Type | Naam | Waarde | TTL | Doel |
|---|---|---|---|---|
| `CNAME` | `www` | `qhqzr824.up.railway.app` | 14400 | Website (www) → Railway |
| `A` | `@` | *(Railway IP)* | 14400 | Website (root) → Railway |
| `TXT` | `_railway-verify.www` | `railway-verify=36396056...` | 14400 | Railway domeinverificatie |
| `MX` | `@` | `10 smoothbyjune.be` | 14400 | E-mail ontvangen |
| `TXT` | `@` | `v=spf1 +a +mx +ip4:45.82.188.210 -all` | 14400 | SPF (e-mail spam) |
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine;` | 14400 | DMARC (e-mail beveiliging) |
| `CNAME` | `mail` | `smoothbyjune.be` | 14400 | Mail subdomain |
| `CNAME` | `smtp` | `smoothbyjune.be` | 14400 | SMTP subdomain |
| `CNAME` | `ftp` | `smoothbyjune.be` | 14400 | FTP subdomain |
| `A` | `webmail` | `45.82.188.210` | 14400 | Webmail Cloud86 |

### Waarom CNAME op `www` en A-record op `@`?

**CNAME op `@` (root) is verboden** als er ook MX of TXT records op `@` staan.
DNS-regel: een CNAME mag niet samen bestaan met andere recordtypes op dezelfde naam.

Oplossing:
- `www` → **CNAME** → Railway (werkt omdat `www` geen andere records heeft)
- `@` → **A record** → Railway IP (werkt omdat A + MX + TXT mogen samenstaan)

### Hoe www en root samenwerken

```
Bezoeker typt: smoothbyjune.be
       ↓
DNS: @ A-record → Railway IP
       ↓
Railway ontvangt request
       ↓
Node.js ziet: host = "smoothbyjune.be"
       ↓
server.js redirect: 301 → https://www.smoothbyjune.be
       ↓
Bezoeker belandt op www.smoothbyjune.be ✓
```

```
Bezoeker typt: www.smoothbyjune.be
       ↓
DNS: www CNAME → qhqzr824.up.railway.app
       ↓
Railway ontvangt request
       ↓
Node.js ziet: host = "www.smoothbyjune.be"
       ↓
Geen redirect → site wordt geserveerd ✓
```

### De www-redirect in server.js

```js
app.use((req, res, next) => {
  if (req.headers.host === 'smoothbyjune.be') {
    return res.redirect(301, 'https://www.smoothbyjune.be' + req.url);
  }
  next();
});
```

Deze middleware staat **als eerste** in de code — vóór alles — zodat elke
request erdoor gaat, ook requests voor statische bestanden.

---

## ⚙️ Railway configuratie

### railway.toml

```toml
[deploy]
startCommand = "node server.js"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 5
```

### Environment variables (Railway → Variables tab)

| Variable | Waarde | Verplicht |
|---|---|---|
| `SMTP_HOST` | `mail.cloud86.nl` | ✅ |
| `SMTP_PORT` | `587` | ✅ |
| `SMTP_SECURE` | `false` | ✅ |
| `SMTP_USER` | `info@smoothbyjune.be` | ✅ |
| `SMTP_PASS` | *(wachtwoord emailadres)* | ✅ |
| `PORT` | *(niet invullen — Railway zet dit automatisch)* | ❌ |

SMTP-gegevens vind je in **Cloud86 → Hosting → E-mail → SMTP instellingen**.

### Custom domains in Railway

Railway → smoothbyjune → Settings → Networking → Public Networking:

| Domein | Poort | Status |
|---|---|---|
| `smoothbyjune-production.up.railway.app` | 8080 (auto) | Railway fallback URL |
| `www.smoothbyjune.be` | 8080 (auto) | Hoofddomein |
| `smoothbyjune.be` | 8080 (auto) | Root → redirect naar www |

---

## 📧 E-mail API routes

| Method | Route | Wat het doet |
|---|---|---|
| `POST` | `/api/booking` | Afspraakaanvraag → e-mail naar June + bevestiging naar klant |
| `POST` | `/api/contact` | Contactbericht → e-mail naar June + bevestiging naar klant |

Beide routes sturen automatisch:
1. Een opgemaakte notificatie naar `info@smoothbyjune.be`
2. Een branded bevestigingsmail naar de klant

---

## 🔄 Nieuwe wijziging deployen

```bash
# Bestanden aanpassen, dan:
git add .
git commit -m "Beschrijving van de wijziging"
git push origin main
# → Railway deployt automatisch (~1-2 min)
```

---

## 🐛 Veelvoorkomende problemen

### "Application failed to respond"
**Oorzaak:** Server luistert op `localhost` i.p.v. `0.0.0.0`
**Oplossing:** `app.listen(PORT, '0.0.0.0', ...)` in server.js

### Site werkt niet na DNS-wijziging
**Oorzaak:** DNS propagatie kan 15 min tot 48u duren
**Check:** `https://dnschecker.org/#CNAME/www.smoothbyjune.be`

### E-mails komen niet aan
**Oorzaak 1:** SMTP_PASS environment variable niet ingesteld op Railway
**Oorzaak 2:** Verkeerde SMTP_HOST (check Cloud86 instellingen)
**Test:** Stuur een testformulier in en check Railway logs

### Railway toont "Waiting for DNS update"
**Oorzaak:** DNS-records nog niet gepropageerd of `_railway-verify` TXT ontbreekt
**Oplossing:** Voeg `_railway-verify.www` TXT record toe in Cloud86

### Port conflict lokaal
```bash
kill $(lsof -ti:5050)
npm start
```

---

## 👤 Client

**June Goris — Smooth by June**
- Adres: Oosterloseweg 42, 2440 Geel
- E-mail: info@smoothbyjune.be
- WhatsApp: +32 471 60 82 09
- BTW: 0770 767 245

---

*Ontwikkeld door [AlexWeb](https://alexweb.be) — web design voor zelfstandigen en kleine bedrijven in België.*
