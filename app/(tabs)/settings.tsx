import { useUserStore } from "@/store/useUserStore";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { user, removeUser } = useUserStore();

  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: () => {
          removeUser();
          SecureStore.deleteItemAsync("token");
          SecureStore.deleteItemAsync("dataUser");
          router.replace("/");
        },
      },
    ]);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Feather name={icon as any} size={20} color="#2a9d8f" />
        </View>
        <View style={styles.settingItemText}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <Feather name="chevron-right" size={20} color="#666" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Perfil del Usuario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              {user.user?.image ? (
                <Image source={{ uri: user.user.image }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Feather name="user" size={24} color="#fff" />
                </View>
              )}

              <View style={styles.profileText}>
                <Text style={styles.profileName}>
                  {user.user?.name || "Usuario"}
                </Text>
                <Text style={styles.profileEmail}>
                  {user.user?.email || "usuario@ejemplo.com"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Configuraciones Generales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <SettingItem
            icon="user"
            title="Editar Perfil"
            subtitle="Actualizar información personal"
            onPress={() => router.push("/profile/edit")}
          />
          {/* <SettingItem
            icon="bell"
            title="Notificaciones"
            subtitle="Configurar alertas y recordatorios"
            onPress={() =>
              Alert.alert("Próximamente", "Esta función estará disponible pronto")
            }
          /> */}
          {/* <SettingItem
            icon="moon"
            title="Tema"
            subtitle="Claro / Oscuro"
            onPress={() =>
              Alert.alert("Próximamente", "Esta función estará disponible pronto")
            }
          /> */}
        </View>

        {/* Configuraciones de Biblioteca */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biblioteca</Text>
          <SettingItem
            icon="download"
            title="Exportar Datos"
            subtitle="Descargar tu biblioteca"
            onPress={() =>
              Alert.alert("Próximamente", "Esta función estará disponible pronto")
            }
          />
          <SettingItem
            icon="upload"
            title="Importar Datos"
            subtitle="Cargar libros desde archivo"
            onPress={() =>
              Alert.alert("Próximamente", "Esta función estará disponible pronto")
            }
          />
          <SettingItem
            icon="trash-2"
            title="Limpiar Biblioteca"
            subtitle="Eliminar todos los libros"
            onPress={() =>
              Alert.alert("Próximamente", "Esta función estará disponible pronto")
            }
          />
        </View> */}

        {/* Configuraciones de la App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicación</Text>
          <SettingItem
            icon="info"
            title="Acerca de"
            subtitle="Versión 1.0.0"
            onPress={() =>
              Alert.alert(
                "Mi Libro App",
                "Versión 1.0.0\n\nUna aplicación para gestionar tu biblioteca personal. \n\n Desarrollado por Danniel Navas \n\n<me@danniel.dev>"
              )
            }
          />
          <SettingItem
            icon="help-circle"
            title="Ayuda y Soporte"
            subtitle="Preguntas frecuentes"
            onPress={() =>
              Alert.alert("Próximamente", "Esta función estará disponible pronto")
            }
          />
          <SettingItem
            icon="shield"
            title="Privacidad"
            subtitle="Política de privacidad"
            onPress={() =>
              Alert.alert("Próximamente", "Esta función estará disponible pronto")
            }
          />
        </View>

        {/* Cerrar Sesión */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color="#e76f51" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2a9d8f",
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
    marginHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2a9d8f",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6c757d",
  },
  settingItem: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212529",
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  logoutButton: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e76f51",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e76f51",
    marginLeft: 8,
  },
});
