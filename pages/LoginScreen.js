import axios from "axios";
import { useState } from "react";
import {
  Button,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

function LoginScreen({ navigation }) {
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
            email,
            password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          signIn(res?.data?.userInfo, res?.data?.accessToken);
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
        style={tw`rounded-full border border-[--light-gray] bg-transparent w-full px-5 py-2 mt-4 mb-4`}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      ></TextInput>
      <TextInput
        style={tw`rounded-full border border-[--light-gray] bg-transparent w-full px-5 py-2 mt-4 mb-4`}
        secureTextEntry={true}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      ></TextInput>
      {isLoading ? (
        <ActivityIndicator size="small" color="#2d757c" />
      ) : (
        <TouchableOpacity
          style={tw`font-semibold text-sm w-full rounded-full text-[#f5f3eb] text-center bg-black py-[10px] border-black border border-2 hover:bg-transparent hover:text-black duration-300`}
          onPress={login}
        >
          <Text style={tw`text-[#f5f3eb] text-center`}> Log In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default LoginScreen;
