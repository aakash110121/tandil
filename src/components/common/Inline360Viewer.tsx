import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

type Props = {
  images: string[];
  autoRotate?: boolean;
  rotationSpeedMs?: number;
};

const Inline360Viewer: React.FC<Props> = ({ images, autoRotate = true, rotationSpeedMs = 90 }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const lastDxRef = useRef(0);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 3,
        onPanResponderGrant: () => {
          lastDxRef.current = 0;
        },
        onPanResponderMove: (_, g) => {
          const delta = g.dx - lastDxRef.current;
          lastDxRef.current = g.dx;
          const framesDelta = Math.trunc(delta / 6);
          if (framesDelta !== 0) {
            setFrameIndex((p) => p - framesDelta);
          }
        },
      }),
    [images.length]
  );

  // optional auto-rotate using Animated loop (keeps CPU low)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => {
    if (!autoRotate) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setFrameIndex((p) => p + 1), rotationSpeedMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRotate, rotationSpeedMs]);

  const uri = images[Math.abs(frameIndex) % images.length];

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.Image source={{ uri }} style={styles.image} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Inline360Viewer;



