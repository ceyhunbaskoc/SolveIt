import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import IssueDetailScreen from './src/screens/IssueDetailScreen';
import ReportIssueScreen from './src/screens/ReportIssueScreen';
import MyIssuesScreen from './src/screens/MyIssuesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import MapScreen from './src/screens/MapScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = { Home: '🏠', Map: '🗺️', Report: '➕', MyIssues: '📋', Leaderboard: '🏆', Profile: '👤' };

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => <Text style={{ fontSize: 17 }}>{TAB_ICONS[route.name] || '•'}</Text>,
        tabBarActiveTintColor: '#C3F746',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { backgroundColor: '#161717', borderTopColor: '#2A2B2B', height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 9 },
        headerStyle: { backgroundColor: '#161717', shadowColor: 'transparent', borderBottomColor: '#2A2B2B', borderBottomWidth: 1 },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Anasayfa', headerTitle: 'SolveIt' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Harita', headerTitle: 'Sorun Haritası' }} />
      <Tab.Screen name="Report" component={ReportIssueScreen} options={{ title: 'Bildir', headerTitle: 'Sorun Bildir' }} />
      <Tab.Screen name="MyIssues" component={MyIssuesScreen} options={{ title: 'Bildirmlerim', headerTitle: 'Bildirimlerim' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Sıralama', headerTitle: 'Liderlik Tablosu' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil', headerTitle: 'Profilim' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={HomeTabs} />
          <Stack.Screen
            name="IssueDetail"
            component={IssueDetailScreen}
            options={{
              headerShown: true,
              headerTitle: 'Sorun Detayı',
              headerStyle: { backgroundColor: '#161717' },
              headerTintColor: '#FFF',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </AuthProvider>
  );
}
