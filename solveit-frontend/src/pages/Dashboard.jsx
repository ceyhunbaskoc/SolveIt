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
        return <span className="bg-yellow-100 text-yellow-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">Beklemede</span>;
      case 'inceleniyor':
        return <span className="bg-blue-100 text-blue-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">İnceleniyor</span>;
      case 'cozuldu':
        return <span className="bg-green-100 text-green-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">Çözüldü</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">{status}</span>;
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
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kampüs ve Şehir Sorunları</h1>
        <p className="text-gray-600">Topluluğumuzdaki sorunları görün ve katkıda bulunun</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? `${category.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz sorun bildirilmedi</h3>
          <p className="text-gray-500 mb-6">
            {selectedCategory === 'all' 
              ? 'Topluluğumuzda henüz bir sorun bildirilmemiş.' 
              : 'Bu kategoride henüz sorun bildirilmemiş.'}
          </p>
          <Link
            to="/report"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {issue.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryBadge(issue.category)}
                    {getStatusBadge(issue.status)}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {issue.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(issue.createdAt)}</span>
                  {issue.location && issue.location.lat && (
                    <span className="text-sm text-gray-500 flex items-center ml-2">
                      <span className="mr-1">📍</span> Konum belirtilmiş
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleUpvote(issue._id, e)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        hasUpvoted(issue)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span>Destekle</span>
                    </button>
                    
                    <button
                      onClick={(e) => handleDownvote(issue._id, e)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        hasDownvoted(issue)
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span>Katılmıyorum</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm font-medium">
                    <span className={`px-2 py-1 rounded-full ${
                      getScore(issue) > 0 
                        ? 'bg-green-100 text-green-700'
                        : getScore(issue) < 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
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
