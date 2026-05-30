# Ceyhun Başkoç'un Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** *(Eklenecek)*

Bu dokümanda, SolveIt mobil uygulaması için REST API entegrasyonu kapsamında geliştirilen 10 temel servis görevi, istek (request) ve yanıt (response) yapılarıyla detaylandırılmıştır.

**Production API URL:** `https://solveit-887w.onrender.com/api`

---

## 1. Kullanıcı Hesap Oluşturma Servisi
- **Endpoint:** `POST /api/auth/register`
- **Görev:** Mobil kayıt formundan toplanan verileri API'ye gönderir, dönen JWT token'ı `SecureStore`'a kaydeder.
- **Authentication:** Gerekli Değil
- **Request Body:**
```json
{
  "name": "Ceyhun Başkoç",
  "email": "ceyhun@example.com",
  "password": "GuvenliSifre123",
  "department": "Bilgisayar Mühendisliği"
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Kayıt işlemi başarılı.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Mobil Davranış:** Token SecureStore'a kaydedilir → Ana sayfaya (`/`) yönlendirilir → Başarı toast gösterilir.

---

## 2. Kullanıcı Girişi Yapma Servisi
- **Endpoint:** `POST /api/auth/login`
- **Görev:** E-posta ve şifre ile giriş yapar, dönen JWT token ve kullanıcı bilgilerini cihaza kaydeder.
- **Authentication:** Gerekli Değil
- **Request Body:**
```json
{
  "email": "ceyhun@example.com",
  "password": "GuvenliSifre123"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Giriş başarılı.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Ceyhun Başkoç",
    "email": "ceyhun@example.com",
    "role": "user",
    "department": "Bilgisayar Mühendisliği",
    "xp": 30
  }
}
```
- **Mobil Davranış:** Token + kullanıcı SecureStore'a kaydedilir → Tab navigator aktif edilir → Hata durumunda shake animasyonu.

---

## 3. Yeni Sorun Bildirimi Oluşturma Servisi
- **Endpoint:** `POST /api/issues`
- **Görev:** GPS'ten alınan konum, form verileri ve opsiyonel görsel dosyasını `multipart/form-data` olarak API'ye gönderir.
- **Authentication:** Bearer Token Gerekli
- **Request Body:** `multipart/form-data`
```
title:       "Kütüphane İnternet Arızası"
description: "Zemin katta eduroam bağlanılmıyor."
category:    "altyapi"
location:    {"lat": 37.8322, "lng": 30.5260}   (JSON string)
image:       <dosya verisi, opsiyonel>
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Kütüphane İnternet Arızası",
    "status": "PENDING",
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQ..."
  }
}
```
- **Mobil Davranış:** Başarıda +10 XP animasyonu → Liste ekranına dönülür → Yeni kart listenin en üstünde görünür.

---

## 4. Tüm Bildirimleri Listeleme Servisi
- **Endpoint:** `GET /api/issues`
- **Görev:** Tüm sorunları en yeniden eskiye sıralı çeker, mobil liste bileşenine aktarır.
- **Authentication:** Gerekli Değil
- **Query Parameters:** `category` (opsiyonel)
- **Response:** `200 OK`
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Kütüphane İnternet Arızası",
      "category": "altyapi",
      "status": "PENDING",
      "reporterId": { "name": "Ceyhun Başkoç" },
      "upvotes": [],
      "downvotes": [],
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```
- **Mobil Davranış:** Pull-to-refresh ile yenileme → Uygulama kapalıyken önce cache gösterilir, arka planda güncellenir.

---

## 5. Kategoriye Göre Filtreleme Servisi
- **Endpoint:** `GET /api/issues?category={kategoriAdı}`
- **Görev:** Üst kategori chip'lerine tıklandığında query parametresiyle filtrelenmiş liste çeker.
- **Authentication:** Gerekli Değil
- **Geçerli Kategoriler:** `altyapi` | `temizlik` | `guvenlik` | `ulasim` | `yesilalan` | `aydinlatma` | `diger`
- **Response:** `200 OK` — Yalnızca seçilen kategoriyle eşleşen sorunların listesi döner.
- **Mobil Davranış:** Chip seçiminde `selectedCategory` state güncellenir → Debounce (300ms) sonrası istek atılır → Sonuç 0 ise empty state gösterilir.

