"use client";

import { BookInfo } from "@/components/BookInfo";
import type { Book } from "@/components/cardBook";
import { DateInput } from "@/components/DateInput";
import { Header } from "@/components/Header";
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
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

export default function Detail() {
  const book: Book = useDetailsStore((state) => state.book);
  const router = useRouter();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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
  }, [book, formik.setFieldValue]); // Added formik.setFieldValue to dependencies

  async function editBook(id: string) {
    return (
      <ScrollView style={styles.editForm}>
        <Text style={styles.formLabel}>Título</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="Título del libro"
        />

        <Text style={styles.formLabel}>Autor</Text>
        <TextInput
          style={styles.input}
          value={formData.author}
          onChangeText={(text) => setFormData({ ...formData, author: text })}
          placeholder="Autor del libro"
        />

        <Text style={styles.formLabel}>ISBN</Text>
        <TextInput
          style={styles.input}
          value={formData.isbn}
          onChangeText={(text) => setFormData({ ...formData, isbn: text })}
          placeholder="ISBN"
          keyboardType="numeric"
        />

        <Text style={styles.formLabel}>Género</Text>
        <TextInput
          style={styles.input}
          value={formData.genre}
          onChangeText={(text) => setFormData({ ...formData, genre: text })}
          placeholder="Género"
        />

        <Text style={styles.formLabel}>Estado</Text>
        <View style={styles.statusButtons}>
          {(["reading", "completed", "wishlist"] as BookStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                formData.status === status && styles.statusButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, status })}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  formData.status === status && styles.statusButtonTextActive,
                ]}
              >
                {status === "reading"
                  ? "Leyendo"
                  : status === "completed"
                  ? "Leído"
                  : "Deseado"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {formData.status === "completed" && (
          <>
            <Text style={styles.formLabel}>Calificación</Text>
            {renderStars(tempRating, true)}
          </>
        )}

        <Text style={styles.formLabel}>Páginas totales</Text>
        <TextInput
          style={styles.input}
          value={formData.totalPages?.toString()}
          onChangeText={(text) =>
            setFormData({ ...formData, totalPages: parseInt(text) || 0 })
          }
          placeholder="Número de páginas"
          keyboardType="numeric"
        />

        {formData.status === "reading" && (
          <>
            <Text style={styles.formLabel}>Página actual</Text>
            <TextInput
              style={styles.input}
              value={formData.currentPage?.toString()}
              onChangeText={(text) =>
                setFormData({ ...formData, currentPage: parseInt(text) || 0 })
              }
              placeholder="Página actual"
              keyboardType="numeric"
            />
          </>
        )}

        <Text style={styles.formLabel}>Notas personales</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Escribe tus notas aquí"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.favoriteToggle}
          onPress={() =>
            setFormData({ ...formData, isFavorite: !formData.isFavorite })
          }
        >
          <AntDesign
            name={formData.isFavorite ? "heart" : "hearto"}
            size={24}
            color={formData.isFavorite ? "#ff4081" : "#666"}
          />
          <Text style={styles.favoriteToggleText}>
            {formData.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

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

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={book.title}
        onDelete={() => removeBook(book._id)}
        onEdit={() => editBook(book._id)}
      />

      <ScrollView style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: book.image_url.replace("http://", "https://") }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <BookInfo book={book} />

        <View style={styles.formContainer}>
          <RatingInput
            rating={formik.values.rating}
            onRatingChange={(rating) => formik.setFieldValue("rating", rating)}
            error={formik.errors.rating}
            touched={formik.touched.rating}
          />

          <DateInput
            label="Fecha de inicio:"
            date={formik.values.startDate}
            showPicker={showStartPicker}
            setShowPicker={setShowStartPicker}
            onDateChange={(date) => formik.setFieldValue("startDate", date)}
            error={formik.errors.startDate as string | undefined}
            touched={!!formik.touched.startDate}
          />

          <DateInput
            label="Fecha de fin:"
            date={formik.values.endDate}
            showPicker={showEndPicker}
            setShowPicker={setShowEndPicker}
            onDateChange={(date) => formik.setFieldValue("endDate", date)}
            error={formik.errors.endDate as string | undefined}
            touched={!!formik.touched.endDate}
          />

          <SubmitButton onPress={() => formik.handleSubmit()} />
        </View>
      </ScrollView>
    </SafeAreaView>
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
