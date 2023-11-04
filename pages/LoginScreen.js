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
  const [message, setMessage] = useState("");

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
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        )
        .then((res) => {
          signIn(res?.data?.userInfo, res?.data?.accessToken);
          setIsLoading(false);
        })
        .catch((err) => {
          setMessage(err?.response?.data);
          setIsLoading(false);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View
      style={tw`flex h-full w-full flex-col gap-12 mt-28r bg-[#f5f3eb] p-10`}
    >
      <View style={tw`flex flex-col gap-5`}>
        <Text style={tw`flex text-16 text-center font-black`}>Katoto</Text>
        <Text style={tw`flex flex-col text-6 text-center gap-3`}>
          Log in to Katoto
        </Text>
      </View>
      <View>
        <TextInput
          style={tw`rounded-full border bg-transparent w-full px-5 py-2 mt-5 mb-5 ${
            message ? "border-[#ff6961] border-2" : null
          }`}
          onChangeText={(text) => {
            setMessage("");
            setEmail(text);
          }}
        ></TextInput>
        <TextInput
          style={tw`rounded-full border bg-transparent w-full px-5 py-2 mb-5 ${
            message ? "border-[#ff6961] border-2" : null
          }`}
          secureTextEntry={true}
          onChangeText={(text) => {
            setMessage("");
            setPassword(text);
          }}
        ></TextInput>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2d757c" />
        ) : (
          <>
            {message ? (
              <Text style={tw`text-center font-semibold text-[#ff6961] mb-5`}>
                {message}
              </Text>
            ) : (
              <></>
            )}
            <TouchableOpacity
              style={tw`font-semibold text-sm w-full rounded-full text-[#f5f3eb] text-center bg-black py-[10px] border-black border border-2 hover:bg-transparent hover:text-black`}
              onPress={login}
            >
              <Text style={tw`text-[#f5f3eb] text-center py-1`}> Log In</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export default LoginScreen;
