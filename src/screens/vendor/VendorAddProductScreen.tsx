import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const { width } = Dimensions.get('window');

const VendorAddProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    brand: '',
    material: '',
    size: '',
    color: '',
    condition: 'new',
    quantity: '',
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [modelUrl, setModelUrl] = useState('');
  // Removed background analyzer to avoid layout issues

  const categories = [
    { id: 'shoes', name: 'Shoes', icon: 'footsteps-outline' },
    { id: 'accessories', name: 'Accessories', icon: 'bag-outline' },
    { id: 'clothing', name: 'Clothing', icon: 'shirt-outline' },
    { id: 'bags', name: 'Bags & Wallets', icon: 'briefcase-outline' },
    { id: 'jewelry', name: 'Jewelry', icon: 'diamond-outline' },
  ];

  const conditions = [
    { id: 'new', name: 'New', description: 'Never used, original packaging' },
    { id: 'like_new', name: 'Like New', description: 'Used once or twice, excellent condition' },
    { id: 'good', name: 'Good', description: 'Used but well maintained' },
    { id: 'fair', name: 'Fair', description: 'Some wear but functional' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    if (selectedImages.length >= 8) {
      Alert.alert('Maximum Images', 'You can upload up to 8 images for 360° view');
      return;
    }

    // Simulate image picker - in real app, use expo-image-picker
    Alert.alert(
      'Add Image',
      'Select image source',
      [
        { text: 'Camera', onPress: () => simulateImagePick('camera') },
        { text: 'Gallery', onPress: () => simulateImagePick('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const simulateImagePick = (source: string) => {
    // Demo images for demonstration
    const demoImages = [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400',
    ];

    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
    setSelectedImages(prev => [...prev, randomImage]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setSelectedImages(prev => {
      const next = [...prev];
      const target = direction === 'left' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return next;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!productData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    if (!productData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please add at least one product image');
      return;
    }
    // 360° guideline: recommend 24–36 frames; enforce minimum of 8
    if (selectedImages.length < 8) {
      Alert.alert('More Images Recommended', 'Please upload at least 8 images taken around the product for a smooth 360° view (recommended 24–36).');
      return;
    }

    // Skipping automated whiteness/resolution checks in demo

    setUploading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success!',
        'Product uploaded successfully. It will be reviewed by our team within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderImageItem = (image: string, index: number) => (
    <View key={index} style={styles.imageItem}>
      <Image source={{ uri: image }} style={styles.imagePreview} />
      {/* Quality hints removed in demo to keep UI clean */}
      {/* Reorder controls removed for now */}
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => handleRemoveImage(index)}
      >
        <Ionicons name="close-circle" size={24} color={COLORS.error} />
      </TouchableOpacity>
      <View style={styles.imageNumber}>
        <Text style={styles.imageNumberText}>{index + 1}</Text>
      </View>
    </View>
  );

  // 360° quick preview player
  const [isPlaying, setIsPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && selectedImages.length > 0) {
      timer = setInterval(() => {
        setPlayIndex((p) => (p + 1) % selectedImages.length);
      }, 80);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isPlaying, selectedImages.length]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Product</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images (360° View)</Text>
          <Text style={styles.sectionDescription}>
            Upload high-quality images with white background and proper angles for the best customer experience
          </Text>
          
          {/* Removed inline Play preview to avoid layout jumps */}

          <View style={styles.imageGrid}>
            {selectedImages.map((image, index) => renderImageItem(image, index))}
            
            {selectedImages.length < 8 && (
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                <Ionicons name="add" size={32} color={COLORS.primary} />
                <Text style={styles.addImageText}>Add Image</Text>
                <Text style={styles.addImageSubtext}>
                  {selectedImages.length}/8
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.imageGuidelines}>
            <Text style={styles.guidelinesTitle}>Image Guidelines:</Text>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.guidelineText}>High quality (minimum 800x800px)</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.guidelineText}>White or neutral background</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.guidelineText}>Multiple angles for 360° view</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.guidelineText}>Good lighting and clear details</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="information-circle" size={16} color={COLORS.info} />
              <Text style={styles.guidelineText}>We check border whiteness ≥ 80% and resolution ≥ 800x800.</Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name *</Text>
            <TextInput
              style={styles.textInput}
              value={productData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter product name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={productData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe your product in detail"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    productData.category === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => handleInputChange('category', category.id)}
                >
                  <Ionicons 
                    name={category.icon as any} 
                    size={20} 
                    color={productData.category === category.id ? COLORS.background : COLORS.primary} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    productData.category === category.id && styles.categoryButtonTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Brand</Text>
              <TextInput
                style={styles.textInput}
                value={productData.brand}
                onChangeText={(value) => handleInputChange('brand', value)}
                placeholder="Brand name"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Material</Text>
              <TextInput
                style={styles.textInput}
                value={productData.material}
                onChangeText={(value) => handleInputChange('material', value)}
                placeholder="e.g., Leather, Canvas"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Size</Text>
              <TextInput
                style={styles.textInput}
                value={productData.size}
                onChangeText={(value) => handleInputChange('size', value)}
                placeholder="e.g., 42, M, L"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Color</Text>
              <TextInput
                style={styles.textInput}
                value={productData.color}
                onChangeText={(value) => handleInputChange('color', value)}
                placeholder="e.g., Black, Brown"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Condition</Text>
            <View style={styles.conditionGrid}>
              {conditions.map((condition) => (
                <TouchableOpacity
                  key={condition.id}
                  style={[
                    styles.conditionButton,
                    productData.condition === condition.id && styles.conditionButtonActive
                  ]}
                  onPress={() => handleInputChange('condition', condition.id)}
                >
                  <Text style={[
                    styles.conditionButtonText,
                    productData.condition === condition.id && styles.conditionButtonTextActive
                  ]}>
                    {condition.name}
                  </Text>
                  <Text style={[
                    styles.conditionDescription,
                    productData.condition === condition.id && styles.conditionDescriptionActive
                  ]}>
                    {condition.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity Available</Text>
            <TextInput
              style={styles.textInput}
              value={productData.quantity}
              onChangeText={(value) => handleInputChange('quantity', value)}
              placeholder="Number of items available"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* 3D Model */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3D Model (optional)</Text>
          <Text style={styles.sectionDescription}>Provide a URL to a .glb/.gltf model for interactive 3D view.</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Model URL</Text>
            <TextInput
              style={styles.textInput}
              value={modelUrl}
              onChangeText={setModelUrl}
              placeholder="https://.../shoe.glb"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="cloud-upload" size={24} color={COLORS.background} />
                <Text style={styles.submitButtonText}>Uploading...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={24} color={COLORS.background} />
                <Text style={styles.submitButtonText}>Upload Product</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            Your product will be reviewed within 24 hours before being published
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  imageItem: {
    position: 'relative',
    width: (width - SPACING.lg * 3) / 3,
    height: (width - SPACING.lg * 3) / 3,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  qualityHints: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.background + 'CC',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  hintText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  imageNumber: {
    position: 'absolute',
    bottom: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.primary + 'CC',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  imageNumberText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  addImageButton: {
    width: (width - SPACING.lg * 3) / 3,
    height: (width - SPACING.lg * 3) / 3,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  addImageText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  addImageSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  imageGuidelines: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  previewPlayer: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlayBtn: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  previewPlayText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  guidelinesTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    height: 44,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 60,
    paddingTop: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  categoryButtonTextActive: {
    color: COLORS.background,
  },
  conditionGrid: {
    gap: SPACING.sm,
  },
  conditionButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  conditionButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  conditionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  conditionButtonTextActive: {
    color: COLORS.primary,
  },
  conditionDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  conditionDescriptionActive: {
    color: COLORS.primary,
  },
  submitSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    marginBottom: SPACING.md,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginLeft: SPACING.sm,
  },
  submitNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VendorAddProductScreen;
