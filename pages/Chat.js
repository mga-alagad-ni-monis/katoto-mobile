import { StyleSheet, Text, View } from "react-native";

export default function Chat() {
  return <Text styles={styles.container}>Chat</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
