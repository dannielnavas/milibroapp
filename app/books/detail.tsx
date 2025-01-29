import { Book } from "@/components/cardBook";
import { useDetailsStore } from "@/store/useDetailsStore";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function detail() {
  const book: Book = useDetailsStore((state) => state.book);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: book.image_url }}
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
