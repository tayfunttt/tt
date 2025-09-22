const express = require("express");
const cors = require("cors");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();

// sadece parpar.it ve localhost izinli
app.use(cors({
  origin: ["https://parpar.it", "http://localhost:3000"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// VAPID keyleri .env'den oku
const publicVapidKey = process.env.VAPID_PUBLIC;
const privateVapidKey = process.env.VAPID_PRIVATE;

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

// ---- Bellekte abone saklama ----
let subscription = null;

// Abonelik kaydı
app.post("/subscribe", (req, res) => {
  console.log("Gelen /subscribe:", req.body);

  // subscription nesnesi içinden çıkar
  if (req.body.subscription) {
    subscription = req.body.subscription;
    console.log("Abonelik kaydedildi ✅");
    res.status(201).json({ ok: true });
  } else {
    console.log("HATALI abonelik isteği ❌");
    res.status(400).json({ error: "No subscription in body" });
  }
});

// Push gönderme
app.post("/send", async (req, res) => {
  console.log("Gelen /send:", req.body);

  if (!subscription) {
    console.log("Abonelik yok ❌");
    return res.status(400).json({ error: "No subscription found" });
  }

  const { title, body, url } = req.body;

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url })
    );
    console.log("Push gönderildi ✅");
    res.json({ ok: true });
  } catch (err) {
    console.error("Push gönderim hatası ❌", err);
    res.status(500).json({ error: "Push failed", details: err.message });
  }
});

// Sunucu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor...`));
