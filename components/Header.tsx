import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import type React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface HeaderProps {
  title: string;
  onDelete: () => void;
  onEdit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onDelete, onEdit }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Link href={"/(tabs)#index"} style={styles.backLink}>
        <Ionicons name="arrow-back-outline" size={24} color="white" />
      </Link>
      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      <Pressable onPress={onEdit} style={styles.trashButton}>
        <FontAwesome name="edit" size={15} color="#98eddc" />
      </Pressable>
      <Pressable onPress={onDelete} style={styles.trashButton}>
        <FontAwesome name="trash-o" size={15} color="#98eddc" />
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#05453e",
    padding: 16,
    height: 64,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backLink: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginHorizontal: 8,
  },
  trashButton: {
    padding: 8,
    borderRadius: 50,
    marginLeft: 8,
    backgroundColor: "rgba(39, 245, 198, 0.32)",
    borderWidth: 1,
    borderColor: "rgba(39, 245, 198, 0.32)",
  },
});
