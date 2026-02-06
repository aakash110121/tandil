import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { UserStackParamList } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { ServiceCard } from '../../components/cards/ServiceCard';
import { OrderCard } from '../../components/cards/OrderCard';
import { useAppStore } from '../../store';
import { mockServices, mockOrders } from '../../data/mockData';
import Header from '../../components/common/Header';
import BeforeAfter from '../../components/common/BeforeAfter';
import { useTranslation } from 'react-i18next';
import { getBanners, getBannerImageUrl, Banner } from '../../services/bannerService';
import { shopService, ShopProductCategory } from '../../services/shopService';
import { buildFullImageUrl } from '../../config/api';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, orders } = useAppStore();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [productCategories, setProductCategories] = useState<Array<{ id: string; name: string; image: string; products_count?: number; coming_soon?: boolean }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 3) : [];
  // Extract first order that has before/after photos in its tracking (if any)
  const orderWithPhotos: any | undefined = Array.isArray(orders)
    ? orders.find((o: any) => Array.isArray(o.tracking) && o.tracking.some((t: any) => t.photos && ((t.photos.before && t.photos.before.length) || (t.photos.after && t.photos.after.length))))
    : undefined;
  const photoStep: any | undefined = orderWithPhotos?.tracking?.find((t: any) => t.photos && ((t.photos.before && t.photos.before.length) || (t.photos.after && t.photos.after.length)));
  
  // Ensure orders are initialized
  useEffect(() => {
    if (!Array.isArray(orders)) {
      console.log('Orders not initialized yet:', orders);
    }
  }, [orders]);
  
  // Main service categories with their sub-services (Agriculture)
  const serviceCategories = [
    {
      id: 'watering',
      name: t('home.categories.watering.name'),
      description: t('home.categories.watering.description'),
      icon: 'water-outline',
      services: t('home.categories.watering.services', { returnObjects: true }) as string[],
    },
    {
      id: 'planting',
      name: t('home.categories.planting.name'),
      description: t('home.categories.planting.description'),
      icon: 'leaf-outline',
      services: t('home.categories.planting.services', { returnObjects: true }) as string[],
    },
    {
      id: 'cleaning',
      name: t('home.categories.cleaning.name'),
      description: t('home.categories.cleaning.description'),
      icon: 'brush-outline',
      services: t('home.categories.cleaning.services', { returnObjects: true }) as string[],
    },
    {
      id: 'care',
      name: t('home.categories.care.name'),
      description: t('home.categories.care.description'),
      icon: 'construct-outline',
      services: t('home.categories.care.services', { returnObjects: true }) as string[],
    }
  ];

  // Helper functions for order status
  const getOrderIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'in_progress':
        return 'construct-outline';
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'document-outline';
    }
  };

  const getOrderColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return COLORS.warning;
      case 'confirmed':
        return COLORS.primary;
      case 'in_progress':
        return COLORS.info;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  // Helper function for service icons
  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'watering':
        return 'water-outline';
      case 'planting':
        return 'leaf-outline';
      case 'cleaning':
        return 'brush-outline';
      case 'care':
        return 'construct-outline';
      default:
        return 'construct-outline';
    }
  };

  // Fetch banners from API (priority-ordered); fallback slides when none; prefetch images for fast display
  useEffect(() => {
    let cancelled = false;
    setBannersLoading(true);
    getBanners()
      .then((list) => {
        if (!cancelled) {
          setBanners(list);
          const uris = list.map((b) => getBannerImageUrl(b)).filter(Boolean) as string[];
          if (uris.length > 0) Image.prefetch(uris, { cachePolicy: 'disk' }).catch(() => {});
        }
      })
      .finally(() => {
        if (!cancelled) setBannersLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Fetch product categories for Shop by Category (GET /shop/products/categories)
  const categoryPlaceholderImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60';
  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    shopService
      .getProductCategories()
      .then((list: ShopProductCategory[]) => {
        if (!cancelled) {
          const mapped = list.map((c) => ({
            id: String(c.id),
            name: c.name || '',
            image: c.image_url || (c.image ? buildFullImageUrl(c.image) : categoryPlaceholderImage),
            products_count: c.products_count ?? 0,
            coming_soon: c.coming_soon ?? false,
          }));
          setProductCategories(mapped);
          const uris = mapped.map((c) => c.image).filter(Boolean);
          if (uris.length > 0) Image.prefetch(uris, { cachePolicy: 'disk' }).catch(() => {});
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Promotional slider: API banners (priority order) or fallback static slides
  const promotionalSlides = (() => {
    if (banners.length > 0) {
      return banners.map((b) => ({
        id: String(b.id),
        title: b.title || t('home.title'),
        subtitle: b.description || t('home.learnMore'),
        buttonText: b.button_text || t('home.learnMore'),
        buttonLink: b.button_link || null,
        image: getBannerImageUrl(b) || 'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?w=800',
        backgroundColor: COLORS.primary,
      }));
    }
    return [
      { id: '1', title: t('home.title'), subtitle: t('home.learnMore'), buttonText: t('home.learnMore'), buttonLink: null, image: 'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?w=800', backgroundColor: COLORS.primary },
      { id: '2', title: t('home.quickActions'), subtitle: t('home.bookService'), buttonText: t('home.learnMore'), buttonLink: null, image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800', backgroundColor: '#1c4b27' },
      { id: '3', title: t('home.loyaltyPoints'), subtitle: t('home.viewRewards'), buttonText: t('home.learnMore'), buttonLink: null, image: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=800', backgroundColor: '#6D8F5B' },
    ];
  })();

  const onBannerButtonPress = useCallback((buttonLink: string | null) => {
    if (buttonLink && (buttonLink.startsWith('http://') || buttonLink.startsWith('https://'))) {
      Linking.openURL(buttonLink).catch(() => {});
    }
  }, []);

  const scrollToSlide = (index: number) => {
    if (!flatListRef.current) return;
    const clamped = Math.max(0, Math.min(index, promotionalSlides.length - 1));
    try {
      flatListRef.current.scrollToOffset({ offset: clamped * screenWidth, animated: true });
    } catch {}
    setCurrentSlide(clamped);
  };

  const goPrev = () => scrollToSlide(currentSlide - 1);
  const goNext = () => scrollToSlide(currentSlide + 1);

  // Cached image components (expo-image uses disk cache for fast repeat loads)
  const CategoryImage = ({ uri }: { uri: string }) => (
    <Image
      source={{ uri: uri || categoryPlaceholderImage }}
      style={styles.categoryImage}
      contentFit="cover"
      transition={200}
      cachePolicy="disk"
    />
  );

  const OfferImage = ({ uri, style }: { uri: string; style: any }) => (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      transition={200}
      cachePolicy="disk"
    />
  );

  // Featured services with better visuals
  const featuredServices = [
    {
      id: 'featured1',
      name: t('home.featuredItems.scheduledWatering.name'),
      description: t('home.featuredItems.scheduledWatering.description'),
      price: 120,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400',
      badge: t('home.badges.popular'),
    },
    {
      id: 'featured2',
      name: t('home.featuredItems.plantingService.name'),
      description: t('home.featuredItems.plantingService.description'),
      price: 200,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?w=400',
      badge: t('home.badges.new'),
    },
    {
      id: 'featured3',
      name: t('home.featuredItems.fullCareVisit.name'),
      description: t('home.featuredItems.fullCareVisit.description'),
      price: 260,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=60',
      badge: t('home.badges.bestValue'),
    },
  ];

  // Shop by Category: use API categories when available, else static fallback
  const staticCategoryFallback = [
    { id: 'fertilizer', name: t('store.categories.fertilizer', { defaultValue: 'Fertilizer' }), image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60', products_count: 1, coming_soon: false },
    { id: 'soil', name: t('store.categories.soil', { defaultValue: 'Soil' }), image: 'https://images.unsplash.com/photo-1457530378978-8bac673b8062?auto=format&fit=crop&w=800&q=60', products_count: 1, coming_soon: false },
    { id: 'tools', name: t('store.categories.tools', { defaultValue: 'Tools' }), image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60', products_count: 1, coming_soon: false },
    { id: 'irrigation', name: t('store.categories.irrigation', { defaultValue: 'Irrigation' }), image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60', products_count: 1, coming_soon: false },
    { id: 'produce', name: t('store.categories.produce', { defaultValue: 'Produce' }), image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=60', products_count: 1, coming_soon: false },
  ];
  const displayCategories = productCategories.length > 0 ? productCategories : staticCategoryFallback;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header 
        title={t('home.title')}
        showBack={false}
        showNotifications={true}
        showCart={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
      
      {/* Promotional Slider */}
      <View style={styles.sliderContainer}>
        <FlatList
          ref={flatListRef}
          data={promotionalSlides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentSlide(index);
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
              <View style={styles.slideContent}>
                <View style={styles.slideTextContainer}>
                  <Text style={styles.slideTitle}>{item.title}</Text>
                  <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
                  <TouchableOpacity
                    style={styles.slideButton}
                    onPress={() => onBannerButtonPress(item.buttonLink ?? null)}
                  >
                    <Text style={styles.slideButtonText}>{item.buttonText}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.slideImageContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.slideImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="disk"
                  />
                </View>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />

        {/* Left/Right Arrows */}
        <TouchableOpacity
          onPress={goPrev}
          activeOpacity={0.8}
          disabled={currentSlide === 0}
          style={[
            styles.arrowButton,
            styles.arrowLeft,
            currentSlide === 0 && { opacity: 0.4 }
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.background} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.8}
          disabled={currentSlide === promotionalSlides.length - 1}
          style={[
            styles.arrowButton,
            styles.arrowRight,
            currentSlide === promotionalSlides.length - 1 && { opacity: 0.4 }
          ]}
        >
          <Ionicons name="chevron-forward" size={22} color={COLORS.background} />
        </TouchableOpacity>
        
        {/* Slider Indicators */}
        <View style={styles.sliderIndicators}>
          {promotionalSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentSlide && styles.indicatorActive
              ]}
            />
          ))}
        </View>
      </View>

      {/* Loyalty Points */}
      <View style={styles.loyaltyCard}>
        <View style={styles.loyaltyContent}>
          <View>
            <Text style={styles.loyaltyTitle}>{t('home.loyaltyPoints')}</Text>
            <Text style={styles.loyaltyPoints}>{user?.loyaltyPoints || 0} {t('common.points')}</Text>
          </View>
          <TouchableOpacity
            style={styles.loyaltyButton}
            onPress={() => navigation.navigate('LoyaltyPoints')}
          >
            <Text style={styles.loyaltyButtonText}>{t('home.viewRewards')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Maintenance Photos (horizontal slider of multiple before/after cards) */}
      {(() => {
        // Fixed agriculture/tree-maintenance images from Pixabay (stable, no randomness)
        // Fixed palm/garden maintenance images
        const demoBefore = [
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60', // leaves with water
          'https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=60', // tools on soil
          'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=60', // garden path
        ];
        const demoAfter = [
          'https://images.unsplash.com/photo-1520975954732-35dd22f4758f?auto=format&fit=crop&w=1200&q=60', // maintained palm
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=60', // pruned garden
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60', // healthy leaves
        ];
        // Always show curated palm maintenance demo on Home
        const beforeList: string[] = demoBefore;
        const afterList: string[] = demoAfter;
        const count = Math.min(beforeList.length, afterList.length);
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Maintenance Photos</Text>
              {orderWithPhotos?.id ? (
                <TouchableOpacity onPress={() => navigation.navigate('OrderTracking', { orderId: orderWithPhotos.id })}>
                  <Text style={styles.viewAllText}>View Order</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row' }}>
                {beforeList.slice(0, count).map((bUri, idx) => (
                  <View key={`home-ba-${idx}`} style={{ width: 300, marginRight: SPACING.md }}>
                    <BeforeAfter
                      beforeUri={bUri}
                      afterUri={afterList[idx]}
                      width={300}
                      aspectRatio={0.6}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );
      })()}

      {/* Offers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exclusive Offers</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Offers')}>
            <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        {/* Top full-width banner */}
          <TouchableOpacity style={styles.offerBannerFull} onPress={() => navigation.navigate('Offers')}>
          <OfferImage uri={'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1200&q=60'} style={styles.offerImageFull} />
          <View style={styles.offerOverlay} />
          <View style={styles.offerContentFull}>
            <Text style={styles.offerTitle}>Farm Fresh Week</Text>
            <Text style={styles.offerSubtitle}>Up to 30% OFF on fresh produce</Text>
          </View>
        </TouchableOpacity>

        {/* Two half banners side by side */}
        <View style={styles.offerRow}>
          <TouchableOpacity style={styles.offerHalf} onPress={() => navigation.navigate('Offers')}>
            <OfferImage uri={'https://images.unsplash.com/photo-1582515073490-d2e98499d4a7?auto=format&fit=crop&w=800&q=60'} style={styles.offerImageHalf} />
            <View style={styles.offerOverlay} />
            <View style={styles.offerContentHalf}>
              <Text style={styles.offerTitleSm}>Buy 1 Get 1</Text>
              <Text style={styles.offerSubtitleSm}>Fertilizers & Soil</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.offerHalf} onPress={() => navigation.navigate('Offers')}>
            <OfferImage uri={'https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=800&q=60'} style={styles.offerImageHalf} />
            <View style={styles.offerOverlay} />
            <View style={styles.offerContentHalf}>
              <Text style={styles.offerTitleSm}>Irrigation Deal</Text>
              <Text style={styles.offerSubtitleSm}>Extra 10% OFF kits</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Categories */}
       <View style={styles.section}>
         <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>{t('home.placeServiceOrders')}</Text>
           <TouchableOpacity
             onPress={() => navigation.navigate('Main' as never, { screen: 'Services' } as never)}
           >
             <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
           </TouchableOpacity>
         </View>
         
                   <View style={styles.serviceGrid}>
            {serviceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.serviceGridCard}
                onPress={() => navigation.navigate('ServiceCategory', { 
                  category: { 
                    id: category.id, 
                    name: category.name, 
                    description: category.description, 
                    icon: category.icon, 
                    services: category.services 
                  }
                })}
              >
                <View style={styles.serviceGridIconContainer}>
                  <View style={styles.serviceGridIcon}>
                    <Ionicons 
                      name={category.icon as any} 
                      size={32} 
                      color={COLORS.primary} 
                    />
                  </View>
                                     <View style={styles.serviceGridBadge}>
                     <Text style={styles.serviceGridBadgeText}>{category.services?.length || 4} {t('common.services')}</Text>
                   </View>
                </View>
                <View style={styles.serviceGridContent}>
                  <Text style={styles.serviceGridTitle} numberOfLines={1}>{category.name}</Text>
                  <Text style={styles.serviceGridDescription} numberOfLines={2}>{category.description}</Text>
                                     <View style={styles.serviceGridServices}>
                     <Text style={styles.serviceGridServicesText}>
                       {category.services?.slice(0, 2).join(', ') || t('home.professionalServices')}
                       {category.services && category.services.length > 2 && '...'}
                     </Text>
                   </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
       </View>

      {/* Featured Services */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.featured')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main' as never, { screen: 'Services' } as never)}
          >
            <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.featuredServiceCard}
              onPress={() => navigation.navigate('ServiceDetail', { service })}
            >
              <View style={styles.featuredServiceImageContainer}>
                <OfferImage uri={service.image} style={styles.featuredServiceImage} />
                <View style={styles.featuredServiceBadge}>
                  <Text style={styles.featuredServiceBadgeText}>{service.badge}</Text>
                </View>
              </View>
              <View style={styles.featuredServiceContent}>
                <Text style={styles.featuredServiceName}>{service.name}</Text>
                <Text style={styles.featuredServiceDescription}>{service.description}</Text>
                <View style={styles.featuredServiceFooter}>
                  <Text style={styles.featuredServicePrice}>${service.price}</Text>
                  <View style={styles.featuredServiceRating}>
                    <Ionicons name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.featuredServiceRatingText}>{service.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.shopByCategory')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main' as never, { screen: 'Store' } as never)}
          >
            <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoriesGrid}>
          {displayCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => {
                const noProducts = category.coming_soon || (category.products_count !== undefined && category.products_count === 0);
                if (noProducts) {
                  Alert.alert(
                    t('category.comingSoon', { defaultValue: 'Coming Soon' }),
                    t('category.comingSoonMessage', { defaultValue: 'Products in this category are coming soon.' })
                  );
                  return;
                }
                navigation.navigate('CategoryProducts', { category });
              }}
            >
              <View style={styles.categoryImageContainer}>
                <CategoryImage uri={category.image} />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Main' as never, { screen: 'Services' } as never)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="construct-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('home.bookService')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('OrderTracking', { orderId: recentOrders[0]?.id || '' })}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="location-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('home.trackOrder')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Main' as never, { screen: 'Store' } as never)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="bag-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('home.shopProducts')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="list-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('home.orderHistory')}</Text>
          </TouchableOpacity>
        </View>
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
  greetingContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  loyaltyCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  loyaltyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loyaltyTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    opacity: 0.9,
  },
  loyaltyPoints: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  loyaltyButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  loyaltyButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
     serviceCard: {
     width: 200,
     backgroundColor: COLORS.surface,
     borderRadius: BORDER_RADIUS.lg,
     marginRight: SPACING.md,
     overflow: 'hidden',
     shadowColor: COLORS.text,
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   serviceCardImageContainer: {
     height: 120,
     position: 'relative',
   },
   serviceCardImage: {
     width: '100%',
     height: '100%',
     resizeMode: 'cover',
   },
   serviceCardBadge: {
     position: 'absolute',
     top: SPACING.sm,
     left: SPACING.sm,
     backgroundColor: COLORS.primary,
     paddingHorizontal: SPACING.sm,
     paddingVertical: 2,
     borderRadius: BORDER_RADIUS.xs,
   },
   serviceCardBadgeText: {
     fontSize: FONT_SIZES.xs,
     fontWeight: FONT_WEIGHTS.bold,
     color: COLORS.background,
   },
   serviceCardContent: {
     padding: SPACING.md,
   },
   serviceCardTitle: {
     fontSize: FONT_SIZES.md,
     fontWeight: FONT_WEIGHTS.semiBold,
     color: COLORS.text,
     marginBottom: SPACING.xs,
   },
   serviceCardDescription: {
     fontSize: FONT_SIZES.sm,
     color: COLORS.textSecondary,
     marginBottom: SPACING.sm,
   },
   serviceCardFooter: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
   serviceCardPrice: {
     fontSize: FONT_SIZES.md,
     fontWeight: FONT_WEIGHTS.bold,
     color: COLORS.primary,
   },
   serviceCardRating: {
     flexDirection: 'row',
     alignItems: 'center',
   },
   serviceCardRatingText: {
     fontSize: FONT_SIZES.xs,
     color: COLORS.textSecondary,
     marginLeft: SPACING.xs,
   },
     // Service Grid Styles
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceGridCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: SPACING.md,
  },
   serviceGridIconContainer: {
     height: 100,
     position: 'relative',
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: COLORS.primary + '10',
   },
   serviceGridIcon: {
     width: 48,
     height: 48,
     borderRadius: 24,
     backgroundColor: COLORS.primary + '20',
     justifyContent: 'center',
     alignItems: 'center',
   },
   serviceGridBadge: {
     position: 'absolute',
     top: SPACING.sm,
     left: SPACING.sm,
     backgroundColor: COLORS.primary,
     paddingHorizontal: SPACING.sm,
     paddingVertical: 2,
     borderRadius: BORDER_RADIUS.xs,
   },
   serviceGridBadgeText: {
     fontSize: FONT_SIZES.xs,
     fontWeight: FONT_WEIGHTS.bold,
     color: COLORS.background,
   },
   serviceGridContent: {
     padding: SPACING.md,
   },
   serviceGridTitle: {
     fontSize: FONT_SIZES.sm,
     fontWeight: FONT_WEIGHTS.semiBold,
     color: COLORS.text,
     marginBottom: SPACING.xs,
   },
   serviceGridDescription: {
     fontSize: FONT_SIZES.xs,
     color: COLORS.textSecondary,
     marginBottom: SPACING.sm,
   },
   serviceGridFooter: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
   serviceGridPrice: {
     fontSize: FONT_SIZES.sm,
     fontWeight: FONT_WEIGHTS.bold,
     color: COLORS.primary,
   },
   serviceGridRating: {
     flexDirection: 'row',
     alignItems: 'center',
   },
       serviceGridRatingText: {
      fontSize: FONT_SIZES.xs,
      color: COLORS.textSecondary,
      marginLeft: SPACING.xs,
    },
    serviceGridServices: {
      marginTop: SPACING.xs,
    },
    serviceGridServicesText: {
      fontSize: FONT_SIZES.xs,
      color: COLORS.primary,
      fontWeight: FONT_WEIGHTS.medium,
    },
  serviceCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  serviceCategory: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  categorySubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  // Slider Styles
  sliderContainer: {
    marginBottom: SPACING.lg,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  arrowLeft: { left: SPACING.md },
  arrowRight: { right: SPACING.md },
  slide: {
    width: screenWidth,
    height: 200,
    paddingHorizontal: SPACING.xl + 24,
    paddingVertical: SPACING.lg,
  },
  slideContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slideTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  slideTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  slideSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.background,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  slideButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  slideButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  slideImageContainer: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sliderIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  // Featured Services Styles
  featuredServiceCard: {
    width: 280,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  featuredServiceImageContainer: {
    height: 160,
    position: 'relative',
  },
  featuredServiceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredServiceBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.xs,
  },
  featuredServiceBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  featuredServiceContent: {
    padding: SPACING.md,
  },
  featuredServiceName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  featuredServiceDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  featuredServiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredServicePrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  featuredServiceRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredServiceRatingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  // Categories Grid Styles
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: SPACING.md,
  },
  categoryImageContainer: {
    height: 120,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    padding: SPACING.md,
  },
  // Category Badge Styles
  categoryBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  categoryBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  // Recent Orders Styles
  recentOrdersContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  recentOrderCard: {
    width: 280,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    marginVertical: SPACING.xs,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  recentOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recentOrderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  recentOrderStatusContainer: {
    flex: 1,
  },
  recentOrderStatus: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    textTransform: 'capitalize',
  },
  recentOrderDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentOrderContent: {
    padding: SPACING.md,
  },
  recentOrderServiceInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  recentOrderServiceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  recentOrderServiceDetails: {
    flex: 1,
  },
  recentOrderTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  recentOrderDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  recentOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentOrderPriceContainer: {
    flex: 1,
  },
  recentOrderPriceLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  recentOrderPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  recentOrderActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  recentOrderActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  recentOrderActionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  // Enhanced Empty State Styles
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  emptyStateButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.background,
  },
  // Offers styles
  offerBannerFull: {
    height: 160,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  offerImageFull: { width: '100%', height: '100%' },
  offerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  offerContentFull: { position: 'absolute', left: SPACING.lg, bottom: SPACING.lg },
  offerTitle: { color: COLORS.background, fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold },
  offerSubtitle: { color: COLORS.background, opacity: 0.9, marginTop: 2 },
  offerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md },
  offerHalf: { width: '48%', height: 120, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  offerImageHalf: { width: '100%', height: '100%' },
  offerContentHalf: { position: 'absolute', left: SPACING.md, bottom: SPACING.md },
  offerTitleSm: { color: COLORS.background, fontWeight: FONT_WEIGHTS.semiBold },
  offerSubtitleSm: { color: COLORS.background, opacity: 0.9, fontSize: FONT_SIZES.xs },
});

export default HomeScreen; 