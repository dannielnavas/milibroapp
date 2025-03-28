import { Book } from "@/components/cardBook";
import { DateInput } from "@/components/DateInput";
import { RatingInput } from "@/components/RatingInput";
import { SubmitButton } from "@/components/SubmitButton";
import { useDetailsStore } from "@/store/useDetailsStore";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

export default function EditBook() {
  const router = useRouter();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const book: Book = useDetailsStore((state) => state.book);
  console.log("book", book);

  const formData = useFormik({
    initialValues: initialValues(),
    validationSchema: Yup.object(validationSchemaEdit()),
    validateOnChange: false,
    onSubmit: async (values) => {
      console.log("values", values);
      const token = await SecureStore.getItemAsync("token");
      const url = `https://milibro-danniel-dev.vercel.app/books/${book._id}`;
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
      console.log("response", response);
      if (response.status === 200) {
        Alert.alert("Libro editado", "El libro ha sido editado", [
          {
            text: "Aceptar",
            onPress: () => router.push("/(tabs)#index"),
          },
        ]);
      } else {
        Alert.alert("Error", "No se pudo editar el libro");
      }
    },
  });

  const getStatusText = (status: string) => {
    if (status === "reading") return "Leyendo";
    if (status === "completed") return "Leído";
    return "Deseado";
  };

  useEffect(() => {
    formData.setFieldValue("title", book.title || "");
    formData.setFieldValue("author", book.author || "");
    formData.setFieldValue("isbn", book.isbn || "");
    formData.setFieldValue("genre", book.genre || "");
    formData.setFieldValue("status", book.status || "");
    formData.setFieldValue("totalPages", book.totalPages || "");
    formData.setFieldValue("currentPage", book.currentPage || "");
    formData.setFieldValue("notes", book.notes || "");
    formData.setFieldValue("isFavorite", book.isFavorite || false);
    formData.setFieldValue("rating", book.rating || 0);
    formData.setFieldValue("startDate", new Date(book.startDate || new Date()));
    formData.setFieldValue("endDate", new Date(book.endDate || new Date()));
  }, [book, formData.setFieldValue]); // Added formik.setFieldValue to dependencies

  return (
    <ScrollView style={styles.editForm}>
      <Text style={styles.formLabel}>Título</Text>
      <TextInput
        style={styles.input}
        value={formData.values.title}
        onChangeText={(text) => formData.setFieldValue("title", text)}
        placeholder="Título del libro"
      />

      <Text style={styles.formLabel}>Autor</Text>
      <TextInput
        style={styles.input}
        value={formData.values.author}
        onChangeText={(text) => formData.setFieldValue("author", text)}
        placeholder="Autor del libro"
      />

      <Text style={styles.formLabel}>Género</Text>
      <TextInput
        style={styles.input}
        value={formData.values.genre}
        onChangeText={(text) => formData.setFieldValue("genre", text)}
        placeholder="Género"
      />

      <Text style={styles.formLabel}>Estado</Text>
      <View style={styles.statusButtons}>
        {["reading", "completed", "wishlist"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              formData.values.status === status && styles.statusButtonActive,
            ]}
            onPress={() => formData.setFieldValue("status", status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                formData.values.status === status && styles.statusButtonTextActive,
              ]}
            >
              {getStatusText(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <RatingInput
        rating={formData.values.rating}
        onRatingChange={(rating) => formData.setFieldValue("rating", rating)}
        error={formData.errors.rating}
        touched={formData.touched.rating}
      />

      <DateInput
        label="Fecha de inicio:"
        date={formData.values.startDate}
        showPicker={showStartPicker}
        setShowPicker={setShowStartPicker}
        onDateChange={(date) => formData.setFieldValue("startDate", date)}
        error={formData.errors.startDate as string | undefined}
        touched={!!formData.touched.startDate}
      />

      <DateInput
        label="Fecha de fin:"
        date={formData.values.endDate}
        showPicker={showEndPicker}
        setShowPicker={setShowEndPicker}
        onDateChange={(date) => formData.setFieldValue("endDate", date)}
        error={formData.errors.endDate as string | undefined}
        touched={!!formData.touched.endDate}
      />

      <Text style={styles.formLabel}>Páginas totales</Text>
      <TextInput
        style={styles.input}
        value={formData.values.totalPages?.toString()}
        onChangeText={(text) => formData.setFieldValue("totalPages", text)}
        placeholder="Número de páginas"
        keyboardType="numeric"
      />

      {formData.values.status === "reading" && (
        <>
          <Text style={styles.formLabel}>Página actual</Text>
          <TextInput
            style={styles.input}
            value={formData.values.currentPage?.toString()}
            onChangeText={(text) => formData.setFieldValue("currentPage", text)}
            placeholder="Página actual"
            keyboardType="numeric"
          />
        </>
      )}

      <Text style={styles.formLabel}>Notas personales</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.values.notes}
        onChangeText={(text) => formData.setFieldValue("notes", text)}
        placeholder="Escribe tus notas aquí"
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
            ? "Quitar de favoritos"
            : "Marcar como favorito"}
        </Text>
      </TouchableOpacity>
      <SubmitButton onPress={() => formData.handleSubmit()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
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
  formContainer: {
    marginTop: 24,
    gap: 16,
  },
  editForm: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  statusButton: {
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  statusButtonActive: {
    backgroundColor: "#ff4081",
  },
  statusButtonText: {
    color: "#666",
  },
  statusButtonTextActive: {
    color: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  favoriteToggleText: {
    color: "#666",
  },
  favoriteToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 36,
    paddingBottom: 16,
  },
});

const initialValues = () => {
  return {
    title: "",
    author: "",
    isbn: "",
    genre: "",
    status: "",
    totalPages: "",
    currentPage: "",
    notes: "",
    isFavorite: false,
    startDate: new Date(),
    endDate: new Date(),
    rating: 0,
  };
};

const validationSchemaEdit = () => {
  return {
    title: Yup.string(),
    author: Yup.string(),
    isbn: Yup.string(),
    genre: Yup.string(),
    status: Yup.string(),
    totalPages: Yup.string(),
    currentPage: Yup.string(),
    notes: Yup.string(),
    isFavorite: Yup.boolean(),
    startDate: Yup.date(),
    endDate: Yup.date(),
    rating: Yup.number(),
  };
};
