import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { VendorProduct } from '../../types';

const { width } = Dimensions.get('window');

const VendorEditProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productId } = route.params || {};

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Demo product data for editing
  const demoProduct: VendorProduct = {
    id: '1',
    vendorId: 'vendor_001',
    name: 'Premium Leather Sneakers',
    description: 'High-quality leather sneakers with comfortable sole, perfect for daily wear and casual outings.',
    category: 'shoes',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
    ],
    isAvailable: true,
    createdAt: new Date('2024-01-15'),
  };

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

  useEffect(() => {
    if (productId && demoProduct) {
      // Load existing product data
      setProductData({
        name: demoProduct.name,
        description: demoProduct.description,
        category: demoProduct.category,
        price: '299',
        brand: 'Premium Brand',
        material: 'Genuine Leather',
        size: '42',
        color: 'Brown',
        condition: 'new',
        quantity: '15',
      });
      setSelectedImages(demoProduct.images);
    }
  }, [productId]);

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
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
    ];

    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
    setSelectedImages(prev => [...prev, randomImage]);
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          setSelectedImages(prev => prev.filter((_, i) => i !== index));
        }},
      ]
    );
  };

  const handleSave = async () => {
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

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success!',
        'Product updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Deleted', 'Product has been deleted successfully.');
          navigation.goBack();
        }},
      ]
    );
  };

  const renderImageItem = (image: string, index: number) => (
    <View key={index} style={styles.imageItem}>
      <Image source={{ uri: image }} style={styles.imagePreview} />
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
        <Text style={styles.title}>Edit Product</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images (360° View)</Text>
          <Text style={styles.sectionDescription}>
            Update high-quality images with white background and proper angles for the best customer experience
          </Text>
          
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

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="save-outline" size={24} color={COLORS.background} />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="save-outline" size={24} color={COLORS.background} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
  deleteButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
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
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.xs,
  },
  guidelineText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  inputGroup: {
    marginBottom: SPACING.md,
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
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 100,
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
  actionSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginLeft: SPACING.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});

export default VendorEditProductScreen;
