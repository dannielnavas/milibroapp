import { GoogleBooks, OpenLibrary, SearchBook } from "@/models/books";
import { useIsbnCodeStore } from "@/store/useIsbnCodeStore";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

export const colors = {
  background: "#f0f0f0",
  text: "#333333",
  primary: "#4a90e2",
  border: "#cccccc",
  buttonText: "#ffffff",
  placeholderText: "#999999",
};

export default function Add() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<GoogleBooks | OpenLibrary>();
  const [author, setAuthor] = useState("");
  const router = useRouter();
  const scannedData = useIsbnCodeStore((state) => state.isbnCode);
  const library = useLibraryStore((state) => state.library);

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: Yup.object(validationSchema()),
    validateOnChange: false,
    onSubmit: (formData) => {
      setLoading(true);
      console.log("Formulario");
      setError(null);
      console.log(formData);
      addBook(formData);
    },
  });

  const addBook = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        ...library,
      };
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch("http://192.168.10.60:3000/books", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log(data);
      router.replace("/(tabs)#index");
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!scannedData) {
      setBook({} as GoogleBooks);
      return;
    }
    console.log(library);
    void fetchBook(scannedData as string);
  }, []);

  async function fetchBook(isbn: string) {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `http://192.168.10.60:3000/books/search/${isbn}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: SearchBook = await response.json();
      validateEmptyData(data);
    } catch (error) {
      console.log(error);
    }
  }

  const validateEmptyData = (data: SearchBook) => {
    console.log("---".repeat(100));
    console.log(data);
    if (Object.keys(data.openLibrary).length > 0) {
      console.log("OpenLibrary");
      const author = data.openLibrary?.authors?.join(",") ?? "";
      setAuthor(author);
      setBook(data.openLibrary);
      formik.setValues({
        title: data.openLibrary.title || "",
        author: author,
        isbn: scannedData || "",
        publication_year: parseInt(data.openLibrary.publishedDate) || 0,
        publisher: data.openLibrary.publisher || "",
        image_url: data.openLibrary.imageLinks?.thumbnail || "",
        lenguaje: data.openLibrary.language || "",
        wishlist: false,
      });
      setLoading(false);
      return;
    } else if (Object.keys(data.googleBooks).length > 0) {
      console.log("GoogleBooks");
      const author = data.googleBooks?.authors?.join(",") ?? "";
      setAuthor(author);
      setBook(data.googleBooks);
      formik.setValues({
        title: data.googleBooks.title || "",
        author: author,
        isbn: scannedData || "",
        publication_year: parseInt(data.googleBooks.publishedDate) || 0,
        publisher: data.googleBooks.publisher || "",
        image_url: data.googleBooks.imageLinks?.thumbnail || "",
        lenguaje: data.googleBooks.language || "",
        wishlist: false,
      });
      setLoading(false);
      return;
    }
    setBook({} as GoogleBooks);
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.mainContainer}>
        {loading && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#00ff00" />
            <Text>Cargando...</Text>
          </View>
        )}

        {!loading && (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Agregar Nuevo Libro</Text>

            {formik.values.image_url && (
              <View style={{ marginTop: 10 }}>
                <Image
                  source={{ uri: formik.values.image_url }}
                  style={{ width: 100, height: 100, margin: 10, marginBottom: 20 }}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={formik.values.title}
                onChangeText={(text) => formik.setFieldValue("title", text)}
                placeholder="Ingrese el título del libro"
                placeholderTextColor={colors.placeholderText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Autores (separados por coma)</Text>
              <TextInput
                style={styles.input}
                value={formik.values.author}
                onChangeText={(text) => formik.setFieldValue("author", text)}
                placeholder="Ingrese los autores"
                placeholderTextColor={colors.placeholderText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>URL de la imagen</Text>
              <TextInput
                style={styles.input}
                value={formik.values.image_url}
                onChangeText={(text) => formik.setFieldValue("image_url", text)}
                placeholder="Ingrese la URL de la imagen"
                placeholderTextColor={colors.placeholderText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>ISBN</Text>
              <TextInput
                style={styles.input}
                value={formik.values.isbn}
                onChangeText={(text) => formik.setFieldValue("isbn", text)}
                placeholder="Ingrese el ISBN"
                placeholderTextColor={colors.placeholderText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Idioma</Text>
              <TextInput
                style={styles.input}
                value={formik.values.lenguaje}
                onChangeText={(text) => formik.setFieldValue("lenguaje", text)}
                placeholder="Ingrese el idioma"
                placeholderTextColor={colors.placeholderText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha de publicación</Text>
              <TextInput
                style={styles.input}
                value={String(formik.values.publication_year)}
                onChangeText={(text) =>
                  formik.setFieldValue("publication_year", text)
                }
                placeholder="Ingrese la fecha de publicación"
                placeholderTextColor={colors.placeholderText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Editorial</Text>
              <TextInput
                style={styles.input}
                value={formik.values.publisher}
                onChangeText={(text) => formik.setFieldValue("publisher", text)}
                placeholder="Ingrese la editorial"
                placeholderTextColor={colors.placeholderText}
              />
            </View>

            {error && <Text style={{ color: "red" }}>{error}</Text>}

            <TouchableOpacity
              style={styles.button}
              onPress={() => formik.handleSubmit()}
            >
              <Text style={styles.buttonText}>Guardar Libro</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: "bold",
  },
});

const initialValues = () => {
  return {
    title: "",
    author: "",
    isbn: "",
    publication_year: 0,
    publisher: "",
    image_url: "",
    wishlist: false,
    lenguaje: "",
  };
};

const validationSchema = () => {
  return {
    // title: Yup.string().required("El título es requerido"),
    // author: Yup.string().required("El autor es requerido"),
    // isbn: Yup.string().required("El ISBN es requerido"),
    // publication_year: Yup.number().required("El año de publicación es requerido"),
    // publisher: Yup.string().required("La editorial es requerida"),
    // image_url: Yup.string().required("La URL de la imagen es requerida"),
    // lenguaje: Yup.string().required("El idioma es requerido"),
  };
};
