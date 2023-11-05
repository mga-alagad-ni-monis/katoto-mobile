import { Text, TextInput, View, TouchableOpacity, Image } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { useCallback, useState } from "react";
import { API_URI, KATOTO_CG_API_URI, KATOTO_FC_API_URI } from "@env";
import { useEffect, memo, useReducer, useContext, useMemo } from "react";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { LayoutProvider, RecyclerListView } from "recyclerlistview";
import ToastComponent from "../components/ToastComponent";
import { TypingAnimation } from "react-native-typing-animation";
import Messages from "../components/Messages";
import { AnimatePresence, Motion } from "@legendapp/motion";

const Chat = memo(({ auth, Toast }) => {
  const { signOut } = useContext(AuthContext);

  const [isGuided, setIsGuided] = useState(false);
  const [isFriendly, setIsFriendly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [disable, setDisable] = useState(true);

  const [limit, setLimit] = useState(20);

  const [katotoMessage, setKatotoMessage] = useState("");

  const [guidedButtons, setGuidedButtons] = useState([]);
  const [messages, dispatchMessage] = useReducer(messageReducer, []);
  const [friendlyMsg, dispatchFriendlyMsg] = useReducer(friendlyMsgReducer, "");

  const actionMessage = (action, newMessage) => {
    dispatchMessage({ type: action, payload: newMessage });
  };

  const actionFriendlyMsg = (action, newMessage) => {
    dispatchFriendlyMsg({ type: action, payload: newMessage });
  };

  function friendlyMsgReducer(state, action) {
    switch (action.type) {
      case "ADD_MESSAGE":
        return action.payload;
      case "DELETE_MESSAGE":
        return "";
      default:
        return state;
    }
  }

  function messageReducer(state, action) {
    switch (action.type) {
      case "ADD_MESSAGE":
        return isGuided || state?.length > 20
          ? [...state.slice(1), action.payload]
          : [...state, action.payload];
      case "GET_MESSAGE":
        return action.payload;
      case "DELETE_MESSAGE":
        return [];
      case "POP_MESSAGE":
        const newState = [...state];
        newState.pop();
        return newState;
      default:
        return state;
    }
  }

  useEffect(() => {
    if (isGuided || isFriendly) {
      (async () => {
        if (isGuided) {
          await handleGetConversation(20);
        }
        setDisable(true);
        setIsLoading(false);
        handleSubmitMessage(
          auth?.accessToken,
          isGuided
            ? {
                title: "Hi",
                payload: "initial",
              }
            : "Hi"
        );
      })();
    }
  }, [isGuided, isFriendly]);

  const handleGetConversation = async (param) => {
    try {
      await axios
        .get(`${API_URI}/api/logs/get/student-limit?limit=${param}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          actionMessage("GET_MESSAGE", res?.data?.conversation);
          isLoadMore = false;
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitMessage = async (sender, inputMessage) => {
    try {
      let msg = "";

      if (!isGuided) {
        if (!inputMessage.trim()) {
          return Toast.show({
            type: "error",
            text1: "Please include a message!",
          });
        }
        setDisable(true);
        msg = friendlyMsg ? friendlyMsg : "Hi";
        actionFriendlyMsg("DELETE_MESSAGE", "");
      }
      setGuidedButtons([]);

      //typing
      setIsTyping(true);
      actionMessage("ADD_MESSAGE", {
        sender,
        message: msg ? msg : inputMessage.title,
      });
      // actionMessage("ADD_MESSAGE", {
      //   sender: "Katoto",
      //   message: " ",
      // });

      axios
        .post(isGuided ? KATOTO_CG_API_URI : KATOTO_FC_API_URI, {
          sender,
          message: isGuided ? inputMessage.title : msg ? msg : inputMessage,
        })
        .then(async (res) => {
          res.data[0].text =
            res.data[0]?.custom !== undefined
              ? res.data[0].custom.text
              : res.data[0].text;

          if (isGuided) {
            const buttons = res.data[0]?.buttons?.map((i) => {
              return i;
            });

            setKatotoMessage(res.data[0].text);
            setTimeout(() => {
              //typing
              setIsTyping(false);
              // actionMessage("POP_MESSAGE", {
              //   sender: "Katoto",
              //   message: " ",
              // });
              actionMessage("ADD_MESSAGE", {
                sender: "Katoto",
                message: res.data[0].text,
              });

              setTimeout(() => {
                setGuidedButtons(buttons);
              }, 1000);
            }, 900);

            let isProblem = false;

            if (inputMessage.payload === "Mga Problema") {
              isProblem = true;
            }

            // if (inputMessage.payload === "Open SOS") {
            //   setPopUpSOS(true);
            // }

            // if (inputMessage.payload === "Open Regular") {
            //   setPopUpStandard(true);
            // }

            // if (inputMessage.payload === "Open Feedback") {
            //   setIsOpenFeedbackModal(true);
            // }

            await axios
              .post(
                `${API_URI}/api/logs/send`,
                {
                  studentMessage: { sender, message: inputMessage.title },
                  katotoMessage: {
                    sender: "Katoto",
                    message: res.data[0].text,
                  },
                  isGuided,
                  credentials: auth?.userInfo,
                  isProblem,
                },
                {
                  withCredentials: true,
                  headers: {
                    Authorization: `Bearer ${auth?.accessToken}`,
                  },
                }
              )
              .then((res) => {
                setKatotoMessage("");
                return;
              })
              .catch((err) => {
                Toast.show({
                  type: "error",
                  text1: "Error!",
                });
              });
          } else {
            setKatotoMessage(res.data[0].text);
            setTimeout(() => {
              actionMessage("ADD_MESSAGE", {
                sender: "Katoto",
                message: res.data[0].text,
              });
              setIsTyping(false);
              // if (res.data[0].custom !== undefined) {
              //   setTimeout(() => {
              //     setPopUpSOS(res.data[0].custom.opensos);
              //   }, 900);
              // }
              setDisable(false);
            }, 900);

            await axios
              .post(
                `${API_URI}/api/logs/send`,
                {
                  studentMessage: { sender },
                  isGuided,
                  credentials: auth?.userInfo,
                },
                {
                  withCredentials: true,
                  headers: {
                    Authorization: `Bearer ${auth?.accessToken}`,
                  },
                }
              )
              .then((res) => {
                setKatotoMessage("");
                return;
              })
              .catch((err) => {
                Toast.show({
                  type: "error",
                  text1: "Error!",
                });
              });
          }
        })
        .catch((err) => {
          Toast.show({
            type: "error",
            text1: "Error!",
          });
        });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error!",
      });
    }
  };

  const goBack = async () => {
    setLimit(20);
    await handleGetConversation(20);
  };

  const memoizedHandleSendMessage = useCallback(
    (auth, msg) => handleSubmitMessage(auth, msg),
    [friendlyMsg, guidedButtons]
  );

  return (
    <SafeAreaView>
      <View style={tw`bg-[#f5f3eb] w-full h-full pb-5 pt-3 `}>
        {/* <Button title="Logout" onPress={signOut}></Button> */}

        <View
          style={tw`w-full flex flex-row gap-5 items-center px-5 shadow-2xl mb-3`}
        >
          <TouchableOpacity
            onPress={() => {
              setIsGuided(false);
              setIsFriendly(false);
              setGuidedButtons([]);
              setLimit(0);
              actionMessage("DELETE_MESSAGE", {});
            }}
          >
            <SimpleLineIcons name="arrow-left" size={18} color="black" />
          </TouchableOpacity>
          <Image
            style={tw`h-[40px] w-[40px] bg-[#a9e6c2] rounded-full`}
            source={require("../assets/katoto/katoto-logo.png")}
          />
        </View>

        {isGuided || isFriendly ? (
          <Messages
            isGuided={isGuided}
            messages={messages}
            handleGetConversation={handleGetConversation}
            setLimit={setLimit}
            limit={limit}
          />
        ) : (
          <View style={tw`flex items-center gap-3 h-full justify-end pb-10`}>
            <Text>Click to choose</Text>
            <TouchableOpacity
              style={tw`text-sm px-5 py-2 rounded-full bg-[#2d757c] border-2 border-[#2d757c]`}
              onPress={() => {
                setIsGuided(true);
              }}
            >
              <Text style={tw`text-[#f5f3eb] font-medium`}>
                Counselor-Guided Mode
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`text-sm px-5 py-2 rounded-full bg-[#2d757c] border-2 border-[#2d757c]`}
              onPress={() => {
                setIsFriendly(true);
                actionMessage("DELETE_MESSAGE", {});
              }}
            >
              <Text style={tw`text-[#f5f3eb] font-medium`}>
                Friendly Conversation Mode
              </Text>
            </TouchableOpacity>
            <Text>Learn more about our Privacy Policy</Text>
            <Text style={tw`mb-10`}>Please leave a feedback here.</Text>
          </View>
        )}
        {isGuided || isFriendly ? (
          <View
            style={tw`flex flex-row w-full gap-3 px-5 justify-center items-center mt-3`}
          >
            <AnimatePresence>
              {isTyping ? (
                <Motion.View
                  key={"1"}
                  initial={{ opacity: 1, scale: 0 }}
                  exit={{ opacity: 1, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    delayChildren: 0.2,
                    staggerChildren: 0.2,
                  }}
                  style={tw`w-full -top-14 transform -translate-x-1/2 absolute`}
                >
                  <View style={tw`w-full flex justify-center items-center`}>
                    <View
                      style={tw`w-auto flex flex-row gap-2 items-center justify-center text-sm py-1 px-2 rounded-full bg-[#f5f3eb] shadow`}
                    >
                      <Image
                        style={tw`h-[30px] w-[30px]`}
                        source={require("../assets/katoto/katoto-logo.png")}
                      />

                      <TypingAnimation
                        style={tw`h-[30px] w-[35px]`}
                        dotColor="#2d757c"
                        dotMargin={8}
                        dotAmplitude={5}
                        dotSpeed={0.2}
                        dotRadius={4}
                      />
                    </View>
                  </View>
                </Motion.View>
              ) : (
                <></>
              )}
            </AnimatePresence>

            {isGuided ? (
              <View
                style={tw`flex flex-row flex-wrap gap-2 items-center justify-center`}
              >
                {guidedButtons?.map((i, k) => {
                  return (
                    <Motion.View
                      initial={{ y: 20, opacity: 0 }}
                      exit={{ y: 20, opacity: 0 }}
                      animate={{
                        y: 0,
                        opacity: 1,
                      }}
                      transition={{
                        delayChildren: 0.3,
                        staggerChildren: 0.2,
                      }}
                      key={k}
                    >
                      <TouchableOpacity
                        key={k}
                        style={tw`text-sm px-5 py-2 rounded-full bg-[#2d757c] border-2 border-[#2d757c]`}
                        onPress={() => {
                          memoizedHandleSendMessage(auth.accessToken, i);
                        }}
                      >
                        <Text style={tw`text-[#f5f3eb] font-medium`}>
                          {i.title}
                        </Text>
                      </TouchableOpacity>
                    </Motion.View>
                  );
                })}

                <AnimatePresence>
                  {limit > 20 ? (
                    <Motion.View
                      key={"2"}
                      initial={{ opacity: 1, scale: 0 }}
                      exit={{ opacity: 1, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        type: "spring",
                        delayChildren: 0.3,
                        staggerChildren: 0.2,
                      }}
                      style={tw`w-full -top-14 transform -translate-x-1/2 absolute`}
                    >
                      <View style={tw`w-full flex justify-center items-center`}>
                        <TouchableOpacity
                          style={tw`text-sm py-1 px-1.2 rounded-full bg-[#2d757c] border-2 border-[#2d757c] shadow-md`}
                          onPress={goBack}
                        >
                          <Ionicons
                            name="arrow-down-outline"
                            size={18}
                            color="#f5f3eb"
                          />
                        </TouchableOpacity>
                      </View>
                    </Motion.View>
                  ) : (
                    <></>
                  )}
                </AnimatePresence>
              </View>
            ) : (
              <></>
            )}

            {isFriendly ? (
              <>
                <TextInput
                  value={friendlyMsg}
                  onChangeText={(text) => {
                    actionFriendlyMsg("ADD_MESSAGE", text);
                  }}
                  style={tw`bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-none font-semibold w-4/5`}
                  placeholder="Aa..."
                ></TextInput>

                <TouchableOpacity
                  style={tw`w-[46px] h-[46px] rounded-full bg-[#2d757c] flex justify-center items-center text-[#f5f3eb] border-2 
          border-[#2d757c] hover:text-[--dark-green] hover:bg-[#f5f3eb] ${
            !friendlyMsg.trim() || disable ? "opacity-50" : null
          }`}
                  disabled={!friendlyMsg.trim() || disable ? true : false}
                  onPress={() => {
                    memoizedHandleSendMessage(auth.accessToken, friendlyMsg);
                  }}
                >
                  <Ionicons name="send" size={18} color="#f5f3eb" />
                </TouchableOpacity>
              </>
            ) : (
              <></>
            )}
          </View>
        ) : (
          <></>
        )}
      </View>
      <ToastComponent />
    </SafeAreaView>
  );
});

export default Chat;
