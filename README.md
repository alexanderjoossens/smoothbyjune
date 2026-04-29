# Smooth by June — Website

Website voor **Smooth by June**, een professionele laserontharing praktijk in Geel (België), gerund door June Goris — opgeleide verpleegkundige en laserspecialist.

Gebouwd door [AlexWeb](https://alexweb.be) · Alexander Joossens

---

## Tech stack

| Laag | Technologie |
|---|---|
| Frontend | HTML5 · CSS3 · Vanilla JS |
| Backend | Node.js · Express |
| E-mail | Nodemailer (via Cloud86 SMTP) |
| Hosting | Railway |
| Domain | Cloud86 (`smoothbyjune.be`) |
| Versiebeheer | GitHub |

---

## Pagina's

| Pagina | Bestand |
|---|---|
| Homepage | `index.html` |
| Over mij | `over-mij.html` |
| Laserontharing | `laserontharing.html` |
| Behandelingen & Prijzen | `behandelingen-prijzen.html` |
| Voorbereiding & Nazorg | `voorbereiding-nazorg.html` |
| Afspraak maken | `afspraak-maken.html` |
| Contact | `contact.html` |
| Privacybeleid | `privacy.html` |

---

## Lokaal draaien

```bash
# 1. Clone de repo
git clone https://github.com/alexanderjoossens/smoothbyjune.git
cd smoothbyjune

# 2. Installeer dependencies
npm install

# 3. Maak een .env bestand aan (zie .env.example)
cp .env.example .env
# Vul je SMTP-gegevens in (Cloud86)

# 4. Start de server
npm start
# → http://localhost:3000
```

---

## Environment variables

Stel deze in via Railway → Project → Variables:

| Variable | Waarde |
|---|---|
| `SMTP_HOST` | `mail.cloud86.nl` (of je Cloud86 SMTP host) |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `info@smoothbyjune.be` |
| `SMTP_PASS` | *(wachtwoord van het e-mailadres)* |
| `PORT` | *(wordt automatisch ingesteld door Railway)* |

Zie `.env.example` voor een template.

---

## Deployment (Railway)

Railway deployt automatisch bij elke push naar `main`.

```bash
git add .
git commit -m "Beschrijving van de wijziging"
git push origin main
# → Railway deployt automatisch
```

**DNS-setup (Cloud86):**
- `www` → CNAME → `rg6ojttf.up.railway.app` ✅
- `@` → MX + TXT records voor e-mail (niet wijzigen)
- Root-domein redirect (`smoothbyjune.be` → `www.smoothbyjune.be`) wordt afgehandeld door Node.js in `server.js`

---

## Projectstructuur

```
smoothbyjune/
├── server.js                  ← Express server + e-mailroutes + www-redirect
├── package.json
├── .env.example               ← Template voor environment variables
├── .gitignore
├── index.html
├── over-mij.html
├── laserontharing.html
├── behandelingen-prijzen.html
├── voorbereiding-nazorg.html
├── afspraak-maken.html        ← Afspraakformulier (POST /api/booking)
├── contact.html               ← Contactformulier (POST /api/contact)
├── privacy.html
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

## API routes

| Method | Route | Beschrijving |
|---|---|---|
| `POST` | `/api/booking` | Afspraakaanvraag — stuurt e-mail naar June + bevestiging naar klant |
| `POST` | `/api/contact` | Contactbericht — stuurt e-mail naar June + bevestiging naar klant |

---

## Client

**June Goris — Smooth by June**
- Adres: Oosterloseweg 42, 2440 Geel
- E-mail: info@smoothbyjune.be
- WhatsApp: +32 471 60 82 09
- BTW: 0770 767 245

---

*Ontwikkeld door [AlexWeb](https://alexweb.be) — web design voor zelfstandigen en kleine bedrijven in België.*
