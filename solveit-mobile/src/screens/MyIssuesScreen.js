import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  PENDING: { label: 'Beklemede', color: '#F7721A' },
  IN_PROGRESS: { label: 'İnceleniyor', color: '#3B82F6' },
  RESOLVED: { label: 'Çözüldü', color: '#C3F746' },
};

const CAT_LABELS = {
  altyapi: 'Altyapı', temizlik: 'Temizlik', guvenlik: 'Güvenlik',
  ulasim: 'Ulaşım', yesilalan: 'Yeşil Alan', aydinlatma: 'Aydınlatma', diger: 'Diğer',
};

export default function MyIssuesScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyIssues = async () => {
    try {
      const res = await api.get('/issues/user/my-issues');
      setIssues(res.data.data || []);
    } catch {
      Alert.alert('Hata', 'Bildirimler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    if (isAuthenticated) fetchMyIssues();
    else setLoading(false);
  }, [isAuthenticated]));

  const handleDelete = (id) => {
    Alert.alert('Sil', 'Bu bildirimi silmek istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/issues/${id}`);
            setIssues(p => p.filter(i => i._id !== id));
          } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || 'Silme başarısız');
          }
        }
      },
    ]);
  };

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'PENDING').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: issues.filter(i => i.status === 'RESOLVED').length,
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🔒</Text>
        <Text style={styles.emptyTitle}>Giriş Yapmalısınız</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#C3F746" size="large" /></View>;

  const renderItem = ({ item }) => {
    const statusCfg = STATUS_CONFIG[item.status] || { label: item.status, color: '#6B7280' };
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('IssueDetail', { id: item._id })}>
        <View style={styles.cardTop}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: '#3B82F633' }]}>
              <Text style={[styles.badgeText, { color: '#3B82F6' }]}>{CAT_LABELS[item.category] || item.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusCfg.color + '22' }]}>
              <Text style={[styles.badgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item._id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

        {item.imageUrl && item.imageUrl !== 'no-photo.jpg' && (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} resizeMode="cover" />
        )}

        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {issues.length > 0 && (
        <View style={styles.statsRow}>
          {[
            { label: 'Toplam', value: stats.total, color: '#FFF' },
            { label: 'Bekleyen', value: stats.pending, color: '#F7721A' },
            { label: 'İncelenen', value: stats.inProgress, color: '#3B82F6' },
            { label: 'Çözülen', value: stats.resolved, color: '#C3F746' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={issues}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyIssues(); }} tintColor="#C3F746" />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Henüz bildirim açmadınız</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Report')}>
              <Text style={styles.loginBtnText}>İlk Sorunu Bildir</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1010' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1010', padding: 32 },
  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#161717', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2A2B2B' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#6B7280', fontSize: 11, marginTop: 4 },
  card: { backgroundColor: '#161717', borderRadius: 20, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2A2B2B' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  deleteIcon: { fontSize: 16 },
  cardTitle: { color: '#F9FAFB', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardDesc: { color: '#9CA3AF', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  thumbnail: { width: '100%', height: 100, borderRadius: 10, marginBottom: 8 },
  dateText: { color: '#4B5563', fontSize: 11 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  loginBtn: { backgroundColor: '#C3F746', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  loginBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
