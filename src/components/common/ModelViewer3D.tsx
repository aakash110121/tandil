import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

type Props = {
  modelUrl: string; // glb/gltf/usdz
  title?: string;
  onClose: () => void;
  autoRotate?: boolean;
};

// Uses Google <model-viewer> via WebView to provide rich 3D orbit controls + AR
const ModelViewer3D: React.FC<Props> = ({ modelUrl, title = '3D Viewer', onClose, autoRotate = true }) => {
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
      <style>
        html, body { margin:0; padding:0; background:#fff; height:100%; }
        .topbar { position:absolute; left:0; right:0; top:0; height:56px; display:flex; align-items:center; justify-content:center; color:white; font-family:system-ui; }
        .title { opacity:.9; }
        model-viewer { width:100vw; height:100vh; background: #fff; }
        .loading { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#000; font-family:system-ui; opacity:.9; z-index:2; }
      </style>
    </head>
    <body>
      <div id="loading" class="loading">Loading 3D model…</div>
      <model-viewer id="mv" camera-controls interaction-prompt="auto" exposure="1" ${autoRotate ? 'auto-rotate' : ''} shadow-intensity="1" ar ar-modes="webxr scene-viewer quick-look" environment-image="neutral" reveal="auto" crossorigin="anonymous"></model-viewer>
      <script>
        const mv = document.getElementById('mv');
        const loading = document.getElementById('loading');
        const candidates = [
          '${modelUrl}',
          'https://modelviewer.dev/shared-assets/models/ShopifyModels/Shoe.glb',
          'https://raw.githubusercontent.com/google/model-viewer/master/packages/shared-assets/models/ShopifyModels/Shoe.glb',
          'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
        ];
        const trySequence = async (idx=0) => {
          if (idx >= candidates.length) { loading.innerText = 'Failed to load model'; return; }
          const url = candidates[idx];
          loading.innerText = 'Loading model…';
          try {
            const res = await fetch(url, { method: 'GET', mode: 'cors' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            mv.src = url;
            mv.addEventListener('load', () => { loading.style.display = 'none'; }, { once: true });
            mv.addEventListener('error', () => { loading.innerText = 'Display error, trying next…'; trySequence(idx+1); }, { once: true });
          } catch (e) {
            loading.innerText = 'Network blocked, trying next…';
            trySequence(idx+1);
          }
        };
        trySequence(0);
      </script>
    </body>
  </html>`;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={onClose}>
          <Ionicons name="close" size={22} color={COLORS.background} />
        </TouchableOpacity>
        <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
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
  titleText: {
    flex: 1,
    marginHorizontal: SPACING.sm,
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    textAlign: 'center',
  },
});

export default ModelViewer3D;


