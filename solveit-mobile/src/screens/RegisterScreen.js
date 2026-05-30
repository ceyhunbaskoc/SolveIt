import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const update = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 3) e.name = 'Ad en az 3 karakter olmalı';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli e-posta girin';
    if (!form.password || form.password.length < 6) e.password = 'Şifre en az 6 karakter olmalı';
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.department);
    setLoading(false);
    if (!result.success) Alert.alert('Kayıt Hatası', result.error);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>SolveIt'e katılın ve sorunları bildirin</Text>

        <View style={styles.card}>
          {[
            { key: 'name', label: 'Ad Soyad', placeholder: 'Adınız Soyadınız' },
            { key: 'email', label: 'E-posta', placeholder: 'ornek@email.com', keyboard: 'email-address' },
            { key: 'password', label: 'Şifre', placeholder: '••••••••', secure: true },
            { key: 'department', label: 'Departman (Opsiyonel)', placeholder: 'Bilgisayar Mühendisliği' },
          ].map(({ key, label, placeholder, keyboard, secure }) => (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[styles.input, errors[key] && styles.inputError]}
                placeholder={placeholder}
                placeholderTextColor="#6B7280"
                value={form[key]}
                onChangeText={(t) => update(key, t)}
                keyboardType={keyboard || 'default'}
                autoCapitalize={key === 'email' ? 'none' : 'words'}
                secureTextEntry={!!secure}
              />
              {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
            </View>
          ))}

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Zaten hesabınız var mı? <Text style={styles.linkBold}>Giriş Yapın</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1010' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 8 },
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
