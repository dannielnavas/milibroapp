import { useIsbnCodeStore } from "@/store/useIsbnCodeStore";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const setCode = useIsbnCodeStore((state) => state.setCode);
  const scannedData = useIsbnCodeStore((state) => state.isbnCode);
  const router = useRouter();

  if (!permission) {
    // Permisos están cargando
    return <View />;
  }

  if (!permission.granted) {
    // Permisos no otorgados
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Se necesitan permisos para usar la cámara.</Text>
        <Button onPress={requestPermission} title="Otorgar permisos" />
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (type === "ean13" || type === "ean8") {
      setCode(data);
      router.replace("/books/add");
    }
  };

  return (
    <View style={styles.container}>
      {scannedData ? (
        <Text style={styles.text}>Último ISBN escaneado: {scannedData}</Text>
      ) : (
        <Text style={styles.text}>Apunte la cámara al código ISBN.</Text>
      )}
      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8"], // Tipos soportados para ISBN
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  camera: {
    width: "70%",
    height: "20%",
  },
});
