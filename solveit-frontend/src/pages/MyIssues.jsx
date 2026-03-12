import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const MyIssues = () => {
  const { user, isAuthenticated } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Socket.io bağlantısı
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io('http://localhost:5000');
    
    socket.on('statusUpdated', (data) => {
      console.log('MyIssues - Status updated:', data);
      
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
      console.log('MyIssues - Vote updated:', data);
      
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

  const categories = {
    'altyapi': 'Altyapı',
    'temizlik': 'Temizlik',
    'guvenlik': 'Güvenlik',
    'ulasim': 'Ulaşım',
    'yesilalan': 'Yeşil Alan',
    'aydinlatma': 'Aydınlatma',
    'diger': 'Diğer'
  };

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
    const colors = {
      'altyapi': 'bg-blue-500',
      'temizlik': 'bg-green-500',
      'guvenlik': 'bg-red-500',
      'ulasim': 'bg-yellow-500',
      'yesilalan': 'bg-emerald-500',
      'aydinlatma': 'bg-orange-500',
      'diger': 'bg-purple-500'
    };
    
    return (
      <span className={`badge ${colors[category] || 'bg-gray-500'} text-white`}>
        {categories[category] || category}
      </span>
    );
  };

  const fetchMyIssues = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.get('/issues/user/my-issues');
      setIssues(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching my issues:', error);
      toast.error('Bildirimleriniz yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, [isAuthenticated]);

  const handleDelete = async (issueId) => {
    const confirmed = window.confirm('Bu bildirimi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
    if (!confirmed) return;

    setDeleteLoading(issueId);
    try {
      await api.delete(`/issues/${issueId}`);
      
      // Remove from UI immediately
      setIssues(prev => prev.filter(issue => issue._id !== issueId));
      toast.success('Bildirim başarıyla silindi');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Bildirim silinirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      console.log('MyIssues status change:', { issueId, newStatus });
      
      const response = await api.patch(
        `/issues/${issueId}/status`,
        { status: newStatus }
      );
      
      console.log('MyIssues status response:', response.data);
      
      // Update issue in UI
      setIssues(prev => prev.map(issue => 
        issue._id === issueId 
          ? { ...issue, status: response.data.data?.status || response.data.status || newStatus }
          : issue
      ));
      toast.success('Durum başarıyla güncellendi');
    } catch (error) {
      console.error('MyIssues status change error:', error);
      const errorMessage = error.response?.data?.message || 'Durum güncellenirken hata oluştu';
      toast.error(errorMessage);
    }
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

  const getStats = () => {
    const total = issues.length;
    const bekleyen = issues.filter(i => i.status === 'beklemede').length;
    const incelenen = issues.filter(i => i.status === 'inceleniyor').length;
    const cozulen = issues.filter(i => i.status === 'cozuldu').length;
    
    return { total, bekleyen, incelenen, cozulen };
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Giriş Yapmalısınız</h3>
        <p className="text-gray-500 mb-6">Bildirimlerinizi görmek için giriş yapmalısınız.</p>
        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bildirimlerim</h1>
          <p className="text-gray-600">Yaptığınız tüm sorun bildirimleri</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
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

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bildirimlerim</h1>
        <p className="text-gray-600">Yaptığınız tüm sorun bildirimleri</p>
      </div>

      {issues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Toplam Bildirim</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.bekleyen}</div>
            <div className="text-sm text-gray-600">Beklemede</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.incelenen}</div>
            <div className="text-sm text-gray-600">İnceleniyor</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.cozulen}</div>
            <div className="text-sm text-gray-600">Çözüldü</div>
          </div>
        </div>
      )}

      {issues.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz bir sorun bildirmediniz</h3>
          <p className="text-gray-500 mb-6">Topluluğumuzdaki sorunları bildirmek için ilk adımı atın.</p>
          <Link to="/report" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            İlk Sorunu Bildir
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <div key={issue._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 relative group">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="PENDING">Beklemede</option>
                  <option value="IN_PROGRESS">İnceleniyor</option>
                  <option value="RESOLVED">Çözüldü</option>
                </select>
                <button
                  onClick={() => handleDelete(issue._id)}
                  disabled={deleteLoading === issue._id}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 p-2 text-xs"
                  title="Sil"
                >
                  {deleteLoading === issue._id ? (
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
              
              <Link to={`/issues/${issue._id}`} className="block">
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
                  {issue.location && (
                    <span className="flex items-center">
                      <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Konum
                    </span>
                  )}
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
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIssues;
