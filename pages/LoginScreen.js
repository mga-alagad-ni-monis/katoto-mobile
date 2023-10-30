import axios from "axios";

import { useState } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { API_URI } from "@env";
import tw from "twrnc";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  // useEffect(() => {
  //   fetchToken();
  // }, []);

  // const fetchToken = async () => {
  //   let accessToken;
  //   accessToken = null;
  //   try {
  //     accessToken = await AsyncStorage.getItem("accessToken");
  //     console.log(accessToken);
  //     if (accessToken) {
  //       navigation.navigate("Chat");
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const login = async () => {
    try {
      setIsLoading(true);

      await axios
        .post(
          `${API_URI}/api/login`,
          {
            email: "alvinpanerio@plv.edu.ph",
            password: "09182001",
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        )
        .then((res) => {
          console.log(res);
          signIn(res?.data?.userInfo, res?.data?.accessToken);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View
      style={tw`flex h-full w-full justify-center items-center bg-[#f5f3eb] p-10`}
    >
      <TextInput
        style={tw`rounded-full border bg-transparent w-full px-5 py-2 mt-4 mb-4`}
        onChangeText={(text) => setEmail(text)}
      ></TextInput>
      <TextInput
        style={tw`rounded-full border bg-transparent w-full px-5 py-2 mt-4 mb-4`}
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
      ></TextInput>
      {isLoading ? (
        <ActivityIndicator size="small" color="#2d757c" />
      ) : (
        <TouchableOpacity
          style={tw`font-semibold text-sm w-full rounded-full text-[#f5f3eb] text-center bg-black py-[10px] border-black border border-2 hover:bg-transparent hover:text-black`}
          onPress={login}
        >
          <Text style={tw`text-[#f5f3eb] text-center`}> Log In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default LoginScreen;
