import { Book, CardBook } from "@/components/cardBook";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
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

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const userData = useUserStore((state) => state.user);
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
        `http://192.168.10.55:3000/library/${idUser}/${wishlist}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: Library = await response.json();
      console.log(data);
      void fetchBooks(data._id);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchBooks = async (idLibrary: string) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(`http://192.168.10.55:3000/books/${idLibrary}`, {
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
    <SafeAreaView className="flex flex-1 bg-slate-700">
      {/* float button style inline */}
      <Pressable
        style={{
          zIndex: 1,
          elevation: 10,
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#3182CE",
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => router.push("/books/camera")}
      >
        <Text className="text-white text-2xl">+</Text>
      </Pressable>
      {books.length === 0 && !loading && (
        <View className="flex flex-1 justify-center items-center">
          <Text className="text-white">No hay libros</Text>
        </View>
      )}
      {loading && (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flatListContentContainer: {
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  spinner: {
    marginTop: 20,
    marginBottom: Platform.OS === "android" ? 90 : 60,
  },
});
