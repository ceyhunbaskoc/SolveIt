# Ceyhun Başkoç'un Mobil Frontend Görevleri

**Mobile Front-end Demo Videosu:** *(Eklenecek)*

Bu dokümanda, SolveIt (Kampüs ve Şehir Sorun Bildirim Sistemi) mobil uygulaması için geliştirilen ekranlar, UI bileşenleri ve kullanıcı deneyimi detaylarıyla anlatılmıştır.

> ⚠️ **ÖNEMLİ UYARI:** Render'ın ücretsiz versiyonu kullanıldığı için ilk API isteğinde backend'in uyanması **30-40 saniye sürebilir**.

**Platform:** React Native (Expo) — iOS ve Android  
**Tasarım Dili:** Koyu tema, neon yeşil `#C3F746` vurgu rengi, `#0F1010` arka plan

---

## 1. Kullanıcı Hesap Oluşturma Ekranı (`RegisterScreen`)
- **API Endpoint:** `POST /api/auth/register`
- **UI Bileşenleri:**
  - Ad Soyad `TextInput` (autoComplete="name", returnKeyType="next")
  - E-posta `TextInput` (keyboardType="email-address", autoCapitalize="none")
  - Şifre `TextInput` (secureTextEntry, göster/gizle toggle ikonu)
  - Departman `TextInput` (opsiyonel, placeholder="Bilgisayar Mühendisliği")
  - "Kayıt Ol" `TouchableOpacity` butonu (neon yeşil, loading spinner)
  - "Zaten hesabınız var mı? Giriş Yap" link metni
- **Form Validasyonu:**
  - E-posta format kontrolü (regex)
  - Şifre minimum 6 karakter
  - Ad minimum 3 karakter
  - Hatalar input alanının hemen altında kırmızı metin olarak gösterilir
- **Kullanıcı Deneyimi:**
  - Başarılı kayıtta token SecureStore'a kaydedilir, Tab Navigator aktif edilir
  - Hata durumunda toast notification (kırmızı arka plan, üstten giriş)
  - Klavye açıkken form `KeyboardAvoidingView` ile kaymaz
- **Teknik Detaylar:** React Navigation Stack, `expo-secure-store`, `axios` ile `POST /api/auth/register`

---

## 2. Kullanıcı Girişi Ekranı (`LoginScreen`)
- **API Endpoint:** `POST /api/auth/login`
- **UI Bileşenleri:**
  - Uygulama logosu ve "SolveIt" başlığı (merkezde)
  - E-posta `TextInput` (keyboardType="email-address")
  - Şifre `TextInput` (secureTextEntry toggle)
  - "Giriş Yap" butonu (disabled ve loading state)
  - "Hesabınız yok mu? Kayıt Ol" linki
- **Kullanıcı Deneyimi:**
  - Yanlış kimlik bilgisinde form `Animated.shake` animasyonu
  - Başarılı girişte `AuthContext` güncellenerek Tab Navigator'a geçiş
  - "Beni Hatırla" toggle: token kalıcı olarak SecureStore'da saklanır
- **Teknik Detaylar:** AuthContext, JWT parse (`role` alanından admin kontrolü), `expo-secure-store`

---

## 3. Ana Sayfa — Tüm Bildirimleri Listeleme (`HomeScreen`)
- **API Endpoint:** `GET /api/issues` / `GET /api/issues?category={kategori}`
- **UI Bileşenleri:**
  - Üstte yatay kaydırılabilir kategori chip'leri (Tümü, Altyapı, Temizlik, Güvenlik...)
  - `FlatList` ile sorun kartları (her kart: başlık, kategori badge, durum badge, tarih, upvote/downvote butonları)
  - Renkli durum badge'leri: turuncu (Beklemede), mavi (İnceleniyor), yeşil (Çözüldü)
  - Sağ altta Yeni Bildirim FAB butonu (`+`, neon yeşil)
  - Yükleme sırasında 6 adet shimmer skeleton kart
  - Boş durumda "Henüz sorun bildirilmedi" empty state ve bildirim butonu
