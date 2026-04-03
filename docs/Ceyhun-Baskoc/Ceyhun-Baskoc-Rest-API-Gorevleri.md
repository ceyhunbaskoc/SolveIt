# Ceyhun Başkoç'un REST API Metotları

**API Test Videosu:** https://youtu.be/OEhmxA2q4ek

Bu dokümanda, SolveIt (Kampüs ve Şehir Sorun Bildirim Sistemi) projesi için geliştirilen 10 temel fonksiyonel gereksinimin RESTful API uç noktaları, istek (request) ve yanıt (response) yapıları detaylandırılmıştır.

> ⚠️ **ÖNEMLİ UYARI / DİKKAT:** > Projenin Frontend kısmı **Vercel**'de, Backend kısmı ise **Render**'da canlı olarak çalışmaktadır.
> Render'ın ücretsiz versiyonu kullanıldığı için, siteye ilk girişinizde backend'in uyanması **30-40 saniye sürebilir**. Lütfen ilk istekte biraz bekleyiniz.

**Production URL:** `https://solveit-887w.onrender.com/api`

## 1. Kullanıcı Hesap Oluşturma
- **Endpoint:** `POST /api/auth/register`
- **Görev:** Sisteme yeni öğrenci/vatandaş kaydı oluşturur.
- **Request Body:** 
```json
  {
    "name": "Ceyhun Başkoç",
    "email": "ceyhun@example.com",
    "password": "GuvenliSifre123",
    "role": "user",
    "department": "Bilgisayar Mühendisliği"
  }
  ```
- **Response:** `201 Created` - Başarılı kayıt sonrası JWT token ve kullanıcı bilgileri döner.
  ```json
  {
    "success": true,
    "message": "Kayıt işlemi başarılı.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

## 2. Kullanıcı Girişi Yapma
- **Endpoint:** `POST /api/auth/login`
- **Görev:** Mevcut kullanıcıların sisteme giriş yapmasını sağlar.
- **Request Body:** 
```json
  {
    "email": "ceyhun@example.com",
    "password": "GuvenliSifre123"
  }
  ```
- **Response:** `200 OK` - Başarılı girişte oturum yönetimi için Bearer Token ve kullanıcı bilgileri döner.
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
      "xp": 0,
      "createdAt": "2023-07-20T12:00:00.000Z"
    }
  }
  ```

## 3. Yeni Sorun Bildirimi Oluşturma
- **Endpoint:** `POST /api/issues`
- **Görev:** Kullanıcının kampüs veya şehirdeki bir sorunu bildirmesi (fotoğraf eklenebilir).
- **Authentication:** Bearer Token Gerekli
- **Request Body:** `multipart/form-data`
  ```
  {
  title: "Kütüphane İnternet Arızası"
  description: "Zemin katta eduroam ağına bağlanılamıyor."
  category: "altyapi"
  location: {"lat": 37.8322, "lng": 30.5260}
  image: (opsiyonel) - Resim dosyası
  }
  ```
- **Response:** `201 Created` - Oluşturulan sorunun detayları ve ID'si döner.
  ```json
  {
    "success": true,
    "data": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Kütüphane İnternet Arızası",
      "description": "Zemin katta eduroam ağına bağlanılamıyor.",
      "category": "altyapi",
      "location": {"lat": 37.8322, "lng": 30.5260},
      "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
      "status": "PENDING",
      "reporterId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "createdAt": "2023-07-20T12:00:00.000Z"
    }
  }
  ```

## 4. Tüm Bildirimleri Listeleme
- **Endpoint:** `GET /api/issues`
- **Görev:** Sistemde kayıtlı tüm sorunları kronolojik olarak listeler.
- **Authentication:** Gerekli Değil (Açık Endpoint)
- **Query Parameters:** `category` (opsiyonel) - Kategori filtrelemesi için
- **Response:** `200 OK` - Sorun (Issue) objelerinden oluşan bir JSON dizisi döner.
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
        "reporterId": {"name": "Ceyhun Başkoç", "email": "ceyhun@example.com"},
        "createdAt": "2023-07-20T12:00:00.000Z"
      }
    ]
  }
  ```

## 5. Kategoriye Göre Filtreleme
- **Endpoint:** `GET /api/issues?category={kategoriAdı}`
- **Görev:** Listelenen sorunları belirli bir kategoriye göre filtreler.
- **Query Parameters:** `category` (string, required)
  - **Kategoriler:** `altyapi`, `temizlik`, `guvenlik`, `ulasim`, `yesilalan`, `aydinlatma`, `diger`
- **Response:** `200 OK` - Yalnızca belirtilen kategoriyle eşleşen sorunların listesi döner.
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Yol Çukuru",
        "category": "altyapi",
        "status": "IN_PROGRESS",
        "createdAt": "2023-07-20T12:00:00.000Z"
      }
    ]
  }
  ```

