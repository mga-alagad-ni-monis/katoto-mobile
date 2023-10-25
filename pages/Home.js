import { Button, Text } from "react-native";

function Home({ navigation }) {
  return (
    <Text>
      Home
      <Button onPress={() => navigation.navigate("Chat")}></Button>
    </Text>
  );
}

export default Home;
