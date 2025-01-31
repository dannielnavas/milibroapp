import { Book } from "@/components/cardBook";
import { useDetailsStore } from "@/store/useDetailsStore";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function detail() {
  const book: Book = useDetailsStore((state) => state.book);
  const router = useRouter();

  const removeBook = async (id: string) => {
    console.log("Removing book", id);
    try {
      const token = await SecureStore.getItemAsync("token");
      const url = "https://milibro-danniel-dev.vercel.app/books/";
      const response = await fetch(url + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert("Libro eliminado", "El libro ha sido eliminado", [
          {
            text: "Aceptar",
            onPress: () => {
              router.push("/(tabs)#index");
            },
          },
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          height: 64,
          backgroundColor: "#05453e",
          padding: 16,
        }}
      >
        <Link
          href={"/(tabs)#index"}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Ionicons name="arrow-back-outline" size={24} color="white" />

          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "white",
              height: 44,
              textAlignVertical: "center",
            }}
          >
            {book.title}
          </Text>
        </Link>
        <Pressable
          onPress={() => removeBook(book._id)}
          style={{
            padding: 8,
            borderRadius: 50,
            height: 40,
            width: 40,
            backgroundColor: "rgba(39, 245, 198, 0.32)",
            borderWidth: 1,
            borderColor: "rgba(39, 245, 198, 0.32)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome name="trash-o" size={20} color="#98eddc" />
        </Pressable>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: book.image_url.replace("http://", "https://") }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Título:</Text>
            <Text style={styles.value}>{book.title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Autor:</Text>
            <Text style={styles.value}>{book.author}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Año:</Text>
            <Text style={styles.value}>{book.publication_year}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Editorial:</Text>
            <Text style={styles.value}>{book.publisher}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ISBN:</Text>
            <Text style={styles.value}>{book.isbn}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: 200,
    height: 300,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    width: 80,
    fontWeight: "bold",
    color: "#666",
  },
  value: {
    flex: 1,
    color: "#333",
  },
});
