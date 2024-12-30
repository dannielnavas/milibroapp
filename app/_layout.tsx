import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="Mi libro"
        options={{
          headerShown: false, // Hide the header
        }}
      />
    </Stack>
  );
}
