const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const webpush = require('web-push');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔑 Senin VAPID anahtarların
const publicKey = "BG4lyEIPRLqGRgv9-UuLlyoavfXO2ESAlK-K1Cca8ERu30XWR-DnFjdR3G4UW7wxvngm-7-OfxNZVlIdxTYJ9m8";
const privateKey = "wlZqOiKl-ogKzs1rNrHs2zSb9yZLZ3Sf3l7h1jKsC30";

// Web Push ayarı
webpush.setVapidDetails(
  'mailto:seninmail@domain.com', // buraya mail adresini yaz
  publicKey,
  privateKey
);

let subscriptions = [];

// 👉 Tarayıcıya public key göndermek için endpoint
app.get("/vapidPublicKey", (req, res) => {
  res.send(publicKey);
});

// 👉 Abonelik kaydı
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ ok: true });
});

// 👉 Mesaj gönderme
app.post("/message", async (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });

  const results = await Promise.all(
    subscriptions.map(async (sub, idx) => {
      try {
        await webpush.sendNotification(sub, payload);
        return { idx, ok: true };
      } catch (err) {
        subscriptions.splice(idx, 1);
        return { idx, ok: false, error: err.message };
      }
    })
  );

  res.json({ sent: results });
});

// Sunucu başlat
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