---

## 6. Bildirim Detaylarını Görüntüleme Servisi
- **Endpoint:** `GET /api/issues/{id}`
- **Görev:** Listedeki karta tıklandığında sorunun tüm detaylarını, yorumlarını ve oy sayısını getirir.
- **Authentication:** Gerekli Değil
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Kütüphane İnternet Arızası",
    "description": "Zemin katta eduroam bağlanılmıyor.",
    "category": "altyapi",
    "status": "IN_PROGRESS",
    "location": { "lat": 37.8322, "lng": 30.5260 },
    "imageUrl": "data:image/jpeg;base64,...",
    "reporterId": { "name": "Ceyhun Başkoç", "email": "ceyhun@example.com" },
    "upvotes": [{ "name": "Ahmet Yılmaz" }],
    "downvotes": [],
    "comments": [
      { "user": { "name": "Admin", "role": "admin" }, "text": "İnceleniyor.", "createdAt": "2024-01-15T11:00:00.000Z" }
    ]
  }
}
```
- **Mobil Davranış:** Stack navigator push ile detay ekranı açılır → Konum varsa harita kartı render edilir.

---

## 7. Kişisel Bildirimleri Takip Etme Servisi
- **Endpoint:** `GET /api/issues/user/my-issues`
- **Görev:** Giriş yapmış kullanıcının yalnızca kendi oluşturduğu sorunları listeler.
- **Authentication:** Bearer Token Gerekli
- **Response:** `200 OK`
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Kütüphane İnternet Arızası",
      "category": "altyapi",
      "status": "IN_PROGRESS",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```
- **Mobil Davranış:** "Bildirimlerim" tab'ına geçişte otomatik çekilir → Durum istatistik kartları (Bekleyen, İncelenen, Çözülen) hesaplanır.

---

## 8. Sorun Durumunu Güncelleme Servisi
- **Endpoint:** `PATCH /api/issues/{id}/status`
- **Görev:** Admin veya sorun sahibinin statüyü değiştirmesini API'ye iletir; çözüldüğünde XP bildirimi işlenir.
- **Authentication:** Bearer Token Gerekli (Admin veya Sorun Sahibi)
- **Request Body:**
```json
{ "status": "RESOLVED" }
```
- **Geçerli Status Değerleri:** `PENDING` | `IN_PROGRESS` | `RESOLVED`
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "status": "RESOLVED",
    "xpAwarded": true,
    "reporterId": { "name": "Ceyhun Başkoç" }
  }
}
```
- **Mobil Davranış:** Başarı toast → RESOLVED ise "+20 XP" animasyonu → Socket.io ile diğer ekranlar otomatik güncellenir.

---

## 9. Hatalı Bildirimi Silme Servisi
- **Endpoint:** `DELETE /api/issues/{id}`
- **Görev:** Onay dialog'u sonrası bildirimi kalıcı siler, liste önbelleğini geçersiz kılar.
- **Authentication:** Bearer Token Gerekli (Bildirimi Açan veya Admin)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {}
}
```
- **Mobil Davranış:** Önce "Emin misiniz?" ActionSheet → Onay sonrası API isteği → Başarıda kart listeden optimistic olarak kaldırılır → Hata durumunda kart geri eklenir.

---

## 10. Profil Bilgilerini Güncelleme Servisi
- **Endpoint:** `PATCH /api/users/profile`
- **Görev:** Profil formundaki ad ve departman değişikliklerini API'ye gönderir.
- **Authentication:** Bearer Token Gerekli
- **Request Body:**
```json
{
  "name": "Ceyhun Başkoç",
  "department": "Bilgisayar Mühendisliği"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Ceyhun Başkoç",
    "email": "ceyhun@example.com",
    "department": "Bilgisayar Mühendisliği",
    "role": "user",
    "xp": 150
  }
}
```
- **Mobil Davranış:** Başarı toast → AuthContext'teki user nesnesi güncellenir → SecureStore'daki user verisi yenilenir.

---

