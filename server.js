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

let subscription = null; // sadece tek abonelik için

// === Subscribe endpoint ===
app.post("/subscribe", (req, res) => {
  console.log("📥 /subscribe çağrısı geldi. Gelen body:", req.body);

  // Eğer subscription iç içe gelmişse çıkar
  subscription = req.body.subscription || req.body;

  if (!subscription || !subscription.endpoint) {
    console.error("❌ Geçersiz subscription:", subscription);
    return res.status(400).json({ error: "Geçersiz subscription" });
  }

  console.log("✅ Subscription kaydedildi:", subscription.endpoint);
  res.status(201).json({ ok: true });
});

// === Send endpoint ===
app.post("/send", (req, res) => {
  console.log("📤 /send çağrısı geldi. Body:", req.body);

  if (!subscription) {
    console.error("❌ Henüz subscription yok.");
    return res.status(400).json({ error: "Abonelik yok" });
  }

  const payload = JSON.stringify({
    title: req.body.title || "Parpar.it Bildirim",
    body: req.body.body || "Web Push çalışıyor!",
    url: req.body.url || "https://parpar.it"
  });

  console.log("➡️ Push gönderiliyor. Payload:", payload);

  webpush.sendNotification(subscription, payload)
    .then(() => {
      console.log("✅ Push bildirimi başarıyla gönderildi.");
      res.status(200).json({ success: true });
    })
    .catch(err => {
      console.error("❌ Push error:", err);
      res.status(500).json({ error: "Push gönderilemedi" });
    });
});

const port = 3000;
app.listen(port, () => console.log(`🚀 Sunucu http://localhost:${port} adresinde çalışıyor`));
