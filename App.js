import { NavigationContainer, StackRouter } from "@react-navigation/native";
import { useEffect, useState, useReducer, useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "twrnc";
import axios from "axios";
import { API_URI } from "@env";

import Chat from "./pages/Chat";
import Home from "./pages/Home";
import LoginScreen from "./pages/LoginScreen";
import { AuthContext } from "./context/AuthContext";

export default function App() {
  const initialLoginState = {
    isLoading: true,
    userInfo: null,
    accessToken: null,
  };

  useEffect(() => {
    setTimeout(async () => {
      let accessToken;
      accessToken = null;
      let userInfo;
      userInfo = null;
      try {
        accessToken = await AsyncStorage.getItem("accessToken");
        userInfo = await AsyncStorage.getItem("userInfo");
        dispatch({
          type: "RETRIEVE_TOKEN",
          accessToken,
          userInfo: JSON.parse(userInfo),
        });

        await axios
          .get(`${API_URI}/api/refresh`, {
            withCredentials: true,
          })
          .then((res) => {
            dispatch({
              type: "RETRIEVE_TOKEN",
              accessToken: res?.data?.accessToken,
              userInfo: JSON.parse(res?.data?.userInfo),
            });
          });
      } catch (err) {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("userInfo");
      }
    }, 1000);
  }, []);

  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case "RETRIEVE_TOKEN":
        return {
          ...prevState,
          userInfo: action.userInfo,
          accessToken: action.accessToken,
          isLoading: false,
        };
      case "LOGIN":
        return {
          ...prevState,
          userInfo: action.userInfo,
          accessToken: action.accessToken,
          isLoading: false,
        };
      case "LOGOUT":
        return {
          ...prevState,
          userInfo: null,
          accessToken: null,
          isLoading: false,
        };
    }
  };

  const [auth, dispatch] = useReducer(loginReducer, initialLoginState);

  const authContext = useMemo(
    () => ({
      signIn: async (userInfo, accessToken) => {
        try {
          await AsyncStorage.setItem("accessToken", accessToken);
          await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
        } catch (e) {
          console.log(e);
        }

        dispatch({ type: "LOGIN", userInfo, accessToken });
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("userInfo");
        } catch (err) {
          console.log(err);
        }
        dispatch({ type: "LOGOUT" });
      },
    }),
    []
  );

  if (auth.isLoading) {
    return (
      <SafeAreaView
        style={tw`bg-[#f5f3eb] flex justify-center items-center w-full h-full`}
      >
        <View>
          <ActivityIndicator size="large" color="#2d757c" />
        </View>
      </SafeAreaView>
    );
  }

  const Stack = createNativeStackNavigator();

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {auth.userInfo && auth.accessToken ? (
          <Stack.Navigator>
            <Stack.Screen
              name="Chat"
              component={() => <Chat auth={auth} Toast={Toast} />}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
