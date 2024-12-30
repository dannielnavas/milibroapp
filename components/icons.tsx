import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const IconNew = ({ color }: { color: string }) => (
  <FontAwesome5 name="book-open" size={24} color={color} />
);

const IconBook = ({ color }: { color: string }) => (
  <Feather name="book" size={24} color={color} />
);

export { IconBook, IconNew };
