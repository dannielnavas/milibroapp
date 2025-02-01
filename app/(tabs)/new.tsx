import { Book, CardBook } from "@/components/cardBook";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTitleStore } from "@/store/useTitleStore";
import { useUserStore } from "@/store/useUserStore";
import { AntDesign, Ionicons } from "@expo/vector-icons";
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Library } from ".";
import { colors } from "../books/add";

const FloatingActionButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <Ionicons name="add" size={24} color="#2ce" style={{ zIndex: 999 }} />
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
              <Text style={styles.modalText}>Añadir libro de forma manual</Text>
            </Pressable>

            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          router.push("/books/add");
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Buscar un libro por su titulo</Text>
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

      <ScrollView style={styles.scrollView}>
        {books.length === 0 && (
          <View className="flex flex-1 justify-center items-center">
            <Text className="text-white">Cargando...</Text>
          </View>
        )}
        {books.length > 0 && (
          <View className="flex flex-1">
            <FlatList
              data={books}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              keyExtractor={(book) => String(book._id)}
              renderItem={({ item }) => <CardBook book={item} />}
              contentContainerStyle={styles.flatListContentContainer}
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator
                    size="large"
                    style={styles.spinner}
                    color="#aeaeae"
                  />
                ) : null
              }
            />
          </View>
        )}
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
  libraryStats: {
    fontSize: 14,
    color: "#666",
    marginTop: 16,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  flatListContentContainer: {
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  spinner: {
    marginTop: 20,
    marginBottom: Platform.OS === "android" ? 90 : 60,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: colors.text,
    width: 320,
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
});
