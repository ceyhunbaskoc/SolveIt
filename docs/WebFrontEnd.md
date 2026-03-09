# Web Frontend Görev Dağılımı ve Prensipleri

**Web Frontend Adresi:** `http://localhost:3000` (Geliştirme Ortamı)

Bu dokümanda, SolveIt web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) mimarisinin genel kuralları ve ekip görev dağılımı listelenmektedir.

---

## Grup Üyelerinin Web Frontend Görevleri

Proje "Solo Developer" mimarisiyle ilerlediği için tüm frontend modüllerinden tek bir üye sorumludur.

1. [Ceyhun Başkoç'un Web Frontend Görevleri](Ceyhun-Baskoc/Ceyhun-Baskoc-Web-Frontend-Gorevleri.md)

---

## Genel Web Frontend Prensipleri

UniFix projesinin web arayüzü geliştirilirken uyulması gereken temel standartlar aşağıdadır:

### 1. Responsive Tasarım (Duyarlı Arayüz)
- **Mobile-First Approach:** Önce mobil cihazlara uygun tasarım, ardından masaüstü (Desktop) genişletmesi yapılmalıdır.
- **Flexible Layouts:** Tasarımda statik pikseller yerine CSS Grid ve Flexbox mantığı (Bootstrap 5 grid sistemi) kullanılmalıdır.
- **Touch-Friendly:** Mobil tarayıcılarda rahat kullanım için tıklanabilir alanlar minimum 44x44px olmalıdır.

### 2. Tasarım Sistemi ve UI Bileşenleri
- **CSS Framework:** Hızlı ve tutarlı bir arayüz için Bootstrap 5 tercih edilmiştir.
- **Renk Paleti:** Sorunların durumunu belirten semantik renkler kullanılmalıdır (Örn: Beklemede -> Sarı/Warning, Çözüldü -> Yeşil/Success).
- **Iconography:** Kullanıcı deneyimini artırmak için Font Awesome veya Bootstrap Icons kullanılmalıdır.

### 3. API Entegrasyonu ve Veri Akışı
- **HTTP Client:** Backend ile iletişim kurmak için native `Fetch API` veya `Axios` kullanılacaktır.
- **Request Headers:** Kimlik doğrulaması gerektiren işlemlerde JWT Token, `Authorization: Bearer {token}` formatında gönderilmelidir.
- **Asenkron Yapı:** API istekleri mutlaka `async/await` mimarisiyle ele alınmalı ve sayfa donmaları engellenmelidir.

### 4. Hata ve Durum Yönetimi (State Management)
- **Loading States:** API'den veri beklenirken kullanıcılara mutlaka görsel bir geribildirim (Loading spinner veya skeleton ekran) sunulmalıdır.
- **Error Handling:** Backend'den dönen 400 ve 500 serisi hatalar (Örn: "Şifre yanlış", "Zorunlu alan eksik"), kullanıcı dostu bildirimler (Alert/Toast) olarak ekrana yansıtılmalıdır.

### 5. Tarayıcı İçi Depolama (Storage)
- **Kimlik Yönetimi:** Başarılı giriş sonrası alınan JWT token güvenlik amacıyla `localStorage` veya `sessionStorage` içerisinde tutulmalıdır.
- **Oturum Kapatma:** Kullanıcı çıkış yaptığında (Logout) depolanan token verisi tarayıcıdan temizlenmelidir.

### 6. Form Doğrulama (Validation)
- **Client-Side Validation:** Gereksiz sunucu yorgunluğunu önlemek için, e-posta formatı, boş alan kontrolü ve şifre uzunluğu gibi temel doğrulamalar HTML5 veya JavaScript ile arayüz tarafında (backend'e istek gitmeden önce) yapılmalıdır.