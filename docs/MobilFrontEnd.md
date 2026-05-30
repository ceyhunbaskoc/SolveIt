# Mobil Frontend Görev Dağılımı

**Mobil Uygulama Adı:** SolveIt Mobile  
**Platform:** React Native (Expo) — iOS ve Android

Bu dokümanda, SolveIt mobil uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) mimari prensipleri ile ekip görev dağılımı listelenmektedir. Mobil uygulama, web arayüzüyle aynı tasarım dili ve renk paletini kullanır.

---

## Grup Üyelerinin Mobil Frontend Görevleri

1. [Ceyhun Başkoç'un Mobil Frontend Görevleri](Ceyhun-Baskoc/Ceyhun-Baskoc-Mobil-Frontend-Gorevleri.md)

---

## Genel Mobil Frontend Prensipleri

### 1. Tasarım Sistemi ve Renk Paleti
- **Birincil Renk:** `#C3F746` (Neon Yeşil) — aktif butonlar, başarı durumları
- **İkincil Renk:** `#F7721A` (Neon Turuncu) — uyarılar, bekleyen durum
- **Arka Plan:** `#0F1010` (Koyu Siyah), **Kart Yüzeyi:** `#161717`, **Kenarlık:** `#2A2B2B`
- **Metin:** Birincil `#FFFFFF`, İkincil `#9CA3AF` (gray-400)
- **Tipografi:** System font (iOS: SF Pro, Android: Roboto); başlık 24sp/bold, gövde 14sp/regular
- **Spacing:** 8dp grid sistemi; kart padding 16dp, ekran kenar boşluğu 16dp

### 2. Navigasyon Yapısı
- **Bottom Tab Navigator:** Ana Sayfa, Yeni Bildirim, Bildirimlerim, Profil sekmeleri
- **Stack Navigator:** Her tab içinde detay ekranlarına geçiş için
- **Auth Navigator:** Giriş/Kayıt ekranları için ayrı stack (oturum yoksa otomatik yönlendirme)
- Admin rolü için tab bar'a "Yönetici" sekmesi eklenir
- Deep link desteği: `solveit://issues/:id` formatında doğrudan detay açma

### 3. Responsive Tasarım ve Ekran Uyumu
- Küçük ekran (< 375dp) ile büyük ekran (> 414dp) arası fluid layout
- Landscape modda yatay scrollable grid veya split-view
- iPhone notch ve Android status bar için `SafeAreaView` kullanımı
- Tablet (iPad/Android tablet) için iki sütunlu kart grid'i
- Minimum dokunma hedefi 44×44pt/dp (erişilebilirlik standardı)

### 4. Kullanıcı Deneyimi (UX) Standartları
- **Loading States:** Veri yüklenirken animasyonlu skeleton kartlar (shimmer effect)
- **Empty States:** Her ekran için özel illüstrasyon ve yönlendirici buton
- **Error States:** Bağlantı hatası için retry butonu, toast notification
- **Pull-to-Refresh:** Tüm liste ekranlarında aşağı çekince yenileme
- **Haptic Feedback:** Başarılı upvote, silme onayı gibi aksiyonlarda titreşim geri bildirimi

### 5. Durum Renk Kodlaması
Uygulama genelinde tutarlı durum renkleri:
- **PENDING (Beklemede):** `#F7721A` turuncu badge
- **IN_PROGRESS (İnceleniyor):** `#3B82F6` mavi badge
- **RESOLVED (Çözüldü):** `#C3F746` neon yeşil badge

### 6. Form Yönetimi ve Validasyon
- Real-time validasyon: kullanıcı yazarken hata mesajı gösterilir
- Hata mesajları ilgili input alanının hemen altında kırmızı renkte
- Klavye açıldığında form alanları görünür kalır (`KeyboardAvoidingView`)
- Zorunlu alanlar boşken "Gönder" butonu `disabled` durumda
- `title` min 5 karakter, `description` min 20 karakter kuralı uygulanır

### 7. Görsel Yükleme ve Kamera Entegrasyonu
- Resim seçme için aksiyon sheet: "Galeriden Seç" / "Kameradan Çek" seçenekleri
- Seçilen görsel form içinde önizleme thumbnail'i olarak gösterilir
- Maksimum 5MB dosya boyutu kontrolü, yalnızca `image/*` MIME türleri kabul edilir
- Yükleme sırasında circular progress indicator

### 8. Harita Entegrasyonu (Leaflet.js + OpenStreetMap)
- Sorun konumlarını haritada göstermek için `react-native-webview` içinde **Leaflet.js** kullanılır; Google Maps API key gerektirmez
- OpenStreetMap tile katmanı üzerinde durum bazlı renkli nokta marker'lar (sarı: Beklemede, mavi: İnceleniyor, yeşil: Çözüldü)
- Marker popup'ında sorun başlığı, durum ve "Detay →" butonu; butona tıklayınca WebView'dan React Native'e `postMessage` ile `IssueDetail` ekranına geçiş
- Harita SDÜ kampüs merkezi (37.7572, 30.5247) konumunu varsayılan olarak gösterir
- Konum bilgisi olmayan sorunlar haritada gösterilmez; sağ üstte aktif konum sayısı badge'i

### 9. Gerçek Zamanlı Güncelleme UI
- Socket.io `statusUpdated` eventi gelince ilgili kart otomatik güncellenir (sayfa yenilemesi gerekmez)
- `voteUpdated` eventi ile oy sayıları anlık güncellenir
- `newComment` eventi ile yorum listesi otomatik uzar
- Yeni güncelleme geldiğinde karta kısa süreli highlight (pulse) animasyonu uygulanır

### 10. Gamification Arayüzü (XP ve Liderlik)
- Profil ekranında animated XP progress bar (mevcut seviyeye göre doluluk)
- Seviye rozetleri: 🌱 Duyarlı Vatandaş (0-49), 👁️ Aktif Gözlemci (50-149), 🏆 Şehir Kahramanı (150+)
- Sorun çözüldüğünde "+20 XP" confetti animasyonu ve toast bildirimi
- Liderlik tablosunda 🥇🥈🥉 rozetleri ve mevcut kullanıcı vurgulaması

### 11. Erişilebilirlik (Accessibility)
- Tüm bileşenlerde `accessibilityLabel` ve `accessibilityHint` tanımlanır
- VoiceOver (iOS) ve TalkBack (Android) uyumluluğu test edilir
- Renk körü uyumu için badge'lerde renk yanı sıra ikon/metin de kullanılır
- Sistem font boyutu büyütüldüğünde layout bozulmaması için dinamik boyutlandırma

### 12. Performans Optimizasyonu
- Liste ekranlarında `FlatList` ile virtualized rendering (büyük veri setleri için)
- Görsel önbellekleme için `expo-image` veya `react-native-fast-image`
- `useMemo` ve `useCallback` ile gereksiz render engeli
- Ekran geçişlerinde `InteractionManager` ile ağır işlemleri sıralama
- Bundle boyutu için `react-native-svg` ikonları (font icon yerine)
