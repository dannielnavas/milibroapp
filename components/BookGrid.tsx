import type { Book } from "@/components/cardBook";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

interface BookGridProps {
  books: Book[];
  onBookPress: (book: Book) => void;
}

export const BookGrid = ({ books, onBookPress }: BookGridProps) => (
  <ScrollView style={styles.scrollView}>
    <View style={styles.bookGrid}>
      {books.map((book) => (
        <Pressable
          key={book._id}
          style={styles.bookCard}
          onPress={() => onBookPress(book)}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: book.image_url.replace("http://", "https://") }}
              style={styles.bookCover}
              resizeMode="cover"
            />
          </View>
        </Pressable>
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 10,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  bookCard: {
    width: "48%",
    marginBottom: 20,
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    aspectRatio: 0.7,
  },
  bookCover: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});