- **Kullanıcı Deneyimi:**
  - Kategori chip'e tıklayınca liste anında filtrelenir
  - Aşağı çekince pull-to-refresh → API'den güncel veri çekilir
  - Socket.io `statusUpdated` ve `voteUpdated` eventleri ile sayfayı yenilemeden güncelleme
- **Teknik Detaylar:** `FlatList` + `keyExtractor`, Socket.io client, `useFocusEffect` ile ekran odaklanınca yenileme

---

## 4. Sorun Bildirme Formu (`ReportIssueScreen`)
- **API Endpoint:** `POST /api/issues`
- **UI Bileşenleri:**
  - Başlık `TextInput` (maxLength=100, karakter sayacı)
  - Kategori `Picker` dropdown (altyapi, temizlik, guvenlik, ulasim, yesilalan, aydinlatma, diger)
  - Açıklama `TextInput` (multiline, 5 satır, min 20 karakter sayacı)
  - "Mevcut Konumu Kullan" butonu (GPS ikonu, konum alınca koordinat gösterir)
  - Görsel yükleme alanı: "Galeriden Seç" / "Kameradan Çek" ActionSheet
  - Görsel önizleme thumbnail (sil X butonu ile)
  - "Sorunu Bildir" submit butonu (yeşil, loading)
- **Form Validasyonu:**
  - Başlık boş veya 5 karakterden kısa ise submit disabled
  - Açıklama 20 karakterden kısa ise submit disabled
  - Görsel 5MB'dan büyük ise "Görsel boyutu çok büyük" uyarısı
- **Kullanıcı Deneyimi:**
  - GPS konum alınırken spinner gösterilir; hata durumuna göre "İzin reddedildi" uyarısı
  - Başarıda "+10 XP kazandınız!" toast ve Ana Sayfa'ya yönlendirme
- **Teknik Detaylar:** `expo-image-picker`, `expo-location`, `FormData`, `multipart/form-data` ile Axios

---

## 5. Kategori Filtreleme Bileşeni
- **API Endpoint:** `GET /api/issues?category={kategoriAdı}`
- **UI Bileşenleri:**
  - Yatay `ScrollView` içinde kategori chip'leri
  - Aktif kategori: neon yeşil arka plan, siyah metin, gölge efekti
  - Pasif kategori: koyu gri arka plan (`#2A2B2B`), gri metin
  - "Tümü" chip'i en başta, seçilince filtreyi temizler
- **Kullanıcı Deneyimi:**
  - Seçim anında API isteği atılır (debounce 300ms)
  - Seçili kategoride sonuç yoksa "Bu kategoride sorun bulunmuyor" empty state
  - Aktif filtre chip'i seçildiğinde "Tümü"ne döner (toggle)
- **Teknik Detaylar:** `useState(selectedCategory)`, category state değişince `useEffect` ile `fetchIssues` tetiklenir

---

