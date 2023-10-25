import { NavigationContainer, StackRouter } from "@react-navigation/native";
import { useEffect, useState, useReducer } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import tw from "twrnc";

import Chat from "./pages/Chat";
import Home from "./pages/Home";
import LoginScreen from "./pages/LoginScreen";
import { AuthContext } from "./context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo } from "react";

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
        dispatch({ type: "RETRIEVE_TOKEN", accessToken, userInfo });
      } catch (err) {
        console.log(err);
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

  const [loginState, dispatch] = useReducer(loginReducer, initialLoginState);

  const authContext = useMemo(
    () => ({
      signIn: async (userInfo, accessToken) => {
        try {
          await AsyncStorage.setItem("accessToken", accessToken);
          await AsyncStorage.setItem("userInfo", userInfo);
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

  if (loginState.isLoading) {
    return (
      <View style={tw`bg-[#f5f3eb] flex justify-center items-center w-full`}>
        <ActivityIndicator size="large" color="#2d757c" />
      </View>
    );
  }

  const Stack = createNativeStackNavigator();

  return (
    <AuthContext.Provider value={authContext}>
      {console.log(loginState)}
      <NavigationContainer>
        {loginState.userInfo && loginState.accessToken ? (
          <Stack.Navigator>
            <Stack.Screen name="Chat" component={Chat} />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={Home} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
