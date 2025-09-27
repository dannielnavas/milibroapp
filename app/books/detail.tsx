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
  AccessibilityInfo,
  Alert,
  Image,
  Modal,
  Platform,
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
  const [isLoading, setIsLoading] = useState(false);

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

  // Configure accessibility
  useEffect(() => {
    if (Platform.OS === "ios") {
      AccessibilityInfo.setAccessibilityFocus(1);
    }
  }, []);

  async function removeBook(id: string) {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      const url = `http://192.168.10.49:3000/books/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert("Book deleted", "The book has been deleted successfully", [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)#index"),
          },
        ]);
      } else {
        Alert.alert("Error", "Could not delete the book");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo eliminar el libro");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(values: {
    rating: number;
    startDate: Date;
    endDate: Date;
  }) {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      const url = `http://192.168.10.49:3000/books/${book._id}`;
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
        Alert.alert("Rating saved", "The rating has been saved successfully");
      } else {
        Alert.alert("Error", "Could not save the rating");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while saving the rating");
    } finally {
      setIsLoading(false);
    }
  }

  const shareBook = async () => {
    const url = `http://192.168.10.49:3000/books/detail?id=${book._id}`;
    await Sharing.shareAsync(url, {
      dialogTitle: "Share this book with your friends",
      mimeType: "text/plain",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Improved header with accessibility */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Return to the previous screen"
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {book.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Book content"
      >
        {/* Book cover with improved accessibility */}
        <View style={styles.bookCoverContainer}>
          <Image
            source={{
              uri: book.image_url?.replace("http://", "https://") || "",
            }}
            style={styles.bookCover}
            resizeMode="cover"
            accessibilityLabel={`Book cover for ${book.title}`}
            accessibilityRole="image"
          />
        </View>

        {/* Main book information */}
        <View style={styles.bookInfoContainer}>
          {/* Genre */}
          {book.genre && (
            <View style={styles.genreContainer}>
              <Text style={styles.genreText}>{book.genre}</Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.bookTitle} accessibilityRole="header">
            {book.title}
          </Text>

          {/* Author */}
          <View style={styles.authorContainer}>
            <Ionicons name="person-outline" size={16} color="#6c757d" />
            <Text style={styles.authorText}>
              <Text style={styles.authorLabel}>Author: </Text>
              <Text style={styles.authorName}>{book.author}</Text>
            </Text>
          </View>

          {/* Rating if exists */}
          {book.rating && book.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#ffc107" />
              <Text style={styles.ratingText}>Rating: {book.rating}/5</Text>
            </View>
          )}
        </View>

        {/* Improved action buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => router.push(`/books/edit?id=${book._id}`)}
            accessibilityLabel="Edit book"
            accessibilityRole="button"
            accessibilityHint="Opens the screen to edit book details"
          >
            <Ionicons name="create-outline" size={20} color="#495057" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.readButton]}
            onPress={() => {
              // Here you can implement the logic to mark as read
              Alert.alert("Book marked", "The book has been marked as read");
            }}
            accessibilityLabel="Mark as read"
            accessibilityRole="button"
            accessibilityHint="Mark this book as read"
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#495057" />
            <Text style={styles.actionButtonText}>Read</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => setShowConfirm(true)}
            accessibilityLabel="Delete book"
            accessibilityRole="button"
            accessibilityHint="Remove this book from your library"
            disabled={isLoading}
          >
            <Ionicons name="trash-outline" size={20} color="#495057" />
            <Text style={styles.actionButtonText}>
              {isLoading ? "Deleting..." : "Delete"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Book description */}
        {book.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle} accessibilityRole="header">
              Description
            </Text>
            <Text
              style={styles.descriptionText}
              accessibilityLabel={`Book description: ${book.description}`}
            >
              {book.description}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Improved confirmation modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
        accessibilityViewIsModal={true}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalBox}>
            <View style={modalStyles.iconContainer}>
              <Ionicons name="warning-outline" size={48} color="#dc3545" />
            </View>
            <Text style={modalStyles.title} accessibilityRole="header">
              Delete book?
            </Text>
            <Text style={modalStyles.text}>
              Are you sure you want to delete this book? This action cannot be
              undone.
            </Text>
            <View style={modalStyles.buttonsRow}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancel]}
                onPress={() => setShowConfirm(false)}
                accessibilityLabel="Cancel deletion"
                accessibilityRole="button"
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.delete]}
                onPress={() => {
                  setShowConfirm(false);
                  removeBook(book._id);
                }}
                accessibilityLabel="Confirm deletion"
                accessibilityRole="button"
                disabled={isLoading}
              >
                <Text style={modalStyles.deleteButtonText}>
                  {isLoading ? "Deleting..." : "Delete"}
                </Text>
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
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40, // Space to balance the layout
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bookCoverContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  bookCover: {
    width: 180,
    height: 270,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  bookInfoContainer: {
    marginBottom: 32,
  },
  genreContainer: {
    alignSelf: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  genreText: {
    color: "#1976d2",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bookTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  authorText: {
    fontSize: 16,
    color: "#6c757d",
    marginLeft: 8,
  },
  authorLabel: {
    fontWeight: "500",
  },
  authorName: {
    color: "#495057",
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#495057",
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  editButton: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  readButton: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  deleteButton: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  actionButtonText: {
    color: "#495057",
    fontSize: 14,
    fontWeight: "500",
  },
  descriptionContainer: {
    marginBottom: 32,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: "#495057",
    lineHeight: 24,
  },
});

const validationSchema = () => ({
  rating: Yup.number()
    .min(1, "The rating must be at least 1")
    .max(5, "The rating cannot be greater than 5")
    .required("The rating is required"),
  startDate: Yup.date().required("The start date is required"),
  endDate: Yup.date()
    .min(Yup.ref("startDate"), "The end date must be after the start date")
    .required("The end date is required"),
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    color: "#2c3e50",
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancel: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  delete: {
    backgroundColor: "#dc3545",
  },
  cancelButtonText: {
    color: "#495057",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});
