import { Stack } from "expo-router";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "red",
          },
          headerTintColor: "#334155",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitle: "Mi librería",
          headerShown: false,
          headerRight: () => null,
          headerLeft: () => null,
        }}
      />
    </View>
  );
}
