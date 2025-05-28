import { GoogleBooks, OpenLibrary, SearchBook } from "@/models/books";
import { useIsbnCodeStore } from "@/store/useIsbnCodeStore";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTitleStore } from "@/store/useTitleStore";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BOOK":
        return "#F59E0B";
      case "PODCAST":
        return "#8B5CF6";
      case "SUMMARY":
        return "#06B6D4";
      default:
        return "#6B7280";
    }
  };

  const renderBookItem = (book: GoogleBooks, index: number) => {
    const isLarge = index === 1 || index === 2;
    const itemWidth = (Dimensions.get("window").width - 60) / 3;
    //isLarge
    // ? (Dimensions.get("window").width - 48) / 2
    // : (Dimensions.get("window").width - 60) / 3;

    return (
      <Pressable
        key={index}
        onPress={() => {
          setAllResult([]);
          validateEmptyData({
            googleBooks: book,
            openLibrary: {} as OpenLibrary,
          });
        }}
      >
        <View key={index} style={[styles.bookItem, { width: itemWidth }]}>
          <View style={styles.bookImageContainer}>
            <Image
              source={{ uri: book.imageLinks?.thumbnail }}
              style={styles.bookImage}
            />
            {/*<TouchableOpacity style={styles.favoriteButton}>
            <Ionicons
              name={book.isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={book.isFavorite ? "#EF4444" : "#6B7280"}
            />
          </TouchableOpacity>*/}
          </View>
          <View style={styles.bookInfo}>
            <Text style={[styles.bookType, { color: getTypeColor("BOOK") }]}>
              {book.authors?.join(", ")}
            </Text>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {book.title}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Books Grid */}
        <View style={styles.booksGrid}>
          {allResult.map((book, index) => renderBookItem(book, index))}
          {!loading && allResult?.length === 0 && renderForm()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 12,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  featuredSection: {
    marginBottom: 20,
  },
  featuredContent: {
    backgroundColor: "#FDE68A",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  featuredText: {
    flex: 1,
    marginRight: 16,
  },
  featuredHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  heartIcon: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  featuredDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  featuredImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterText: {
    fontSize: 14,
    color: "#374151",
    marginRight: 4,
  },
  booksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 20,
  },
  bookItem: {
    marginBottom: 16,
  },
  bookImageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  bookImage: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bookInfo: {
    paddingHorizontal: 4,
  },
  bookType: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 16,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
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
