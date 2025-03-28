"use client";

import { AddBookModal } from "@/components/AddBookModal";
import { AuthorsGrid } from "@/components/AuthorsGrid";
import type { Book } from "@/components/cardBook";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ManualAddModal } from "@/components/ManualAddModal";
import { useAuthorStore } from "@/store/useAuthor";
import { useBooksStore } from "@/store/useBooks";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTitleStore } from "@/store/useTitleStore";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<
    { author: string; count: number; url?: string }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;

  const userData = useUserStore((state) => state.user);
  const setTitle = useTitleStore((state) => state.setTitle);
  const title = useTitleStore((state) => state.title);
  const addLibrary = useLibraryStore((state) => state.addLibrary);
  const addAuthor = useAuthorStore((state) => state.addAuthor);
  const addBooks = useBooksStore((state) => state.addBooks);
  const removeBooks = useBooksStore((state) => state.removeBooks);

  const databaseImages = [
    "https://images.unsplash.com/photo-1514593214839-ce1849100055",
    "https://images.unsplash.com/photo-1519682337058-a94d519337bc",
    "https://plus.unsplash.com/premium_photo-1721762724233-1332468b252f",
    "https://images.unsplash.com/photo-1546521343-4eb2c01aa44b",
    "https://images.unsplash.com/photo-1615976909545-a2d402c7dac3",
    "https://images.unsplash.com/photo-1598960087461-556c5a1f864a",
    "https://images.unsplash.com/photo-1544716278-e513176f20b5",
    "https://images.unsplash.com/photo-1542981784-71a7fea7ff18",
    "https://images.unsplash.com/photo-1582659770841-cbf093685dd6",
    "https://images.unsplash.com/photo-1575709527142-a93ed587bb83",
  ];

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
      const authors = data.reduce((acc, book) => {
        const author = acc.find((a) => a.author === book.author);
        if (author) {
          author.count++;
        } else {
          acc.push({ author: book.author, count: 1 });
        }
        return acc;
      }, [] as { author: string; count: number }[]);
      setCover(authors);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const setCover = async (
    authors: { author: string; count: number; url?: string }[]
  ) => {
    authors.forEach(async (author) => {
      author.url = databaseImages[Math.floor(Math.random() * databaseImages.length)];
      authors.sort((a, b) => a.author.localeCompare(b.author));
      setAuthors([...authors]);
    });
  };

  useEffect(() => {
    setCover(authors);
  }, [books]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ce" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.headerTitle}>Mi Biblioteca</Text> */}
        <Text style={styles.libraryStats}>
          {" "}
          Total de libros {books.length} libros
        </Text>
      </View>

      <AuthorsGrid
        authors={authors}
        onAuthorPress={(author) => {
          addAuthor(author);
          removeBooks();
          addBooks(books.filter((book) => book.author === author));
          router.push("/books/books");
        }}
      />

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
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  libraryStats: {
    fontSize: 14,
    color: "#666",
  },
});
