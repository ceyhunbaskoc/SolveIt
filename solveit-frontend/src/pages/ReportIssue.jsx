import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'altyapi',
    description: '',
    location: null,
    image: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { id: 'altyapi', name: 'Altyapı' },
    { id: 'temizlik', name: 'Temizlik' },
    { id: 'guvenlik', name: 'Güvenlik' },
    { id: 'ulasim', name: 'Ulaşım' },
    { id: 'yesilalan', name: 'Yeşil Alan' },
    { id: 'aydinlatma', name: 'Aydınlatma' },
    { id: 'diger', name: 'Diğer' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Başlık gerekli';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Başlık en az 5 karakter olmalı';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama gerekli';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Açıklama en az 20 karakter olmalı';
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Görsel en fazla 5MB olabilir');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Sadece görsel dosyaları yüklenebilir');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız konum hizmetini desteklemiyor');
      return;
    }
    
    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: { lat: latitude, lng: longitude }
        }));
        setLocationLoading(false);
        toast.success('Konumunuz alındı');
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Konum izni verilmedi. Lütfen tarayıcı ayarlarından konum iznini verin.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Konum bilgisi alınamadı');
            break;
          case error.TIMEOUT:
            toast.error('Konum alma işlemi zaman aşımına uğradı');
            break;
          default:
            toast.error('Konum alınırken bir hata oluştu');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const removeLocation = () => {
    setFormData(prev => ({
      ...prev,
      location: null
    }));
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
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      
      if (formData.location) {
        formDataToSend.append('location', JSON.stringify(formData.location));
      }
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/issues',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Sorun bildiriminiz başarıyla oluşturuldu!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Sorun bildirilirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title.trim().length >= 5 && 
                     formData.description.trim().length >= 20;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Sorun Bildir</h1>
        <p className="text-gray-600">Topluluğumuzdaki sorunları bildirerek çözüm sürecine katkıda bulunun</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Başlık <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Sorunun kısa ve açık bir başlığını girin"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/5 karakter minimum
              </p>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Sorunu detaylı bir şekilde açıklayın. Ne oldu, nerede ve ne zaman?"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/20 karakter minimum
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konum
              </label>
              <div className="space-y-2">
                {!formData.location ? (
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full disabled:opacity-50"
                  >
                    {locationLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Konum Alınıyor...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Mevcut Konumu Kullan
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800">
                        Konum belirlendi: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                      </span>
                      <button
                        type="button"
                        onClick={removeLocation}
                        className="text-error-600 hover:text-error-800"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Görsel (Opsiyonel)
              </label>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Görsel Yükle
                    </span>
                  </button>
                ) : (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Önizleme"
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-error-600 text-white rounded-full p-1 hover:bg-error-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG formatında, maksimum 5MB
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gönderiliyor...
              </span>
            ) : (
              'Sorunu Bildir'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;
