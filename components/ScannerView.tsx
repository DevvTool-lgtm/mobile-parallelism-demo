import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Animated, { FadeIn } from 'react-native-reanimated';

type Props = {
  onCodeScanned: (data: string) => void;
};

export default function ScannerView({ onCodeScanned }: Props) {
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onCodeScanned(data);
    setTimeout(() => setScanned(false), 1200);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>No access to camera. Please grant permissions in settings.</Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <BarCodeScanner
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.mask} />
        <View style={styles.scanRow}>
          <View style={styles.mask} />
          <View style={styles.target} />
          <View style={styles.mask} />
        </View>
        <View style={styles.mask} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { height: 360, borderRadius: 16, overflow: 'hidden' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  target: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    backgroundColor: 'transparent',
  },
  center: { height: 360, alignItems: 'center', justifyContent: 'center' },
});