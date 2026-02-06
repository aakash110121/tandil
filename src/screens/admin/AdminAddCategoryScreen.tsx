import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { adminService } from '../../services/adminService';
import { compressImageForUpload } from '../../utils/compressImage';

const AdminAddCategoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<{ uri: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const pickImageFromDevice = async () => {
    if (pickingImage) return;
    setPickingImage(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('admin.categoryForm.permissionTitle', 'Permission needed'),
          t(
            'admin.categoryForm.permissionBody',
            'Allow access to your photos to add a category image. You can enable it in Settings.'
          ),
          [{ text: t('common.done', 'OK') }]
        );
        return;
      }
      if (typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        Alert.alert(
          t('admin.categoryForm.notAvailableTitle', 'Not available'),
          t(
            'admin.categoryForm.notAvailableBody',
            'Image picker is not available in this environment.'
          ),
          [{ text: t('common.done', 'OK') }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        const uri = await compressImageForUpload(result.assets[0].uri);
        setImage({ uri });
      }
    } catch (err: any) {
      Alert.alert(
        t('admin.categoryForm.unableToOpenTitle', 'Unable to open photos'),
        err?.message ?? t('admin.categoryForm.unableToOpenBody', 'Could not open photo library.'),
        [{ text: t('common.done', 'OK') }]
      );
    } finally {
      setPickingImage(false);
    }
  };

  const removeImage = () => setImage(null);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = t('admin.categoryForm.errorNameRequired', 'Category name is required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCategory = async () => {
    if (!validateForm()) {
      Alert.alert(
        t('admin.categoryForm.missingFieldTitle', 'Missing required field'),
        t('admin.categoryForm.missingFieldMessage', 'Please enter a category name.'),
        [{ text: t('common.done', 'OK') }]
      );
      return;
    }

    setLoading(true);
    try {
      await adminService.createCategory({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        image: image ?? undefined,
      });
      Alert.alert(
        t('admin.users.success', 'Success'),
        t('admin.categoryForm.successCreate', 'Category created successfully.'),
        [{ text: t('common.done', 'OK'), onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        t('admin.categoryForm.createFailed', 'Failed to create category. Please try again.');
      Alert.alert(t('admin.users.error', 'Error'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('admin.categoryForm.addTitle', 'Add Category')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('admin.categoryForm.detailsSection', 'Category details')}
            </Text>

            <Input
              label={t('admin.categoryForm.nameLabel', 'Name *')}
              placeholder={t('admin.categoryForm.namePlaceholder', 'e.g. Fertilizers')}
              value={name}
              onChangeText={(t) => { setName(t); if (errors.name) setErrors({ ...errors, name: '' }); }}
              leftIcon="pricetag-outline"
              error={errors.name}
            />

            <Input
              label={t('admin.categoryForm.slugLabel', 'Slug (optional)')}
              placeholder={t('admin.categoryForm.slugPlaceholder', 'e.g. fertilizers')}
              value={slug}
              onChangeText={setSlug}
              autoCapitalize="none"
            />

            <Input
              label={t('admin.categoryForm.descriptionLabel', 'Description (optional)')}
              placeholder={t('admin.categoryForm.descriptionPlaceholder', 'e.g. Organic and chemical fertilizers')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('admin.categoryForm.imageSection', 'Image (optional)')}
            </Text>
            <Text style={styles.uploadedHint}>
              {t('admin.categoryForm.imageHint', 'Add an image for the category. JPEG, PNG or WebP.')}
            </Text>
            <TouchableOpacity
              style={[styles.uploadBtn, pickingImage && styles.uploadBtnDisabled]}
              onPress={pickImageFromDevice}
              disabled={pickingImage}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={24} color={COLORS.primary} />
              <Text style={styles.uploadBtnText}>
                {pickingImage
                  ? t('admin.categoryForm.opening', 'Opening…')
                  : t('admin.categoryForm.uploadFromDevice', 'Upload from device')}
              </Text>
            </TouchableOpacity>
            {image && (
              <View style={styles.imagePreviewWrap}>
                <View style={styles.thumbWrap}>
                  <Image source={{ uri: image.uri }} style={styles.thumb} contentFit="cover" />
                  <TouchableOpacity style={styles.thumbRemove} onPress={removeImage}>
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <Button
            title={t('admin.categoryForm.submitCreate', 'Create Category')}
            onPress={handleCreateCategory}
            disabled={loading}
            loading={loading}
            style={styles.submitButton}
          />
          <View style={styles.bottomPad} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  headerRight: { width: 40 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  uploadedHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  imagePreviewWrap: { marginTop: SPACING.sm },
  thumbWrap: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: { width: '100%', height: '100%' },
  thumbRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  submitButton: { marginTop: SPACING.md },
  bottomPad: { height: SPACING.xl * 2 },
});

export default AdminAddCategoryScreen;
