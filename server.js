'use strict';

const express    = require('express');
const nodemailer = require('nodemailer');
const path       = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

/* ─── Mailer ─── */
function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

/* ─── Email: notification to June ─── */
function notificationHtml({ name, email, phone, zones, date, time, message, type }) {
  const zonesStr = Array.isArray(zones) ? zones.join(', ') : (zones || '—');
  const row = (label, value) => value
    ? `<tr><td style="padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9E8678;white-space:nowrap;width:140px;vertical-align:top;">${label}</td><td style="padding:10px 16px;font-size:15px;color:#2C2420;">${value}</td></tr>`
    : '';

  return `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#FAF8F5;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(44,36,32,.09);">
  <div style="background:#A0615A;padding:32px;text-align:center;">
    <div style="font-size:22px;font-weight:300;letter-spacing:2px;color:#fff;">SMOOTH BY JUNE</div>
    <div style="font-size:13px;color:rgba(255,255,255,.8);margin-top:6px;">Nieuwe ${type === 'booking' ? 'afspraakaanvraag' : 'contactaanvraag'} via de website</div>
  </div>
  <table style="width:100%;border-collapse:collapse;border-top:1px solid #F0E4DC;">
    ${row('Naam', name)}
    ${row('E-mail', `<a href="mailto:${email}" style="color:#A0615A;">${email}</a>`)}
    ${row('Telefoon', phone || '—')}
    ${type === 'booking' ? row('Zone(s)', `<span style="background:#F5EDE8;padding:4px 10px;border-radius:6px;font-size:13px;">${zonesStr}</span>`) : ''}
    ${type === 'booking' && date ? row('Voorkeursdatum', date) : ''}
    ${type === 'booking' && time ? row('Voorkeurstijdstip', time) : ''}
    ${message ? row('Bericht', message.replace(/\n/g, '<br>')) : ''}
  </table>
  <div style="background:#F5EDE8;padding:14px 24px;text-align:center;font-size:12px;color:#9E8678;">
    Ontvangen via smoothbyjune.be &middot; Klik op Reply om te antwoorden
  </div>
</div>
</body></html>`;
}

/* ─── Email: confirmation to client ─── */
function confirmationHtml({ name, zones, date, time, type }) {
  const zonesStr = Array.isArray(zones) ? zones.join(', ') : (zones || '');
  return `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#FAF8F5;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(44,36,32,.09);">
  <div style="background:linear-gradient(135deg,#A0615A,#9E8678);padding:40px 32px;text-align:center;">
    <div style="font-size:26px;font-weight:300;letter-spacing:2px;color:#fff;margin-bottom:8px;">Smooth by June</div>
    <div style="font-size:13px;color:rgba(255,255,255,.8);">Laserontharing · Geel</div>
  </div>
  <div style="padding:36px 32px;">
    <p style="font-size:16px;line-height:1.75;color:#2C2420;margin:0 0 16px;">Dag ${name},</p>
    <p style="font-size:15px;line-height:1.75;color:#2C2420;margin:0 0 16px;">
      Bedankt voor je ${type === 'booking' ? 'afspraakaanvraag' : 'berichtje'}! Ik heb alles goed ontvangen en neem zo snel mogelijk contact met je op om ${type === 'booking' ? 'je afspraak in te plannen' : 'je vraag te beantwoorden'}.
    </p>
    ${type === 'booking' && (zonesStr || date) ? `
    <div style="background:#F5EDE8;border-radius:10px;padding:20px 24px;margin:24px 0;border-left:3px solid #C9A99A;">
      <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9E8678;margin-bottom:10px;">Jouw aanvraag</div>
      ${zonesStr ? `<p style="margin:6px 0;font-size:14px;color:#2C2420;">Zone(s): <strong>${zonesStr}</strong></p>` : ''}
      ${date ? `<p style="margin:6px 0;font-size:14px;color:#2C2420;">Voorkeursdatum: <strong>${date}</strong></p>` : ''}
      ${time ? `<p style="margin:6px 0;font-size:14px;color:#2C2420;">Tijdstip: <strong>${time}</strong></p>` : ''}
    </div>` : ''}
    <p style="font-size:15px;line-height:1.75;color:#2C2420;margin:0 0 24px;">
      Heb je nog een vraag of wil je iets aanpassen? Stuur gerust een WhatsApp.
    </p>
    <a href="https://wa.me/32471608209" style="display:block;background:#A0615A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:50px;font-size:14px;font-weight:600;text-align:center;margin:0 0 28px;">Chat met June via WhatsApp</a>
    <p style="font-size:14px;color:#7A6F6A;margin:0;">Tot snel!<br><strong style="color:#2C2420;">June</strong><br><span style="font-size:13px;">Smooth by June · Geel</span></p>
  </div>
  <div style="background:#F5EDE8;padding:20px 32px;text-align:center;">
    <p style="font-size:12px;color:#9E8678;margin:4px 0;">Oosterloseweg 42, 2440 Geel</p>
    <p style="font-size:12px;margin:4px 0;"><a href="mailto:info@smoothbyjune.be" style="color:#A0615A;text-decoration:none;">info@smoothbyjune.be</a></p>
    <p style="font-size:11px;color:#C9A99A;margin:12px 0 0;">Je ontvangt dit bericht omdat je een aanvraag hebt gedaan via smoothbyjune.be</p>
  </div>
</div>
</body></html>`;
}

