import { Book } from "@/components/cardBook";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useUserStore } from "@/store/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    <Ionicons name="camera" size={24} color="white" />
  </TouchableOpacity>
);

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const userData = useUserStore((state) => state.user);
  const addLibrary = useLibraryStore((state) => state.addLibrary);
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
        `http://192.168.10.60:3000/library/${idUser}/${wishlist}`,
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
      const response = await fetch(`http://192.168.10.60:3000/books/${idLibrary}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: Book[] = await response.json();
      console.log(data);
      setBooks(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biblioteca</Text>
        {/* <Pressable>
          <Text style={styles.menuDots}>⋯</Text>
        </Pressable> */}
      </View>

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
                <View style={styles.bookInfo}>
                  {/* <Text style={styles.progressText}>{book.progress}</Text> */}
                  {/* <Pressable style={styles.bookMenuButton}>
                    <Text style={styles.menuDots}>⋯</Text>
                  </Pressable> */}
                </View>
              </Pressable>
            </View>
          ))}
        </View>
        <Text style={styles.libraryStats}>{books.length} libros </Text>
        <FloatingActionButton onPress={() => router.push("/books/camera")} />
      </ScrollView>
    </View>
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
    paddingTop: 48,
    paddingBottom: 8,
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
    justifyContent: "space-between",
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
    marginBottom: 80,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
