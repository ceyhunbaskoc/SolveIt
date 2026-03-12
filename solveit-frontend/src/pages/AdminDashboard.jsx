import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingIssues, setUpdatingIssues] = useState(new Set());

  // Admin kontrolü
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Tüm sorunları çek
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/issues');
      setIssues(response.data.data || response.data || []);
    } catch (error) {
      console.error('Sorunlar yüklenirken hata:', error);
      toast.error('Sorunlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Statü güncelleme
  const updateStatus = async (issueId, newStatus) => {
    try {
      setUpdatingIssues(prev => new Set(prev).add(issueId));
      
      await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      
      setIssues(prev => prev.map(issue => 
        issue._id === issueId ? { ...issue, status: newStatus } : issue
      ));
      
      toast.success('Statü başarıyla güncellendi');
    } catch (error) {
      console.error('Statü güncellenirken hata:', error);
      toast.error('Statü güncellenirken bir hata oluştu');
    } finally {
      setUpdatingIssues(prev => {
        const newSet = new Set(prev);
        newSet.delete(issueId);
        return newSet;
      });
    }
  };

  // Sorun silme
  const deleteIssue = async (issueId) => {
    if (!window.confirm('Bu sorunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      await api.delete(`/issues/${issueId}`);
      
      setIssues(prev => prev.filter(issue => issue._id !== issueId));
      
      toast.success('Sorun başarıyla silindi');
    } catch (error) {
      console.error('Sorun silinirken hata:', error);
      toast.error('Sorun silinirken bir hata oluştu');
    }
  };

  // Statü çeviri fonksiyonu
  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Beklemede',
      'IN_PROGRESS': 'İnceleniyor',
      'RESOLVED': 'Çözüldü'
    };
    return statusMap[status] || status;
  };

  // Kategori çeviri fonksiyonu
  const getCategoryText = (category) => {
    const categoryMap = {
      'infrastructure': 'Altyapı',
      'security': 'Güvenlik',
      'cleanliness': 'Temizlik',
      'transportation': 'Ulaşım',
      'environment': 'Çevre',
      'other': 'Diğer'
    };
    return categoryMap[category] || category;
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Yönetici Paneli</h1>
        <div className="text-sm text-gray-500">
          Toplam {issues.length} sorun
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bildiren Kişi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statü
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Henüz hiç sorun bulunmuyor
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(issue.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={issue.title}>
                          {issue.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {getCategoryText(issue.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.reporterId?.name || issue.reporterId?.username || 'Bilinmeyen'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={issue.status}
                          onChange={(e) => updateStatus(issue._id, e.target.value)}
                          disabled={updatingIssues.has(issue._id)}
                          className={`px-3 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                            issue.status === 'PENDING' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : issue.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          <option value="PENDING">Beklemede</option>
                          <option value="IN_PROGRESS">İnceleniyor</option>
                          <option value="RESOLVED">Çözüldü</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => deleteIssue(issue._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
