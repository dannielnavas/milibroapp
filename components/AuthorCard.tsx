import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export interface AuthorsGridProps {
  author: { author: string; count: number; url?: string };
  onAuthorPress: (author: string) => void;
}

const AuthorCard = ({ author, onAuthorPress }: AuthorsGridProps) => {
  return (
    <TouchableWithoutFeedback onPress={() => onAuthorPress(author.author)}>
      <View style={styles.card}>
        <View style={styles.spacing}>
          <View style={styles.bgStyles}>
            <Text style={styles.number}>#{`${author.count}`}</Text>
            <Text style={styles.name}>{author.author}</Text>
            <Image
              source={{ uri: author.url?.replace("http://", "https://") }}
              style={styles.image}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: 320,
    height: 130,
  },
  spacing: {
    flex: 1,
    padding: 5,
  },
  number: {
    position: "absolute",
    right: 10,
    top: 20,
    color: "#000",
    fontSize: 18,
    textShadowColor: "rgba(255, 255, 255, 1)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 10,
  },
  bgStyles: {
    flex: 1,
    borderRadius: 15,
    padding: 10,
  },
  name: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 25,
    paddingTop: 25,
    paddingLeft: 10,

    textShadowColor: "rgba(255, 255, 255, 1)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 10,
  },
  image: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: "100%",
    height: "100%",
    borderRadius: 15,
    resizeMode: "cover",
    zIndex: -1,
  },
});

export default AuthorCard;
