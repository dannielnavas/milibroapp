"use client";

import { AddBookModal } from "@/components/AddBookModal";
import { BookGrid } from "@/components/BookGrid";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ManualAddModal } from "@/components/ManualAddModal";
import { useBooksStore } from "@/store/useBooks";
import { useDetailsStore } from "@/store/useDetailsStore";
import { useTitleStore } from "@/store/useTitleStore";
import { useRouter } from "expo-router";
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

export default function Books() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;

  const setTitle = useTitleStore((state) => state.setTitle);
  const title = useTitleStore((state) => state.title);
  const books = useBooksStore((state) => state.books);
  const addBook = useDetailsStore((state) => state.addBook);

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
    setLoading(true);
    setTitle("");
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [setTitle]);

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
        <Text style={styles.libraryStats}>Total de libros: {books.length}</Text>
      </View>

      <BookGrid
        books={books}
        onBookPress={(book) => {
          addBook(book);
          router.push("/books/detail");
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