## 11. Güncel Kullanıcı Bilgisi Çekme Servisi
- **Endpoint:** `GET /api/auth/me`
- **Görev:** Ekran odaklandığında (screen focus) güncel XP ve kullanıcı bilgilerini çekerek profil ekranını günceller.
- **Authentication:** Bearer Token Gerekli
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Ceyhun Başkoç",
    "role": "user",
    "xp": 150,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```
- **Mobil Davranış:** `useFocusEffect` hook'u ile tab değiştirince otomatik çağrılır → XP progress bar animasyonla güncellenir.

---

## 12. Liderlik Tablosu Servisi
- **Endpoint:** `GET /api/users/leaderboard`
- **Görev:** En yüksek XP'ye sahip ilk 10 kullanıcıyı getirir.
- **Authentication:** Gerekli Değil
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "Ceyhun Başkoç", "department": "Bilgisayar Mühendisliği", "xp": 150 }
  ]
}
```
- **Mobil Davranış:** Liderlik ekranı açıldığında çekilir → Mevcut kullanıcı vurgulanır → Sıralamaya göre altın/gümüş/bronz rozet gösterilir.

---

## 13. Soruna Olumlu Oy Verme Servisi
- **Endpoint:** `POST /api/issues/{id}/upvote`
- **Görev:** Kullanıcının bir sorunu desteklediğini backend'e iletir; aynı kullanıcı tekrar basarsa oyu geri alır (toggle).
- **Authentication:** Bearer Token Gerekli
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "upvotes": ["userId1", "userId2"],
    "downvotes": []
  }
}
```
- **Mobil Davranış:** Anlık state güncellenir → Socket.io `voteUpdated` eventi diğer ekranlara yayılır → Skor = upvote - downvote olarak hesaplanır.

---

## 14. Soruna Olumsuz Oy Verme Servisi
- **Endpoint:** `POST /api/issues/{id}/downvote`
- **Görev:** Kullanıcının bir sorunu önemsiz bulduğunu backend'e iletir; tekrar basınca toggle ile geri alır.
- **Authentication:** Bearer Token Gerekli
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "upvotes": [],
    "downvotes": ["userId1"]
  }
}
```
- **Mobil Davranış:** Skor negatifse kırmızı, pozitifse yeşil renkte gösterilir → Optimistic update uygulanır.

---

## 15. Soruna Yorum Ekleme Servisi
- **Endpoint:** `POST /api/issues/{id}/comments`
- **Görev:** Detay ekranındaki yorum alanından yazılan metni sorunun yorum listesine ekler.
- **Authentication:** Bearer Token Gerekli
- **Request Body:**
```json
{ "text": "Bu sorun hâlâ devam ediyor." }
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "comments": [
      { "user": { "name": "Ceyhun Başkoç", "role": "user" }, "text": "Bu sorun hâlâ devam ediyor.", "createdAt": "2024-01-15T12:00:00.000Z" }
    ]
  }
}
```
- **Mobil Davranış:** Yorum gönderince input temizlenir → Liste en alta kaydırılır → Socket.io `newComment` eventi ile diğer kullanıcıların ekranına anlık eklenir.

---

## 📋 Servis Özet Tablosu

| # | Servis | Method | Endpoint | Auth |
|---|---|---|---|---|
| 1 | Kayıt | POST | `/api/auth/register` | Hayır |
| 2 | Giriş | POST | `/api/auth/login` | Hayır |
| 3 | Sorun Oluştur | POST | `/api/issues` | Evet |
| 4 | Tüm Sorunlar | GET | `/api/issues` | Hayır |
| 5 | Kategoriye Göre | GET | `/api/issues?category=X` | Hayır |
| 6 | Sorun Detayı | GET | `/api/issues/:id` | Hayır |
| 7 | Kişisel Sorunlar | GET | `/api/issues/user/my-issues` | Evet |
| 8 | Durum Güncelle | PATCH | `/api/issues/:id/status` | Evet |
| 9 | Sorun Sil | DELETE | `/api/issues/:id` | Evet |
| 10 | Profil Güncelle | PATCH | `/api/users/profile` | Evet |
| 11 | Ben Kimim | GET | `/api/auth/me` | Evet |
| 12 | Liderlik | GET | `/api/users/leaderboard` | Hayır |
| 13 | Olumlu Oy | POST | `/api/issues/:id/upvote` | Evet |
| 14 | Olumsuz Oy | POST | `/api/issues/:id/downvote` | Evet |
| 15 | Yorum Ekle | POST | `/api/issues/:id/comments` | Evet |
