import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import AuthorCard from "./AuthorCard";

export interface AuthorsGridProps {
  authors: { author: string; count: number; url?: string }[];
  onAuthorPress: (author: string) => void;
}

export const AuthorsGrid = ({ authors, onAuthorPress }: AuthorsGridProps) => {
  return (
    <FlatList
      data={authors}
      keyExtractor={(item) => item.author}
      renderItem={({ item }) => (
        <AuthorCard author={item} onAuthorPress={onAuthorPress} />
      )}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.flatListContentContainer}
      ListEmptyComponent={
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>No authors found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  flatListContentContainer: {
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  spinner: {
    marginTop: 20,
    marginBottom: Platform.OS === "android" ? 90 : 60,
  },
});
