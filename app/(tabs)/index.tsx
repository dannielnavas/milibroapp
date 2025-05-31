"use client";

import { AddBookModal } from "@/components/AddBookModal";
import type { Book } from "@/components/cardBook";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ManualAddModal } from "@/components/ManualAddModal";
import { useDetailsStore } from "@/store/useDetailsStore";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const addBook = useDetailsStore((state) => state.addBook);

  const slideAnim = useRef(new Animated.Value(300)).current;

  const userData = useUserStore((state) => state.user);
  const setTitle = useTitleStore((state) => state.setTitle);
  const title = useTitleStore((state) => state.title);
  const addLibrary = useLibraryStore((state) => state.addLibrary);

  useEffect(() => {
    if (!userData) {
      void removeUser();
      router.replace("/");
    } else {
      void fetchLibrary(userData?.user?._id, false);
    }
  }, [userData, router]); // Added router to dependencies

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
      const data = await response.json();
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
    const isLarge = index === 1 || index === 2;
    const itemWidth = (Dimensions.get("window").width - 60) / 3;
    //isLarge
    // ? (Dimensions.get("window").width - 48) / 2
    // : (Dimensions.get("window").width - 60) / 3;

    return (
      <Pressable
        key={book._id}
        onPress={() => {
          addBook(book);
          router.push("/books/detail");
        }}
      >
        <View key={book._id} style={[styles.bookItem, { width: itemWidth }]}>
          <View style={styles.bookImageContainer}>
            <Image source={{ uri: book.image_url }} style={styles.bookImage} />
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
        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredContent}>
            <View style={styles.featuredText}>
              <View style={styles.featuredHeader}>
                <View style={styles.heartIcon}>
                  <Ionicons name="heart" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.featuredTitle}>Top-20 detectives</Text>
              </View>
              <Text style={styles.featuredDescription}>
                Let's pull back the curtain on what books are currently on the minds
                and tongues of this community
              </Text>
            </View>
            <Image
              source={{ uri: "https://picsum.photos/120/160?random=featured" }}
              style={styles.featuredImage}
            />
          </View>
        </View>

        {/* Filter Buttons */}
        {/* <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>All languages</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Book, summary</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View> */}

        {/* Books Grid */}
        <View style={styles.booksGrid}>
          {books.map((book, index) => renderBookItem(book, index))}
        </View>
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
});
