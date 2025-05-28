import { Book } from "@/store/useBooks";
import React, { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface BookCardProps {
  book: Book;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const BookCardComponent: React.FC<BookCardProps> = ({
  book,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}) => {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
    >
      <View style={styles.imageContainer}>
        {book.cover ? (
          <Image
            source={{ uri: book.cover }}
            style={styles.cover}
            resizeMode="cover"
            accessibilityLabel={`Portada de ${book.title}`}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{book.title}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>
      {book.author && (
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    aspectRatio: 0.7,
    backgroundColor: "#f0f0f0",
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    padding: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    marginHorizontal: 8,
  },
  author: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    marginHorizontal: 8,
  },
});

export const BookCard = memo(BookCardComponent);
