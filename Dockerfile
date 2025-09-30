# Node.js taban imajı
FROM node:18

# Çalışma klasörü
WORKDIR /app

# package.json ve package-lock.json kopyala
COPY package*.json ./

# bağımlılıkları yükle
RUN npm install --omit=dev

# tüm dosyaları kopyala
COPY . .

# Port (Cloud Run default: 8080)
EXPOSE 8080

# server başlat
CMD ["npm", "start"]
