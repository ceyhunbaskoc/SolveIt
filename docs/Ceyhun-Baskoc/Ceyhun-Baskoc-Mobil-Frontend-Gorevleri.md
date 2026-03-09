# Ceyhun Başkoç'un Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** []

## 1. Kullanıcı Hesap Oluşturma Ekranı
- **UI Bileşenleri:** E-posta, Ad, Şifre inputları. Kayıt Ol butonu.
- **Kullanıcı Deneyimi:** Şifre gücü göstergesi, real-time e-posta validasyonu.

## 2. Kullanıcı Girişi Ekranı
- **UI Bileşenleri:** E-posta ve şifre giriş alanları. Giriş yap butonu ve loading spinner.
- **Kullanıcı Deneyimi:** Yanlış şifrede sarsıntı (shake) animasyonu ve hata snackbar'ı.

## 3. Yeni Sorun Bildirimi Form Ekranı
- **UI Bileşenleri:** Başlık input, kategori dropdown, açıklama textarea, "Konumumu Bul" butonu ve görsel yükleme alanı.
- **Kullanıcı Deneyimi:** GPS izni isteme dialog'u, form boşken kaydet butonunun pasif (disabled) olması.

## 4. Tüm Bildirimleri Listeleme Ekranı (Ana Sayfa)
- **UI Bileşenleri:** Sorun kartları (Card) içeren kaydırılabilir liste (RecyclerView/FlatList). Kartlarda başlık, kategori ve durum (renkli badge) gösterimi.
- **Kullanıcı Deneyimi:** Pull-to-refresh özelliği, veriler yüklenirken skeleton ekran gösterimi.

## 5. Kategori Filtreleme Barı
- **UI Bileşenleri:** Ana sayfanın üst kısmında yatay kaydırılabilir kategori çipleri (Chips).
- **Kullanıcı Deneyimi:** Seçilen kategoriye göre anında listenin filtrelenmesi ve boş state ekranı.

## 6. Bildirim Detay Ekranı
- **UI Bileşenleri:** Büyük görsel alanı, detaylı metin, harita görünümü (Map component) ve sorunu bildiren kişi bilgisi.
- **Kullanıcı Deneyimi:** Akıcı sayfa geçiş animasyonu, geri butonu entegrasyonu.

## 7. Kişisel Bildirimlerim Ekranı (Profil Sekmesi)
- **UI Bileşenleri:** Sadece kullanıcının kendi açtığı sorunların listelendiği ayrı bir tab arayüzü.
- **Kullanıcı Deneyimi:** Boş durum (Empty State) için "Henüz bir sorun bildirmediniz" mesajı.

## 8. Sorun Durumu Güncelleme UI (Admin)
- **UI Bileşenleri:** Detay ekranında sadece adminlere görünen statü değiştirme (BottomSheet veya Dropdown) arayüzü.
- **Kullanıcı Deneyimi:** Değişiklik sonrası onay toast mesajı.

## 9. Bildirim Silme Akışı
- **UI Bileşenleri:** Kendi bildirimi üzerinde sağ üstte çöp kutusu ikonu.
- **Kullanıcı Deneyimi:** "Bu bildirimi silmek istediğinize emin misiniz?" onay dialog'u.

## 10. Profil Düzenleme Ekranı
- **UI Bileşenleri:** Mevcut bilgilerin dolu geldiği input alanları. Kaydet ve İptal butonları.
- **Kullanıcı Deneyimi:** Klavye açıldığında inputların görünür kalması (ScrollView/KeyboardAvoidingView).