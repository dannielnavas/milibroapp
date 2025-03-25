import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Rating } from "react-native-ratings";

interface RatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  error?: string;
  touched?: boolean;
}

export const RatingInput: React.FC<RatingInputProps> = ({
  rating,
  onRatingChange,
  error,
  touched,
}) => (
  <View style={styles.ratingContainer}>
    <Text style={styles.label}>Calificación:</Text>
    <Rating
      type="star"
      ratingCount={5}
      imageSize={30}
      onFinishRating={onRatingChange}
      startingValue={rating}
    />
    {error && touched && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  ratingContainer: {
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
