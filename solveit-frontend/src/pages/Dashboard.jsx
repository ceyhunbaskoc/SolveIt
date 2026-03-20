import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Socket.io bağlantısı
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io('http://localhost:5000');
    
    socket.on('statusUpdated', (data) => {
      console.log('Dashboard - Status updated:', data);
      
      // State içindeki ilgili sorunu güncelle
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue._id === data.issueId 
            ? { ...issue, status: data.status === 'RESOLVED' ? 'cozuldu' : data.status === 'IN_PROGRESS' ? 'inceleniyor' : 'beklemede' }
            : issue
        )
      );
    });

    socket.on('voteUpdated', (data) => {
      console.log('Dashboard - Vote updated:', data);
      
      // State içindeki ilgili sorunun oylarını güncelle
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue._id === data.issueId 
            ? { ...issue, upvotes: data.upvotes, downvotes: data.downvotes }
            : issue
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);
  
  const categories = [
    { id: 'all', name: 'Tümü', color: 'bg-gray-500' },
    { id: 'altyapi', name: 'Altyapı', color: 'bg-blue-500' },
    { id: 'temizlik', name: 'Temizlik', color: 'bg-green-500' },
    { id: 'guvenlik', name: 'Güvenlik', color: 'bg-red-500' },
    { id: 'ulasim', name: 'Ulaşım', color: 'bg-yellow-500' },
    { id: 'yesilalan', name: 'Yeşil Alan', color: 'bg-emerald-500' },
    { id: 'aydinlatma', name: 'Aydınlatma', color: 'bg-orange-500' },
    { id: 'diger', name: 'Diğer', color: 'bg-purple-500' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'beklemede':
        return <span className="bg-[#F7721A]/20 text-[#F7721A] border border-[#F7721A]/30 px-3 py-1 rounded-full text-xs font-medium">Beklemede</span>;
      case 'inceleniyor':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-medium">İnceleniyor</span>;
      case 'cozuldu':
        return <span className="bg-[#C3F746]/20 text-[#C3F746] border border-[#C3F746]/30 px-3 py-1 rounded-full text-xs font-medium">Çözüldü</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-3 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const getCategoryBadge = (category) => {
    const categoryInfo = categories.find(cat => cat.id === category);
    if (!categoryInfo) return <span className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">{category}</span>;
    
    return (
      <span className={`${categoryInfo.color} text-white inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
        {categoryInfo.name}
      </span>
    );
  };

  const fetchIssues = async (category = 'all') => {
    try {
      setLoading(true);
      const url = category === 'all' 
        ? 'http://localhost:5000/api/issues'
        : `http://localhost:5000/api/issues?category=${category}`;
      
      const response = await api.get(url);
      setIssues(response.data.data || response.data);
    } catch (error) {
      toast.error('Sorunlar yüklenirken hata oluştu');
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (issueId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Oy vermek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await api.post(`/issues/${issueId}/upvote`);
      
      // Optimistic UI update
      setIssues(prev => prev.map(issue => 
        issue._id === issueId ? response.data.data : issue
      ));
      
      toast.success('Oyunuz başarıyla güncellendi');
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız oldu');
      console.error('Error upvoting:', error);
    }
  };

  const handleDownvote = async (issueId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Oy vermek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await api.post(`/issues/${issueId}/downvote`);
      
      // Optimistic UI update
      setIssues(prev => prev.map(issue => 
        issue._id === issueId ? response.data.data : issue
      ));
      
      toast.success('Oyunuz başarıyla güncellendi');
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız oldu');
      console.error('Error downvoting:', error);
    }
  };

  const getScore = (issue) => {
    return (issue.upvotes?.length || 0) - (issue.downvotes?.length || 0);
  };

  const hasUpvoted = (issue) => {
    if (!isAuthenticated || !user) return false;
    return issue.upvotes?.some(upvote => upvote._id === user._id || upvote === user._id);
  };

  const hasDownvoted = (issue) => {
    if (!isAuthenticated || !user) return false;
    return issue.downvotes?.some(downvote => downvote._id === user._id || downvote === user._id);
  };

  useEffect(() => {
    fetchIssues(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'Az önce' : `${diffMinutes} dakika önce`;
      }
      return diffHours === 1 ? '1 saat önce' : `${diffHours} saat önce`;
    } else if (diffDays === 1) {
      return 'Dün';
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kampüs ve Şehir Sorunları</h1>
          <p className="text-gray-600">Topluluğumuzdaki sorunları görün ve katkıda bulunun</p>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-8 w-20 bg-[#161717] border-[#2A2B2B] rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#161717] rounded-[2rem] border border-[#2A2B2B] p-6 hover:shadow-xl transition-all duration-300 animate-pulse">
              <div className="h-4 bg-[#2A2B2B] rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-[#2A2B2B] rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-[#2A2B2B] rounded w-full mb-2"></div>
              <div className="h-3 bg-[#2A2B2B] rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Kampüs ve Şehir Sorunları</h1>
        <p className="text-gray-400">Topluluğumuzdaki sorunları görün ve katkıda bulunun</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#C3F746] text-black font-bold shadow-[0_0_15px_rgba(195,247,70,0.3)]'
                  : 'bg-[#161717] text-gray-400 hover:text-white border border-[#2A2B2B]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Henüz sorun bildirilmedi</h3>
          <p className="text-gray-500 mb-6">
            {selectedCategory === 'all' 
              ? 'Topluluğumuzda henüz bir sorun bildirilmemiş.' 
              : 'Bu kategoride henüz sorun bildirilmemiş.'}
          </p>
          <Link
            to="/report"
            className="bg-[#C3F746] hover:bg-green-500 text-black font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            İlk Sorunu Bildir
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <Link
              key={issue._id}
              to={`/issues/${issue._id}`}
              className="block"
            >
              <div className="bg-[#161717] rounded-[2rem] p-6 border border-[#2A2B2B] hover:border-[#C3F746] hover:-translate-y-1 transition-all duration-300 shadow-xl">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">
                    {issue.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryBadge(issue.category)}
                    {getStatusBadge(issue.status)}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                  {issue.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(issue.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {issue.location && issue.location.lat && (
                      <span className="text-sm text-gray-500 flex items-center">
                        <span className="mr-1">📍</span> Konum eklenmiş
                      </span>
                    )}
                    {issue.imageUrl && issue.imageUrl !== 'no-photo.jpg' && (
                      <span className="text-xs text-[#C3F746] font-medium flex items-center">
                        <span className="mr-1">📷</span> Fotoğraf eklendi
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-4 mt-4 border-t border-[#2A2B2B]">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleUpvote(issue._id, e)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors border border-[#2A2B2B] ${
                        hasUpvoted(issue)
                          ? 'bg-[#C3F746]/10 text-[#C3F746] border border-[#C3F746]/30'
                          : 'bg-[#0F1010] text-gray-400 hover:text-white'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span>Destekle</span>
                    </button>
                    
                    <button
                      onClick={(e) => handleDownvote(issue._id, e)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors border border-[#2A2B2B] ${
                        hasDownvoted(issue)
                          ? 'bg-[#F7721A]/10 text-[#F7721A] border border-[#F7721A]/30'
                          : 'bg-[#0F1010] text-gray-400 hover:text-white'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span>Katılmıyorum</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm font-medium">
                    <span className={`bg-[#0F1010] text-white px-3 py-1 rounded-xl border border-[#2A2B2B] ${
                      getScore(issue) > 0 
                        ? 'text-[#C3F746]'
                        : getScore(issue) < 0
                        ? 'text-[#F7721A]'
                        : ''
                    }`}>
                      {getScore(issue) > 0 && '+'}{getScore(issue)}
                    </span>
                    <span className="text-gray-500 text-xs">Skor</span>
                  </div>
                </div>
                
                {issue.image && (
                  <div className="mt-3">
                    <img 
                      src={issue.image} 
                      alt={issue.title}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
