import React, { useMemo, useState } from 'react';
import { View, Image, StyleSheet, PanResponder, LayoutChangeEvent, Text } from 'react-native';

type Props = {
  beforeUri: string | any; // string URL or require() asset id
  afterUri: string | any; // string URL or require() asset id
  width?: number; // optional explicit width
  height?: number; // optional explicit height
  aspectRatio?: number; // when width provided or container measured, height = width * aspectRatio (default 0.6)
};

// Simple before/after comparison slider for React Native
// Stacks two images and reveals the "after" image with a draggable handle
const BeforeAfter: React.FC<Props> = ({ beforeUri, afterUri, width, height, aspectRatio = 0.6 }) => {
  const [containerWidth, setContainerWidth] = useState<number>(width || 0);
  const computedHeight = height || (containerWidth > 0 ? Math.max(120, Math.round(containerWidth * aspectRatio)) : 160);
  const [position, setPosition] = useState<number>(Math.round((width || 260) * 0.5));
  const minX = 0;
  const maxX = containerWidth;

  const clamp = (val: number) => Math.max(minX, Math.min(val, maxX));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          setPosition((prev) => clamp(prev + gesture.dx));
        },
        onPanResponderGrant: () => {},
        onPanResponderRelease: () => {},
      }),
    [containerWidth]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const w = width || e.nativeEvent.layout.width;
    if (w && w !== containerWidth) {
      setContainerWidth(w);
      setPosition(Math.round(w * 0.5));
    }
  };

  // Avoid adding cache-busting params to CDNs that may reject unknown query strings
  const withVersion = (uri: string | any) => (typeof uri === 'string' ? uri : uri);
  const [beforeSrc, setBeforeSrc] = useState<string | any>(withVersion(beforeUri));
  const [afterSrc, setAfterSrc] = useState<string | any>(withVersion(afterUri));
  const [beforeFailed, setBeforeFailed] = useState<boolean>(false);
  const [afterFailed, setAfterFailed] = useState<boolean>(false);

  // Deterministic agriculture fallbacks (rotate if a CDN is blocked)
  const fallbackPool = [
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=60', // watering trees
    'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=1200&q=60', // planting
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=60', // garden tools
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60', // leaf water
  ];
  const [fallbackIdxBefore, setFallbackIdxBefore] = useState<number>(0);
  const [fallbackIdxAfter, setFallbackIdxAfter] = useState<number>(0);

  return (
    <View style={[styles.container, { width: width || '100%', height: computedHeight }]} onLayout={onLayout}>
      {/* BEFORE image as base */}
      {beforeFailed ? (
        <Image source={{ uri: fallbackPool[0] }} style={styles.image} resizeMode="cover" />
      ) : (
        <Image
          source={typeof beforeSrc === 'string' ? { uri: beforeSrc } : beforeSrc}
          style={styles.image}
          resizeMode="cover"
          onError={() => {
            const next = withVersion(fallbackPool[(fallbackIdxBefore + 1) % fallbackPool.length]);
            if (next === beforeSrc || typeof beforeSrc !== 'string') {
              setBeforeFailed(true);
            } else {
              setBeforeSrc(next);
            }
          }}
        />
      )}

      {/* AFTER image clipped by position */}
      <View style={[styles.afterClip, { width: clamp(position) }]}> 
        {afterFailed ? (
          <Image source={{ uri: fallbackPool[1] }} style={styles.image} resizeMode="cover" />
        ) : (
          <Image
            source={typeof afterSrc === 'string' ? { uri: afterSrc } : afterSrc}
            style={styles.image}
            resizeMode="cover"
            onError={() => {
              const next = withVersion(fallbackPool[(fallbackIdxAfter + 1) % fallbackPool.length]);
              if (next === afterSrc || typeof afterSrc !== 'string') {
                setAfterFailed(true);
              } else {
                setAfterSrc(next);
              }
            }}
          />
        )}
      </View>

      {/* Divider and Handle */}
      <View style={[styles.divider, { left: clamp(position) - 1 }]} />
      <View
        style={[styles.handle, { left: clamp(position) - 16 }]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.handleGrip}>||</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackView: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e5e5',
  },
  fallbackEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  fallbackText: {
    color: '#666',
    fontWeight: '600',
  },
  afterClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  handle: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleGrip: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default BeforeAfter;


