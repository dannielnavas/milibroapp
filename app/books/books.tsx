"use client";

import { AddBookModal } from "@/components/AddBookModal";
import { BookGrid } from "@/components/BookGrid";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ManualAddModal } from "@/components/ManualAddModal";
import { useBooksStore } from "@/store/useBooks";
import { useDetailsStore } from "@/store/useDetailsStore";
import { useTitleStore } from "@/store/useTitleStore";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Books() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const setTitle = useTitleStore((state) => state.setTitle);
  const title = useTitleStore((state) => state.title);
  const books = useBooksStore((state) => state.books);
  const addBook = useDetailsStore((state) => state.addBook);

  const categories = [
    { id: "todos", label: "Todos", icon: "menu-book" as const },
    { id: "favoritos", label: "Favoritos", icon: "favorite" as const },
    { id: "leyendo", label: "Leyendo", icon: "book" as const },
    { id: "leidos", label: "Leídos", icon: "check-circle" as const },
  ];

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

    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [setTitle]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Preparando tu biblioteca...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#6366F1", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>¡Hola!</Text>
              <Text style={styles.headerTitle}>Mi Biblioteca</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <MaterialIcons name="person" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialIcons name="book" size={20} color="#FFFFFF" />
              <Text style={styles.statText}>{books.length} Libros</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="favorite" size={20} color="#FFFFFF" />
              <Text style={styles.statText}>12 Favoritos</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <MaterialIcons
              name={category.icon}
              size={20}
              color={selectedCategory === category.id ? "#6366F1" : "#64748B"}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <BookGrid
          books={books}
          onBookPress={(book) => {
            addBook(book);
            router.push("/books/detail");
          }}
        />
      </Animated.View>

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
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6366F1",
    fontWeight: "500",
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-around",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginTop: -20,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryButtonActive: {
    backgroundColor: "#EEF2FF",
  },
  categoryText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#6366F1",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
