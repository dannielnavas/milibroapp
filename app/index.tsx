import { UserModel } from "@/models/user";
import { useUserStore } from "@/store/useUserStore";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

const { width, height } = Dimensions.get("window");

const BookWithRing = () => (
  <View style={{ width: 220, height: 220 }}>
    <Image
      source={require("@/assets/images/books-image.png")}
      style={{ width: 220, height: 220 }}
    />
  </View>
);

const PixelatedText = ({ text, style }: { text: string; style: any }) => {
  return <Text style={[styles.pixelatedText, style]}>{text}</Text>;
};

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const addUserData = useUserStore((state) => state.addUser);

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    const { email, password } = values;
    await fetchLogin({ email: email.toLowerCase(), password });
  };

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
        JSON.stringify({ email, password, name: data.user.name })
      );
      ToastAndroid.show("¡Bienvenido!", ToastAndroid.SHORT);
      router.replace("/(tabs)#index");
    } catch (error) {
      Alert.alert(
        "Error de inicio de sesión",
        "Por favor verifica tus credenciales e intenta nuevamente"
      );
    } finally {
      setIsLoading(false);
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
        setIsLoading(true);
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
        const dataUser = JSON.parse(savedData);
        setUserData(dataUser);
        setHasBiometric(true);
      }
    };
    checkSavedCredentials();
  }, [biometricAvailable]);

  return !hasBiometric ? (
    <LinearGradient colors={["#2D1B4E", "#1E0E33"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <BookWithRing />
              <PixelatedText
                text="Welcome to My Library"
                style={styles.welcomeText}
              />
              <Text style={styles.subtitleText}>
                Sign in to continue to your library
              </Text>
            </View>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={[
                        styles.input,
                        touched.email && errors.email && styles.inputError,
                      ]}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <TextInput
                      style={[
                        styles.input,
                        touched.password && errors.password && styles.inputError,
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      isLoading && styles.loginButtonDisabled,
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={isLoading}
                  >
                    <Text style={styles.loginButtonText}>
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity>
                      <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </ScrollView>

          <View style={styles.homeIndicator} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  ) : (
    <LinearGradient colors={["#2D1B4E", "#1E0E33"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.centerContent}>
            <BookWithRing />
            <PixelatedText text="Log in" style={styles.loginText} />

            <TouchableOpacity style={styles.userCard} onPress={handleAuthentication}>
              <Image
                source={{ uri: "https://via.placeholder.com/40" }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData?.name}</Text>
                <Text style={styles.userEmail}>{userData?.email}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setHasBiometric(false)}>
              <Text style={styles.anotherAccountText}>Use another account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.homeIndicator} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  loginText: {
    textTransform: "uppercase",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 50,
    padding: 10,
    paddingHorizontal: 20,
    width: width * 0.8,
    maxWidth: 350,
    marginBottom: 20,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  userEmail: {
    color: "#FFFFFF",
    opacity: 0.7,
    fontSize: 14,
  },
  anotherAccountText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 20,
    width: 150,
  },
  userInfo: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
  },
  bookContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  bookWrapper: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFB6C1",
  },
  ringContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    borderWidth: 6,
    borderColor: "#B19CD9",
    transform: [{ rotateX: "70deg" }],
  },
  pixelatedText: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 24,
    color: "#FFFFFF",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  welcomeText: {
    marginBottom: 8,
  },
  subtitleText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    textAlign: "center",
    width: "80%",
  },
  formContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 350,
    alignSelf: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#B19CD9",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#B19CD9",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#B19CD9",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  signupLink: {
    color: "#FFB6C1",
    fontSize: 14,
    fontWeight: "600",
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
});
