import { AntDesign, Feather } from "@expo/vector-icons";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

interface AddBookModalProps {
  isVisible: boolean;
  closeModal: () => void;
  onCameraPress: () => void;
  onManualPress: () => void;
}

export const AddBookModal = ({
  isVisible,
  closeModal,
  onCameraPress,
  onManualPress,
}: AddBookModalProps) => {
  if (!isVisible) return null;

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={styles.overlay} onPress={closeModal} />
      <Animated.View style={[styles.modalContent]}>
        <Pressable onPress={onCameraPress} style={styles.option}>
          <Feather name="camera" size={24} color="#333" />
          <Text style={styles.optionText}>Agregar libro escaneando código ISBN</Text>
        </Pressable>

        <Pressable onPress={onManualPress} style={styles.option}>
          <AntDesign name="edit" size={24} color="#333" />
          <Text style={styles.optionText}>Añadir libro de forma manual</Text>
        </Pressable>

        <Pressable onPress={closeModal} style={styles.closeButton}>
          <Text style={styles.buttonText}>Cerrar</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#e53935",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
