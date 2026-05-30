import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';

const LEVEL_LABELS = ['Duyarlı Vatandaş', 'Aktif Gözlemci', 'Şehir Kahramanı'];
const MEDALS = ['🥇', '🥈', '🥉'];

function getLevel(xp) {
  if (xp >= 150) return 2;
  if (xp >= 50) return 1;
  return 0;
}

export default function LeaderboardScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await api.get('/users/leaderboard');
      setUsers(res.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchLeaderboard();
    }, [fetchLeaderboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const renderItem = ({ item, index }) => {
    const level = getLevel(item.xp);
    return (
      <View style={[styles.row, index < 3 && styles.topRow]}>
        <Text style={styles.rank}>{MEDALS[index] || `#${index + 1}`}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.dept}>{item.department || 'SDÜ'} · {LEVEL_LABELS[level]}</Text>
        </View>
        <View style={styles.xpBox}>
          <Text style={styles.xpValue}>{item.xp}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C3F746" />
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={u => u._id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C3F746" />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Liderlik Tablosu</Text>
          <Text style={styles.subtitle}>En fazla XP kazanan kullanıcılar</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Henüz veri yok</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1010' },
  list: { backgroundColor: '#0F1010', paddingBottom: 20 },
  header: { padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#C3F746' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161717',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2B2B',
  },
  topRow: { borderColor: '#C3F746', borderWidth: 1.5 },
  rank: { fontSize: 26, width: 40, textAlign: 'center' },
  info: { flex: 1, marginLeft: 10 },
  name: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  dept: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  xpBox: { alignItems: 'center' },
  xpValue: { fontSize: 20, fontWeight: 'bold', color: '#C3F746' },
  xpLabel: { fontSize: 11, color: '#6B7280' },
  empty: { textAlign: 'center', color: '#6B7280', padding: 40 },
});
