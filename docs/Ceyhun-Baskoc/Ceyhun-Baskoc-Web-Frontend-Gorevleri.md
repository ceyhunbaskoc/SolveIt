# Ceyhun Başkoç'un Web Frontend Görevleri
**Front-end Test Videosu:** []

## 1. Kullanıcı Hesap Oluşturma Sayfası
- **UI Bileşenleri:** Kayıt formu (HTML5 input).
- **İşlev:** POST isteği ile form verisini backend'e yollama.

## 2. Kullanıcı Girişi Sayfası
- **UI Bileşenleri:** E-posta ve şifre inputları.
- **İşlev:** Giriş sonrası gelen Token'ı `localStorage`'a kaydetme.

## 3. Yeni Sorun Bildirimi Formu (Ana Sayfa Yan Panel)
- **UI Bileşenleri:** Başlık (input), Kategori (select), Açıklama (textarea).
- **İşlev:** PreventDefault ile sayfa yenilenmesini durdurup fetch POST atılması.

## 4. Tüm Bildirimleri Listeleme Dashboard'u
- **UI Bileşenleri:** Bootstrap Card yapıları. Listeyi render eden JavaScript döngüsü.
- **İşlev:** DOM manipülasyonu ile `innerHTML` kullanarak sorunları ekrana basma.

## 5. Kategori Filtreleme Arayüzü
- **UI Bileşenleri:** Yan tarafta filtreleme linkleri veya butonları.
- **İşlev:** Tıklanan butona göre API URL'sini değiştirip yeniden veri çekme.

## 6. Bildirim Detayı Modal/Sayfası
- **UI Bileşenleri:** Bootstrap Modal.
- **İşlev:** "Detaylar" butonuna basıldığında o sorunun içeriğini modal içine doldurma.

## 7. Kişisel Bildirimlerim Paneli
- **UI Bileşenleri:** "Benim Bildirimlerim" sekmesi.
- **İşlev:** Auth token gönderilerek `my-issues` rotasından verilerin çekilip gösterilmesi.

## 8. Durum Güncelleme Butonları (Admin UI)
- **UI Bileşenleri:** Kartların üzerindeki "Çözüldü İşaretle" butonları.
- **İşlev:** Tıklandığında statüyü değiştiren PATCH isteği.

## 9. Bildirim Silme Arayüzü
- **UI Bileşenleri:** Kırmızı çöp kutusu butonu ve `window.confirm` onay kutusu.
- **İşlev:** DELETE isteği sonrası listeden ilgili HTML elementinin (kartın) anında silinmesi.

## 10. Profil Düzenleme Sayfası
- **UI Bileşenleri:** Profil ayarları formu.
- **İşlev:** Mevcut verinin inputlara doldurulması ve PUT isteğiyle güncellenmesi.