## 6. Bildirim Detaylarını Görüntüleme
- **Endpoint:** `GET /api/issues/{id}`
- **Görev:** Spesifik bir sorunun tüm detaylarını, yorumları ve durumunu getirir.
- **Path Parameters:** `id` (string, required) - Sorunun benzersiz ID'si
- **Authentication:** Gerekli Değil
- **Response:** `200 OK` - Tekil sorun (Issue) objesi döner.
  ```json
  {
    "success": true,
    "data": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Kütüphane İnternet Arızası",
      "description": "Zemin katta eduroam ağına bağlanılamıyor.",
      "category": "altyapi",
      "status": "IN_PROGRESS",
      "location": {"lat": 37.8322, "lng": 30.5260},
      "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
      "reporterId": {"name": "Ceyhun Başkoç", "email": "ceyhun@example.com"},
      "upvotes": [{"name": "Ahmet Yılmaz"}],
      "downvotes": [],
      "comments": [
        {
          "user": {"name": "Admin"},
          "text": "Konu inceleniyor.",
          "createdAt": "2023-07-20T13:00:00.000Z"
        }
      ],
      "createdAt": "2023-07-20T12:00:00.000Z"
    }
  }
  ```

## 7. Kişisel Bildirimleri Takip Etme
- **Endpoint:** `GET /api/issues/user/my-issues`
- **Görev:** Giriş yapmış kullanıcının sadece kendi oluşturduğu sorun kayıtlarını listeler.
- **Authentication:** Bearer Token Gerekli
- **Response:** `200 OK` - Kullanıcının ID'si ile eşleşen sorunların listesi döner.
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
        "createdAt": "2023-07-20T12:00:00.000Z"
      }
    ]
  }
  ```

## 8. Sorun Durumunu Güncelleme
- **Endpoint:** `PATCH /api/issues/{id}/status`
- **Görev:** Yetkili kişinin sorunun durumunu güncellemesi.
- **Path Parameters:** `id` (string, required)
- **Authentication:** Bearer Token Gerekli (Sorun sahibi veya Admin)
- **Request Body:** 
```json
  {
    "status": "RESOLVED"
  }
  ```
- **Status Seçenekleri:** `"PENDING"`, `"IN_PROGRESS"`, `"RESOLVED"`
- **Response:** `200 OK` - Güncellenmiş sorun verisi döner.
  ```json
  {
    "success": true,
    "data": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Kütüphane İnternet Arızası",
      "status": "RESOLVED",
      "xpAwarded": true,
      "reporterId": {"name": "Ceyhun Başkoç", "email": "ceyhun@example.com"}
    }
  }
  ```

## 9. Hatalı Bildirimi Silme
- **Endpoint:** `DELETE /api/issues/{id}`
- **Görev:** Yanlış açılmış bir sorunun veritabanından kalıcı olarak silinmesi.
- **Path Parameters:** `id` (string, required)
- **Authentication:** Bearer Token Gerekli (Bildirimi açan kullanıcı veya Admin)
- **Response:** `200 OK` - Başarıyla silindiğine dair mesaj döner.
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

## 10. Profil Bilgilerini Güncelleme
- **Endpoint:** `PATCH /api/users/profile`
- **Görev:** Kullanıcının kişisel profil bilgilerini güncellemesi.
- **Authentication:** Bearer Token Gerekli
- **Request Body:** 
```json
  {
    "name": "Ceyhun Başkoç",
    "department": "Bilgisayar Mühendisliği"
  }
  ```
- **Response:** `200 OK` - Güncellenmiş kullanıcı profili bilgileri döner.
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

---

## 📋 **Postman Collection Özeti**

| # | Sorgu | Method | URL | Authentication | Body |
|---|---|---|---|---|---|
| 1 | Kayıt Ol | POST | `/api/auth/register` | Hayır | `{name, email, password, role, department}` |
| 2 | Giriş Yap | POST | `/api/auth/login` | Hayır | `{email, password}` |
| 3 | Sorun Oluştur | POST | `/api/issues` | Evet | `multipart/form-data` |
| 4 | Tüm Sorunlar | GET | `/api/issues` | Hayır | - |
| 5 | Filtreleme | GET | `/api/issues?category=CATEGORY` | Hayır | - |
| 6 | Sorun Detayı | GET | `/api/issues/ID` | Hayır | - |
| 7 | Kişisel Sorunlar | GET | `/api/issues/user/my-issues` | Evet | - |
| 8 | Durum Güncelle | PATCH | `/api/issues/ID/status` | Evet | `{status}` |
| 9 | Sorun Sil | DELETE | `/api/issues/ID` | Evet | - |
| 10 | Profil Güncelle | PATCH | `/api/users/profile` | Evet | `{name, department}` |