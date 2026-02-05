import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { buildFullImageUrl } from '../../config/api';
import { getProductImageUri } from '../../utils/productImage';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { adminService, AdminProduct } from '../../services/adminService';
import { setPendingProductImage } from './pendingProductImage';
import { compressImageForUpload, compressImagesForUpload } from '../../utils/compressImage';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const CurrentProductImage: React.FC<{ uri: string }> = ({ uri }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <View style={[styles.thumbWrap, styles.currentImagePlaceholder]}>
        <Ionicons name="broken-image-outline" size={32} color={COLORS.textSecondary} />
        <Text style={styles.placeholderLabel}>Could not load</Text>
      </View>
    );
  }
  return (
    <View style={styles.thumbWrap}>
      <Image
        source={{ uri }}
        style={styles.thumb}
        contentFit="cover"
        cachePolicy="disk"
        onError={() => setFailed(true)}
      />
    </View>
  );
};

const WEIGHT_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
];

type AdminEditProductParams = { product: AdminProduct };

const AdminEditProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: AdminEditProductParams }, 'params'>>();
  const initialProduct = route.params?.product;
  const productId = initialProduct?.id;
  const [productDetails, setProductDetails] = useState<AdminProduct | null>(initialProduct ?? null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  /** Key that changes on each product fetch so image URLs get a new cache-buster and show updated images */
  const [imageFetchKey, setImageFetchKey] = useState(() => Date.now());

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('active');
  const [categoryId, setCategoryId] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [sku, setSku] = useState('');
  const [handle, setHandle] = useState('');
  const [mainImage, setMainImage] = useState<{ uri: string } | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [extraImages, setExtraImages] = useState<{ uri: string }[]>([]);
  const [extraImageUrls, setExtraImageUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showWeightUnitDropdown, setShowWeightUnitDropdown] = useState(false);
  const [pickingMain, setPickingMain] = useState(false);
  const [pickingExtra, setPickingExtra] = useState(false);

  useEffect(() => {
    if (!productDetails || hasUserEdited) return;
    setName(productDetails.name ?? '');
    setDescription(productDetails.description ?? '');
    setPrice(
      typeof productDetails.price === 'string'
        ? productDetails.price
        : String(productDetails.price ?? '')
    );
    setStock(String(productDetails.stock ?? ''));
    setStatus((productDetails.status as string) ?? 'active');
    setCategoryId(productDetails.category_id != null ? String(productDetails.category_id) : '');
    setWeightUnit(productDetails.weight_unit ?? 'kg');
    setSku(productDetails.sku ?? '');
    setHandle(productDetails.handle ?? '');
  }, [productDetails, hasUserEdited]);

  useFocusEffect(
    React.useCallback(() => {
      if (!productId) return;
      let alive = true;
      setLoadingProduct(true);
      adminService
        .getProductById(productId)
        .then((res) => {
          if (!alive) return;
          // Response shape can vary:
          // - { id, ...product }
          // - { status/success, data: { id, ...product } }
          // - { status/success, data: { data: { id, ...product } } }
          const candidate =
            (res as any)?.id != null ? (res as any) :
            (res as any)?.data?.id != null ? (res as any).data :
            (res as any)?.data?.data?.id != null ? (res as any).data.data :
            null;
          if (candidate) {
            setProductDetails(candidate);
            setImageFetchKey(Date.now());
          }
        })
        .catch(() => {
          // Ignore: we still have initialProduct from navigation
        })
        .finally(() => {
          if (alive) setLoadingProduct(false);
        });
      return () => {
        alive = false;
      };
    }, [productId])
  );

  const pickMainImageFromDevice = async () => {
    if (pickingMain) return;
    setPickingMain(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to your photos to update the main image.', [{ text: 'OK' }]);
        return;
      }
      if (typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        Alert.alert('Not available', 'Image picker is not available in this environment.', [{ text: 'OK' }]);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        const uri = await compressImageForUpload(result.assets[0].uri);
        setMainImage({ uri });
      }
    } catch (err: any) {
      Alert.alert('Unable to open photos', err?.message ?? 'Could not open photo library.', [{ text: 'OK' }]);
    } finally {
      setPickingMain(false);
    }
  };

  const pickExtraImagesFromDevice = async () => {
    if (pickingExtra) return;
    setPickingExtra(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to your photos to update extra images.', [{ text: 'OK' }]);
        return;
      }
      if (typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        Alert.alert('Not available', 'Image picker is not available in this environment.', [{ text: 'OK' }]);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        const uris = await compressImagesForUpload(result.assets!.map((a) => a.uri));
        setExtraImages((prev) => [...prev, ...uris.map((uri) => ({ uri }))]);
      }
    } catch (err: any) {
      Alert.alert('Unable to open photos', err?.message ?? 'Could not open photo library.', [{ text: 'OK' }]);
    } finally {
      setPickingExtra(false);
    }
  };

  const removeMainImage = () => setMainImage(null);
  const removeExtraImage = (index: number) => {
    setExtraImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addExtraImageUrl = () => setExtraImageUrls((prev) => [...prev, '']);
  const removeExtraImageUrl = (index: number) => setExtraImageUrls((prev) => prev.filter((_, i) => i !== index));
  const updateExtraImageUrl = (index: number, value: string) => {
    setExtraImageUrls((prev) => {
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

  const handleUpdateProduct = async () => {
    if (!productId) {
      Alert.alert('Error', 'Product not found.');
      return;
    }
    if (!validateForm()) {
      Alert.alert(
        'Missing required fields',
        'Please fill in all required fields (Name, Price, Stock, SKU, Handle) and fix any errors.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      const categoryIdNum = categoryId.trim() ? parseInt(categoryId, 10) : undefined;
      const urlList: string[] = [mainImageUrl, ...extraImageUrls].filter((u) => u.trim().length > 0);
      const payload = {
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
      };

      const hasMainFile = mainImage != null;
      const hasExtraFiles = extraImages.length > 0;
      let updatedData: { image_url?: string; image?: string; primary_image?: { image_url?: string; image_path?: string }; images?: Array<{ image_url?: string; image_path?: string }> } | undefined;

      if (hasMainFile || hasExtraFiles) {
        const res = await adminService.updateProductWithImages(productId, {
          ...payload,
          mainImage: mainImage ?? undefined,
          extraImages: extraImages.map((i) => ({ uri: i.uri })),
        });
        updatedData = res.data;
      } else {
        const res = await adminService.updateProduct(productId, payload);
        updatedData = res.data;
      }

      const rawImageUrl =
        (typeof updatedData?.image_url === 'string' && updatedData.image_url.trim() ? updatedData.image_url : null) ??
        (typeof updatedData?.primary_image?.image_url === 'string' && updatedData.primary_image.image_url.trim() ? updatedData.primary_image.image_url : null) ??
        (updatedData?.images?.length && typeof updatedData.images[0]?.image_url === 'string' ? updatedData.images[0].image_url : null) ??
        (typeof updatedData?.image === 'string' && updatedData.image.trim() ? updatedData.image : null) ??
        (typeof updatedData?.primary_image?.image_path === 'string' ? updatedData.primary_image.image_path : null) ??
        (updatedData?.images?.[0]?.image_path ?? null);
      if (rawImageUrl) {
        const fullUrl = buildFullImageUrl(rawImageUrl);
        Image.prefetch(fullUrl, { cachePolicy: 'disk' }).catch(() => {});
      }

      if (mainImage) {
        setPendingProductImage(productId, mainImage.uri);
      }

      Alert.alert(
        'Success',
        'Product updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to update product. Please try again.';
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

  const existingMainUri = (() => {
    const base = productDetails ? getProductImageUri(productDetails) : null;
    if (!base) return null;
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}fk=${imageFetchKey}`;
  })();
  const existingExtraUris: string[] = (() => {
    if (!productDetails) return [];
    const cacheBuster =
      (productDetails as any)?.updated_at ??
      (productDetails as any)?.primary_image?.updated_at ??
      (productDetails as any)?.primary_image?.id ??
      null;
    const arr = (productDetails as Record<string, unknown>)['images'] as Array<{ image_url?: string; image_path?: string; is_primary?: number }> | undefined;
    if (!Array.isArray(arr)) return [];
    const nonPrimary = arr.filter((i) => i.is_primary !== 1 && i.is_primary !== true);
    const sep = (url: string) => (url.includes('?') ? '&' : '?');
    return nonPrimary.map((i) => {
      const raw = (typeof i.image_url === 'string' && i.image_url.trim() ? i.image_url : null) ?? (typeof i.image_path === 'string' ? i.image_path : null);
      if (!raw) return '';
      const url = buildFullImageUrl(raw);
      const v = cacheBuster ? `${url}${sep(url)}v=${encodeURIComponent(String(cacheBuster))}` : url;
      return `${v}${sep(v)}fk=${imageFetchKey}`;
    }).filter(Boolean);
  })();

  if (!productId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Product</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
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
            <Text style={styles.sectionTitle}>Main image</Text>
            <Text style={styles.uploadedHint}>Shows on the product list. Upload to replace.</Text>
            {!mainImage && (
              <View style={styles.uploadedPreviewWrap}>
                <Text style={styles.uploadedLabel}>Current main image</Text>
                {existingMainUri ? (
                  <CurrentProductImage uri={existingMainUri} />
                ) : (
                  <View style={[styles.thumbWrap, styles.currentImagePlaceholder]}>
                    <Ionicons name="image-outline" size={32} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderLabel}>No image</Text>
                  </View>
                )}
              </View>
            )}
            <TouchableOpacity
              style={[styles.uploadFromDeviceBtn, pickingMain && styles.uploadFromDeviceBtnDisabled]}
              onPress={pickMainImageFromDevice}
              disabled={pickingMain}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="image-outline" size={24} color={COLORS.primary} />
              <Text style={styles.uploadFromDeviceText}>
                {pickingMain ? 'Opening…' : 'Upload from device'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.uploadedLabel, { marginTop: SPACING.sm }]}>Or paste image URL</Text>
            <TextInput
              style={styles.urlInput}
              placeholder="https://example.com/main-image.jpg"
              placeholderTextColor={COLORS.textSecondary}
              value={mainImageUrl}
              onChangeText={setMainImageUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {mainImage && (
              <View style={styles.uploadedPreviewWrap}>
                <View style={[styles.thumbWrap, styles.primaryThumbWrap]}>
                  <Image source={{ uri: mainImage.uri }} style={styles.thumb} contentFit="cover" />
                  <View style={styles.primaryBadge}>
                    <Ionicons name="star" size={12} color={COLORS.background} />
                    <Text style={styles.primaryBadgeText}>Main</Text>
                  </View>
                  <TouchableOpacity style={styles.thumbRemove} onPress={removeMainImage}>
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extra images</Text>
            <Text style={styles.uploadedHint}>Additional product images (gallery). Upload to replace all.</Text>
            {extraImages.length === 0 && existingExtraUris.length > 0 && (
              <View style={styles.uploadedPreviewWrap}>
                <Text style={styles.uploadedLabel}>Current extra images</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
                  {existingExtraUris.map((uri, index) => (
                    <CurrentProductImage key={index} uri={uri} />
                  ))}
                </ScrollView>
              </View>
            )}
            <TouchableOpacity
              style={[styles.uploadFromDeviceBtn, pickingExtra && styles.uploadFromDeviceBtnDisabled]}
              onPress={pickExtraImagesFromDevice}
              disabled={pickingExtra}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="images-outline" size={24} color={COLORS.primary} />
              <Text style={styles.uploadFromDeviceText}>
                {pickingExtra ? 'Opening…' : 'Upload from device'}
              </Text>
            </TouchableOpacity>
            <View style={styles.imageUrlsHeader}>
              <Text style={[styles.uploadedLabel, { marginTop: SPACING.sm }]}>Or add image URLs</Text>
              <TouchableOpacity style={styles.addUrlBtn} onPress={addExtraImageUrl}>
                <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                <Text style={styles.addUrlText}>Add URL</Text>
              </TouchableOpacity>
            </View>
            {extraImageUrls.map((url, index) => (
              <View key={index} style={styles.imageUrlRow}>
                <TextInput
                  style={styles.urlInput}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={COLORS.textSecondary}
                  value={url}
                  onChangeText={(t) => updateExtraImageUrl(index, t)}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.removeUrlBtn}
                  onPress={() => removeExtraImageUrl(index)}
                  disabled={extraImageUrls.length <= 1}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={extraImageUrls.length <= 1 ? COLORS.textSecondary : COLORS.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
            {extraImages.length > 0 && (
              <View style={styles.uploadedPreviewWrap}>
                <Text style={styles.uploadedLabel}>New extra images</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
                  {extraImages.map((img, index) => (
                    <View key={index} style={styles.thumbWrap}>
                      <Image source={{ uri: img.uri }} style={styles.thumb} contentFit="cover" />
                      <TouchableOpacity style={styles.thumbRemove} onPress={() => removeExtraImage(index)}>
                        <Ionicons name="close-circle" size={24} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <Button
            title="Update Product"
            onPress={handleUpdateProduct}
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
  uploadFromDeviceBtnDisabled: { opacity: 0.6 },
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
  uploadedHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  currentImagePlaceholder: {
    backgroundColor: COLORS.border + '40',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  placeholderLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  primaryThumbWrap: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.background,
  },
  setPrimaryBtn: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  setPrimaryBtnText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
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
  addUrlBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
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

export default AdminEditProductScreen;
