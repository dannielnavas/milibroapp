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

interface FormValues {
  title: string;
  author: string;
  isbn: string;
  publication_year: number;
  publisher: string;
  image_url: string;
  wishlist: boolean;
  lenguaje: string;
}

export default function Add() {
  const [loading, setLoading] = useState(false);
  const [allResult, setAllResult] = useState<GoogleBooks[]>([]);
  const router = useRouter();
  const scannedData = useIsbnCodeStore((state) => state.isbnCode);
  const library = useLibraryStore((state) => state.library);
  const title = useTitleStore((state) => state.title);
  const setTitle = useTitleStore((state) => state.setTitle);

  const formik = useFormik<FormValues>({
    initialValues: initialValues(),
    validationSchema: Yup.object().shape({
      title: Yup.string()
        .required("El título es obligatorio")
        .min(2, "El título debe tener al menos 2 caracteres"),
      author: Yup.string()
        .required("El autor es obligatorio")
        .min(2, "El autor debe tener al menos 2 caracteres"),
      isbn: Yup.string()
        .required("El ISBN es obligatorio")
        .matches(/^[0-9-]{10,13}$/, "El ISBN debe tener entre 10 y 13 dígitos"),
      publication_year: Yup.number()
        .required("El año de publicación es obligatorio")
        .min(1000, "Año inválido")
        .max(new Date().getFullYear(), "El año no puede ser futuro"),
      publisher: Yup.string()
        .required("La editorial es obligatoria")
        .min(2, "La editorial debe tener al menos 2 caracteres"),
      image_url: Yup.string()
        .required("La URL de la imagen es obligatoria")
        .url("Debe ser una URL válida"),
      lenguaje: Yup.string()
        .required("El idioma es obligatorio")
        .min(2, "El idioma debe tener al menos 2 caracteres"),
      wishlist: Yup.boolean(),
    }),
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await addBook(values);
        router.back();
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "No se pudo guardar el libro");
      } finally {
        setLoading(false);
      }
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

  const validateFields = () => {
    if (!formik.values.title || !formik.values.author || !formik.values.isbn) {
      Alert.alert(
        "Error",
        "Por favor completa los campos obligatorios (título, autor e ISBN)"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      await addBook(formik.values);
      router.back();
    } catch (err) {
      Alert.alert("Error", "No se pudo guardar el libro");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Agregar Nuevo Libro</Text>

      {Boolean(formik.values.image_url) && (
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: formik.values.image_url.replace("http://", "https://"),
            }}
            style={styles.bookCover}
            resizeMode="cover"
          />
        </View>
      )}

      {(Object.keys(formik.initialValues) as Array<keyof FormValues>).map(
        (fieldName) => (
          <View key={fieldName} style={styles.inputContainer}>
            <Text style={styles.label}>
              {fieldName.charAt(0).toUpperCase() +
                fieldName.slice(1).replace("_", " ")}
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors[fieldName] &&
                  formik.touched[fieldName] && {
                    borderColor: "#dc3545",
                  },
              ]}
              value={String(formik.values[fieldName])}
              onChangeText={(text) => formik.setFieldValue(fieldName, text)}
              onBlur={() => formik.setFieldTouched(fieldName)}
              placeholder={`Ingrese ${fieldName.replace("_", " ")}`}
              keyboardType={fieldName === "publication_year" ? "numeric" : "default"}
            />
            {formik.errors[fieldName] && formik.touched[fieldName] && (
              <Text style={styles.errorText}>{formik.errors[fieldName]}</Text>
            )}
          </View>
        )
      )}

      <TouchableOpacity
        style={[styles.button, !formik.isValid && { backgroundColor: "#cccccc" }]}
        onPress={() => formik.handleSubmit()}
        disabled={!formik.isValid}
      >
        <Text style={styles.buttonText}>Guardar Libro</Text>
      </TouchableOpacity>
    </ScrollView>
  );

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
                    style={styles.bookCardItem}
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

        {!loading && allResult?.length === 0 && renderForm()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#05453e",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  bookCover: {
    width: 160,
    height: 280,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 16,
  },
  bookCardItem: {
    width: 190,
    marginBottom: 32,
    marginLeft: 20,
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
