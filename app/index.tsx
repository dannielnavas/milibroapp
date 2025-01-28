import { UserModel } from "@/models/user";
import { useUserStore } from "@/store/useUserStore";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
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
  const [error, setError] = useState(null);
  const router = useRouter();
  const addUserData = useUserStore((state) => state.addUser);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: Yup.object(validationSchema()),
    validateOnChange: false,
    onSubmit: (formData) => {
      setError(null);
      const { email, password } = formData;
      fetchLogin({ email: email.toLowerCase(), password });
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
      const data: UserModel = await response.json();
      await SecureStore.setItemAsync("token", data.access_token);
      addUserData(data);
      SecureStore.setItemAsync("dataUser", JSON.stringify({ email, password }));
      ToastAndroid.show("Inicio de sesión correcto", ToastAndroid.SHORT);
      router.replace("/(tabs)#index");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    SecureStore.getItemAsync("token").then((token) => {
      if (token) {
        router.replace("/(tabs)#index");
      }
    });
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();

    if (!compatible) {
      Alert.alert(
        "Dispositivo no compatible",
        "Este dispositivo no soporta autenticación biométrica."
      );
    }
  };

  const handleAuthentication = async () => {
    try {
      const hasEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasEnrolled) {
        Alert.alert(
          "Sin datos biométricos",
          "No se han registrado datos biométricos en este dispositivo."
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirma tu identidad",
        fallbackLabel: "Usar contraseña",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const data = JSON.parse(
          (await SecureStore.getItemAsync("dataUser")) ?? "{}"
        );
        await fetchLogin(data);
      } else {
        console.log(result.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const checkBiometricAndLogin = async () => {
      await checkBiometricAvailability();
      const loginBiometric = await SecureStore.getItemAsync("dataUser");

      if (loginBiometric) {
        setIsBiometricAvailable(true);
        handleAuthentication();
      }
    };

    checkBiometricAndLogin();
  }, []);

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
      }}
      style={styles.background}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Mi Lista de Libros</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#A0A0A0"
              value={formik.values.email}
              onChangeText={(text) => formik.setFieldValue("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#A0A0A0"
              value={formik.values.password}
              onChangeText={(text) => formik.setFieldValue("password", text)}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => formik.handleSubmit()}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 15,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 15,
    width: "100%",
  },
  button: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

const initialValues = () => {
  return {
    email: "",
    password: "",
  };
};

const validationSchema = () => {
  return {
    email: Yup.string()
      .required("El nombre de usuario es obligatorio")
      .email("El email no es válido"),
    password: Yup.string().required("La contraseña es obligatoria"),
  };
};
