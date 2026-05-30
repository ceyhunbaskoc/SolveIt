import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const LEVELS = [
  { min: 150, title: 'Şehir Kahramanı', icon: '🏆', color: '#7C3AED' },
  { min: 50, title: 'Aktif Gözlemci', icon: '👁️', color: '#2563EB' },
  { min: 0, title: 'Duyarlı Vatandaş', icon: '🌱', color: '#059669' },
];

const getLevel = (xp) => LEVELS.find(l => xp >= l.min) || LEVELS[2];

const getProgress = (xp) => {
  if (xp >= 150) return 1;
  if (xp >= 50) return (xp - 50) / 100;
  return xp / 50;
};

const getNextXP = (xp) => {
  if (xp >= 150) return null;
  if (xp >= 50) return 150 - xp;
  return 50 - xp;
};

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', department: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!isAuthenticated) return;
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        const u = res.data.data;
        setCurrentUser(u);
        setForm({ name: u.name || '', email: u.email || '', department: u.department || '' });
      } catch {}
    };
    fetchUser();
  }, [isAuthenticated]));

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Hata', 'Ad alanı boş olamaz.'); return; }
    setLoading(true);
    try {
      await api.patch('/users/profile', { name: form.name, department: form.department });
      await refreshUser();
      Alert.alert('Başarılı', 'Profil güncellendi.');
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.message || 'Güncelleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Hesabınızdan çıkış yapmak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🔒</Text>
        <Text style={styles.emptyTitle}>Giriş Yapmalısınız</Text>
        <TouchableOpacity style={styles.greenBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.greenBtnText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const xp = currentUser?.xp || 0;
  const level = getLevel(xp);
  const progress = getProgress(xp);
  const nextXP = getNextXP(xp);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0F1010' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">

        {/* XP Kartı */}
        <View style={[styles.xpCard, { borderColor: level.color + '66' }]}>
          <View style={styles.xpTop}>
            <Text style={styles.xpIcon}>{level.icon}</Text>
            <View>
              <Text style={[styles.levelTitle, { color: level.color }]}>{level.title}</Text>
              <Text style={styles.xpLabel}>Seviyeniz</Text>
            </View>
            <View style={styles.xpRight}>
              <Text style={[styles.xpValue, { color: level.color }]}>{xp}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: level.color }]} />
          </View>
          <Text style={styles.nextXpText}>
            {nextXP ? `Sıradaki seviyeye ${nextXP} XP kaldı` : 'Maksimum seviyeye ulaştınız! 🎉'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          {[
            { key: 'name', label: 'Ad Soyad', required: true },
            { key: 'email', label: 'E-posta', editable: false },
            { key: 'department', label: 'Departman' },
          ].map(({ key, label, required, editable = true }) => (
            <View key={key}>
              <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
              <TextInput
                style={[styles.input, !editable && styles.inputReadonly]}
                value={form[key]}
                onChangeText={t => setForm(p => ({ ...p, [key]: t }))}
                editable={editable}
                placeholderTextColor="#6B7280"
                placeholder={label}
                autoCapitalize={key === 'email' ? 'none' : 'words'}
                keyboardType={key === 'email' ? 'email-address' : 'default'}
              />
              {!editable && <Text style={styles.hint}>E-posta değiştirilemez</Text>}
            </View>
          ))}
        </View>

        {/* Hesap bilgileri */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
          {[
            { label: 'Kayıt Tarihi', value: currentUser ? new Date(currentUser.createdAt).toLocaleDateString('tr-TR') : '-' },
            { label: 'Kullanıcı Rolü', value: currentUser?.role === 'admin' ? 'Yönetici' : 'Kullanıcı' },
            { label: 'Deneyim Puanı', value: `${xp} XP`, color: '#C3F746' },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={[styles.infoValue, color && { color }]}>{value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.greenBtn, loading && styles.btnDisabled]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.greenBtnText}>Değişiklikleri Kaydet</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1010', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  xpCard: { backgroundColor: '#161717', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 2 },
  xpTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  xpIcon: { fontSize: 36 },
  levelTitle: { fontSize: 18, fontWeight: 'bold' },
  xpLabel: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  xpRight: { marginLeft: 'auto', alignItems: 'flex-end' },
  xpValue: { fontSize: 28, fontWeight: 'bold' },
  progressBg: { height: 8, backgroundColor: '#2A2B2B', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: 8, borderRadius: 4 },
  nextXpText: { color: '#6B7280', fontSize: 12 },
  card: { backgroundColor: '#161717', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A2B2B' },
  label: { color: '#9CA3AF', fontSize: 13, marginBottom: 6, marginTop: 10 },
  required: { color: '#EF4444' },
  input: { backgroundColor: '#0F1010', borderWidth: 1, borderColor: '#2A2B2B', borderRadius: 12, padding: 12, color: '#FFF', fontSize: 14 },
  inputReadonly: { opacity: 0.5 },
  hint: { color: '#4B5563', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1F2020' },
  infoLabel: { color: '#6B7280', fontSize: 13 },
  infoValue: { color: '#FFF', fontSize: 13, fontWeight: '500' },
  greenBtn: { backgroundColor: '#C3F746', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 12 },
  greenBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
  logoutBtn: { borderWidth: 1, borderColor: '#F7721A', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 32 },
  logoutBtnText: { color: '#F7721A', fontWeight: '600', fontSize: 15 },
});
