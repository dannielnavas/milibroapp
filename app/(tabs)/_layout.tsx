import { IconBook, IconNew, IconSettings } from "@/components/icons";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";

const TabBarIconBook = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={{ alignItems: "center", justifyContent: "center" }}>
    <IconBook color={color} />
    {focused && (
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
          marginTop: 2,
        }}
      />
    )}
  </View>
);

const TabBarIconNew = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={{ alignItems: "center", justifyContent: "center" }}>
    <IconNew color={color} />
    {focused && (
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
          marginTop: 2,
        }}
      />
    )}
  </View>
);

const TabBarIconSettings = ({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) => (
  <View style={{ alignItems: "center", justifyContent: "center" }}>
    <IconSettings color={color} />
    {focused && (
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
          marginTop: 2,
        }}
      />
    )}
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        headerShown: false,
        tabBarActiveTintColor: "#2a9d8f",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="new"
        options={{
          title: "Nuevos",
          tabBarIcon: TabBarIconNew,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Biblioteca",
          tabBarIcon: TabBarIconBook,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: TabBarIconSettings,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
