# Ceyhun Başkoç'un Gereksinimleri

1. **Kullanıcı Hesap Oluşturma**
   - **API Metodu:** `POST /api/auth/register`
   - **Açıklama:** Sisteme dahil olmak isteyen öğrencilerin/kullanıcıların bilgilerini kaydedebilmesi. Kişisel bilgilerin toplanmasını ve hesap oluşturma işlemlerini içerir. Kullanıcılar e-posta adresi, ad ve şifre belirleyerek hesap oluşturur.

2. **Kullanıcı Girişi Yapma**
   - **API Metodu:** `POST /api/auth/login`
   - **Açıklama:** Mevcut kullanıcıların e-posta ve şifreleri ile güvenli bir şekilde sisteme erişim sağlaması. Başarılı girişte oturum anahtarı (token) oluşturulur.

3. **Yeni Sorun Bildirimi Oluşturma**
   - **API Metodu:** `POST /api/issues`
   - **Açıklama:** Kullanıcının kampüs veya şehirdeki bir sorunu konum, açıklama, kategori ve görsel ile kayıt altına alması. Güvenlik için giriş yapmış olmak gerekir.

4. **Tüm Bildirimleri Listeleme**
   - **API Metodu:** `GET /api/issues`
   - **Açıklama:** Ana sayfada kampüs veya şehir genelinde bildirilen tüm sorunların kronolojik olarak (en yeniden eskiye) listelenmesi.

5. **Kategoriye Göre Filtreleme**
   - **API Metodu:** `GET /api/issues?category={kategori}`
   - **Açıklama:** Kullanıcıların sadece "Teknik", "Temizlik" veya "Güvenlik" gibi spesifik kategorideki sorunları görüntüleyebilmesi.

6. **Bildirim Detaylarını Görüntüleme**
   - **API Metodu:** `GET /api/issues/{id}`
   - **Açıklama:** Belirli bir soruna tıklandığında, sorunun detaylı açıklaması, tam konumu ve güncel çözüm durumunun incelenmesi.

7. **Kişisel Bildirimleri Takip Etme**
   - **API Metodu:** `GET /api/issues/my-issues`
   - **Açıklama:** Kişinin sadece kendi açtığı sorunların listesini ve hangi aşamada (Beklemede, Çözüldü vb.) olduğunu görebilmesi. Güvenlik için giriş yapmış olmak gerekir.

8. **Sorun Durumunu Güncelleme**
   - **API Metodu:** `PATCH /api/issues/{id}/status`
   - **Açıklama:** Yetkili kişinin sorunu "Beklemede" durumundan "İnceleniyor" veya "Çözüldü" durumuna getirmesi. Yalnızca yetkili (admin) hesaplar yapabilir.

9. **Hatalı Bildirimi Silme**
   - **API Metodu:** `DELETE /api/issues/{id}`
   - **Açıklama:** Yanlış açılmış veya mükerrer bir kaydın sistemden kaldırılması. Yalnızca bildirimi açan kullanıcı veya yöneticiler silebilir.

10. **Profil Bilgilerini Güncelleme**
    - **API Metodu:** `PUT /api/users/profile`
    - **Açıklama:** Kullanıcının ad, e-posta veya şifre gibi temel profil bilgilerini değiştirebilmesi. Yalnızca kendi bilgilerini güncelleyebilir.