# Video Sunum

## Sunum Videosu
> **Video Linki:** []

---

## Sunum Yapısı

### 1. Grup Lideri - Açılış Konuşması (1-2 dakika)
**Konuşma İçeriği:**
> "Merhaba, ben Ceyhun Başkoç. Süleyman Demirel Üniversitesi Bilgisayar Mühendisliği öğrencisiyim. Solo geliştirici olarak SolveIt projesini hazırladım. SolveIt, kampüs ve şehirdeki teknik veya altyapısal sorunların anlık olarak bildirilip takip edilebildiği bir yönetim sistemidir. Bugün sizlere tüm gereksinimlerin canlı demosunu yapacağım."

---

### 2. Kişisel Tanıtım ve Gereksinim Sunumu

#### Ceyhun Başkoç
**Gereksinimler:**
1. **Kullanıcı Hesap Oluşturma & Giriş (Gereksinim 1 ve 2):**
   - API: `POST /api/auth/register` ve `/login`
   - Demo: Ekranda yeni hesap oluşturma ve localStorage'a token gelmesinin gösterilmesi.

2. **Sorun Bildirme (Gereksinim 3):**
   - API: `POST /api/issues`
   - Demo: "Batı Merkezi Derslik Priz Arızası" şeklinde form doldurulup gönderilmesi.

3. **Listeleme ve Filtreleme (Gereksinim 4 ve 5):**
   - API: `GET /api/issues`
   - Demo: Eklenen sorunun ana sayfada anında görünmesi ve kategori menüsünden filtrelenmesi.

4. **Kişisel Takip ve Detaylar (Gereksinim 6 ve 7):**
   - API: `GET /api/issues/my-issues`
   - Demo: Kendi bildirdiği sorunun detaylarına bakılması.

5. **Güncelleme ve Silme (Gereksinim 8, 9 ve 10):**
   - API: `PATCH /api/issues/{id}/status` ve `DELETE`
   - Demo: Yetkili hesabıyla sorunun "Çözüldü" yapılması ve gereksiz kaydın silinmesi.

---

### 3. Grup Lideri - Kapanış Konuşması (1 dakika)
**Konuşma İçeriği:**
> "Gördüğünüz gibi UniFix projemizdeki 10 temel gereksinimin tamamı, veritabanı, backend ve frontend bağlantısıyla uçtan uca çalışmaktadır. İzlediğiniz için teşekkür ederim."