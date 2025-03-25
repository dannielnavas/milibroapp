import type { Book } from "@/components/cardBook";
import type React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BookInfoProps {
  book: Book;
}

export const BookInfo: React.FC<BookInfoProps> = ({ book }) => (
  <View style={styles.infoContainer}>
    <InfoRow label="Título:" value={book.title} />
    <InfoRow label="Autor:" value={book.author} />
    <InfoRow label="Año:" value={book.publication_year.toString()} />
    <InfoRow label="Editorial:" value={book.publisher} />
    <InfoRow label="ISBN:" value={book.isbn} />
  </View>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
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
