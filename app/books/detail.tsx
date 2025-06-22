"use client";

import type { Book } from "@/components/cardBook";
import { useDetailsStore } from "@/store/useDetailsStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as Sharing from "expo-sharing";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

export default function Detail() {
  const book: Book = useDetailsStore((state) => state.book);
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      rating: 0,
      startDate: new Date(),
      endDate: new Date(),
    },
    validationSchema: Yup.object(validationSchema()),
    validateOnChange: true,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    formik.setFieldValue("rating", book.rating || 0);
    formik.setFieldValue("startDate", new Date(book.startDate || new Date()));
    formik.setFieldValue("endDate", new Date(book.endDate || new Date()));
  }, [book, formik.setFieldValue]);

  async function removeBook(id: string) {
    try {
      const token = await SecureStore.getItemAsync("token");
      const url = `https://milibro-danniel-dev.vercel.app/books/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert("Libro eliminado", "El libro ha sido eliminado", [
          {
            text: "Aceptar",
            onPress: () => router.push("/(tabs)#index"),
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo eliminar el libro");
    }
  }

  async function handleSubmit(values: {
    rating: number;
    startDate: Date;
    endDate: Date;
  }) {
    try {
      const token = await SecureStore.getItemAsync("token");
      const url = `https://milibro-danniel-dev.vercel.app/books/${book._id}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: values.rating,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        }),
      });

      if (response.status === 200) {
        Alert.alert(
          "Calificación guardada",
          "La calificación ha sido guardada exitosamente"
        );
      } else {
        Alert.alert("Error", "No se pudo guardar la calificación");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un error al guardar la calificación");
    }
  }

  const shareBook = async () => {
    const url = `https://milibro-danniel-dev.vercel.app/books/detail?id=${book._id}`;
    await Sharing.shareAsync(url, {
      dialogTitle: "Comparte este libro con tus amigos",
      mimeType: "text/plain",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{book.title}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Cover */}
        <View style={styles.bookCoverContainer}>
          <Image
            source={{
              uri: book.image_url.replace("http://", "https://") || "",
            }}
            style={styles.bookCover}
            resizeMode="cover"
          />
        </View>

        {/* Genre Tags */}
        <Text style={styles.genreTags}>{book.genre}</Text>

        {/* Book Title */}
        <Text style={styles.bookTitle}>{book.title}</Text>

        {/* Author and Rating */}
        <View style={styles.authorRatingContainer}>
          <Text style={styles.authorText}>
            By <Text style={styles.authorName}>{book.author}</Text>
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowConfirm(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#666" />
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.wantToReadButton}>
            <Text style={styles.wantToReadText}>Leer ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={shareBook}>
            <Ionicons name="share-outline" size={20} color="#666" />
            <Text style={styles.actionButtonText}>Compartir</Text>
          </TouchableOpacity>
        </View>

        {/* Book Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{book.description}</Text>
        </View>
      </ScrollView>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator} />

      {/* Confirm Delete Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalBox}>
            <Text style={modalStyles.title}>¿Eliminar libro?</Text>
            <Text style={modalStyles.text}>
              ¿Estás seguro de que deseas eliminar este libro? Esta acción no se
              puede deshacer.
            </Text>
            <View style={modalStyles.buttonsRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancel]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={modalStyles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.delete]}
                onPress={() => {
                  setShowConfirm(false);
                  removeBook(book._id);
                }}
              >
                <Text style={modalStyles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginLeft: 16,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bookCoverContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  bookCover: {
    width: 200,
    height: 300,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  genreTags: {
    textAlign: "center",
    color: "#ff6b35",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    flexWrap: "wrap",
    alignSelf: "center",
    maxWidth: "90%",
  },
  bookTitle: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  authorRatingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  authorText: {
    fontSize: 16,
    color: "#666",
    width: "100%",
    textAlign: "center",
  },
  authorName: {
    color: "#4a9b8e",
    fontWeight: "500",
    fontSize: 16,
    width: "100%",
    textAlign: "center",
  },
  separator: {
    color: "#666",
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  wantToReadButton: {
    backgroundColor: "#4a9b8e",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  wantToReadText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  descriptionContainer: {
    marginBottom: 40,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navItem: {
    alignItems: "center",
    gap: 2,
  },
  navText: {
    fontSize: 12,
    color: "#8B4513",
    fontWeight: "500",
  },
  bottomIndicator: {
    height: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 120,
    borderRadius: 2,
    marginBottom: 8,
  },
});

const validationSchema = () => ({
  rating: Yup.number()
    .min(1, "La calificación debe ser al menos 1")
    .max(5, "La calificación no puede ser mayor a 5")
    .required("La calificación es requerida"),
  startDate: Yup.date().required("La fecha de inicio es requerida"),
  endDate: Yup.date()
    .min(
      Yup.ref("startDate"),
      "La fecha de fin debe ser posterior a la fecha de inicio"
    )
    .required("La fecha de fin es requerida"),
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#E75A7C",
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancel: {
    backgroundColor: "#F3F4F6",
  },
  delete: {
    backgroundColor: "#E75A7C",
  },
  buttonText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 16,
  },
});
