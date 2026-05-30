# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

**REST API Adresi:** `https://solveit-887w.onrender.com/api`

Bu dokümanda, SolveIt mobil uygulamasının mevcut REST API ile iletişimini sağlayan backend entegrasyon görevleri listelenmektedir. Mobil uygulama, web uygulamasıyla aynı backend'i kullanmaktadır; ayrı bir mobil backend geliştirilmesine gerek yoktur.

> ⚠️ **ÖNEMLİ UYARI:** Render'ın ücretsiz versiyonu kullanıldığı için ilk istekte backend'in uyanması **30-40 saniye sürebilir**.

---

## Grup Üyelerinin Mobil Backend Görevleri

1. [Ceyhun Başkoç'un Mobil Backend Görevleri](Ceyhun-Baskoc/Ceyhun-Baskoc-Mobil-Backend-Gorevleri.md)

---

## Genel Mobil Backend Prensipleri

### 1. HTTP Client Yapılandırması
- **Base URL:** `https://solveit-887w.onrender.com/api`
- **Timeout:** Request timeout 30 saniye, connect timeout 10 saniye
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (korumalı endpoint'lerde)
- **Framework:** React Native için `axios`, Flutter için `dio` paketi önerilir

### 2. Authentication ve Token Yönetimi
- JWT token'ları cihazın güvenli depolama birimine kaydedilir (React Native: `expo-secure-store`, Flutter: `flutter_secure_storage`)
- Token 30 gün geçerlidir; süresi dolduğunda kullanıcı login ekranına yönlendirilir
- 401 yanıtı alındığında token temizlenerek otomatik çıkış yapılır
- Tüm korumalı isteklere `Authorization: Bearer <token>` header'ı eklenir

### 3. Multipart Form Data ile Görsel Yükleme
- Sorun oluştururken (`POST /api/issues`) `multipart/form-data` formatı kullanılır
- Görsel cihaz galerisinden veya kameradan seçilir, 5MB limitine uyulur
- Backend görseli Base64 Data URL olarak MongoDB'ye kaydeder
- Yükleme sırasında progress indicator gösterilir

### 4. Gerçek Zamanlı Güncellemeler (Socket.io)
- `socket.io-client` paketi ile `https://solveit-887w.onrender.com` adresine bağlantı kurulur
- Dinlenen olaylar: `statusUpdated`, `voteUpdated`, `newComment`
- `statusUpdated` olayında sorun sahibine bildirim gösterilir, +20 XP kazanıldığında kullanıcı bilgilendirilir
- Bağlantı koptuğunda otomatik reconnect denenir

### 5. Konum Servisi Entegrasyonu
- Cihazın GPS servisine erişim için gerekli izinler istenir (Android: `ACCESS_FINE_LOCATION`, iOS: `NSLocationWhenInUseUsageDescription`)
- `navigator.geolocation` veya platform-native API ile `{lat, lng}` verisi alınır
- Konum verisi `location` alanı olarak JSON stringify edilerek form data'ya eklenir
- Konum izni reddedilirse form opsiyonel devam eder

### 6. Hata Yönetimi (Error Handling)
- Network hataları (zaman aşımı, bağlantı yok) kullanıcı dostu mesajlarla gösterilir
- HTTP 400: Validasyon hataları, 401: Oturum sona erdi, 403: Yetersiz yetki, 404: Kayıt bulunamadı, 500: Sunucu hatası
- Render cold start için ilk istek hatasında kullanıcıya "Sunucu uyanıyor, lütfen bekleyin" mesajı verilir
- Offline durumda önbellekten okuma yapılır (cache stratejisi)

### 7. Caching Stratejisi
- `GET /api/issues` ve `GET /api/users/leaderboard` yanıtları yerel önbellekte tutulur
- `POST`, `PATCH`, `DELETE` işlemlerinden sonra ilgili cache geçersiz kılınır (cache invalidation)
- Uygulama açılışında önce cache verisi gösterilir, arka planda güncel veri çekilir (stale-while-revalidate)

### 8. XP Sistemi ile Entegrasyon
- Sorun oluşturmada kullanıcıya +10 XP verilir (backend otomatik işler)
- Admin sorunu RESOLVED yapınca bildireni +20 XP kazanır; Socket.io ile bildirim gelir
- Profil sayfası `GET /api/auth/me` ile güncel XP değerini çeker
- Liderlik tablosu `GET /api/users/leaderboard` ile top 10 kullanıcıyı getirir

### 9. Push Notification Altyapısı
- Backend'den gelen Socket.io `statusUpdated` event'i uygulama arka planda çalışırken yerel bildirime dönüştürülür
- React Native için `expo-notifications`, Flutter için `firebase_messaging` kullanılır
- Bildirim içeriği: "Sorununuz '[başlık]' durumu güncellendi: Çözüldü ✅ +20 XP"

### 10. Güvenlik Prensipleri
- Token `AsyncStorage` yerine `SecureStore`/`flutter_secure_storage` ile şifreli saklanır
- HTTPS dışında istek atılmaz; certificate pinning değerlendirilir
- `req.body`'den gelen veriler ekranda direkt render edilmeden önce sanitize edilir (XSS koruması)
- Admin paneli bileşenleri yalnızca `role === 'admin'` koşulunda render edilir

### 11. Kategori ve Durum Sabitleri
Mobil uygulamada kullanılacak sabit değerler:
```
Kategoriler: altyapi | temizlik | guvenlik | ulasim | yesilalan | aydinlatma | diger
Durumlar:    PENDING | IN_PROGRESS | RESOLVED
```

### 12. API Response Dönüşüm Katmanı
- Tüm API yanıtları `{ success, data, count, message }` formatındadır
- Başarılı yanıtlarda `response.data.data` alınır
- Hata yanıtlarında `error.response.data.message` kullanıcıya gösterilir
- Tarih alanları (`createdAt`, `updatedAt`) mobil locale'e göre formatlanır (Türkçe)
