import { GoogleBooks, OpenLibrary, SearchBook } from "@/models/books";
import { useIsbnCodeStore } from "@/store/useIsbnCodeStore";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTitleStore } from "@/store/useTitleStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [allResult, setAllResult] = useState<GoogleBooks[]>([]);
  const router = useRouter();
  const scannedData = useIsbnCodeStore((state) => state.isbnCode);
  const library = useLibraryStore((state) => state.library);
  const title = useTitleStore((state) => state.title);
  const setTitle = useTitleStore((state) => state.setTitle);

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: Yup.object(validationSchema()),
    validateOnChange: true,
    onSubmit: (formData) => {
      setLoading(true);
      setError(null);
      addBook(formData);
    },
  });

  const addBook = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        library: library.id,
        wishlist: library.wishlist,
      };
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch("https://milibro-danniel-dev.vercel.app/books", {
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
      setTitle("");
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (title) {
      fetchBookForTitle(title);
      return;
    }
    if (scannedData) {
      fetchBook(scannedData);
    }
  }, []);

  async function fetchBookForTitle(title: string) {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `https://milibro-danniel-dev.vercel.app/books/search-title/${title}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: SearchBook = await response.json();
      setLoading(false);
      if (Object.keys(data.googleBooks).length === 0) {
        Alert.alert(
          "No se encontraron resultados",
          "Intenta buscar por el autor o el ISBN",
          [
            {
              text: "Aceptar",
              onPress: () => {
                router.replace("/(tabs)#index");
              },
            },
          ]
        );
      }
      setAllResult(data.googleBooks as unknown as GoogleBooks[]);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchBook(isbn: string) {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `https://milibro-danniel-dev.vercel.app/books/search/${isbn}`,
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
    if (Object.keys(data.openLibrary).length > 0) {
      const author = data.openLibrary?.authors?.join(",") ?? "";
      formik.setValues({
        title: data.openLibrary.title || "",
        author: author,
        isbn: scannedData ?? "",
        publication_year: parseInt(data.openLibrary.publishedDate) || 0,
        publisher: data.openLibrary.publisher || "",
        image_url: data.openLibrary.imageLinks?.thumbnail || "",
        lenguaje: data.openLibrary.language || "",
        wishlist: false,
      });
      setLoading(false);
      return;
    } else if (Object.keys(data.googleBooks).length > 0) {
      const author = data.googleBooks?.authors?.join(",") ?? "";
      formik.setValues({
        title: data.googleBooks.title || "",
        author: author,
        isbn: scannedData ?? "",
        publication_year: parseInt(data.googleBooks.publishedDate) || 0,
        publisher: data.googleBooks.publisher || "",
        image_url: data.googleBooks.imageLinks?.thumbnail || "",
        lenguaje: data.googleBooks.language || "",
        wishlist: false,
      });
      setLoading(false);
      return;
    } else {
      Alert.alert(
        "No se encontraron resultados",
        "Intenta agregarlo de forma manual",
        [
          {
            text: "Aceptar",
            onPress: () => {
              setLoading(false);
              router.replace("/(tabs)#index");
            },
          },
        ]
      );
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <Link
        href={"/(tabs)#index"}
        style={{ padding: 10 }}
        onPress={() => setTitle("")}
      >
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </Link>

      <View style={styles.mainContainer}>
        {loading && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#43c1d1" />
            <Text>Cargando...</Text>
          </View>
        )}

        {allResult?.length !== 0 && (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.bookGrid}>
              <FlatList
                data={allResult}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.bookCard}
                    onPress={() => {
                      setAllResult([]);
                      validateEmptyData({
                        googleBooks: item,
                        openLibrary: {} as OpenLibrary,
                      });
                    }}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{
                          uri: item.imageLinks?.thumbnail.replace(
                            "http://",
                            "https://"
                          ),
                        }}
                        style={styles.bookCover}
                        resizeMode="cover"
                      />
                    </View>
                  </Pressable>
                )}
                numColumns={2}
                contentContainerStyle={styles.bookGrid}
              />
            </View>
          </ScrollView>
        )}

        {!loading && allResult?.length === 0 && (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Agregar Nuevo Libro</Text>

            {!!formik.values.image_url && (
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Image
                  source={{
                    uri: formik.values.image_url.replace("http://", "https://"),
                  }}
                  style={{ width: 200, height: 300, margin: 10, marginBottom: 20 }}
                  resizeMode="cover"
                />
              </View>
            )}
            {/* TODO: agregar validaciones de los campos */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={formik.values.title}
                onChangeText={(text) => formik.setFieldValue("title", text)}
                placeholder="Ingrese el título del libro"
                placeholderTextColor={colors.placeholderText}
              />
              {formik.errors.title && (
                <Text style={{ color: "red" }}>{formik.errors.title}</Text>
              )}
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
              {formik.errors.author && (
                <Text style={{ color: "red" }}>{formik.errors.author}</Text>
              )}
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
              {formik.errors.image_url && (
                <Text style={{ color: "red" }}>{formik.errors.image_url}</Text>
              )}
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
              {formik.errors.isbn && (
                <Text style={{ color: "red" }}>{formik.errors.isbn}</Text>
              )}
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
              {formik.errors.lenguaje && (
                <Text style={{ color: "red" }}>{formik.errors.lenguaje}</Text>
              )}
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
              {formik.errors.publication_year && (
                <Text style={{ color: "red" }}>
                  {formik.errors.publication_year}
                </Text>
              )}
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
              {formik.errors.publisher && (
                <Text style={{ color: "red" }}>{formik.errors.publisher}</Text>
              )}
            </View>

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
  bookCard: {
    width: 160, // Ancho fijo en lugar de porcentaje
    marginBottom: 32,
    marginLeft: 20,
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    overflow: "hidden",
    aspectRatio: 0.7, // Mantiene una proporción consistente
  },
  bookCover: {
    width: "100%", // Ocupa todo el ancho del contenedor
    height: "100%", // Ocupa todo el alto del contenedor
    objectFit: "cover",
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 20,
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
    title: Yup.string().required("El título es requerido"),
    author: Yup.string().required("El autor es requerido"),
    isbn: Yup.string().required("El ISBN es requerido"),
    publication_year: Yup.number().required("El año de publicación es requerido"),
    publisher: Yup.string().required("La editorial es requerida"),
    image_url: Yup.string().required("La URL de la imagen es requerida"),
    lenguaje: Yup.string().required("El idioma es requerido"),
  };
};
