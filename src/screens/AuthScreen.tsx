import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAppStore } from '../store';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setUser, setAuthenticated } = useAppStore();
  const { t } = useTranslation();
  
  // Get role from route params, default to 'client' for client role
  const selectedRole = route.params?.role || 'client';
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!password.trim()) {
      setError('Password is required');
      return false;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError('Name is required');
        return false;
      }

      if (!phone.trim()) {
        setError('Phone number is required');
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login
        const response = await authService.login({
          email: email.trim(),
          password: password,
        });

        // Get the mapped user from storage (authService stores it)
        const appUser = await authService.getStoredUser();
        
        if (appUser) {
          setUser(appUser);
          setAuthenticated(true);
          navigation.navigate('UserApp');
        }
      } else {
        // Register
        const response = await authService.register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password,
          password_confirmation: confirmPassword,
          role: selectedRole, // Dynamic role from route params
        });

        // Get the mapped user from storage
        const appUser = await authService.getStoredUser();
        
        if (appUser) {
          setUser(appUser);
          setAuthenticated(true);
          navigation.navigate('UserApp');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Handle error response
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        (isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.');
      
      setError(errorMessage);
      Alert.alert(
        isLogin ? 'Login Error' : 'Registration Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Handle social login
    console.log(`${provider} login`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.content}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('RoleSelection');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Logo and Title */}
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
        </View>
       
        <Text style={styles.subtitle}>
          {isLogin ? t('auth.welcome') : t('auth.createAccount')}
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!isLogin && (
          <Input
            label={t('auth.nameLabel')}
            placeholder={t('auth.namePlaceholder')}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
            leftIcon="person-outline"
          />
        )}

        <Input
          label={t('auth.emailLabel')}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          keyboardType="email-address"
          leftIcon="mail-outline"
        />

        {!isLogin && (
          <Input
            label={t('auth.phoneLabel')}
            placeholder={t('auth.phonePlaceholder')}
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError(null);
            }}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />
        )}

        <Input
          label={t('auth.passwordLabel')}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          secureTextEntry
          leftIcon="lock-closed-outline"
        />

        {!isLogin && (
          <Input
            label={t('auth.confirmPasswordLabel')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError(null);
            }}
            secureTextEntry
            leftIcon="lock-closed-outline"
          />
        )}

        <Button
          title={isLogin ? t('auth.login') : t('auth.signup')}
          onPress={handleAuth}
          loading={loading}
          style={styles.authButton}
        />

        {isLogin && (
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Social Login */}
      <View style={styles.socialContainer}>
        <Text style={styles.socialText}>{t('auth.orContinueWith')}</Text>
        
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('google')}
          >
            <Ionicons name="logo-google" size={24} color={COLORS.error} />
            <Text style={styles.socialButtonText}>{t('auth.google')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('apple')}
          >
            <Ionicons name="logo-apple" size={24} color={COLORS.text} />
            <Text style={styles.socialButtonText}>{t('auth.apple')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Switch Mode */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
        </Text>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchButton}>
            {isLogin ? t('auth.signup') : t('auth.login')}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: {
    padding: SPACING.sm,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  authButton: {
    marginTop: SPACING.lg,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  socialContainer: {
    marginBottom: SPACING.xl,
  },
  socialText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  socialButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  switchButton: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});

export default AuthScreen; 