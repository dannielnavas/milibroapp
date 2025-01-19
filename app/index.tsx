import { UserModel } from "@/models/user";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import * as Yup from "yup";

export default function App() {
  const [error, setError] = useState(null);
  const router = useRouter();
  const addUserData = useUserStore((state) => state.addUser);
  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: Yup.object(validationSchema()),
    validateOnChange: false,
    onSubmit: (formData) => {
      setError(null);
      const { email, password } = formData;
      console.log(email, password);
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
      const response = await fetch("http://192.168.10.55:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data: UserModel = await response.json();
      await SecureStore.setItemAsync("token", data.access_token);
      addUserData(data);
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

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={formik.values.email}
        onChangeText={(text) => formik.setFieldValue("email", text)}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry={true}
        value={formik.values.password}
        onChangeText={(text) => formik.setFieldValue("password", text)}
      />

      <Button title="Iniciar sesión" onPress={() => formik.handleSubmit()} />
      <Text style={styles.error}>{formik.errors.email}</Text>
      <Text style={styles.error}>{formik.errors.password}</Text>
      <Text style={styles.error}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    width: 300,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#3498db",
    color: "#fff",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    width: 300,
  },
  error: {
    color: "#f00",
    textAlign: "center",
    marginTop: 20,
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
