import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api from '../utils/api';

const CATEGORIES = [
  { id: 'altyapi', name: 'Altyapı' },
  { id: 'temizlik', name: 'Temizlik' },
  { id: 'guvenlik', name: 'Güvenlik' },
  { id: 'ulasim', name: 'Ulaşım' },
  { id: 'yesilalan', name: 'Yeşil Alan' },
  { id: 'aydinlatma', name: 'Aydınlatma' },
  { id: 'diger', name: 'Diğer' },
];

export default function ReportIssueScreen({ navigation }) {
  const [form, setForm] = useState({ title: '', category: 'altyapi', description: '' });
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const update = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const getLocation = async () => {
    setLocationLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Konum izni verilmedi. Lütfen uygulama ayarlarından izin verin.');
      setLocationLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    setLocationLoading(false);
    Alert.alert('Başarılı', 'Konumunuz alındı.');
  };

  const pickImage = () => {
    Alert.alert('Görsel Seç', '', [
      { text: 'Galeriden Seç', onPress: () => launchPicker('library') },
      { text: 'Kameradan Çek', onPress: () => launchPicker('camera') },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const launchPicker = async (source) => {
    const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true };
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled) setImage(result.assets[0]);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 5) e.title = 'Başlık en az 5 karakter olmalı';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Açıklama en az 20 karakter olmalı';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('description', form.description);
      if (location) formData.append('location', JSON.stringify(location));
      if (image) {
        const filename = image.uri.split('/').pop();
        const ext = filename.split('.').pop();
        formData.append('image', { uri: image.uri, name: filename, type: `image/${ext}` });
      }

      await api.post('/issues', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Başarılı', 'Sorun bildiriminiz oluşturuldu! +10 XP kazandınız 🎉', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || 'Sorun bildirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.title.trim().length >= 5 && form.description.trim().length >= 20;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0F1010' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">

        <View style={styles.card}>
          {/* Başlık */}
          <Text style={styles.label}>Başlık <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Sorunun kısa başlığını girin (min 5 karakter)"
            placeholderTextColor="#6B7280"
            value={form.title}
            onChangeText={(t) => update('title', t)}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          <Text style={styles.charCount}>{form.title.length} / 5 minimum</Text>

          {/* Kategori */}
          <Text style={styles.label}>Kategori <Text style={styles.required}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, form.category === cat.id && styles.catChipActive]}
                onPress={() => update('category', cat.id)}
              >
                <Text style={[styles.catChipText, form.category === cat.id && styles.catChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Açıklama */}
          <Text style={styles.label}>Açıklama <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textarea, errors.description && styles.inputError]}
            placeholder="Sorunu detaylı açıklayın. Ne oldu, nerede, ne zaman? (min 20 karakter)"
            placeholderTextColor="#6B7280"
            value={form.description}
            onChangeText={(t) => update('description', t)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          <Text style={styles.charCount}>{form.description.length} / 20 minimum</Text>

          {/* Konum */}
          <Text style={styles.label}>Konum (Opsiyonel)</Text>
          {location ? (
            <View style={styles.locationBox}>
              <Text style={styles.locationText}>📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</Text>
              <TouchableOpacity onPress={() => setLocation(null)}>
                <Text style={styles.removeText}>Kaldır ✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.outlineBtn} onPress={getLocation} disabled={locationLoading}>
              {locationLoading
                ? <ActivityIndicator size="small" color="#C3F746" />
                : <Text style={styles.outlineBtnText}>📍 Mevcut Konumu Kullan</Text>}
            </TouchableOpacity>
          )}

          {/* Görsel */}
          <Text style={styles.label}>Görsel (Opsiyonel)</Text>
          {image ? (
            <View>
              <Image source={{ uri: image.uri }} style={styles.preview} />
              <TouchableOpacity style={styles.removeImgBtn} onPress={() => setImage(null)}>
                <Text style={styles.removeText}>Görseli Kaldır ✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.outlineBtn} onPress={pickImage}>
              <Text style={styles.outlineBtnText}>📷 Görsel Ekle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.submitBtnText}>Sorunu Bildir</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#161717', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A2B2B' },
  label: { color: '#9CA3AF', fontSize: 13, fontWeight: '500', marginTop: 16, marginBottom: 6 },
  required: { color: '#EF4444' },
  input: { backgroundColor: '#0F1010', borderWidth: 1, borderColor: '#2A2B2B', borderRadius: 12, padding: 12, color: '#FFF', fontSize: 14 },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  charCount: { color: '#4B5563', fontSize: 11, marginTop: 4 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#0F1010', borderWidth: 1, borderColor: '#2A2B2B', marginRight: 8, marginTop: 4 },
  catChipActive: { backgroundColor: '#C3F746', borderColor: '#C3F746' },
  catChipText: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
  catChipTextActive: { color: '#000', fontWeight: 'bold' },
  outlineBtn: { backgroundColor: '#0F1010', borderWidth: 1, borderColor: '#2A2B2B', borderRadius: 12, padding: 12, alignItems: 'center' },
  outlineBtnText: { color: '#9CA3AF', fontSize: 14 },
  locationBox: { backgroundColor: '#0F1010', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#C3F74644', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationText: { color: '#C3F746', fontSize: 13 },
  removeText: { color: '#EF4444', fontSize: 12 },
  preview: { width: '100%', height: 160, borderRadius: 12, marginTop: 8 },
  removeImgBtn: { marginTop: 8, alignItems: 'center' },
  submitBtn: { backgroundColor: '#C3F746', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 32 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
