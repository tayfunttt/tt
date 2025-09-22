const express = require("express");
const cors = require("cors");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
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

let subscription;

// abone kaydı
app.post("/subscribe", (req, res) => {
  subscription = req.body;
  res.status(201).json({});
});

// push gönder
app.post("/send", async (req, res) => {
  const { message } = req.body;
  if (!subscription) {
    return res.status(400).json({ error: "No subscription found" });
  }
  try {
    await webpush.sendNotification(subscription, JSON.stringify({ message }));
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Push error:", err);
    res.status(500).json({ error: "Push failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
