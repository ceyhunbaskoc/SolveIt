import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

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

  // Grafik verilerini hesapla
  const getStatusData = () => {
    const statusCounts = {
      'Beklemede': 0,
      'İnceleniyor': 0,
      'Çözüldü': 0
    };

    issues.forEach(issue => {
      const statusText = getStatusText(issue.status);
      if (statusCounts[statusText] !== undefined) {
        statusCounts[statusText]++;
      }
    });

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const getCategoryData = () => {
    const categoryCounts = {};

    issues.forEach(issue => {
      const categoryText = getCategoryText(issue.category);
      categoryCounts[categoryText] = (categoryCounts[categoryText] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  };

  // Grafik renkleri
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const statusData = getStatusData();
  const categoryData = getCategoryData();

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

      {/* Grafikler */}
      {!loading && issues.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statü Dağılımı - Pasta Grafik */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statü Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Kategori Dağılımı - Sütun Grafik */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
