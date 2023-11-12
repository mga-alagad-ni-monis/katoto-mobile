import axios from "axios";

import { useState } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
// import { API_URI } from "@env";
import tw from "twrnc";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

const API_URI = process.env.API_URI;
const KATOTO_CG_API_URI = process.env.KATOTO_CG_API_URI;
const KATOTO_FC_API_URI = process.env.KATOTO_FC_API_URI;

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
    <ImageBackground
      source={require("../assets/katoto/dots.webp")}
      style={tw`bg-[#f5f3eb]`}
      resizeMode="cover"
    >
      <View style={tw`flex h-full w-full flex-col gap-12 px-10 pt-[40%]`}>
        <View style={tw`flex flex-col gap-5`}>
          <MaskedView
            style={tw`h-16`}
            maskElement={
              <Text
                style={[
                  tw`flex text-16 text-center`,
                  { fontFamily: "Inter-EB" },
                ]}
              >
                Katoto
              </Text>
            }
          >
            <LinearGradient
              colors={["#a9e6c2", "#1cd8d2"]}
              start={{ x: 1, y: 1 }}
              end={{ x: 0, y: 0.33 }}
              style={{ flex: 1 }}
            />
          </MaskedView>

          <Text
            style={[
              tw`flex flex-col text-6 text-center gap-3`,
              { fontFamily: "Inter-R" },
            ]}
          >
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
            <ActivityIndicator size="extra-large" color="#2d757c" />
          ) : (
            <>
              {message ? (
                <Text
                  style={[
                    tw`text-center text-[#ff6961] mb-5`,
                    { fontFamily: "Inter-M" },
                  ]}
                >
                  {message}
                </Text>
              ) : (
                <></>
              )}
              <TouchableOpacity onPress={login}>
                <LinearGradient
                  colors={["#a9e6c2", "#1cd8d2"]}
                  style={tw`font-semibold text-sm w-full rounded-full text-[#f5f3eb] text-center bg-black py-[10px] `}
                  start={{ x: 1, y: 1 }}
                  end={{ x: 0, y: 0.33 }}
                >
                  <Text
                    style={[
                      tw`text-black text-center py-1`,
                      { fontFamily: "Inter-B" },
                    ]}
                  >
                    Log In
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

export default LoginScreen;
