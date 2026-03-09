# Ceyhun Başkoç'un Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** []

## 1. Kullanıcı Hesap Oluşturma Servisi
- **API Endpoint:** `POST /api/auth/register`
- **Görev:** Mobil uygulamada kullanıcı kayıt işlemini gerçekleştiren servis entegrasyonu
- **İşlevler:** API'ye POST isteği gönderme, başarılı kayıtta giriş ekranına yönlendirme, 400 Bad Request hatalarını yakalama.

## 2. Kullanıcı Girişi Yapma Servisi
- **API Endpoint:** `POST /api/auth/login`
- **Görev:** Giriş işlemini yapıp dönen JWT Token'ı güvenli depolama birimine (SecureStorage) kaydetme.
- **İşlevler:** Token parse etme, Authorization header yapılandırması.

## 3. Yeni Sorun Bildirimi Oluşturma Servisi
- **API Endpoint:** `POST /api/issues`
- **Görev:** Cihazın GPS servisinden alınan konum verisini (lat/long) ve form verilerini birleştirip API'ye gönderme.
- **İşlevler:** Multipart/form-data ile görsel yükleme desteği, Bearer Token ekleme.

## 4. Tüm Bildirimleri Listeleme Servisi
- **API Endpoint:** `GET /api/issues`
- **Görev:** Sistemdeki tüm sorunları çekip mobil arayüzdeki listeye aktarma.
- **İşlevler:** Pagination (sayfalama) desteği, offline modda cache'den okuma.

## 5. Kategoriye Göre Filtreleme Servisi
- **API Endpoint:** `GET /api/issues?category={category}`
- **Görev:** Mobildeki kategori sekmelerine tıklandığında query parametresiyle istek atma.

## 6. Bildirim Detaylarını Görüntüleme Servisi
- **API Endpoint:** `GET /api/issues/{id}`
- **Görev:** Tıklanan sorunun ID'sini parametre olarak gönderip detay verilerini JSON olarak parse etme.

## 7. Kişisel Bildirimleri Takip Etme Servisi
- **API Endpoint:** `GET /api/issues/my-issues`
- **Görev:** Kullanıcının token'ı üzerinden sadece kendine ait kayıtları getirme. Auth header zorunlu.

## 8. Sorun Durumunu Güncelleme Servisi
- **API Endpoint:** `PATCH /api/issues/{id}/status`
- **Görev:** Admin yetkili kullanıcının uygulama üzerinden statü dropdown'ını değiştirmesiyle API'ye PATCH isteği atma.

## 9. Hatalı Bildirimi Silme Servisi
- **API Endpoint:** `DELETE /api/issues/{id}`
- **Görev:** Silme onayı sonrası API'ye DELETE isteği atma ve listeyi güncelleme (Cache Invalidation).

## 10. Profil Bilgilerini Güncelleme Servisi
- **API Endpoint:** `PUT /api/users/profile`
- **Görev:** Düzenlenen form verilerini toplayıp PUT isteği ile API'ye iletme, Optimistic UI update uygulama.