import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { buildFullImageUrl } from '../../config/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { adminService } from '../../services/adminService';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const WEIGHT_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
];

const AdminAddProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('active');
  const [categoryId, setCategoryId] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [sku, setSku] = useState('');
  const [handle, setHandle] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [uploadedImages, setUploadedImages] = useState<{ uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showWeightUnitDropdown, setShowWeightUnitDropdown] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  const pickImageFromDevice = async () => {
    if (pickingImage) return;
    setPickingImage(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Allow access to your photos to add product images. You can enable it in Settings.',
          [{ text: 'OK' }]
        );
        return;
      }
      if (typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        Alert.alert(
          'Not available',
          'Image picker is not available in this environment. Try running in Expo Go or a development build.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        setUploadedImages((prev) => [...prev, ...result.assets.map((a) => ({ uri: a.uri }))]);
      }
    } catch (err: any) {
      const message = err?.message || err?.code || 'Could not open photo library.';
      Alert.alert('Unable to open photos', message, [{ text: 'OK' }]);
    } finally {
      setPickingImage(false);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    setImageUrls((prev) => [...prev, '']);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    const priceNum = parseFloat(price);
    if (!price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(priceNum) || priceNum < 0) newErrors.price = 'Enter a valid price';
    const stockNum = parseInt(stock, 10);
    if (!stock.trim()) newErrors.stock = 'Stock is required';
    else if (isNaN(stockNum) || stockNum < 0) newErrors.stock = 'Enter a valid stock number';
    if (!status) newErrors.status = 'Status is required';
    if (!sku.trim()) newErrors.sku = 'SKU is required';
    if (!handle.trim()) newErrors.handle = 'Handle is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Missing required fields',
        'Please fill in all required fields (Name, Price, Stock, SKU, Handle) and fix any errors before creating the product.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      const categoryIdNum = categoryId.trim() ? parseInt(categoryId, 10) : undefined;
      const urlList: string[] = imageUrls.filter((u) => u.trim().length > 0);
      let createdData: { image_url?: string | null; image?: string | null; primary_image?: { image_url?: string; image_path?: string }; images?: Array<{ image_url?: string; image_path?: string }> } | undefined;

      if (uploadedImages.length > 0) {
        const res = await adminService.createProductWithImages({
          name: name.trim(),
          description: description.trim() || undefined,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          status,
          category_id: categoryIdNum ?? null,
          weight_unit: weightUnit,
          sku: sku.trim(),
          handle: handle.trim(),
          image_urls: urlList.length > 0 ? urlList : undefined,
          imageFiles: uploadedImages,
        });
        createdData = res.data;
      } else {
        const res = await adminService.createProduct({
          name: name.trim(),
          description: description.trim() || undefined,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          status,
          category_id: categoryIdNum ?? null,
          weight_unit: weightUnit,
          sku: sku.trim(),
          handle: handle.trim(),
          image_urls: urlList.length > 0 ? urlList : undefined,
        });
        createdData = res.data;
      }

      const rawImageUrl =
        (typeof createdData?.image_url === 'string' && createdData.image_url.trim() ? createdData.image_url : null) ??
        (typeof createdData?.primary_image?.image_url === 'string' && createdData.primary_image.image_url.trim() ? createdData.primary_image.image_url : null) ??
        (createdData?.images?.length && typeof createdData.images[0]?.image_url === 'string' ? createdData.images[0].image_url : null) ??
        (typeof createdData?.image === 'string' && createdData.image.trim() ? createdData.image : null) ??
        (typeof createdData?.primary_image?.image_path === 'string' ? createdData.primary_image.image_path : null) ??
        (createdData?.images?.[0]?.image_path ?? null);
      if (rawImageUrl) {
        const fullUrl = buildFullImageUrl(rawImageUrl);
        Image.prefetch(fullUrl, { cachePolicy: 'disk' }).catch(() => {});
      }

      Alert.alert(
        'Success',
        'Product created successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setName('');
              setDescription('');
              setPrice('');
              setStock('');
              setStatus('active');
              setCategoryId('');
              setWeightUnit('kg');
              setSku('');
              setHandle('');
              setImageUrls(['']);
              setUploadedImages([]);
              setErrors({});
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create product. Please try again.';
      if (err.response?.data?.errors) {
        const apiErrors: { [key: string]: string } = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          apiErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(apiErrors);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: Array<{ value: string; label: string }>,
    show: boolean,
    onToggle: () => void,
    onSelect: (v: string) => void,
    error?: string
  ) => (
    <View style={styles.dropdownWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdown, show && styles.dropdownOpen, error && styles.dropdownError]}
        onPress={onToggle}
      >
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {options.find((o) => o.value === value)?.label || `Select ${label}`}
        </Text>
        <Ionicons name={show ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {show && (
        <Modal transparent visible={show} animationType="fade" onRequestClose={onToggle}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onToggle}>
            <View style={styles.dropdownList}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.dropdownItem, value === opt.value && styles.dropdownItemSelected]}
                  onPress={() => {
                    onSelect(opt.value);
                    onToggle();
                  }}
                >
                  <Text style={[styles.dropdownItemText, value === opt.value && styles.dropdownItemTextSelected]}>
                    {opt.label}
                  </Text>
                  {value === opt.value && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product details</Text>

            <Input
              label="Name *"
              placeholder="e.g. Test Product"
              value={name}
              onChangeText={(t) => { setName(t); if (errors.name) setErrors({ ...errors, name: '' }); }}
              leftIcon="pricetag-outline"
              error={errors.name}
            />

            <Input
              label="Description"
              placeholder="Description here"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              error={errors.description}
            />

            <Input
              label="Price *"
              placeholder="e.g. 99.99"
              value={price}
              onChangeText={(t) => { setPrice(t); if (errors.price) setErrors({ ...errors, price: '' }); }}
              keyboardType="numeric"
              leftIcon="cash-outline"
              error={errors.price}
            />

            <Input
              label="Stock *"
              placeholder="e.g. 10"
              value={stock}
              onChangeText={(t) => { setStock(t); if (errors.stock) setErrors({ ...errors, stock: '' }); }}
              keyboardType="number-pad"
              leftIcon="cube-outline"
              error={errors.stock}
            />

            {renderDropdown(
              'Status',
              status,
              STATUS_OPTIONS,
              showStatusDropdown,
              () => setShowStatusDropdown((v) => !v),
              (v) => { setStatus(v); if (errors.status) setErrors({ ...errors, status: '' }); },
              errors.status
            )}

            <Input
              label="Category ID (optional)"
              placeholder="e.g. 2"
              value={categoryId}
              onChangeText={setCategoryId}
              keyboardType="numeric"
              error={errors.category_id}
            />

            {renderDropdown(
              'Weight unit',
              weightUnit,
              WEIGHT_UNITS,
              showWeightUnitDropdown,
              () => setShowWeightUnitDropdown((v) => !v),
              setWeightUnit
            )}

            <Input
              label="SKU *"
              placeholder="e.g. SKU-UNIQUE-002"
              value={sku}
              onChangeText={(t) => { setSku(t); if (errors.sku) setErrors({ ...errors, sku: '' }); }}
              error={errors.sku}
            />

            <Input
              label="Handle *"
              placeholder="e.g. test-product-unique"
              value={handle}
              onChangeText={(t) => { setHandle(t); if (errors.handle) setErrors({ ...errors, handle: '' }); }}
              autoCapitalize="none"
              error={errors.handle}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images</Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity
                style={[styles.uploadFromDeviceBtn, pickingImage && styles.uploadFromDeviceBtnDisabled]}
                onPress={pickImageFromDevice}
                disabled={pickingImage}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="images-outline" size={24} color={COLORS.primary} />
                <Text style={styles.uploadFromDeviceText}>
                  {pickingImage ? 'Opening…' : 'Upload from device'}
                </Text>
              </TouchableOpacity>
            </View>
            {uploadedImages.length > 0 && (
              <View style={styles.uploadedPreviewWrap}>
                <Text style={styles.uploadedLabel}>Uploaded ({uploadedImages.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
                  {uploadedImages.map((img, index) => (
                    <View key={index} style={styles.thumbWrap}>
                      <Image source={{ uri: img.uri }} style={styles.thumb} resizeMode="cover" />
                      <TouchableOpacity
                        style={styles.thumbRemove}
                        onPress={() => removeUploadedImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.imageUrlsHeader}>
              <Text style={styles.sectionTitle}>Or add image URLs</Text>
              <TouchableOpacity style={styles.addUrlBtn} onPress={addImageUrl}>
                <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                <Text style={styles.addUrlText}>Add URL</Text>
              </TouchableOpacity>
            </View>
            {imageUrls.map((url, index) => (
              <View key={index} style={styles.imageUrlRow}>
                <TextInput
                  style={styles.urlInput}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={COLORS.textSecondary}
                  value={url}
                  onChangeText={(t) => updateImageUrl(index, t)}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.removeUrlBtn}
                  onPress={() => removeImageUrl(index)}
                  disabled={imageUrls.length <= 1}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={imageUrls.length <= 1 ? COLORS.textSecondary : COLORS.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Button
            title="Create Product"
            onPress={handleCreateProduct}
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
  backButton: { padding: SPACING.xs },
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
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dropdownWrapper: { marginBottom: SPACING.md },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  dropdownOpen: { borderColor: COLORS.primary },
  dropdownError: { borderColor: COLORS.error },
  dropdownText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  dropdownPlaceholder: { color: COLORS.textSecondary },
  dropdownList: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginTop: 120,
    maxHeight: 280,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemSelected: { backgroundColor: COLORS.primary + '12' },
  dropdownItemText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  dropdownItemTextSelected: { fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.primary },
  errorText: { fontSize: FONT_SIZES.xs, color: COLORS.error, marginTop: SPACING.xs },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
  },
  uploadRow: { marginBottom: SPACING.md },
  uploadFromDeviceBtn: {
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
  uploadFromDeviceBtnDisabled: {
    opacity: 0.6,
  },
  uploadFromDeviceText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  uploadedPreviewWrap: { marginTop: SPACING.sm },
  uploadedLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  thumbScroll: { marginHorizontal: -SPACING.lg },
  thumbWrap: {
    width: 80,
    height: 80,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: { width: '100%', height: '100%' },
  thumbRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  imageUrlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  addUrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  addUrlText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium },
  imageUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  urlInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  removeUrlBtn: { padding: SPACING.xs },
  submitButton: { marginTop: SPACING.md },
  bottomPad: { height: SPACING.xl * 2 },
});

export default AdminAddProductScreen;
