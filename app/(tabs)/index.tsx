import { Book } from "@/components/cardBook";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTitleStore } from "@/store/useTitleStore";
import { useUserStore } from "@/store/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../books/add";

export interface Library {
  _id: string;
  name: string;
  wishlist: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const FloatingActionButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <Ionicons name="add" size={24} color="#2ce" style={{ zIndex: 999 }} />
  </TouchableOpacity>
);

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const userData = useUserStore((state) => state.user);
  const setTitle = useTitleStore((state) => state.setTitle);
  const title = useTitleStore((state) => state.title);
  const addLibrary = useLibraryStore((state) => state.addLibrary);
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current; // Altura inicial fuera de la pantalla

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
      void fetchLibrary(userData.user._id, false);
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
      console.log(data);
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
      console.log(data);
      setBooks(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2ce" />
          <Text>Cargando...</Text>
        </View>
      )}
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.libraryStats}>{books.length} libros </Text>
      </View>

      {/* modal bottom */}

      <Modal transparent visible={isVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.overlay} onPress={closeModal} />
          <Animated.View
            style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}
          >
            <Pressable
              onPress={() => {
                closeModal();
                router.push("/books/camera");
              }}
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <Feather name="camera" size={24} color="black" />
              <Text style={styles.modalText}>
                Agregar libro scanear codigo ISBN q
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                closeModal();
                setModalVisible(true);
              }}
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <AntDesign name="edit" size={24} color="black" />
              <Text style={styles.modalText}>Añadir libro de forma manual as</Text>
            </Pressable>

            {/* <Text style={styles.modalText}>Este es un modal desde abajo 🎉</Text> */}
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* modal agregar manual */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log("Modal has been closed.");
          setModalVisible(!modalVisible);
          router.push("/books/add");
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Buscar un libro por su titulo a</Text>
            <TextInput
              style={styles.input}
              placeholder="Titulo del libro"
              placeholderTextColor="#A0A0A0"
              value={title ?? ""}
              onChangeText={(text) => setTitle(text)}
              keyboardType="default"
              autoCapitalize="none"
            />

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(!modalVisible);
                router.push("/books/add");
              }}
            >
              <Text style={styles.textStyle}>Buscar mi libro</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Final modal agregar manual */}

      {/* Book Grid */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.bookGrid}>
          {books.map((book) => (
            <View key={book._id}>
              <Pressable style={styles.bookCard}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: book.image_url }}
                    style={styles.bookCover}
                    resizeMode="cover"
                  />
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
      <FloatingActionButton onPress={() => openModal()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  menuDots: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  bookCard: {
    width: 160, // Ancho fijo en lugar de porcentaje
    marginBottom: 32,
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
  bookInfo: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  bookMenuButton: {
    alignItems: "flex-end",
  },
  libraryStats: {
    fontSize: 14,
    color: "#666",
    marginTop: 16,
    marginBottom: 16,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    fontSize: 24,
  },
  navText: {
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    borderRadius: 30,
    elevation: 8,
    backgroundColor: "#000",
    zIndex: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5, // Sombra en Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#e53935",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: colors.text,
    width: 320,
  },
});
