import { Book, CardBook } from "@/components/cardBook";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTitleStore } from "@/store/useTitleStore";
import { useUserStore } from "@/store/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Library } from ".";

const FloatingActionButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <MaterialIcons name="add" size={24} color="#FFFFFF" />
  </TouchableOpacity>
);

export default function New() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const userData = useUserStore((state) => state.user);
  const addLibrary = useLibraryStore((state) => state.addLibrary);
  const [isVisible, setIsVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current; // Altura inicial fuera de la pantalla
  const title = useTitleStore((state) => state.title);
  const setTitle = useTitleStore((state) => state.setTitle);

  const openModal = () => {
    setIsVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0, // Se posicionará en la parte inferior visible
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // Se desliza hacia abajo
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
      setBooks(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#6366F1", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Nuevos Libros</Text>
            <View style={styles.statsContainer}>
              <MaterialIcons name="book" size={20} color="#FFFFFF" />
              <Text style={styles.statsText}>{books.length} libros</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {books.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="auto-stories" size={48} color="#6366F1" />
            <Text style={styles.emptyStateText}>No hay libros nuevos</Text>
            <Text style={styles.emptyStateSubtext}>
              Añade libros a tu lista de deseos
            </Text>
          </View>
        ) : (
          <FlatList
            data={books}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            keyExtractor={(book) => String(book._id)}
            renderItem={({ item }) => <CardBook book={item} />}
            contentContainerStyle={styles.flatListContent}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6366F1" />
                  <Text style={styles.loadingText}>Cargando más libros...</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      <Modal transparent visible={isVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.overlay} onPress={closeModal} />
          <Animated.View
            style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir nuevo libro</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
                <MaterialIcons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                closeModal();
                setModalVisible(true);
              }}
              style={styles.modalOption}
            >
              <MaterialIcons name="edit" size={24} color="#6366F1" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Añadir manualmente</Text>
                <Text style={styles.modalOptionSubtitle}>
                  Busca y añade un libro por su título
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          router.push("/books/add");
        }}
      >
        <View style={styles.searchModalContainer}>
          <View style={styles.searchModalContent}>
            <Text style={styles.searchModalTitle}>Buscar libro</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Título del libro"
              placeholderTextColor="#94A3B8"
              value={title ?? ""}
              onChangeText={(text) => setTitle(text)}
              keyboardType="default"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                setModalVisible(false);
                router.push("/books/add");
              }}
            >
              <Text style={styles.searchButtonText}>Buscar libro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingActionButton onPress={openModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  statsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#6366F1",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlay: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  closeIcon: {
    padding: 8,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    gap: 16,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  modalOptionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  searchModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  searchModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  searchModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
