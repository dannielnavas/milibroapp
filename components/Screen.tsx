import { View } from "react-native";

import { ReactNode } from "react";

const Screen = ({ children }: { children: Readonly<ReactNode> }) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
      }}
    >
      {children}
    </View>
  );
};

export { Screen };
