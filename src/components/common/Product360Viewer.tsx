import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Animated, TouchableOpacity, StatusBar } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

export type Product360ViewerProps = {
  images: string[];
  productName?: string;
  onClose: () => void;
  autoRotate?: boolean;
  rotationSpeedMs?: number; // lower is faster
};

const { width, height } = Dimensions.get('window');

const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images,
  productName,
  onClose,
  autoRotate = true,
  rotationSpeedMs = 80,
}) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(autoRotate);
  const scale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(1);
  const autoRotateTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inertiaTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const imageUri = useMemo(() => images[Math.abs(frameIndex) % images.length], [frameIndex, images]);

  const stopAllTimers = () => {
    if (autoRotateTimer.current) {
      clearInterval(autoRotateTimer.current);
      autoRotateTimer.current = null;
    }
    if (inertiaTimer.current) {
      clearInterval(inertiaTimer.current);
      inertiaTimer.current = null;
    }
  };

  useEffect(() => {
    stopAllTimers();
    if (isAutoRotate) {
      autoRotateTimer.current = setInterval(() => {
        setFrameIndex((prev) => prev + 1);
      }, rotationSpeedMs);
    }
    return stopAllTimers;
  }, [isAutoRotate, rotationSpeedMs, images.length]);

  const lastDxRef = useRef(0);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3,
        onPanResponderGrant: () => {
          setIsAutoRotate(false);
          stopAllTimers();
          lastDxRef.current = 0;
        },
        onPanResponderMove: (_, gesture) => {
          const delta = gesture.dx - lastDxRef.current;
          lastDxRef.current = gesture.dx;
          const sensitivity = 6; // pixels per frame
          const framesDelta = Math.trunc(delta / sensitivity);
          if (framesDelta !== 0) {
            setFrameIndex((prev) => prev - framesDelta);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          const velocityX = gesture.vx;
          let remainingVelocity = -velocityX * 25; // inertia
          stopAllTimers();
          inertiaTimer.current = setInterval(() => {
            setFrameIndex((prev) => prev + Math.sign(remainingVelocity));
            remainingVelocity *= 0.92;
            if (Math.abs(remainingVelocity) < 0.1 && inertiaTimer.current) {
              clearInterval(inertiaTimer.current);
              inertiaTimer.current = null;
            }
          }, 24);
        },
      }),
    [images.length]
  );

  const onPinchEvent = Animated.event([{ nativeEvent: { scale: scale } }], { useNativeDriver: true });
  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END || event.nativeEvent.oldState === State.ACTIVE) {
      scale.stopAnimation((value) => {
        let clamped = Math.min(Math.max(Number(value) || 1, 1), 3);
        baseScale.current = clamped;
        scale.setValue(clamped);
      });
    }
  };

  const resetZoom = () => {
    baseScale.current = 1;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
          <Ionicons name="close" size={22} color={COLORS.background} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{productName || '360° View'}</Text>
        <TouchableOpacity onPress={() => setIsAutoRotate((v) => !v)} style={styles.iconButton}>
          <Ionicons name={isAutoRotate ? 'pause' : 'play'} size={20} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.viewerArea} {...panResponder.panHandlers}>
        <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
          <Animated.Image
            source={{ uri: imageUri }}
            resizeMode="contain"
            style={[styles.image, { transform: [{ scale }] }]}
          />
        </PinchGestureHandler>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBtn} onPress={resetZoom}>
          <Ionicons name="contract" size={18} color={COLORS.background} />
          <Text style={styles.bottomBtnText}>Reset</Text>
        </TouchableOpacity>
        <Text style={styles.counterText}>{(Math.abs(frameIndex) % images.length) + 1} / {images.length}</Text>
        <TouchableOpacity style={styles.bottomBtn} onPress={() => setIsAutoRotate((v) => !v)}>
          <Ionicons name={isAutoRotate ? 'pause' : 'play'} size={18} color={COLORS.background} />
          <Text style={styles.bottomBtnText}>{isAutoRotate ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 56,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    marginHorizontal: SPACING.sm,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.background,
    textAlign: 'center',
  },
  viewerArea: {
    width,
    height: height - 56 - 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height - 56 - 56,
  },
  bottomBar: {
    height: 56,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff22',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  bottomBtnText: {
    color: '#000',
    fontSize: FONT_SIZES.sm,
  },
  counterText: {
    color: '#000',
    fontSize: FONT_SIZES.sm,
  },
});

export default Product360Viewer;


