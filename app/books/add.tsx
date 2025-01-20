import { SearchBook } from "@/models/books";
import { useIsbnCodeStore } from "@/store/useIsbnCodeStore";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

export default function Add() {
  const [book, setBook] = useState<SearchBook>();
  const scannedData = useIsbnCodeStore((state) => state.isbnCode);
  useEffect(() => {
    if (!scannedData) setBook({} as SearchBook);
    void fetchBook(scannedData as string);
  }, []);

  async function fetchBook(isbn: string) {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `http://192.168.10.55:3000/books/search/${isbn}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: SearchBook = await response.json();
      setBook(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text>{scannedData}</Text>
      {book?.googleBooks ? (
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "blue",
            textDecorationLine: "underline",
          }}
        >
          {book.googleBooks.title}
        </Text>
      ) : (
        <Text>No encontramos datos </Text>
      )}
      {book?.openLibrary ? (
        // formulario para agregar libro

        <ScrollView
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          style={{
            marginTop: 20,
            height: 1200,
            width: "100%",
            flex: 1,
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <TextInput
            placeholder="title"
            style={styles.input}
            value={book.openLibrary.title}
          />
          <TextInput
            placeholder="publishedDate"
            style={styles.input}
            value={book.openLibrary.publishedDate}
          />
          <TextInput
            placeholder="authors"
            style={styles.input}
            value={book.openLibrary.authors.join(", ")}
          />

          <TextInput
            placeholder="publisher"
            style={styles.input}
            value={book.openLibrary.publisher}
          />
          <TextInput
            placeholder="language"
            style={styles.input}
            value={book.openLibrary.language}
          />
          <TextInput
            placeholder="pages"
            style={styles.input}
            value={book.openLibrary.pages.toString()}
          />
          <TextInput
            placeholder="categories"
            style={styles.input}
            value={book.openLibrary.categories.join(", ")}
          />
          <TextInput
            placeholder="previewLink"
            style={styles.input}
            value={book.openLibrary.previewLink}
          />
          <TextInput
            placeholder="infoLink"
            style={styles.input}
            value={book.openLibrary.infoLink}
          />
          <TextInput
            placeholder="isbn"
            style={styles.input}
            value={book.openLibrary.isbn.isbn_13.join(", ")}
          />
          <Image
            style={styles.image}
            source={{ uri: book.openLibrary.imageLinks.thumbnail }}
          />
          <Pressable
            style={{
              backgroundColor: "blue",
              padding: 10,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ color: "white" }}>Agregar</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <Text>No encontramos datos</Text>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    width: 300,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    objectFit: "cover",
  },
});
