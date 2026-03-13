import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/leaderboard');
      setLeaderboard(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Liderlik tablosu yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white border-gray-400';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500';
      default:
        return 'bg-white text-gray-800 border-gray-200';
    }
  };

  const getLevelInfo = (xp) => {
    if (xp >= 150) {
      return {
        title: 'Şehir Kahramanı',
        color: 'bg-purple-100 text-purple-800'
      };
    } else if (xp >= 50) {
      return {
        title: 'Aktif Gözlemci',
        color: 'bg-blue-100 text-blue-800'
      };
    } else {
      return {
        title: 'Duyarlı Vatandaş',
        color: 'bg-green-100 text-green-800'
      };
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Liderlik tablosu yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Liderlik Tablosu</h1>
        <p className="text-gray-600">En aktif vatandaşlarımızın XP sıralaması</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <p className="text-gray-600 text-lg">Henüz kullanıcı bulunmuyor</p>
          <p className="text-gray-500 text-sm mt-2">İlk sıradaki olmak için sorun bildirin!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((leaderboardUser, index) => {
            const rank = index + 1;
            const levelInfo = getLevelInfo(leaderboardUser.xp || 0);
            const isCurrentUser = isAuthenticated && user && user._id === leaderboardUser._id;
            
            return (
              <div
                key={leaderboardUser._id}
                className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${
                  isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                } ${getRankStyle(rank)}`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl font-bold">
                        {getRankIcon(rank)}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold">
                          {leaderboardUser.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Siz
                            </span>
                          )}
                        </h3>
                        <p className="text-sm opacity-75">
                          {leaderboardUser.department || 'Departman belirtilmemiş'}
                        </p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelInfo.color}`}>
                            {levelInfo.title}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {leaderboardUser.xp || 0}
                      </div>
                      <div className="text-sm opacity-75">XP</div>
                    </div>
                  </div>
                  
                  {rank <= 3 && (
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                      <div className="text-6xl">
                        {rank === 1 && '👑'}
                        {rank === 2 && '🥈'}
                        {rank === 3 && '🥉'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">XP Nasıl Kazanılır?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📝</span>
              <span>Yeni sorun bildir: <strong>+10 XP</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">✅</span>
              <span>Sorun çözülünce: <strong>+20 XP</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">💬</span>
              <span>Tartışmaya katıl: <strong>+5 XP</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
