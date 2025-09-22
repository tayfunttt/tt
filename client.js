// Service Worker kaydı
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker kayıt başarılı"))
    .catch(err => console.error("SW hatası:", err));
}

const publicVapidKey = "BBQ77VKt4IQRPpEc6tog47ah70q5Z8ey2wp4nJrQy9gDoo2SRaGK013BKcN19yrJv4M-6ZsivcX6p0T5dpYcrHA";

// === Abone ol ===
document.getElementById("subscribe").addEventListener("click", async () => {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });

  // Kullanıcı oda adını al (örnek: localStorage’dan)
  const roomName = localStorage.getItem("roomName") || prompt("Oda adını gir:");

  await fetch("https://tt-ov0s.onrender.com/subscribe", {
    method: "POST",
    body: JSON.stringify({
      room: roomName,
      subscription: subscription
    }),
    headers: { "Content-Type": "application/json" }
  });

  alert("Abonelik kaydedildi! Oda: " + roomName);
});

// === Push bildirimi gönder ===
document.getElementById("notify").addEventListener("click", async () => {
  const toRoom = prompt("Mesaj hangi odaya gitsin?");
  const message = prompt("Gönderilecek mesaj:");

  await fetch("https://tt-ov0s.onrender.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      toRoom: toRoom,
      title: "Yeni Mesaj",
      body: message,
      url: "https://parpar.it"
    })
  });

  alert("Push mesajı gönderildi → " + toRoom);
});

// === Base64 dönüşüm fonksiyonu ===
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
