"use client";

import { BookInfo } from "@/components/BookInfo";
import type { Book } from "@/components/cardBook";
import { Header } from "@/components/Header";
import { useDetailsStore } from "@/store/useDetailsStore";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFormik } from "formik";
import { useEffect } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import * as Yup from "yup";

export default function Detail() {
  const book: Book = useDetailsStore((state) => state.book);
  const router = useRouter();

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
        onEdit={() => {
          router.push("/books/edit");
        }}
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

        {/* <View style={styles.formContainer}>
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
        </View> */}
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
