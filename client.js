// Service Worker kaydı
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker kayıt başarılı"))
    .catch(err => console.error("SW hatası:", err));
}

const publicVapidKey = "BBQ77VKt4IQRPpEc6tog47ah70q5Z8ey2wp4nJrQy9gDoo2SRaGK013BKcN19yrJv4M-6ZsivcX6p0T5dpYcrHA";

document.getElementById("subscribe").addEventListener("click", async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });

  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: { "Content-Type": "application/json" }
  });

  alert("Abonelik kaydedildi!");
});

document.getElementById("notify").addEventListener("click", async () => {
  await fetch("/send", { method: "POST" });
  alert("Sunucudan push gönderildi.");
});

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
