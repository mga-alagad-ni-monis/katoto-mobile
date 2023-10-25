import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  // ToastAndroid,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { TouchableOpacity } from "react-native-web";
import { useState } from "react";
import { API_URI } from "@env";
import { useEffect } from "react";
import axios from "axios";

function Chat({ auth }) {
  const { signOut } = useContext(AuthContext);

  const [isGuided, setIsGuided] = useState(false);
  const [isFriendly, setIsFriendly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    (async () => {
      await handleGetConversation();
      setIsLoading(false);
    })();
  }, []);

  const handleGetConversation = async (req, res) => {
    try {
      await axios
        .get(`${API_URI}/api/logs/get/student`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setMessages(res?.data?.conversation);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={tw`bg-[#f5f3eb] w-full h-full px-6 py-5`}>
      {/* <Button title="Logout" onPress={signOut}></Button> */}

      <View style={tw`w-full flex justify-between`}>
        <SimpleLineIcons name="arrow-left" size={18} color="black" />
      </View>

      {isGuided || isFriendly ? (
        <ScrollView style={tw`h-full border-2 border-black my-5`}>
          {messages.map((i, k) => {
            return <View key={k}></View>;
          })}
        </ScrollView>
      ) : (
        <View style={tw`flex items-center gap-3 h-full justify-end pb-10`}>
          <Text>Click to choose</Text>
          <TouchableOpacity
            style={tw`w-min text-sm px-5 py-2 rounded-full cursor-pointer bg-[#2d757c] border-2 border-[#2d757c]`}
            onPress={() => setIsGuided(true)}
          >
            <Text style={tw`text-[#f5f3eb] font-medium`}>
              Counselor-Guided Mode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`w-min text-sm px-5 py-2 rounded-full cursor-pointer bg-[#2d757c] border-2 border-[#2d757c]`}
            onPress={() => setIsFriendly(true)}
          >
            <Text style={tw`text-[#f5f3eb] font-medium`}>
              Friendly Conversation Mode
            </Text>
          </TouchableOpacity>
          <Text>Learn more about our Privacy Policy</Text>
          <Text>Please leave a feedback here.</Text>
        </View>
      )}

      {isGuided || isFriendly ? (
        <View style={tw`flex flex-row w-full gap-3`}>
          {isFriendly ? (
            <>
              <TextInput
                style={tw`bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-none placeholder-black/30 font-semibold w-full`}
                placeholder="Aa..."
              ></TextInput>
              <TouchableOpacity
                style={tw`w-[46px] h-[46px] rounded-full bg-[#2d757c] flex justify-center items-center text-[#f5f3eb] cursor-pointer border-2 
          border-[#2d757c] hover:text-[--dark-green] hover:bg-[#f5f3eb] transition-all duration-300`}
              >
                <Ionicons name="send" size={18} color="#f5f3eb" />
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default Chat;
