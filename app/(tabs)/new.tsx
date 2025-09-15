import { AddBookModal } from "@/components/AddBookModal";
import { Book } from "@/components/cardBook";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ManualAddModal } from "@/components/ManualAddModal";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTitleStore } from "@/store/useTitleStore";
import { useUserStore } from "@/store/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Library {
  _id: string;
  wishlist: boolean;
}

export default function New() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [search, setSearch] = useState("");
  const addLibrary = useLibraryStore((state) => state.addLibrary);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const title = useTitleStore((state) => state.title);
  const setTitle = useTitleStore((state) => state.setTitle);
  const userData = useUserStore((state) => state.user);

  const openModal = () => {
    setIsVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  useEffect(() => {
    try {
      if (!userData) {
        void removeUser();
        router.replace("/");
      }
      void fetchLibrary(userData.user._id, true);
    } catch (error) {
      void removeUser();
      router.replace("/");
    }
  }, []);

  const removeUser = async () => {
    await SecureStore.deleteItemAsync("token");
  };

  const fetchLibrary = async (idUser: string, wishlist: boolean) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `https://milibro-danniel-dev.vercel.app/library/${idUser}/${wishlist}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: Library = await response.json();
      addLibrary({ id: data._id, wishlist: data.wishlist });
      void fetchBooks(data._id);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchBooks = async (idLibrary: string) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `https://milibro-danniel-dev.vercel.app/books/${idLibrary}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: Book[] = await response.json();
      data.sort((a, b) => a.author.localeCompare(b.author));
      setBooks(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

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

  const renderBookItem = (book: Book, index: number) => {
    const itemWidth = (Dimensions.get("window").width - 60) / 3;

    return (
      <Pressable key={book._id} onPress={() => {}}>
        <View key={book._id} style={[styles.bookItem, { width: itemWidth }]}>
          <View style={styles.bookImageContainer}>
            <Image
              source={{ uri: book.image_url.replace("http://", "https://") }}
              style={styles.bookImage}
            />
          </View>
          <View style={styles.bookInfo}>
            <Text style={[styles.bookType, { color: getTypeColor("BOOK") }]}>
              {book.author}
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
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nuevos Libros</Text>
          <Text style={styles.headerSubtitle}>
            {books.length} libros en tu lista de deseos
          </Text>
        </View>

        {/* Search Section */}
        <View>
          <Text style={styles.filterText}>Libros</Text>
          <TextInput
            style={styles.filterTextInput}
            placeholder="Buscar"
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
        </View>

        {/* Books Grid */}
        {books.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#6B7280" />
            <Text style={styles.emptyStateText}>No hay libros nuevos</Text>
            <Text style={styles.emptyStateSubtext}>
              Añade libros a tu lista de deseos
            </Text>
          </View>
        ) : (
          <View style={styles.booksGrid}>
            {books
              .filter(
                (book) =>
                  book.title.toLowerCase().includes(search.toLowerCase()) ||
                  book.author.toLowerCase().includes(search.toLowerCase())
              )
              .map((book, index) => renderBookItem(book, index))}
          </View>
        )}
      </ScrollView>

      <FloatingActionButton onPress={openModal} />

      <AddBookModal
        isVisible={isVisible}
        closeModal={closeModal}
        onCameraPress={() => {
          closeModal();
          router.push("/books/camera");
        }}
        onManualPress={() => {
          closeModal();
          setModalVisible(true);
        }}
      />

      <ManualAddModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSearch={() => {
          setModalVisible(false);
          router.push("/books/add");
        }}
        title={title}
        setTitle={setTitle}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#F9FAFB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "600",
  },
  filterTextInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
});
