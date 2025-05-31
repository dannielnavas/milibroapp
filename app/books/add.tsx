import { GoogleBooks, OpenLibrary, SearchBook } from "@/models/books";
import { useIsbnCodeStore } from "@/store/useIsbnCodeStore";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTitleStore } from "@/store/useTitleStore";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [selectedBook, setSelectedBook] = useState<GoogleBooks | null>(null);
  const router = useRouter();
  const scannedData = useIsbnCodeStore((state) => state.isbnCode);
  const library = useLibraryStore((state) => state.library);
  const title = useTitleStore((state) => state.title);
  const setTitle = useTitleStore((state) => state.setTitle);

  const addBook = async (dataBook: GoogleBooks | null) => {
    if (!dataBook) return;
    try {
      const payload = {
        title: dataBook.title,
        author: dataBook.authors?.join(","),
        isbn: dataBook.isbn[0].identifier,
        publication_year: dataBook.publishedDate.split("-")[0],
        image_url: dataBook.imageLinks?.thumbnail,
        lenguaje: dataBook.language,
        startDate: new Date().toISOString(),
        endDate: "",
        status: "reading",
        genre: dataBook.categories?.join(", "),
        totalPages: dataBook.pages,
        description: dataBook.description,
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
      console.log("resultado", data);

      router.replace("/(tabs)#index");
      setTitle("");
      setLoading(false);
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
      console.error(error);
    }
  }

  const validateEmptyData = (data: SearchBook) => {
    if (Object.keys(data.openLibrary).length > 0) {
      setLoading(false);
      return;
    } else if (Object.keys(data.googleBooks).length > 0) {
      setSelectedBook(data.googleBooks);
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

  const renderForm = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Book Title */}
        <Text style={styles.bookTitle}>{selectedBook?.title}</Text>
        <Text style={styles.bookAuthor}>
          Por: {selectedBook?.authors?.join(", ")}
        </Text>

        {/* Book Cover */}
        <View style={styles.bookCoverContainer}>
          <View style={styles.bookShadowWrapper}>
            <View style={styles.bookSpine} />
            <Image
              source={{
                uri: selectedBook?.imageLinks?.thumbnail,
              }}
              style={styles.bookCover}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Book Information */}
        <View style={styles.bookInfoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Categoría:</Text>
            <Text style={styles.infoValue}>
              {selectedBook?.categories?.join(", ")}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lenguaje:</Text>
            <Text style={styles.infoValue}>{selectedBook?.language}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de publicación:</Text>
            <Text style={styles.infoValue}>{selectedBook?.publishedDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Páginas:</Text>
            <Text style={styles.infoValue}>{selectedBook?.pages}</Text>
          </View>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(selectedBook?.infoLink ?? "")}
          >
            <Text style={styles.infoLabel}>Link de información:</Text>
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Ver en Google Books</Text>
              <Feather name="external-link" size={14} color="#E75A7C" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Synopsis */}
        <View style={styles.synopsisContainer}>
          <Text style={styles.synopsisTitle}>Resumen</Text>
          <Text style={styles.synopsisText}>{selectedBook?.description}</Text>
        </View>

        {/* Extra space at bottom to ensure content isn't hidden behind floating button */}
        <View style={styles.buttonSpaceholder} />
      </ScrollView>

      {/* Floating Button - Always at bottom */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => addBook(selectedBook)}
      >
        <Text style={styles.actionButtonText}>Agregar libro a mi biblioteca</Text>
      </TouchableOpacity>

      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
    </SafeAreaView>
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
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
  bookCoverContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  bookShadowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    backgroundColor: "transparent",
    borderRadius: 14,
  },
  bookSpine: {
    width: 10,
    height: 280,
    backgroundColor: "#e5e5e5",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: -4,
    zIndex: 1,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },
  bookCover: {
    width: 170,
    height: 280,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 2,
  },
  bookAuthor: {
    fontSize: 18,
    color: "#777",
    marginBottom: 20,
  },
  bookInfoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
    flex: 1,
    textAlign: "right",
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  linkText: {
    fontSize: 14,
    color: "#E75A7C",
    fontWeight: "500",
    marginRight: 4,
  },

  buttonSpaceholder: {
    height: 80, // Space to ensure content isn't hidden behind floating button
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#E75A7C",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  headerButton: {
    padding: 4,
  },
  synopsisContainer: {
    marginBottom: 20,
  },
  synopsisTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  synopsisText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 2,
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
