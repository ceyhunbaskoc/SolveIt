import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canEdit = useMemo(() => {
    return user && (issue?.reporterId?._id === user._id || user.role === 'admin');
  }, [user, issue]);

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
        return <span className="badge-warning">Beklemede</span>;
      case 'inceleniyor':
        return <span className="badge-primary">İnceleniyor</span>;
      case 'cozuldu':
        return <span className="badge-success">Çözüldü</span>;
      default:
        return <span className="badge-secondary">{status}</span>;
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

  const fetchIssue = async () => {
    try {
      const response = await api.get(`/issues/${id}`);
      setIssue(response.data.data || response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Sorun bulunamadı');
        navigate('/');
      } else {
        toast.error('Sorun yüklenirken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  // Socket.io bağlantısı
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io('http://localhost:5000');
    
    socket.on('voteUpdated', (data) => {
      console.log('IssueDetail - Vote updated:', data);
      
      // Eğer bu issue ise, oyları güncelle
      if (data.issueId === id) {
        setIssue(prevIssue => 
          prevIssue ? { ...prevIssue, upvotes: data.upvotes, downvotes: data.downvotes } : null
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, id]);

  const handleStatusChange = async (newStatus) => {
    if (!canEdit) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    setStatusLoading(true);
    try {
      const response = await api.patch(
        `/issues/${id}/status`,
        { status: newStatus }
      );
      
      // Sadece status'ü güncelle, tüm objeyi değiştirme
      setIssue(prev => ({ ...prev, status: newStatus }));
      toast.success('Durum başarıyla güncellendi');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Durum güncellenirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.error('Bu işlem için giriş yapmalısınız');
      return;
    }

    if (issue.reporterId?._id !== user._id && user.role !== 'admin') {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    const confirmed = window.confirm('Bu sorunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/issues/${id}`);
      toast.success('Sorun başarıyla silindi');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Sorun silinirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Oy vermek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await api.post(`/issues/${id}/upvote`);
      setIssue(response.data.data);
      toast.success('Oyunuz başarıyla güncellendi');
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız oldu');
      console.error('Error upvoting:', error);
    }
  };

  const handleDownvote = async () => {
    if (!isAuthenticated) {
      toast.error('Oy vermek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await api.post(`/issues/${id}/downvote`);
      setIssue(response.data.data);
      toast.success('Oyunuz başarıyla güncellendi');
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız oldu');
      console.error('Error downvoting:', error);
    }
  };

  const getScore = () => {
    return (issue?.upvotes?.length || 0) - (issue?.downvotes?.length || 0);
  };

  const hasUpvoted = () => {
    if (!isAuthenticated || !user) return false;
    return issue?.upvotes?.some(upvote => upvote._id === user._id || upvote === user._id);
  };

  const hasDownvoted = () => {
    if (!isAuthenticated || !user) return false;
    return issue?.downvotes?.some(downvote => downvote._id === user._id || downvote === user._id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMapUrl = () => {
    if (!issue.location) return null;
    const { latitude, longitude } = issue.location;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="card">
            <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sorun bulunamadı</h3>
        <p className="text-gray-500 mb-6">Aradığınız sorun mevcut değil veya silinmiş olabilir.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  console.log('IssueDetail user:', user);
  console.log('IssueDetail issue.reporterId:', issue.reporterId);
  console.log('IssueDetail user._id:', user?._id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
        >
          ← Geri Dön
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{issue.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              {getCategoryBadge(issue.category)}
              {getStatusBadge(issue.status)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ml-6">
            {/* Upvote/Downvote Butonları */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpvote}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasUpvoted()
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span>Destekle</span>
              </button>
              
              <button
                onClick={handleDownvote}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasDownvoted()
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Katılmıyorum</span>
              </button>
            </div>
            
            {/* Skor */}
            <div className="flex items-center space-x-1">
              <span className={`px-3 py-2 rounded-full text-lg font-bold ${
                getScore() > 0 
                  ? 'bg-green-100 text-green-700'
                  : getScore() < 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {getScore() > 0 && '+'}{getScore()}
              </span>
              <span className="text-gray-500 text-sm">Skor</span>
            </div>
            
            {canEdit && (
              <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="PENDING">Beklemede</option>
                  <option value="IN_PROGRESS">İnceleniyor</option>
                  <option value="RESOLVED">Çözüldü</option>
                </select>
                
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm p-2"
                  title="Sil"
                >
                  {deleteLoading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Bildiren</h3>
            <p className="text-gray-600">{issue.reporterId?.name || 'Bilinmeyen Kullanıcı'}</p>
            <p className="text-sm text-gray-500">{issue.reporterId?.email || 'Bilinmeyen E-posta'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Tarih</h3>
            <p className="text-gray-600">{formatDate(issue.createdAt)}</p>
            {issue.updatedAt && issue.updatedAt !== issue.createdAt && (
              <p className="text-sm text-gray-500">Güncellenme: {formatDate(issue.updatedAt)}</p>
            )}
          </div>
        </div>

        {issue.location && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Konum</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">
                Enlem: {issue.location?.latitude?.toFixed(6) || 'Bilinmiyor'}, Boylam: {issue.location?.longitude?.toFixed(6) || 'Bilinmiyor'}
              </p>
              <a
                href={getMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
              >
                Haritada Göster
              </a>
            </div>
          </div>
        )}

        {issue.image && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Görsel</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <img 
                src={issue.image} 
                alt={issue.title}
                className="w-full max-w-2xl rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueDetail;
