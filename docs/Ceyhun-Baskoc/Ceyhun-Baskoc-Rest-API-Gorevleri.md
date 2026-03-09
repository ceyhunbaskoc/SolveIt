# Ceyhun Başkoç'un REST API Metotları

**API Test Videosu:** []

Bu dokümanda, SolveIt (Kampüs ve Şehir Sorun Bildirim Sistemi) projesi için geliştirilen 10 temel fonksiyonel gereksinimin RESTful API uç noktaları, istek (request) ve yanıt (response) yapıları detaylandırılmıştır.

## 1. Kullanıcı Hesap Oluşturma
- **Endpoint:** `POST /api/auth/register`
- **Görev:** Sisteme yeni öğrenci/vatandaş kaydı oluşturur.
- **Request Body:** ```json
  {
    "name": "Ceyhun Başkoç",
    "email": "ceyhun@sdu.edu.tr",
    "password": "GuvenliSifre123!",
    "role": "user"
  }
  ```
- **Response:** `201 Created` - Başarılı kayıt sonrası JWT token döner.

## 2. Kullanıcı Girişi Yapma
- **Endpoint:** `POST /api/auth/login`
- **Görev:** Mevcut kullanıcıların sisteme giriş yapmasını sağlar.
- **Request Body:** ```json
  {
    "email": "ceyhun@sdu.edu.tr",
    "password": "GuvenliSifre123!"
  }
  ```
- **Response:** `200 OK` - Başarılı girişte oturum yönetimi için Bearer Token döner.

## 3. Yeni Sorun Bildirimi Oluşturma
- **Endpoint:** `POST /api/issues`
- **Görev:** Kullanıcının kampüs (örn: Batı Merkezi Derslik) veya şehirdeki bir sorunu bildirmesi.
- **Authentication:** Bearer Token Gerekli
- **Request Body:** ```json
  {
    "title": "Kütüphane İnternet Arızası",
    "description": "Zemin katta eduroam ağına bağlanılamıyor.",
    "category": "Teknik",
    "location": {
      "latitude": 37.8322,
      "longitude": 30.5260
    }
  }
  ```
- **Response:** `201 Created` - Oluşturulan sorunun detayları ve ID'si döner.

## 4. Tüm Bildirimleri Listeleme
- **Endpoint:** `GET /api/issues`
- **Görev:** Sistemde kayıtlı tüm açık sorunları kronolojik olarak listeler.
- **Authentication:** Gerekli Değil (Açık Endpoint)
- **Response:** `200 OK` - Sorun (Issue) objelerinden oluşan bir JSON dizisi (Array) döner.

## 5. Kategoriye Göre Filtreleme
- **Endpoint:** `GET /api/issues?category={kategoriAdı}`
- **Görev:** Listelenen sorunları belirli bir kategoriye göre filtreler.
- **Query Parameters:** `category` (string, required)
- **Response:** `200 OK` - Yalnızca belirtilen kategoriyle eşleşen sorunların listesi döner.

## 6. Bildirim Detaylarını Görüntüleme
- **Endpoint:** `GET /api/issues/{id}`
- **Görev:** Spesifik bir sorunun tüm detaylarını, tam konumunu ve durumunu getirir.
- **Path Parameters:** `id` (string, required) - Sorunun benzersiz ID'si
- **Response:** `200 OK` - Tekil sorun (Issue) objesi döner.

## 7. Kişisel Bildirimleri Takip Etme
- **Endpoint:** `GET /api/issues/my-issues`
- **Görev:** Giriş yapmış kullanıcının sadece kendi oluşturduğu sorun kayıtlarını listeler.
- **Authentication:** Bearer Token Gerekli
- **Response:** `200 OK` - Kullanıcının ID'si ile eşleşen sorunların listesi döner.

## 8. Sorun Durumunu Güncelleme
- **Endpoint:** `PATCH /api/issues/{id}/status`
- **Görev:** Yetkili (Admin) kişinin sorunun durumunu "Beklemede", "İnceleniyor" veya "Çözüldü" olarak güncellemesi.
- **Path Parameters:** `id` (string, required)
- **Authentication:** Bearer Token Gerekli (Sadece Admin yetkisi olanlar)
- **Request Body:** ```json
  {
    "status": "RESOLVED"
  }
  ```
- **Response:** `200 OK` - Güncellenmiş sorun verisi döner.

## 9. Hatalı Bildirimi Silme
- **Endpoint:** `DELETE /api/issues/{id}`
- **Görev:** Yanlış açılmış bir sorunun veritabanından kalıcı olarak silinmesi.
- **Path Parameters:** `id` (string, required)
- **Authentication:** Bearer Token Gerekli (Bildirimi açan kullanıcı veya Admin)
- **Response:** `204 No Content` - Başarıyla silindiğine dair statü kodu döner.

## 10. Profil Bilgilerini Güncelleme
- **Endpoint:** `PUT /api/users/profile`
- **Görev:** Kullanıcının kişisel profil bilgilerini (ad, iletişim) güncellemesi.
- **Authentication:** Bearer Token Gerekli
- **Request Body:** ```json
  {
    "name": "Ceyhun Başkoç",
    "department": "Bilgisayar Mühendisliği"
  }
  ```
- **Response:** `200 OK` - Güncellenmiş kullanıcı profili bilgileri döner.