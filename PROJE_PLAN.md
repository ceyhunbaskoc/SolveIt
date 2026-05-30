# SolveIt Final Proje Planı

## Genel Bilgi
- **Proje:** SolveIt — SDÜ/Isparta şehir sorun bildirme platformu
- **Backend:** `https://solveit-887w.onrender.com/api`
- **Frontend:** `https://solveit-frontend.vercel.app`
- **Mobile:** `D:\SolveIt\solveit-mobile` (React Native + Expo SDK 56, Android)

---

## Tamamlanan Adımlar

### ✅ 1. MD Güncellemeleri
- `docs/MobilBackEnd.md` — 12 madde, production URL düzeltildi
- `docs/MobilFrontEnd.md` — 12 madde, proje renkleri (#C3F746, #F7721A, #0F1010)
- `docs/Ceyhun-Baskoc/Ceyhun-Baskoc-Mobil-Backend-Gorevleri.md` — 12 servis, tam JSON
- `docs/Ceyhun-Baskoc/Ceyhun-Baskoc-Mobil-Frontend-Gorevleri.md` — 13 ekran

### ✅ 2. Mobil FrontEnd Ekranları (Expo SDK 56, React Native)
Tüm ekranlar `D:\SolveIt\solveit-mobile\src\screens\` altında:

| Ekran | Dosya | Açıklama |
|-------|-------|----------|
| Giriş | `LoginScreen.js` | Email/şifre, Alert, KeyboardAvoidingView |
| Kayıt | `RegisterScreen.js` | 4 alan (ad, email, şifre, bölüm) |
| Anasayfa | `HomeScreen.js` | FlatList, kategori chip, Socket.io, oy |
| Sorun Detay | `IssueDetailScreen.js` | Durum değiştir, yorum, Google Maps, sil |
| Sorun Bildir | `ReportIssueScreen.js` | FormData, GPS, görsel seç/çek |
| Bildirimlerim | `MyIssuesScreen.js` | 4 stat, FlatList, sil |
| Profil | `ProfileScreen.js` | XP bar, 3 seviye, PATCH /profile |
| **Liderlik** | `LeaderboardScreen.js` | Top 10 kullanıcı, madalya, XP |
| **Harita** | `MapScreen.js` | react-native-maps, dark stil, pin'ler |

**Navigation (App.js):** 6 Tab — 🏠 Anasayfa / 🗺️ Harita / ➕ Bildir / 📋 Bildirimlerim / 🏆 Sıralama / 👤 Profil

**Paketler:** `npx expo install --check` → "Dependencies are up to date" ✓

### ⏸️ 2b. Telefonda Test (BEKLEMEDE — Yer Sorunu)
**Sorun:** Expo SDK 56, Play Store'daki Expo Go ile uyumsuz.  
**Çözüm kararı:** **EAS Build** ile APK üret, telefona direkt kur.  
**Adımlar (yer açılınca):**
```
# Terminalde sırayla çalıştır:
npm install -g eas-cli          # EAS CLI kur
eas login                        # expo.dev hesabı ile giriş (yoksa kayıt ol)
cd D:\SolveIt\solveit-mobile
eas build --platform android --profile preview
# ~10-15 dk sonra APK download linki gelir → telefona kur
```
**app.json'a** `"package": "com.solveit.mobile"` ekli (android bölümüne).

---

## Kalan Adımlar

### 🔲 3. REST API + UI Bağlantısı
**Ne yapılacak:** Mobile ↔ Backend bağlantısını belgele + demo ekranları düzelt
- `src/utils/api.js` zaten mevcut (baseURL, SecureStore interceptor)
- Endpoint listesi MD'ye eklenecek
- Gerekirse bağlantı test ekranı

### 🔲 4. RabbitMQ / Kafka
**Ne yapılacak:** Backend'e mesaj kuyruğu entegrasyonu
- `solveit-backend`'e `amqplib` eklenecek (RabbitMQ seçildi çünkü daha kolay)
- Yeni sorun bildirilince kuyruğa mesaj gönder
- Consumer: bildirim logu / email trigger simülasyonu
- `docker-compose.yml`'e RabbitMQ servisi eklenecek

### 🔲 5. Redis / Memcache
**Ne yapılacak:** Backend'e önbellekleme ekle
- `ioredis` paketi eklenecek
- `GET /api/issues` → Redis cache (60 sn TTL)
- Cache invalidation: yeni sorun / durum güncellemesinde sil
- `docker-compose.yml`'e Redis servisi eklenecek

### 🔲 6. Docker
**Ne yapılacak:** Backend + tüm servisler container'a alınacak
```
solveit-backend/
  Dockerfile           # Node.js backend image
docker-compose.yml     # backend + mongodb + redis + rabbitmq + jenkins
```

### 🔲 7. CI/CD — Jenkins
**ÖNEMLI:** Hoca Jenkins istiyor (GitHub Actions değil)
**Ne yapılacak:**
- `Jenkinsfile` (Declarative Pipeline)
- Stages: Checkout → Install → Test → Build → Deploy
- `docker-compose.yml`'e Jenkins servisi eklenecek
- Jenkins agent içinde Docker-in-Docker veya host Docker soketi

### 🔲 8. Cep Telefonu Demosu
**Ne yapılacak:** EAS Build APK'yı telefona kur ve tüm ekranları test et
- Login / Register
- Sorun listesi + filtre
- Harita görünümü
- Yeni sorun bildir (GPS + fotoğraf)
- Profil + XP
- Liderlik tablosu

---

## Teknik Referans

### Önemli Dosyalar
| Dosya | Amaç |
|-------|------|
| `solveit-mobile/src/utils/api.js` | Axios instance, SecureStore token |
| `solveit-mobile/src/context/AuthContext.js` | useReducer auth state |
| `solveit-backend/index.js` | Express + Socket.io + daily cron |
| `solveit-backend/src/models/Issue.js` | Sorun modeli |
| `solveit-backend/src/controllers/issueController.js` | XP, Socket.io emit'ler |

### XP Sistemi
- Sorun oluştur: +10 XP
- Admin RESOLVED yaparsa: +20 XP (xpAwarded flag ile tekrar önlenir)
- Seviyeler: 0-49 "Duyarlı Vatandaş" | 50-149 "Aktif Gözlemci" | 150+ "Şehir Kahramanı"

### Sorun Durumları
`PENDING` → `IN_PROGRESS` → `RESOLVED`

### Kategoriler
`altyapi, temizlik, guvenlik, ulasim, yesilalan, aydinlatma, diger`

### Socket.io Olayları
- `statusUpdated` — durum değişince
- `voteUpdated` — oy değişince  
- `newComment` — yeni yorum

---

## Notlar
- Backend Render.com'da, Frontend Vercel'de production'da
- Mobile için production API kullanılıyor (localhost değil)
- `react-native-maps` zaten `package.json`'da kurulu (1.27.2)
- Expo dev server: `npx expo start --port 8082`
