import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'all', name: 'Tümü' },
  { id: 'altyapi', name: 'Altyapı' },
  { id: 'temizlik', name: 'Temizlik' },
  { id: 'guvenlik', name: 'Güvenlik' },
  { id: 'ulasim', name: 'Ulaşım' },
  { id: 'yesilalan', name: 'Yeşil Alan' },
  { id: 'aydinlatma', name: 'Aydınlatma' },
  { id: 'diger', name: 'Diğer' },
];

const STATUS_CONFIG = {
  PENDING: { label: 'Beklemede', color: '#F7721A' },
  IN_PROGRESS: { label: 'İnceleniyor', color: '#3B82F6' },
  RESOLVED: { label: 'Çözüldü', color: '#C3F746' },
};

const CAT_COLORS = {
  altyapi: '#3B82F6', temizlik: '#10B981', guvenlik: '#EF4444',
  ulasim: '#F59E0B', yesilalan: '#059669', aydinlatma: '#F97316', diger: '#8B5CF6',
};

export default function HomeScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchIssues = async (category = selectedCategory) => {
    try {
      const url = category === 'all' ? '/issues' : `/issues?category=${category}`;
      const response = await api.get(url);
      setIssues(response.data.data || []);
    } catch {
      Alert.alert('Hata', 'Sorunlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchIssues(); }, [selectedCategory]));

  useEffect(() => {
    const socket = io('https://solveit-887w.onrender.com');
    socket.on('statusUpdated', (data) => {
      setIssues(prev => prev.map(i => i._id === data.issueId ? { ...i, status: data.status } : i));
    });
    socket.on('voteUpdated', (data) => {
      setIssues(prev => prev.map(i => i._id === data.issueId ? { ...i, upvotes: data.upvotes, downvotes: data.downvotes } : i));
    });
    return () => socket.disconnect();
  }, []);

  const handleVote = async (issueId, type) => {
    if (!isAuthenticated) { Alert.alert('Uyarı', 'Oy vermek için giriş yapmalısınız.'); return; }
    try {
      const res = await api.post(`/issues/${issueId}/${type}`);
      setIssues(prev => prev.map(i => i._id === issueId ? res.data.data : i));
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.message || 'İşlem başarısız');
    }
  };

  const getScore = (issue) => (issue.upvotes?.length || 0) - (issue.downvotes?.length || 0);

  const formatDate = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return `${Math.floor(diff / 86400)} gün önce`;
  };

  const renderItem = ({ item }) => {
    const statusCfg = STATUS_CONFIG[item.status] || { label: item.status, color: '#6B7280' };
    const catColor = CAT_COLORS[item.category] || '#6B7280';
    const score = getScore(item);

    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('IssueDetail', { id: item._id })}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: catColor + '33' }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>
              {CATEGORIES.find(c => c.id === item.category)?.name || item.category}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusCfg.color + '22' }]}>
            <Text style={[styles.badgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          <View style={styles.voteRow}>
            <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(item._id, 'upvote')}>
              <Text style={styles.voteIcon}>▲</Text>
            </TouchableOpacity>
            <Text style={[styles.score, { color: score > 0 ? '#C3F746' : score < 0 ? '#F7721A' : '#9CA3AF' }]}>
              {score > 0 ? `+${score}` : score}
            </Text>
            <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(item._id, 'downvote')}>
              <Text style={styles.voteIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C3F746" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Kategori filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
            onPress={() => { setSelectedCategory(cat.id); fetchIssues(cat.id); }}
          >
            <Text style={[styles.catChipText, selectedCategory === cat.id && styles.catChipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={issues}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchIssues(); }} tintColor="#C3F746" />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Henüz sorun bildirilmedi</Text>
            <Text style={styles.emptyDesc}>Bu kategoride sorun bulunmuyor.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1010' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1010' },
  loadingText: { color: '#9CA3AF', marginTop: 12, fontSize: 14 },
  catScroll: { flexGrow: 0 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#161717', borderWidth: 1, borderColor: '#2A2B2B', marginRight: 8 },
  catChipActive: { backgroundColor: '#C3F746', borderColor: '#C3F746' },
  catChipText: { color: '#9CA3AF', fontSize: 13, fontWeight: '500' },
  catChipTextActive: { color: '#000', fontWeight: 'bold' },
  card: { backgroundColor: '#161717', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2B2B' },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardTitle: { color: '#F9FAFB', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  cardDesc: { color: '#9CA3AF', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { color: '#6B7280', fontSize: 12 },
  voteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voteBtn: { padding: 4 },
  voteIcon: { color: '#9CA3AF', fontSize: 12 },
  score: { fontSize: 14, fontWeight: 'bold', minWidth: 28, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emptyDesc: { color: '#6B7280', fontSize: 13 },
});
