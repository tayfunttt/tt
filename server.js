require("dotenv").config();
const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const publicVapidKey = process.env.VAPID_PUBLIC;
const privateVapidKey = process.env.VAPID_PRIVATE;

webpush.setVapidDetails("mailto:test@test.com", publicVapidKey, privateVapidKey);

let subscription; // sadece tek abonelik için

app.post("/subscribe", (req, res) => {
  // Eğer subscription iç içe gelmişse çıkar
  subscription = req.body.subscription || req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Geçersiz subscription" });
  }

  res.status(201).json({ ok: true });
});

app.post("/send", (req, res) => {
  if (!subscription) {
    return res.status(400).json({ error: "Abonelik yok" });
  }

  const payload = JSON.stringify({
    title: req.body.title || "Parpar.it Bildirim",
    body: req.body.body || "Web Push çalışıyor!",
    url: req.body.url || "https://parpar.it"
  });

  webpush.sendNotification(subscription, payload)
    .then(() => res.status(200).json({ success: true }))
    .catch(err => {
      console.error("Push error:", err);
      res.status(500).json({ error: "Push gönderilemedi" });
    });
});

const port = 3000;
app.listen(port, () => console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`));
