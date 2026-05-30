import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, Image, Linking
} from 'react-native';
import { io } from 'socket.io-client';
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

export default function IssueDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user, isAuthenticated } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchIssue = async () => {
    try {
      const res = await api.get(`/issues/${id}`);
      setIssue(res.data.data);
    } catch {
      Alert.alert('Hata', 'Sorun bulunamadı.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
    const socket = io('https://solveit-887w.onrender.com');
    socket.on('newComment', (data) => {
      if (data.issueId === id) setIssue(p => p ? { ...p, comments: data.comments } : null);
    });
    socket.on('voteUpdated', (data) => {
      if (data.issueId === id) setIssue(p => p ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes } : null);
    });
    return () => socket.disconnect();
  }, [id]);

  const canEdit = user && (issue?.reporterId?._id === user._id || user.role === 'admin');

  const handleVote = async (type) => {
    if (!isAuthenticated) { Alert.alert('Uyarı', 'Oy vermek için giriş yapmalısınız.'); return; }
    try {
      const res = await api.post(`/issues/${id}/${type}`);
      setIssue(res.data.data);
    } catch (e) { Alert.alert('Hata', e.response?.data?.message || 'İşlem başarısız'); }
  };

  const handleStatusChange = async (status) => {
    if (status === 'RESOLVED') {
      Alert.alert('Onay', 'Sorun sahibine +20 XP verilecek. Onaylıyor musunuz?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Onayla', onPress: () => updateStatus(status) },
      ]);
    } else {
      updateStatus(status);
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.patch(`/issues/${id}/status`, { status });
      setIssue(p => ({ ...p, status }));
      Alert.alert('Başarılı', 'Durum güncellendi.');
    } catch (e) { Alert.alert('Hata', e.response?.data?.message || 'Güncelleme başarısız'); }
  };

  const handleDelete = () => {
    Alert.alert('Sil', 'Bu sorunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          setDeleteLoading(true);
          try {
            await api.delete(`/issues/${id}`);
            Alert.alert('Başarılı', 'Sorun silindi.');
            navigation.goBack();
          } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || 'Silme başarısız');
          } finally {
            setDeleteLoading(false);
          }
        }
      },
    ]);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/issues/${id}/comments`, { text: commentText.trim() });
      setIssue(res.data.data);
      setCommentText('');
    } catch (e) { Alert.alert('Hata', e.response?.data?.message || 'Yorum eklenemedi'); }
    finally { setCommentLoading(false); }
  };

  const getScore = () => (issue?.upvotes?.length || 0) - (issue?.downvotes?.length || 0);

  const openMap = () => {
    if (!issue?.location) return;
    const { lat, lng } = issue.location;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#C3F746" /></View>;
  }
  if (!issue) return null;

  const statusCfg = STATUS_CONFIG[issue.status] || { label: issue.status, color: '#6B7280' };
  const score = getScore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Başlık ve badge'ler */}
      <Text style={styles.title}>{issue.title}</Text>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: '#3B82F633' }]}>
          <Text style={[styles.badgeText, { color: '#3B82F6' }]}>{CAT_LABELS[issue.category] || issue.category}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusCfg.color + '22' }]}>
          <Text style={[styles.badgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      {/* Görsel */}
      {issue.imageUrl && issue.imageUrl !== 'no-photo.jpg' && (
        <Image source={{ uri: issue.imageUrl }} style={styles.image} resizeMode="cover" />
      )}

      {/* Açıklama */}
      <View style={styles.section}>
        <Text style={styles.description}>{issue.description}</Text>
      </View>

      {/* Oy */}
      <View style={styles.voteSection}>
        <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote('upvote')}>
          <Text style={styles.voteBtnText}>▲ Destekle</Text>
        </TouchableOpacity>
        <Text style={[styles.score, { color: score > 0 ? '#C3F746' : score < 0 ? '#F7721A' : '#9CA3AF' }]}>
          {score > 0 ? `+${score}` : score}
        </Text>
        <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote('downvote')}>
          <Text style={styles.voteBtnText}>▼ Katılmıyorum</Text>
        </TouchableOpacity>
      </View>

      {/* Bilgi kartı */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Bildiren</Text>
        <Text style={styles.infoValue}>{issue.reporterId?.name || 'Bilinmiyor'}</Text>
        <Text style={styles.infoLabel}>Tarih</Text>
        <Text style={styles.infoValue}>{new Date(issue.createdAt).toLocaleDateString('tr-TR')}</Text>
      </View>

      {/* Konum */}
      {issue.location?.lat && (
        <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
          <Text style={styles.mapBtnText}>🗺️ Google Haritada Aç</Text>
        </TouchableOpacity>
      )}

      {/* Admin / Sahip işlemleri */}
      {canEdit && (
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Durum Güncelle</Text>
          <View style={styles.statusBtns}>
            {['PENDING', 'IN_PROGRESS', 'RESOLVED'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, issue.status === s && styles.statusBtnActive]}
                onPress={() => handleStatusChange(s)}
              >
                <Text style={[styles.statusBtnText, issue.status === s && styles.statusBtnTextActive]}>
                  {STATUS_CONFIG[s].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.deleteBtnText}>🗑️ Sorunu Sil</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Yorumlar */}
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Yorumlar ({issue.comments?.length || 0})</Text>

        {isAuthenticated && (
          <View style={styles.commentForm}>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorumunuzu yazın..."
              placeholderTextColor="#6B7280"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity style={[styles.commentBtn, !commentText.trim() && styles.commentBtnDisabled]} onPress={handleComment} disabled={!commentText.trim() || commentLoading}>
              {commentLoading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.commentBtnText}>Gönder</Text>}
            </TouchableOpacity>
          </View>
        )}

        {issue.comments?.map((c, i) => (
          <View key={i} style={styles.commentItem}>
            <View style={[styles.commentAvatar, { backgroundColor: c.user?.role === 'admin' ? '#EF4444' : '#4B5563' }]}>
              <Text style={styles.commentAvatarText}>{c.user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.commentContent}>
              <View style={styles.commentMeta}>
                <Text style={styles.commentName}>{c.user?.name || 'Bilinmiyor'}</Text>
                {c.user?.role === 'admin' && (
                  <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>
                )}
              </View>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1010' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1010' },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  image: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },
  section: { backgroundColor: '#161717', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2B2B' },
  description: { color: '#D1D5DB', fontSize: 14, lineHeight: 22 },
  voteSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#161717', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#2A2B2B' },
  voteBtn: { backgroundColor: '#0F1010', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#2A2B2B' },
  voteBtnText: { color: '#9CA3AF', fontSize: 13 },
  score: { fontSize: 20, fontWeight: 'bold', minWidth: 40, textAlign: 'center' },
  infoCard: { backgroundColor: '#161717', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2B2B' },
  infoLabel: { color: '#6B7280', fontSize: 12, marginTop: 6 },
  infoValue: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  mapBtn: { backgroundColor: '#1D4ED8', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12 },
  mapBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  adminSection: { backgroundColor: '#161717', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2B2B' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  statusBtns: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statusBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0F1010', borderWidth: 1, borderColor: '#2A2B2B', alignItems: 'center' },
  statusBtnActive: { backgroundColor: '#C3F746', borderColor: '#C3F746' },
  statusBtnText: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
  statusBtnTextActive: { color: '#000', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#DC2626', borderRadius: 10, padding: 10, alignItems: 'center' },
  deleteBtnText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  commentsSection: { marginBottom: 32 },
  commentForm: { backgroundColor: '#161717', borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#2A2B2B' },
  commentInput: { color: '#FFF', fontSize: 14, minHeight: 60, textAlignVertical: 'top', marginBottom: 8 },
  commentBtn: { backgroundColor: '#C3F746', borderRadius: 8, padding: 10, alignItems: 'center' },
  commentBtnDisabled: { opacity: 0.4 },
  commentBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  commentItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  commentContent: { flex: 1 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  commentName: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  adminBadge: { backgroundColor: '#EF444433', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  adminBadgeText: { color: '#EF4444', fontSize: 10, fontWeight: '600' },
  commentText: { color: '#D1D5DB', fontSize: 13, lineHeight: 18 },
});