## 6. Sorun Detay Ekranı (`IssueDetailScreen`)
- **API Endpoint:** `GET /api/issues/{id}`
- **UI Bileşenleri:**
  - Sorun görseli (tam genişlik, `expo-image` önbellekleme)
  - Başlık (H1 boyutu, beyaz metin)
  - Kategori ve durum badge'leri (yan yana)
  - Açıklama metni (kaydırılabilir)
  - Bildiren kişi ve tarih bilgisi
  - Upvote / Downvote butonları ve skor
  - Konum varsa `react-native-maps` ile mini harita kartı
  - "Haritada Aç" butonu (native maps app'e yönlendirme)
  - Yorumlar bölümü: `FlatList` ile yorum listesi
  - Yorum yazma `TextInput` + "Gönder" butonu (giriş yapılmışsa görünür)
  - Sorun sahibi veya admin için: durum değiştirme `Picker` + Sil butonu
- **Kullanıcı Deneyimi:**
  - Ekran açılırken skeleton loading
  - Yorum gönderince klavye kapanır, liste otomatik en alta iner
  - Socket.io `newComment` eventi ile yorum listesi anlık güncellenir
- **Teknik Detaylar:** `useRoute().params.id`, Stack Navigator, `ScrollView` + `KeyboardAvoidingView`

---

## 7. Kişisel Bildirimlerim Ekranı (`MyIssuesScreen`)
- **API Endpoint:** `GET /api/issues/user/my-issues`
- **UI Bileşenleri:**
  - 4'lü istatistik satırı: Toplam / Beklemede / İnceleniyor / Çözüldü sayıları
  - `FlatList` ile kişisel sorun kartları
  - Her kartta: başlık, kategori, durum, tarih + görsel thumbnail (varsa)
  - Kart üzerine long press veya sağa kaydırma ile "Sil" butonu
  - Kart içinde durum değiştirme `Picker` (sahibi için görünür)
  - Boş durumda "Henüz bildirim açmadınız" empty state + "İlk Sorunu Bildir" butonu
- **Kullanıcı Deneyimi:**
  - Silme öncesi `Alert.alert` onay dialog'u
  - Başarılı silmede kart listeden smooth animasyonla kaldırılır
  - Socket.io ile durum güncellemeleri anında yansır
- **Teknik Detaylar:** Auth guard (giriş yapılmamışsa Login ekranına yönlendirme), `useFocusEffect`

---

## 8. Durum Güncelleme Arayüzü (Admin)
- **API Endpoint:** `PATCH /api/issues/{id}/status`
- **UI Bileşenleri:**
  - Detay ekranında yalnızca `role === 'admin'` veya sorun sahibine görünen bölüm
  - iOS'ta `ActionSheet`, Android'de `BottomSheet` ile durum seçimi
  - Seçenekler: "Beklemede", "İnceleniyor", "Çözüldü" (mevcut durum işaretli)
  - Seçim sonrası onay butonu ("Güncelle")
- **Kullanıcı Deneyimi:**
  - RESOLVED seçilince "Sorun sahibine +20 XP verilecek. Onaylıyor musunuz?" alert
  - Başarıda yeşil toast + durum badge'i animasyonla güncellenir
  - Hata durumunda kırmızı toast ve önceki duruma geri döner
- **Teknik Detaylar:** `useMemo(() => canEdit)` ile yetki kontrolü, optimistic UI update

---

## 9. Bildirim Silme Akışı
- **API Endpoint:** `DELETE /api/issues/{id}`
- **UI Bileşenleri:**
  - Detay ekranında çöp kutusu ikonu (kırmızı, sağ üstte)
  - `Alert.alert` ile "Bu sorunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz." dialog'u
  - "Sil" ve "İptal" butonları (Sil → kırmızı)
  - Silme sırasında buton loading spinner'a dönüşür
- **Kullanıcı Deneyimi:**
  - Optimistic UI: kart önce listeden kaldırılır, hata olursa geri eklenir
  - Başarıda yeşil toast + bir önceki ekrana navigate(-1)
  - Silme işlemi yalnızca sorun sahibi veya adminde görünür
- **Teknik Detaylar:** `Alert.alert` native dialog, `navigation.goBack()`, `setIssues(prev => prev.filter(...))`

---

## 10. Profil Düzenleme Ekranı (`ProfileScreen`)
- **API Endpoint:** `PATCH /api/users/profile`, `GET /api/auth/me`
- **UI Bileşenleri:**
  - Üstte XP ve seviye kartı (mavi-mor gradient, animated progress bar)
  - Seviye rozeti: 🌱 Duyarlı Vatandaş / 👁️ Aktif Gözlemci / 🏆 Şehir Kahramanı
  - Ad Soyad `TextInput` (mevcut değerle dolu)
  - E-posta `TextInput` (mevcut değerle dolu)
  - Departman `TextInput`
  - "Değişiklikleri Kaydet" butonu (yeşil)
  - "İptal" butonu (gri, history.goBack)
  - Hesap bilgileri kartı: kayıt tarihi, rol, XP
- **Kullanıcı Deneyimi:**
  - `useFocusEffect` ile ekran açılınca `GET /api/auth/me` ile güncel XP çekilir
  - XP değişmişse progress bar animasyonla güncellenir
  - Başarılı güncellemede toast + AuthContext güncelleme
- **Teknik Detaylar:** `useFocusEffect`, `Animated.Value` ile XP progress bar, `expo-secure-store` güncelleme

---

## 11. Liderlik Tablosu Ekranı (`LeaderboardScreen`)
- **API Endpoint:** `GET /api/users/leaderboard`
- **UI Bileşenleri:**
  - "🏆 Liderlik Tablosu" başlığı (merkezde)
  - `FlatList` ile top 10 kullanıcı listesi
  - 1. sıra: altın gradient kart 🥇, 2. sıra: gümüş 🥈, 3. sıra: bronz 🥉
  - Her satırda: sıra numarası, isim, departman, seviye rozeti, XP puanı
  - Mevcut kullanıcı yeşil kenarlıkla vurgulanır
  - Alt bölümde "XP Nasıl Kazanılır?" bilgi kartı
- **Kullanıcı Deneyimi:**
  - Ekran ilk açılışında skeleton satırlar gösterilir
  - Pull-to-refresh ile yenileme
  - Mevcut kullanıcı listede otomatik görünür konuma kaydırılır
- **Teknik Detaylar:** `FlatList`, `useRef(flatListRef).scrollToIndex()`, `isCurrentUser` karşılaştırması

---

## 12. Sorun Haritası Ekranı (`MapScreen`)
- **API Endpoint:** `GET /api/issues`
- **UI Bileşenleri:**
  - Tam ekran `react-native-maps` `MapView` (OpenStreetMap tile)
  - Her sorun için özel renkli `Marker` (kırmızı: Beklemede, turuncu: İnceleniyor, yeşil: Çözüldü)
  - Marker'a tıklayınca `Callout` popup: başlık, kategori, durum, "Detayı Gör" butonu
  - Kullanıcı konumu mavi nokta `Marker` ile gösterilir
  - Sol üstte legend kartı (renk açıklamaları)
  - Sağ altta "Konumuma Git" butonu (GPS ikonu)
- **Kullanıcı Deneyimi:**
  - Konum izni yoksa "Konum izni verilmedi" toast + varsayılan SDÜ Kampüsü koordinatları (`37.7648, 30.5566`)
  - "Detaya Git" butonuna tıklayınca `IssueDetailScreen`'e push
  - IssueDetail'den gelen `center` state parametresi varsa harita o konuma zoom yapar
- **Teknik Detaylar:** `react-native-maps`, `expo-location`, `navigation.navigate('IssueDetail', { id })`

---

## 13. Yönetici Paneli Ekranı (`AdminDashboard`)
- **API Endpoint:** `GET /api/issues`, `PATCH /api/issues/{id}/status`, `DELETE /api/issues/{id}`
- **UI Bileşenleri:**
  - Yalnızca `role === 'admin'` için Tab Navigator'da görünen "Yönetici" sekmesi
  - İstatistik satırı: Toplam / Beklemede / İnceleniyor / Çözüldü sayıları
  - `react-native-chart-kit` ile pasta grafik (durum dağılımı)
  - `FlatList` tablo görünümü: tarih, başlık, kategori, bildiren, durum dropdown, sil butonu
- **Kullanıcı Deneyimi:**
  - Admin değilse bu ekrana navigate edilmeden Tab item görünmez
  - Durum değişikliği anında tablo satırını günceller
  - Silme işleminde `Alert.alert` onay dialog'u
- **Teknik Detaylar:** Role-based tab rendering, `react-native-chart-kit`, optimistic update

---

## 📋 Teknoloji Stack'i

### Framework ve Araçlar
- React Native (Expo SDK)
- React Navigation (Stack + Bottom Tab Navigator)
- Axios (HTTP Client)
- Socket.io-client (Gerçek zamanlı)
- react-native-maps (Harita)
- expo-location (GPS)
- expo-image-picker (Görsel seçimi)
- expo-secure-store (Token güvenliği)
- react-native-chart-kit (Admin grafikleri)
- react-hot-toast / react-native-toast-message (Bildirimler)

### Tasarım
- Koyu tema: `#0F1010` arka plan, `#C3F746` neon yeşil, `#F7721A` neon turuncu
- Rounded card style (borderRadius: 20)
- TailwindCSS benzeri spacing (8dp grid)
