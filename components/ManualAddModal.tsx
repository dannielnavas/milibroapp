import { colors } from "@/app/books/add";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface ManualAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: () => void;
  title: string | null;
  setTitle: (title: string) => void;
}

export const ManualAddModal = ({
  visible,
  onClose,
  onSearch,
  title,
  setTitle,
}: ManualAddModalProps) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Buscar un libro por su título</Text>
        <TextInput
          style={styles.input}
          placeholder="Título del libro"
          placeholderTextColor="#A0A0A0"
          value={title ?? ""}
          onChangeText={setTitle}
          keyboardType="default"
          autoCapitalize="sentences"
        />
        <Pressable style={styles.button} onPress={onSearch}>
          <Text style={styles.buttonText}>Buscar mi libro</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    width: "100%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2ce",
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
