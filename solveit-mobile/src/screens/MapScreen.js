import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import { LEAFLET_CSS, LEAFLET_JS } from '../utils/leafletBundle';

const STATUS_COLORS = {
  PENDING: '#F59E0B',
  IN_PROGRESS: '#3B82F6',
  RESOLVED: '#10B981',
};

const STATUS_LABELS = {
  PENDING: 'Beklemede',
  IN_PROGRESS: 'İşlemde',
  RESOLVED: 'Çözüldü',
};

function buildHTML(issues) {
  const markers = issues.map(i => ({
    lat: i.location.lat,
    lng: i.location.lng,
    title: i.title,
    status: i.status,
    id: i._id,
  }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <style>${LEAFLET_CSS}</style>
  <script>${LEAFLET_JS}</script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{height:100%;width:100%;background:#0F1010}
    #err{display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#F87171;font-size:13px;text-align:center;padding:16px}
    .leaflet-tile-pane{filter:brightness(0.85)}
    .leaflet-popup-content-wrapper{background:#161717;color:#fff;border:1px solid #2A2B2B;border-radius:12px}
    .leaflet-popup-tip{background:#161717}
    .leaflet-popup-close-button{color:#9CA3AF!important}
    .pt{font-weight:700;font-size:13px;margin-bottom:4px;color:#F9FAFB}
    .ps{font-size:12px;font-weight:600;margin-bottom:8px}
    .pb{display:block;padding:6px 14px;background:#C3F746;color:#000;border:none;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;width:100%;text-align:center}
  </style>
</head>
<body>
<div id="map"></div>
<div id="err">Harita yüklenemedi.<br/>İnternet bağlantınızı kontrol edin.</div>
<script>
  window.onerror=function(){document.getElementById('err').style.display='block';return true};
  if(typeof L==='undefined'){document.getElementById('err').style.display='block';}
</script>
<script>
  var map=L.map('map',{center:[37.7572,30.5247],zoom:14});
  window._map=map;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap'
  }).addTo(map);
  setTimeout(function(){map.invalidateSize();},300);
  window.addEventListener('resize',function(){map.invalidateSize();});

  var SC=${JSON.stringify(STATUS_COLORS)};
  var SL=${JSON.stringify(STATUS_LABELS)};
  var issues=${JSON.stringify(markers)};

  issues.forEach(function(issue){
    var c=SC[issue.status]||'#C3F746';
    var icon=L.divIcon({
      className:'',
      html:'<div style="width:16px;height:16px;border-radius:50%;background:'+c+';border:2.5px solid #000;box-shadow:0 0 6px '+c+'88"></div>',
      iconSize:[16,16],iconAnchor:[8,8]
    });
    L.marker([issue.lat,issue.lng],{icon:icon}).addTo(map)
      .bindPopup(
        '<div class="pt">'+issue.title+'</div>'+
        '<div class="ps" style="color:'+c+'">'+(SL[issue.status]||issue.status)+'</div>'+
        '<button class="pb" onclick="nav(\''+issue.id+'\')">Detay →</button>',
        {maxWidth:220}
      );
  });

  function nav(id){
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'navigate',id:id}));
  }
</script>
</body>
</html>`;
}

export default function MapScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchIssues = useCallback(async () => {
    try {
      const res = await api.get('/issues');
      const withCoords = (res.data.data || []).filter(
        i => i.location && i.location.lat && i.location.lng
      );
      setIssues(withCoords);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchIssues(); }, [fetchIssues]));

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'navigate') {
        navigation.navigate('IssueDetail', { id: msg.id });
      }
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C3F746" />
        <Text style={styles.loadingText}>Harita yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        source={{ html: buildHTML(issues) }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        startInLoadingState
        scalesPageToFit={false}
        mixedContentMode="always"
        injectedJavaScript="setTimeout(function(){if(window._map){window._map.invalidateSize();}},500);true;"
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#C3F746" />
          </View>
        )}
      />

      <View style={styles.legend}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: STATUS_COLORS[key] }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.countBadge}>
        <Text style={styles.countText}>{issues.length} sorun</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1010' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1010' },
  loadingText: { color: '#9CA3AF', marginTop: 12, fontSize: 14 },
  map: { flex: 1 },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(22,23,23,0.92)',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#FFF', fontSize: 12 },
  countBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(22,23,23,0.92)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: { color: '#C3F746', fontWeight: 'bold', fontSize: 13 },
});
