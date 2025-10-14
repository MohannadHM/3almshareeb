import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import GlobalStyles from "../../styles/global";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={GlobalStyles.container}>
      <Text style={GlobalStyles.title}>Card Game Calculator</Text>

      <Pressable
        style={GlobalStyles.button}
        onPress={() => router.push("/games/tarneeb")}
      >
        <Text style={GlobalStyles.buttonText}>Tarneeb</Text>
      </Pressable>

      <Pressable
        style={GlobalStyles.buttonSecondary}
        onPress={() => router.push("/games/baloot")}
      >
        <Text style={GlobalStyles.buttonText}>Baloot</Text>
      </Pressable>

      <Pressable
        style={GlobalStyles.buttonDanger}
        onPress={() => router.push("/games/trix")}
      >
        <Text style={GlobalStyles.buttonText}>Trix</Text>
      </Pressable>
    </View>
  );
}
