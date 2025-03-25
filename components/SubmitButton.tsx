import type React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface SubmitButtonProps {
  onPress: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ onPress }) => (
  <Pressable style={styles.submitButton} onPress={onPress}>
    <Text style={styles.submitButtonText}>Guardar calificación</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: "#05453e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
