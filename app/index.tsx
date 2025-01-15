import AntDesign from "@expo/vector-icons/AntDesign";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

// ios public Key: 444568869956-mogs1g6o522gdulmknnbok9imli5bsfq.apps.googleusercontent.com
// android public Key: 444568869956-phb6pdu6hrt2p3n857m1mc3fceo5v4es.apps.googleusercontent.com

WebBrowser.maybeCompleteAuthSession(); // permite abrir la modal al autenticar

export default function App() {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "381827746154-m6f3qdpspp4ulehpi0kpmn4qg8qo02q2.apps.googleusercontent.com",
    iosClientId:
      "381827746154-r3leljm1ll4e9bvdcdufq5nb6si6r3pi.apps.googleusercontent.com",
    androidClientId:
      "381827746154-gmbj6dj9od2rs2l9chp2d6528dpq67la.apps.googleusercontent.com",
  });

  useEffect(() => {
    console.log("Datos iniciales", response);
    debugger;
    if (response?.type === "success") {
      setAccessToken(response.params?.id_token);
      accessToken && fetchUserInfo();
    }
  }, [response, accessToken]);

  const fetchUserInfo = async () => {
    console.log("accessToken", accessToken);
    let response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    let userInfo = await response.json();
    console.log("Datos del usuario", userInfo);
    setUser(userInfo);
    console.log(user);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* title */}
      <Text
        style={{
          fontSize: 40,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Empieza a explorar tu colección ahora mismo.
      </Text>
      {/* subtitle */}
      <Text style={{ fontSize: 20, marginBottom: 20, textAlign: "center" }}>
        ¡Tu viaje literario comienza aquí! 🧡📚
      </Text>
      <Pressable
        onPress={() => promptAsync()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          backgroundColor: "white",
          borderRadius: 55,
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 5,
          gap: 10,
          height: 50,
          width: 200,
          margin: 10,
        }}
      >
        <AntDesign name="google" size={24} color="#4285F4" />
        <Text>Login con Google</Text>
      </Pressable>
    </View>
  );
}
