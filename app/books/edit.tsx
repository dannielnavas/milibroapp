import { Book } from "@/components/cardBook";
import { SubmitButton } from "@/components/SubmitButton";
import { useDetailsStore } from "@/store/useDetailsStore";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

interface FormValues {
  title: string;
  author: string;
  genre: string;
  status: string;
  totalPages: number;
  currentPage?: number;
  notes?: string;
  isFavorite: boolean;
  rating: number;
  startDate: Date;
  endDate: Date;
}

export default function EditBook() {
  const router = useRouter();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const book: Book = useDetailsStore((state) => state.book);

  const formData = useFormik<FormValues>({
    initialValues: initialValues(),
    validationSchema: Yup.object().shape({
      title: Yup.string()
        .required("The title is required")
        .min(2, "The title must have at least 2 characters"),
      author: Yup.string()
        .required("The author is required")
        .min(2, "The author must have at least 2 characters"),
      genre: Yup.string()
        .required("The genre is required")
        .min(2, "The genre must have at least 2 characters"),
      totalPages: Yup.number()
        .required("The number of pages is required")
        .min(1, "Must have at least 1"),
      currentPage: Yup.number().when("status", {
        is: "reading",
        then: (schema) =>
          schema
            .required("The current page is required")
            .min(1, "Must have at least 1")
            .max(Yup.ref("totalPages"), "Cannot be greater than the total"),
      }),
      notes: Yup.string(),
      isFavorite: Yup.boolean(),
      rating: Yup.number()
        .min(0, "The minimum rating is 0")
        .max(5, "The maximum rating is 5"),
      startDate: Yup.date().required("The start date is required"),
      endDate: Yup.date().when("status", {
        is: "completed",
        then: (schema) =>
          schema
            .required("The end date is required")
            .min(Yup.ref("startDate"), "The end date must be after the start date"),
      }),
    }),
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const url = `http://192.168.10.49:3000/books/${book._id}`;
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...values,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate.toISOString(),
          }),
        });

        if (response.status === 200) {
          Alert.alert("Book edited", "The book has been edited", [
            {
              text: "Accept",
              onPress: () => router.push("/(tabs)#index"),
            },
          ]);
        } else {
          throw new Error("Error editing the book");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "The book could not be edited");
      }
    },
  });

  const getStatusText = (status: string) => {
    if (status === "reading") return "Reading";
    if (status === "completed") return "Read";
    return "Wishlist";
  };

  useEffect(() => {
    formData.setFieldValue("title", book.title ?? "");
    formData.setFieldValue("author", book.author ?? "");
    formData.setFieldValue("isbn", book.isbn ?? "");
    formData.setFieldValue("genre", book.genre ?? "");
    formData.setFieldValue("status", book.status ?? "");
    formData.setFieldValue("totalPages", book.totalPages ?? 0);
    formData.setFieldValue("currentPage", book.currentPage ?? 0);
    formData.setFieldValue("notes", book.notes ?? "");
    formData.setFieldValue("isFavorite", book.isFavorite ?? false);
    formData.setFieldValue("rating", book.rating ?? 0);
    formData.setFieldValue("startDate", new Date(book.startDate ?? new Date()));
    formData.setFieldValue("endDate", new Date(book.endDate ?? new Date()));
  }, [book, formData.setFieldValue]);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{book.title}</Text>
        </View>
      </SafeAreaView>
      <ScrollView style={styles.editForm}>
        <Text style={styles.formLabel}>Title</Text>
        <TextInput
          style={styles.input}
          value={formData.values.title}
          onChangeText={(text) => formData.setFieldValue("title", text)}
          placeholder="Title of the book"
        />

        <Text style={styles.formLabel}>Author</Text>
        <TextInput
          style={styles.input}
          value={formData.values.author}
          onChangeText={(text) => formData.setFieldValue("author", text)}
          placeholder="Author of the book"
        />

        <Text style={styles.formLabel}>Genre</Text>
        <TextInput
          style={styles.input}
          value={formData.values.genre}
          onChangeText={(text) => formData.setFieldValue("genre", text)}
          placeholder="Genre"
        />

        <Text style={styles.formLabel}>Total pages</Text>
        <TextInput
          style={styles.input}
          value={formData.values.totalPages?.toString()}
          onChangeText={(text) => formData.setFieldValue("totalPages", text)}
          placeholder="Number of pages"
          keyboardType="numeric"
        />

        {formData.values.status === "reading" && (
          <>
            <Text style={styles.formLabel}>Current page</Text>
            <TextInput
              style={styles.input}
              value={formData.values.currentPage?.toString()}
              onChangeText={(text) => formData.setFieldValue("currentPage", text)}
              placeholder="Current page"
              keyboardType="numeric"
            />
          </>
        )}

        <Text style={styles.formLabel}>Personal notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.values.notes}
          onChangeText={(text) => formData.setFieldValue("notes", text)}
          placeholder="Write your notes here"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.favoriteToggle}
          onPress={() =>
            formData.setFieldValue("isFavorite", !formData.values.isFavorite)
          }
        >
          <AntDesign
            name={formData.values.isFavorite ? "heart" : "hearto"}
            size={24}
            color={formData.values.isFavorite ? "#ff4081" : "#666"}
          />
          <Text style={styles.favoriteToggleText}>
            {formData.values.isFavorite
              ? "Remove from favorites"
              : "Mark as favorite"}
          </Text>
        </TouchableOpacity>
        <SubmitButton onPress={() => formData.handleSubmit()} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
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
  editForm: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  statusButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statusButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusButtonActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  statusButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  statusButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  favoriteToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginVertical: 24,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  favoriteToggleText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: -16,
    marginBottom: 20,
  },
});

const initialValues = () => {
  return {
    title: "",
    author: "",
    isbn: "",
    genre: "",
    status: "",
    totalPages: 0,
    currentPage: 0,
    notes: "",
    isFavorite: false,
    startDate: new Date(),
    endDate: new Date(),
    rating: 0,
  };
};
