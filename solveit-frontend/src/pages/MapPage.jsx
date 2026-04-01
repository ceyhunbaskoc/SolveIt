import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link, useLocation } from 'react-router-dom';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import api from '../utils/axios';
import toast from 'react-hot-toast';

// Fix Leaflet default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
  const routerLocation = useLocation();
  const initialCenter = routerLocation.state?.center || [37.7648, 30.5566];
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [userLocation, setUserLocation] = useState(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/issues');
      setIssues(response.data.data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Sorunlar haritaya yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (routerLocation.state?.center) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Turkey center as fallback
          setMapCenter([39.0, 35.0]);
        }
      );
    } else {
      // Turkey center as fallback
      setMapCenter([39.0, 35.0]);
    }
  };

  useEffect(() => {
    fetchIssues();
    getUserLocation();
  }, []);

  const getMarkerColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#ef4444'; // red
      case 'IN_PROGRESS':
        return '#F7721A'; // neonOrange
      case 'RESOLVED':
        return '#C3F746'; // neonGreen
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Beklemede';
      case 'IN_PROGRESS':
        return 'İnceleniyor';
      case 'RESOLVED':
        return 'Çözüldü';
      default:
        return status;
    }
  };

  const getCategoryText = (category) => {
    const categories = {
      'altyapi': 'Altyapı',
      'temizlik': 'Temizlik',
      'guvenlik': 'Güvenlik',
      'ulasim': 'Ulaşım',
      'yesilalan': 'Yeşil Alan',
      'aydinlatma': 'Aydınlatma',
      'diger': 'Diğer'
    };
    return categories[category] || category;
  };

  const createCustomIcon = (status) => {
    const color = getMarkerColor(status);
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });
  };

  // Filter issues with valid location data
  const validIssues = issues.filter(issue => issue.location && issue.location.lat && issue.location.lng);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F1010]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C3F746] mx-auto mb-4"></div>
          <p className="text-gray-400">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative">
      <div className="absolute top-4 left-4 z-10 bg-[#161717] rounded-[2rem] shadow-lg p-4 max-w-sm border border-[#2A2B2B]">
        <h1 className="text-xl font-bold text-white mb-2">🗺️ Sorun Haritası</h1>
        <p className="text-sm text-gray-400 mb-3">
          Toplam {validIssues.length} konumlu sorun gösteriliyor
        </p>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-300">Beklemede</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#F7721A]"></div>
            <span className="text-gray-300">İnceleniyor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#C3F746]"></div>
            <span className="text-gray-300">Çözüldü</span>
          </div>
        </div>

        {userLocation && (
          <div className="mt-3 pt-3 border-t border-[#2A2B2B]">
            <p className="text-xs text-gray-500">
              📍 Konumunuz haritada gösteriliyor
            </p>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 z-10 bg-[#161717] rounded-[2rem] shadow-lg p-3 border border-[#2A2B2B]">
        <button
          onClick={() => window.location.href = '/'}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Ana Sayfa
        </button>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-[#C3F746]">📍 Konumunuz</p>
                <p className="text-xs text-gray-500">Burası sizsiniz</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Issue markers */}
        {validIssues.map((issue) => (
          <Marker
            key={issue._id}
            position={[parseFloat(issue.location.lat), parseFloat(issue.location.lng)]}
            icon={createCustomIcon(issue.status)}
          >
            <Popup>
              <div className="min-w-48">
                <h3 className="font-semibold text-white mb-2">{issue.title}</h3>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Kategori:</span>
                    <span className="font-medium text-gray-300">{getCategoryText(issue.category)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Durum:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.status === 'PENDING' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      issue.status === 'IN_PROGRESS' ? 'bg-[#F7721A]/20 text-[#F7721A] border border-[#F7721A]/30' :
                      'bg-[#C3F746]/20 text-[#C3F746] border border-[#C3F746]/30'
                    }`}>
                      {getStatusText(issue.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Bildiren:</span>
                    <span className="font-medium text-gray-300">{issue.reporterId?.name || 'Bilinmeyen'}</span>
                  </div>
                </div>

                <Link
                  to={`/issues/${issue._id}`}
                  className="block w-full bg-[#C3F746] hover:bg-[#a5d13b] !text-black text-center py-2 px-4 rounded-lg text-sm font-bold transition-colors"
                  style={{ color: 'black', textDecoration: 'none' }}
                >
                  Detaya Git →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;
