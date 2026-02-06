import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const PersonalInfoScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('personalInfo.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t('personalInfo.fullName')}</Text>
        <TextInput style={styles.input} placeholder={t('personalInfo.placeholderName')} placeholderTextColor={COLORS.textSecondary} />
        <Text style={styles.label}>{t('personalInfo.email')}</Text>
        <TextInput style={styles.input} placeholder={t('personalInfo.placeholderEmail')} keyboardType="email-address" placeholderTextColor={COLORS.textSecondary} />
        <Text style={styles.label}>{t('personalInfo.phone')}</Text>
        <TextInput style={styles.input} placeholder={t('personalInfo.placeholderPhone')} keyboardType="phone-pad" placeholderTextColor={COLORS.textSecondary} />

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>{t('personalInfo.saveChanges')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  form: { padding: SPACING.lg, gap: SPACING.sm },
  label: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.text },
  saveBtn: { marginTop: SPACING.md, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: FONT_WEIGHTS.medium },
});

export default PersonalInfoScreen;












