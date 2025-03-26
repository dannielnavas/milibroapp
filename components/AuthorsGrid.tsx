import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface AuthorsGridProps {
  authors: { author: string; count: number; url?: string }[];
  onAuthorPress: (author: string) => void;
}

export const AuthorsGrid = ({ authors, onAuthorPress }: AuthorsGridProps) => {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.bookGrid}>
        {authors.map((author) => (
          <Pressable
            key={author.author}
            onPress={() => onAuthorPress(author.author)}
            style={styles.bookCard}
          >
            <View
              style={[
                styles.imageContainer,
                author.count > 1
                  ? { transform: [{ rotateX: "3deg" }, { rotateZ: "0.02rad" }] }
                  : {},
              ]}
            >
              <Image
                source={{ uri: author?.url?.replace("http://", "https://") }}
                // source={{ uri: book.image_url.replace("http://", "https://") }}
                style={styles.bookCover}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.badge}>{author.count}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

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
  badge: {
    position: "absolute",
    top: -8,
    right: 0,
    backgroundColor: "#333",
    borderRadius: 20,
    color: "#fff",
    fontSize: 12,
    height: 24,
    width: 24,
    textAlign: "center",
    marginTop: 10,
  },
});
