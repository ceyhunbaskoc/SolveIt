import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    contactInfo: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [currentXp, setCurrentXp] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  const getLevelInfo = (xp) => {
    if (xp >= 150) {
      return {
        title: 'Şehir Kahramanı',
        color: 'bg-purple-100 text-purple-800',
        icon: '🏆'
      };
    } else if (xp >= 50) {
      return {
        title: 'Aktif Gözlemci',
        color: 'bg-blue-100 text-blue-800',
        icon: '👁️'
      };
    } else {
      return {
        title: 'Duyarlı Vatandaş',
        color: 'bg-green-100 text-green-800',
        icon: '🌱'
      };
    }
  };

  const levelInfo = getLevelInfo(currentXp);

  // Güncel kullanıcı verilerini çek
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      setCurrentUser(userData);
      setCurrentXp(userData.xp || 0);
      
      // Form verilerini güncelle
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        department: userData.department || '',
        contactInfo: userData.contactInfo || ''
      });
    } catch (error) {
      console.error('Kullanıcı bilgileri çekilirken hata:', error);
      toast.error('Kullanıcı bilgileri yüklenirken hata oluştu');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    } else {
      setFetchLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get('/users/profile');
      const profileData = response.data;
      
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        department: profileData.department || '',
        contactInfo: profileData.contactInfo || ''
      });
    } catch (error) {
      toast.error('Profil bilgileri yüklenirken hata oluştu');
      console.error('Error fetching profile:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Adınız gerekli';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Ad en az 2 karakter olmalı';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.put(
        '/users/profile',
        {
          name: formData.name,
          email: formData.email,
          department: formData.department,
          contactInfo: formData.contactInfo
        }
      );
      
      toast.success('Profil başarıyla güncellendi');
      
      // Update auth context with new user data
      // This would need to be handled in the AuthContext
      // For now, we'll just show success message
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profil güncellenirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Giriş Yapmalısınız</h3>
        <p className="text-gray-500 mb-6">Profilinizi düzenlemek için giriş yapmalısınız.</p>
        <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Giriş Yap
        </a>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Ayarları</h1>
          <p className="text-gray-600">Kişisel bilgilerinizi yönetin</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Ayarları</h1>
        <p className="text-gray-600">Kişisel bilgilerinizi yönetin</p>
      </div>

      {/* XP ve Seviye Kartı */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-4xl">{levelInfo.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{levelInfo.title}</h2>
                <p className="text-blue-100">Seviyeniz</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{currentXp}</div>
              <div className="text-blue-100">Toplam XP</div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Sıradaki Seviye</span>
              <span>
                {currentXp < 50 ? `${50 - currentXp} XP` : 
                 currentXp < 150 ? `${150 - currentXp} XP` : 
                 'Maksimum Seviye'}
              </span>
            </div>
            <div className="w-full bg-blue-300 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{
                  width: currentXp < 50 ? `${(currentXp / 50) * 100}%` :
                         currentXp < 150 ? `${((currentXp - 50) / 100) * 100}%` :
                         '100%'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Adınız Soyadınız"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta Adresi <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="ornek@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Not: E-posta adresini değiştirmek sistem yöneticisi onayı gerektirebilir
              </p>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Departman/Birim
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Örn: Bilgi İşlem Daire Başkanlığı"
              />
              <p className="mt-1 text-xs text-gray-500">
                Çalıştığınız departman veya birim (opsiyonel)
              </p>
            </div>

            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-1">
                İletişim Bilgileri
              </label>
              <textarea
                id="contactInfo"
                name="contactInfo"
                rows={3}
                value={formData.contactInfo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Telefon numarası, dahili gibi ek iletişim bilgileriniz"
              />
              <p className="mt-1 text-xs text-gray-500">
                Ek iletişim bilgileriniz (opsiyonel)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hesap Bilgileri</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Kayıt Tarihi:</span>
              <span className="text-sm text-gray-900">
                {currentUser ? new Date(currentUser.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Kullanıcı Adı:</span>
              <span className="text-sm text-gray-900">
                {currentUser?.name || 'Bilinmiyor'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">E-posta:</span>
              <span className="text-sm text-gray-900">
                {currentUser?.email || 'Bilinmiyor'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Kullanıcı Rolü:</span>
              <span className="text-sm text-gray-900">
                {currentUser?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Deneyim Puanı (XP):</span>
              <span className="text-sm font-bold text-blue-600">
                {currentXp} XP
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Hesap Durumu:</span>
              <span className="bg-green-100 text-green-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">Aktif</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Güncelleniyor...
              </span>
            ) : (
              'Değişiklikleri Kaydet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
