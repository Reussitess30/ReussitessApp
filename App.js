import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState } from 'react';
import * as Speech from 'expo-speech';

const injectedJS = `
  if (!window.speechSynthesis) {
    window.speechSynthesis = {
      speak: function(u) { window.ReactNativeWebView.postMessage(JSON.stringify({type:'tts',text:u.text})) },
      cancel: function() { window.ReactNativeWebView.postMessage(JSON.stringify({type:'tts_stop'})) },
      getVoices: function() { return [] },
      onvoiceschanged: null
    };
    window.SpeechSynthesisUtterance = function(text) {
      this.text = text; this.lang = 'fr-FR'; this.rate = 0.9; this.pitch = 1.0;
    };
  }
  true;
`;

export default function App() {
  const [loading, setLoading] = useState(true);

  const handleMessage = (e) => {
    try {
      const d = JSON.parse(e.nativeEvent.data);
      if (d.type === 'tts') {
        Speech.stop();
        Speech.speak(d.text, { language: 'fr-FR', pitch: 1.0, rate: 0.9 });
      }
      if (d.type === 'tts_stop') {
        Speech.stop();
      }
    } catch (err) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0f172a" />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      )}
      <WebView
        source={{ uri: 'https://reussitess.fr' }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScript={injectedJS}
        userAgent="REUSSITESS-AI-App/1.0 Android"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  webview: { flex: 1 },
  loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', zIndex: 999 }
});
