import Ionicons from "@expo/vector-icons/Ionicons";

const IconNew = ({ color }: { color: string }) => (
  <Ionicons name="library-outline" size={26} color={color} />
);

const IconBook = ({ color }: { color: string }) => (
  <Ionicons name="book-outline" size={26} color={color} />
);

const IconSettings = ({ color }: { color: string }) => (
  <Ionicons name="settings-outline" size={26} color={color} />
);

export { IconBook, IconNew, IconSettings };
