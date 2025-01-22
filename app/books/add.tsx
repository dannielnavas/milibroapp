import { GoogleBooks, OpenLibrary, SearchBook } from "@/models/books";
import { useIsbnCodeStore } from "@/store/useIsbnCodeStore";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const colors = {
  background: "#f0f0f0",
  text: "#333333",
  primary: "#4a90e2",
  border: "#cccccc",
  buttonText: "#ffffff",
  placeholderText: "#999999",
};

export default function Add() {
  const [book, setBook] = useState<GoogleBooks | OpenLibrary>();
  const scannedData = useIsbnCodeStore((state) => state.isbnCode);
  useEffect(() => {
    if (!scannedData) setBook({} as GoogleBooks);
    void fetchBook(scannedData as string);
  }, []);

  async function fetchBook(isbn: string) {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `http://192.168.10.60:3000/books/search/${isbn}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: SearchBook = await response.json();
      validateEmptyData(data);
    } catch (error) {
      console.log(error);
    }
  }

  const validateEmptyData = (data: SearchBook) => {
    if (Object.keys(data.openLibrary).length > 0) {
      setBook(data.openLibrary);
      return;
    } else if (Object.keys(data.googleBooks).length > 0) {
      setBook(data.googleBooks);
      return;
    }
    setBook({} as GoogleBooks);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agregar Nuevo Libro</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={book?.title}
          placeholder="Ingrese el título del libro"
          placeholderTextColor={colors.placeholderText}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Autores (separados por coma)</Text>
        <TextInput
          style={styles.input}
          value={book?.authors.join(",")}
          placeholder="Ingrese los autores"
          placeholderTextColor={colors.placeholderText}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>URL de la imagen</Text>
        <TextInput
          style={styles.input}
          value={book?.imageLinks?.thumbnail}
          placeholder="Ingrese la URL de la imagen"
          placeholderTextColor={colors.placeholderText}
        />

        {book?.imageLinks?.thumbnail && (
          <View style={{ marginTop: 10 }}>
            <Image
              source={{ uri: book?.imageLinks?.thumbnail }}
              style={{ width: 100, height: 100 }}
            />
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ISBN</Text>
        <TextInput
          style={styles.input}
          value={
            Array.isArray(book?.isbn)
              ? book?.isbn.join(", ")
              : book?.isbn?.toString()
          }
          placeholder="Ingrese el ISBN"
          placeholderTextColor={colors.placeholderText}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Idioma</Text>
        <TextInput
          style={styles.input}
          value={book?.language}
          placeholder="Ingrese el idioma"
          placeholderTextColor={colors.placeholderText}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha de publicación</Text>
        <TextInput
          style={styles.input}
          value={book?.publishedDate}
          placeholder="Ingrese la fecha de publicación"
          placeholderTextColor={colors.placeholderText}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Editorial</Text>
        <TextInput
          style={styles.input}
          value={book?.publisher}
          placeholder="Ingrese la editorial"
          placeholderTextColor={colors.placeholderText}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Guardar Libro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    margin: 10,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: "bold",
  },
});
