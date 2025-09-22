require("dotenv").config();
const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();

// === Middleware ===
app.use(bodyParser.json());

// 🔥 CORS ekledik: test için herkese aç (istersen sadece parpar.it yapabilirsin)
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// Statik dosyalar (gerekirse)
app.use(express.static(path.join(__dirname)));

const publicVapidKey = process.env.VAPID_PUBLIC;
const privateVapidKey = process.env.VAPID_PRIVATE;

// VAPID key ayarı
webpush.setVapidDetails("mailto:test@test.com", publicVapidKey, privateVapidKey);

let subscription = null; // sadece tek abonelik için

// === Subscribe endpoint ===
app.post("/subscribe", (req, res) => {
  console.log("📥 /subscribe çağrısı geldi. Gelen body:", req.body);

  // Gelen body farklı formatlarda olabilir
  if (req.body.subscription && req.body.subscription.endpoint) {
    subscription = req.body.subscription;
  } else if (req.body.endpoint) {
    subscription = req.body;
  } else {
    console.error("❌ Geçersiz subscription:", req.body);
    return res.status(400).json({ error: "Geçersiz subscription" });
  }

  console.log("✅ Subscription kaydedildi:", subscription.endpoint);
  res.status(201).json({ ok: true });
});

// === Send endpoint ===
app.post("/send", (req, res) => {
  console.log("📤 /send çağrısı geldi. Body:", req.body);

  if (!subscription || !subscription.endpoint) {
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

// === Sunucu ===
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Sunucu http://localhost:${port} adresinde çalışıyor`));
