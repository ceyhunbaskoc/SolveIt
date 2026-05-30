import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();

  const validate = () => {
    const e = {};
    if (!email) e.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Geçerli e-posta girin';
    if (!password) e.password = 'Şifre gerekli';
    else if (password.length < 6) e.password = 'Şifre en az 6 karakter olmalı';
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Giriş Hatası', result.error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>SolveIt</Text>
        <Text style={styles.subtitle}>Kampüs ve Şehir Sorun Bildirimi</Text>

        <View style={styles.card}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="ornek@email.com"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors(p => ({ ...p, email: '' })); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors(p => ({ ...p, password: '' })); }}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Hesabınız yok mu? <Text style={styles.linkBold}>Kayıt Olun</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1010' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#C3F746', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 32 },
  card: { backgroundColor: '#161717', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#2A2B2B' },
  label: { color: '#9CA3AF', fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#0F1010', borderWidth: 1, borderColor: '#2A2B2B', borderRadius: 12, padding: 12, color: '#FFF', fontSize: 14 },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  button: { backgroundColor: '#C3F746', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  link: { color: '#9CA3AF', textAlign: 'center', marginTop: 24, fontSize: 14 },
  linkBold: { color: '#C3F746', fontWeight: 'bold' },
});
