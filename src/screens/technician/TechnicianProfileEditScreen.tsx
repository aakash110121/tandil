import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { getTechnicianProfile, updateTechnicianProfile, TechnicianProfileData } from '../../services/technicianService';

const TechnicianProfileEditScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [profile, setProfile] = useState<TechnicianProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [specializationsText, setSpecializationsText] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [profilePicture, setProfilePicture] = useState<{ uri: string; type?: string; name?: string } | null>(null);

  useEffect(() => {
    getTechnicianProfile().then((data) => {
      setProfile(data ?? null);
      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setServiceArea(data.service_area || '');
        setSpecializationsText(Array.isArray(data.specializations) ? data.specializations.join(', ') : '');
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to photos to change profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setProfilePicture({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not open photos');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required.');
      return;
    }
    if (password || passwordConfirmation || currentPassword) {
      if (!currentPassword) {
        Alert.alert('Error', 'Enter current password to change password.');
        return;
      }
      if (password !== passwordConfirmation) {
        Alert.alert('Error', 'New password and confirmation do not match.');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Error', 'New password must be at least 6 characters.');
        return;
      }
    }
    setSaving(true);
    try {
      const updated = await updateTechnicianProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        service_area: serviceArea.trim() || undefined,
        specializations: specializationsText.trim() ? specializationsText.trim().split(/\s*,\s*/).join(',') : undefined,
        current_password: currentPassword || undefined,
        password: password || undefined,
        password_confirmation: passwordConfirmation || undefined,
        profile_picture: profilePicture || undefined,
      });
      setSaving(false);
      if (updated) {
        Alert.alert('Success', 'Profile updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (err: any) {
      setSaving(false);
      const msg = err.response?.data?.message ?? err.message ?? 'Failed to update profile.';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const displayImageUri = profilePicture?.uri ?? profile?.profile_picture_url;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            {displayImageUri ? (
              <Image source={{ uri: displayImageUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={36} color={COLORS.textSecondary} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="create" size={14} color={COLORS.background} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <Text style={styles.label}>Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />
          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+971..." keyboardType="phone-pad" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service</Text>
          <Text style={styles.label}>Service Area</Text>
          <TextInput style={styles.input} value={serviceArea} onChangeText={setServiceArea} placeholder="e.g. Dubai" />
          <Text style={styles.label}>Specializations (comma-separated)</Text>
          <TextInput style={styles.input} value={specializationsText} onChangeText={setSpecializationsText} placeholder="e.g. AC, Plumbing" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Text style={styles.label}>Current Password</Text>
          <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Leave blank to keep" secureTextEntry />
          <Text style={styles.label}>New Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureTextEntry />
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput style={styles.input} value={passwordConfirmation} onChangeText={setPasswordConfirmation} placeholder="Repeat new password" secureTextEntry />
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.sm, minWidth: 40 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SPACING.sm },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  avatarWrap: { alignSelf: 'center', position: 'relative', marginBottom: SPACING.md },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: '#fff' },
});

export default TechnicianProfileEditScreen;
