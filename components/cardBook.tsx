import { useDetailsStore } from "@/store/useDetailsStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
export interface Book {
  title: string;
  author: string;
  isbn: string;
  publication_year: number;
  publisher: string;
  image_url: string;
  wishlist: boolean;
  library: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CardBookProps {
  book: Book;
}

const CardBook = ({ book }: CardBookProps) => {
  const router = useRouter();
  const addBook = useDetailsStore((state) => state.addBook);

  const goToBooks = () => {
    addBook(book);
    router.push("/books/detail");
  };

  useEffect(() => {
    console.log(book);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={goToBooks}>
      <View style={styles.card}>
        <Image
          style={styles.cover}
          source={{
            uri: book.image_url,
          }}
        />
        <View style={styles.info}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
        </View>
        <View style={styles.markButton}>
          {book.wishlist && (
            <View style={styles.wishlistMarker}>
              <Ionicons name="heart" size={16} color="#fff" />
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 250,
    height: 500,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 10,
    overflow: "hidden",
  },
  cover: {
    width: "100%",
    height: 320,
    objectFit: "cover",
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  author: {
    fontSize: 14,
    color: "#666",
  },
  markButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  wishlistMarker: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 50,
  },
});

export { CardBook };
