import { IconBook, IconNew } from "@/components/icons";
import { Tabs } from "expo-router";

const TabBarIconBook = ({ color }: { color: string }) => <IconBook color={color} />;
const TabBarIconNew = ({ color }: { color: string }) => <IconNew color={color} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#f4a261",
          height: 60,
        },
        headerShown: true,
        tabBarActiveTintColor: "#f4a261",
        tabBarInactiveTintColor: "#2a9d8f",
        tabBarLabelStyle: {
          fontSize: 14, // Increase the font size here
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mi Biblioteca",
          tabBarIcon: TabBarIconBook,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: "Mis nuevos libros",
          tabBarIcon: TabBarIconNew,
        }}
      />
    </Tabs>
  );
}
