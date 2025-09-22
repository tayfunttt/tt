const cors = require("cors");
app.use(cors());
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
  subscription = req.body;
  res.status(201).json({});
});

app.post("/send", (req, res) => {
  const payload = JSON.stringify({
    title: "Parpar.it Bildirim",
    body: "Web Push çalışıyor!"
  });

  webpush.sendNotification(subscription, payload).catch(err => console.error(err));
  res.status(200).json({ success: true });
});

const port = 3000;
app.listen(port, () => console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`));
