require("dotenv").config();
const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.static(path.join(__dirname)));

const publicVapidKey = process.env.VAPID_PUBLIC;
const privateVapidKey = process.env.VAPID_PRIVATE;
webpush.setVapidDetails("mailto:test@test.com", publicVapidKey, privateVapidKey);

// 🔥 Oda bazlı subscription listesi
let subscriptions = {}; 
// örnek: { "ODA1": subscriptionObj, "ODA2": subscriptionObj }

app.post("/subscribe", (req, res) => {
  console.log("📥 /subscribe çağrısı:", req.body);

  const room = req.body.room;
  const sub = req.body.subscription;

  if (!room || !sub || !sub.endpoint) {
    return res.status(400).json({ error: "Geçersiz subscription" });
  }

  subscriptions[room] = sub; // odayı ID olarak kaydet
  console.log(`✅ Subscription kaydedildi → Oda: ${room}, Endpoint: ${sub.endpoint}`);

  res.status(201).json({ ok: true });
});

app.post("/send", (req, res) => {
  console.log("📤 /send çağrısı:", req.body);

  const toRoom = req.body.toRoom; // hangi oda ID'ye gidecek
  const sub = subscriptions[toRoom];

  if (!sub) {
    return res.status(400).json({ error: "Bu oda için abonelik bulunamadı" });
  }

  const payload = JSON.stringify({
    title: req.body.title || "Parpar.it Bildirim",
    body: req.body.body || "Yeni mesajınız var!",
    url: req.body.url || "https://parpar.it"
  });

  webpush.sendNotification(sub, payload)
    .then(() => {
      console.log(`✅ Push ${toRoom} odasına gönderildi.`);
      res.status(200).json({ success: true });
    })
    .catch(err => {
      console.error("❌ Push error:", err);
      res.status(500).json({ error: "Push gönderilemedi" });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Sunucu http://localhost:${port} adresinde çalışıyor`));
