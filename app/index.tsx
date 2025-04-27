import { UserModel } from "@/models/user";
import { useUserStore } from "@/store/useUserStore";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const router = useRouter();
  const addUserData = useUserStore((state) => state.addUser);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .required("El correo electrónico es obligatorio")
        .email("Ingresa un correo electrónico válido"),
      password: Yup.string()
        .required("La contraseña es obligatoria")
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (formData) => {
      setLoading(true);
      const { email, password } = formData;
      await fetchLogin({ email: email.toLowerCase(), password });
    },
  });

  const fetchLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await fetch(
        "https://milibro-danniel-dev.vercel.app/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data: UserModel = await response.json();
      await SecureStore.setItemAsync("token", data.access_token);
      addUserData(data);
      await SecureStore.setItemAsync(
        "dataUser",
        JSON.stringify({ email, password })
      );
      ToastAndroid.show("¡Bienvenido!", ToastAndroid.SHORT);
      router.replace("/(tabs)#index");
    } catch (error) {
      Alert.alert(
        "Error de inicio de sesión",
        "Por favor verifica tus credenciales e intenta nuevamente"
      );
    } finally {
      setLoading(false);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error("Error checking biometric availability:", error);
    }
  };

  const handleAuthentication = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Verifica tu identidad",
        fallbackLabel: "Usar correo y contraseña",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setLoading(true);
        const data = JSON.parse(
          (await SecureStore.getItemAsync("dataUser")) ?? "{}"
        );
        if (data.email && data.password) {
          await fetchLogin(data);
        }
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      Alert.alert("Error", "No se pudo verificar tu identidad");
    }
  };

  useEffect(() => {
    checkBiometricAvailability();
    const checkSavedCredentials = async () => {
      const savedData = await SecureStore.getItemAsync("dataUser");
      if (savedData && biometricAvailable) {
        handleAuthentication();
      }
    };
    checkSavedCredentials();
  }, [biometricAvailable]);

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.overlay}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Iniciando sesión...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Mi Lista de Libros</Text>
              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      formik.touched.email &&
                        formik.errors.email &&
                        styles.inputError,
                    ]}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#A0A0A0"
                    value={formik.values.email}
                    onChangeText={formik.handleChange("email")}
                    onBlur={formik.handleBlur("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    accessibilityLabel="Correo electrónico"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <Text style={styles.errorText}>{formik.errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      formik.touched.password &&
                        formik.errors.password &&
                        styles.inputError,
                    ]}
                    placeholder="Contraseña"
                    placeholderTextColor="#A0A0A0"
                    value={formik.values.password}
                    onChangeText={formik.handleChange("password")}
                    onBlur={formik.handleBlur("password")}
                    secureTextEntry
                    autoComplete="password"
                    accessibilityLabel="Contraseña"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <Text style={styles.errorText}>{formik.errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    (!formik.isValid || !formik.dirty) && styles.buttonDisabled,
                  ]}
                  onPress={() => formik.handleSubmit()}
                  disabled={!formik.isValid || !formik.dirty}
                >
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </TouchableOpacity>

                {biometricAvailable && (
                  <TouchableOpacity
                    style={[styles.button, styles.biometricButton]}
                    onPress={handleAuthentication}
                  >
                    <Text style={styles.buttonText}>Usar huella digital</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
    gap: 16,
  },
  inputWrapper: {
    width: "100%",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    width: "100%",
    color: "#333333",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#4A90E2",
    opacity: 0.5,
  },
  biometricButton: {
    backgroundColor: "#2ECC71",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 16,
  },
});
