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
  console.log("book", book);

  const formData = useFormik<FormValues>({
    initialValues: initialValues(),
    validationSchema: Yup.object().shape({
      title: Yup.string()
        .required("El título es obligatorio")
        .min(2, "El título debe tener al menos 2 caracteres"),
      author: Yup.string()
        .required("El autor es obligatorio")
        .min(2, "El autor debe tener al menos 2 caracteres"),
      genre: Yup.string()
        .required("El género es obligatorio")
        .min(2, "El género debe tener al menos 2 caracteres"),
      status: Yup.string()
        .required("El estado es obligatorio")
        .oneOf(["reading", "completed", "wishlist"], "Estado no válido"),
      totalPages: Yup.number()
        .required("El número de páginas es obligatorio")
        .min(1, "Debe tener al menos 1 página"),
      currentPage: Yup.number().when("status", {
        is: "reading",
        then: (schema) =>
          schema
            .required("La página actual es obligatoria")
            .min(1, "Debe ser al menos 1")
            .max(Yup.ref("totalPages"), "No puede ser mayor que el total"),
      }),
      notes: Yup.string(),
      isFavorite: Yup.boolean(),
      rating: Yup.number()
        .min(0, "La calificación mínima es 0")
        .max(5, "La calificación máxima es 5"),
      startDate: Yup.date().required("La fecha de inicio es obligatoria"),
      endDate: Yup.date().when("status", {
        is: "completed",
        then: (schema) =>
          schema
            .required("La fecha de fin es obligatoria")
            .min(
              Yup.ref("startDate"),
              "La fecha de fin debe ser posterior a la de inicio"
            ),
      }),
    }),
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
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

        if (response.status === 200) {
          Alert.alert("Libro editado", "El libro ha sido editado", [
            {
              text: "Aceptar",
              onPress: () => router.push("/(tabs)#index"),
            },
          ]);
        } else {
          throw new Error("Error al editar el libro");
        }
      } catch (error) {
        console.error(error);
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
  editForm: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "#ffffff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
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
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  statusButtonActive: {
    backgroundColor: "#05453e",
    borderColor: "#05453e",
  },
  statusButtonText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666666",
  },
  statusButtonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  favoriteToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  favoriteToggleText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333333",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
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