/* ─── Input sanitiser (strip HTML tags) ─── */
const clean = v => typeof v === 'string' ? v.replace(/<[^>]*>/g, '').trim().slice(0, 2000) : '';

/* ─── POST /api/booking ─── */
app.post('/api/booking', async (req, res) => {
  try {
    const name    = clean(req.body.name);
    const email   = clean(req.body.email);
    const phone   = clean(req.body.phone);
    const date    = clean(req.body.date);
    const time    = clean(req.body.time);
    const message = clean(req.body.message);

    /* zones can arrive as a single string or array */
    let zones = req.body.zones || [];
    if (!Array.isArray(zones)) zones = [zones];
    zones = zones.map(clean).filter(Boolean);

    if (!name || !email) {
      return res.status(400).json({ error: 'Naam en e-mailadres zijn verplicht.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Ongeldig e-mailadres.' });
    }

    const transporter = createTransport();

    await transporter.sendMail({
      from:    `"Smooth by June Website" <${process.env.SMTP_USER}>`,
      to:      'info@smoothbyjune.be',
      replyTo: email,
      subject: `📅 Afspraakaanvraag — ${name}`,
      html:    notificationHtml({ name, email, phone, zones, date, time, message, type: 'booking' }),
    });

    await transporter.sendMail({
      from:    `"June — Smooth by June" <${process.env.SMTP_USER}>`,
      to:      email,
      subject: `Bedankt voor je aanvraag, ${name}!`,
      html:    confirmationHtml({ name, zones, date, time, type: 'booking' }),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(500).json({ error: 'Er ging iets mis bij het versturen. Probeer het via WhatsApp.' });
  }
});

/* ─── POST /api/contact ─── */
app.post('/api/contact', async (req, res) => {
  try {
    const name    = clean(req.body.name);
    const email   = clean(req.body.email);
    const phone   = clean(req.body.phone);
    const zone    = clean(req.body.zone);
    const message = clean(req.body.message);

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Naam, e-mailadres en bericht zijn verplicht.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Ongeldig e-mailadres.' });
    }

    const transporter = createTransport();

    await transporter.sendMail({
      from:    `"Smooth by June Website" <${process.env.SMTP_USER}>`,
      to:      'info@smoothbyjune.be',
      replyTo: email,
      subject: `✉️ Nieuw contactbericht — ${name}`,
      html:    notificationHtml({ name, email, phone, zones: zone ? [zone] : [], date: null, time: null, message, type: 'contact' }),
    });

    await transporter.sendMail({
      from:    `"June — Smooth by June" <${process.env.SMTP_USER}>`,
      to:      email,
      subject: `Bedankt voor je berichtje, ${name}!`,
      html:    confirmationHtml({ name, zones: [], date: null, time: null, type: 'contact' }),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Contact error:', err.message);
    res.status(500).json({ error: 'Er ging iets mis bij het versturen. Probeer het via WhatsApp.' });
  }
});

/* ─── SPA fallback ─── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Smooth by June running on http://localhost:${PORT}`));
