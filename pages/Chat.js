import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { AntDesign, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
// import { API_URI, KATOTO_CG_API_URI, KATOTO_FC_API_URI } from "@env";
import {
  useEffect,
  memo,
  useReducer,
  useContext,
  useCallback,
  useState,
} from "react";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import ToastComponent from "../components/ToastComponent";
import { TypingAnimation } from "react-native-typing-animation";
import Messages from "../components/Messages";
import { AnimatePresence, Motion } from "@legendapp/motion";
import Checkbox from "expo-checkbox";
import moment from "moment-timezone";
import MaskedView from "@react-native-masked-view/masked-view";

const API_URI = process.env.API_URI;
const KATOTO_CG_API_URI = process.env.KATOTO_CG_API_URI;
const KATOTO_FC_API_URI = process.env.KATOTO_FC_API_URI;

const Chat = memo(({ auth, Toast }) => {
  const { signOut } = useContext(AuthContext);

  const [isGuided, setIsGuided] = useState(false);
  const [isFriendly, setIsFriendly] = useState(false);
  const [isLoadingMain, setIsLoadingMain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [disable, setDisable] = useState(true);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isPrivacyPolicyChecked, setIsPrivacyPolicyChecked] = useState(false);
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState([
    false,
    0,
  ]);

  const [limit, setLimit] = useState(20);

  const [katotoMessage, setKatotoMessage] = useState("");
  const [campaign, setCampaign] = useState("");
  const [quote, setQuote] = useState("");

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
    (async () => {
      setIsLoadingMain(true);
      await getQuote();
      await handleGetPublishedCampaign();
      setIsLoadingMain(false);
    })();
  }, []);

  useEffect(() => {
    if (isGuided || isFriendly) {
      (async () => {
        if (isGuided) {
          setIsLoading(true);
          await handleGetConversation(20);
        }
        setDisable(true);
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

  const getQuote = async () => {
    await axios
      .get(`${API_URI}/api/train/get-quote`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
        },
      })
      .then((res) => {
        setQuote(res?.data?.quote);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleGetPublishedCampaign = async () => {
    try {
      await axios.get(`${API_URI}/api/get-published-latest`).then((res) => {
        const newCampaigns = res?.data?.campaigns?.map((i) => {
          if (new Date(i["effectivityDate"]) > new Date()) {
            i["effectivityDate"] = convertDate(i["effectivityDate"])[1];
            return i;
          }
        });

        setCampaign(newCampaigns[0]);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const convertDate = (date) => {
    const formattedDate = new Date(date);

    const convertedDateTime = formattedDate.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Singapore",
    });

    const convertedDate = formattedDate.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Singapore",
    });

    const convertedTime = formattedDate.toLocaleString("en-PH", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Singapore",
    });

    return [convertedDateTime, convertedDate, convertedTime];
  };

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
          setIsLoading(false);
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

  if (isLoadingMain) {
    return (
      <SafeAreaView
        style={tw`bg-[#f5f3eb] flex justify-center items-center w-full h-full`}
      >
        <View>
          <ActivityIndicator size="extra-large" color="#2d757c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      {/* <LinearGradient
        colors={["#1cd8d2", "#a9e6c2", "#f5f3eb", "#f5f3eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      > */}

      <View style={tw`w-full h-full pb-5 pt-3 bg-[#f5f3eb]`}>
        <AnimatePresence>
          <Modal
            visible={isPrivacyPolicyVisible[0] || isProfileVisible}
            transparent
          >
            <Motion.View
              key={"modal1"}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              animate={{
                opacity: 1,
              }}
              transition={{
                type: "spring",
                delayChildren: 0.2,
                staggerChildren: 0.2,
              }}
              style={tw`flex-1 justify-center`}
            >
              <View style={tw`w-full h-full bg-black/20`}></View>
            </Motion.View>
          </Modal>
        </AnimatePresence>
        <AnimatePresence>
          <Modal
            transparent
            visible={isPrivacyPolicyVisible[0]}
            onRequestClose={() => {
              setIsPrivacyPolicyVisible([false, 0]);
            }}
          >
            <Motion.View
              key={"modal"}
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
              style={tw`flex-1 justify-center`}
            >
              <View
                style={tw`bg-[#f5f3eb] my-[10%] mx-[10%] rounded-xl px-5 justify-center`}
              >
                <Text style={[tw`text-2xl`, { fontFamily: "Inter-EB" }]}>
                  Privacy Policy
                </Text>
                <View style={tw`mt-5 flex flex-col gap-3`}>
                  <ScrollView
                    style={tw`h-[70%] ${
                      isPrivacyPolicyVisible[1] === 3 ? "h-[80%]" : null
                    }`}
                  >
                    <View style={tw`flex flex-col gap-3`}>
                      <Text style={[tw`text-xs`, { fontFamily: "Inter-R" }]}>
                        {"\t"}
                        {"\t"}
                        {"\t"}This Privacy Policy outlines the practices and
                        procedures for collecting, using, and safeguarding data
                        in the context of our mental health assessment for
                        students using Katoto. By checking the box below, you
                        provide your consent for us to collect and process
                        certain categories of personal data.
                      </Text>
                      <Text style={[tw`text-xs`, { fontFamily: "Inter-R" }]}>
                        {"\t"}
                        {"\t"}
                        {"\t"}We collect various details, including names, dates
                        of birth, contact information such as email addresses
                        and phone numbers, educational institution details, and
                        other relevant profile information. Additionally, we
                        gather data related to mental health, including
                        counselor-guided conversations, session notes with
                        mental health advocates/guidance counselors, and any
                        additional information voluntarily provided concerning
                        mental health concerns.
                      </Text>
                      <Text style={[tw`text-xs`, { fontFamily: "Inter-R" }]}>
                        {"\t"}
                        {"\t"}
                        {"\t"}The primary purposes of collecting and processing
                        this data are to provide improved mental health
                        assessments for students, identify potential mental
                        health concerns, and enhance our services. This valuable
                        information is only accessible to our team of guidance
                        counselors at PLV.
                      </Text>
                      <Text style={[tw`text-xs`, { fontFamily: "Inter-R" }]}>
                        {"\t"}
                        {"\t"}
                        {"\t"}Ensuring the security of your data is of utmost
                        importance to us. We have implemented up-to-date
                        security measures to ensure the safety of your data.
                      </Text>
                      <Text style={[tw`text-xs`, { fontFamily: "Inter-R" }]}>
                        {"\t"}
                        {"\t"}
                        {"\t"}You have certain rights regarding your data,
                        including the right to access, correct, or delete your
                        personal data, the right to withdraw consent for data
                        processing (if applicable), the right to object to data
                        processing, and the right to file a complaint with a
                        data protection authority.
                      </Text>
                      <Text style={[tw`text-xs`, { fontFamily: "Inter-R" }]}>
                        {"\t"}
                        {"\t"}
                        {"\t"}If you have any questions or concerns regarding
                        this Privacy Policy or the data we collect, please do
                        not hesitate to provide a feedback.
                      </Text>
                    </View>
                  </ScrollView>
                  {isPrivacyPolicyVisible[1] !== 3 ? (
                    <View style={tw`flex gap-3 mb-3 flex-row w-full`}>
                      <Checkbox
                        value={isPrivacyPolicyChecked}
                        onValueChange={setIsPrivacyPolicyChecked}
                        color={"#2d757c"}
                      />

                      <Text
                        style={[
                          tw`text-xs flex w-[89%]`,
                          { fontFamily: "Inter-R" },
                        ]}
                      >
                        By ticking the box, you acknowledge that you have read
                        and understood this Privacy Policy and consent to the
                        collection and processing of your personal data as
                        described herein.
                      </Text>
                    </View>
                  ) : (
                    <></>
                  )}
                </View>

                <View style={tw`flex flex-row justify-end`}>
                  <TouchableOpacity
                    style={tw`text-sm px-5 py-2 rounded-lg ${
                      isPrivacyPolicyVisible[1] === 3 ? "mt-3" : null
                    }`}
                    onPress={() => {
                      setIsPrivacyPolicyVisible([false, 0]);
                    }}
                  >
                    <Text
                      style={[tw`text-[#ff6961]`, { fontFamily: "Inter-EB" }]}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                  {isPrivacyPolicyVisible[1] !== 3 ? (
                    <TouchableOpacity
                      style={tw`text-sm px-5 py-2 rounded-lg bg-[#2d757c] border-2 border-[#2d757c] ${
                        !isPrivacyPolicyChecked ? "opacity-50" : null
                      }`}
                      disabled={!isPrivacyPolicyChecked}
                      onPress={() => {
                        if (isPrivacyPolicyVisible[1] === 1) {
                          setIsGuided(true);
                        } else if (isPrivacyPolicyVisible[1] === 2) {
                          setIsFriendly(true);
                        }
                        setIsPrivacyPolicyVisible([false, 0]);
                      }}
                    >
                      <Text style={tw`text-[#f5f3eb]`}>Submit</Text>
                    </TouchableOpacity>
                  ) : (
                    <></>
                  )}
                </View>
              </View>
            </Motion.View>
          </Modal>
        </AnimatePresence>
        <Modal
          transparent
          visible={isProfileVisible}
          onRequestClose={() => {
            setIsProfileVisible(false);
          }}
        >
          <Motion.View
            key={"modal"}
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
            style={tw`flex-1 justify-center`}
          >
            <View
              style={tw`bg-[#f5f3eb] my-[10%] mx-[10%] rounded-xl p-5 justify-center`}
            >
              <Text style={[tw`text-2xl`, { fontFamily: "Inter-EB" }]}>
                Profile
              </Text>
              <View style={tw`flex flex-row gap-5 mt-3`}>
                <SimpleLineIcons name="user" size={24} color="black" />
                <Text style={[tw`text-lg`, { fontFamily: "Inter-M" }]}>
                  {auth?.userInfo?.name}
                </Text>
              </View>
              <View style={tw`flex flex-row justify-end mt-5`}>
                <TouchableOpacity
                  style={tw`text-sm px-5 py-2 rounded-lg ${
                    isPrivacyPolicyVisible[1] === 3 ? "mt-3" : null
                  }`}
                  onPress={() => {
                    setIsProfileVisible(false);
                  }}
                >
                  <Text
                    style={[tw`text-[#2d757c] `, { fontFamily: "Inter-EB" }]}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`text-sm px-5 py-2 rounded-lg bg-[#ff6961] border-2 border-[#ff6961] ${
                    isPrivacyPolicyVisible[1] === 3 ? "mt-3" : null
                  }`}
                  onPress={signOut}
                >
                  <Text style={tw`text-[#f5f3eb]`}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Motion.View>
        </Modal>

        <View
          style={tw`w-full flex flex-row gap-5 items-center justify-between px-5 shadow-2xl mb-3`}
        >
          <View style={tw`flex flex-row gap-3 items-center`}>
            {isGuided || isFriendly ? (
              <TouchableOpacity
                onPress={() => {
                  setIsGuided(false);
                  setIsFriendly(false);
                  setGuidedButtons([]);
                  setLimit(0);
                  actionMessage("DELETE_MESSAGE", {});
                }}
              >
                <AntDesign name="arrowleft" size={28} color="black" />
              </TouchableOpacity>
            ) : (
              <></>
            )}
            {isGuided || isFriendly ? (
              <View style={tw`flex flex-row gap-3`}>
                <Image
                  style={tw`${
                    isGuided || isFriendly ? "bg-[#a9e6c2]" : null
                  } h-[40px] w-[40px]  rounded-full`}
                  source={
                    isGuided || isFriendly
                      ? require("../assets/katoto/katoto-logo.png")
                      : null
                  }
                />
                <View>
                  <Text style={[tw`flex text-4`, { fontFamily: "Inter-EB" }]}>
                    Katoto
                  </Text>
                  <Text style={[tw`flex text-sm`, { fontFamily: "Inter-R" }]}>
                    Tara kwentuhan!
                  </Text>
                </View>
              </View>
            ) : (
              <Text
                style={[
                  tw`flex text-8 text-center`,
                  { fontFamily: "Inter-EB" },
                ]}
              >
                Katoto
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              setIsProfileVisible(true);
            }}
          >
            <SimpleLineIcons name="options-vertical" size={18} color="black" />
          </TouchableOpacity>
        </View>

        {isPrivacyPolicyChecked && (isGuided || isFriendly) ? (
          isLoading ? (
            <View
              style={tw`h-full w-full flex flex-row justify-center items-center`}
            >
              <ActivityIndicator size="extra-large" color="#2d757c" />
            </View>
          ) : (
            <Messages
              isGuided={isGuided}
              messages={messages}
              handleGetConversation={handleGetConversation}
              setLimit={setLimit}
              limit={limit}
            />
          )
        ) : (
          <>
            <View style={tw`flex items-center gap-3 h-full justify-between`}>
              <View style={tw`w-full px-5 flex flex-col gap-3 mt-3`}>
                <View>
                  <LinearGradient
                    style={tw`rounded-lg p-3 flex flex-col gap-2`}
                    colors={["#1cd8d2", "#a9e6c2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <View style={tw`flex flex-row justify-between`}>
                      <Text style={[tw`text-xl`, { fontFamily: "Inter-B" }]}>
                        {campaign?.title}
                      </Text>
                      <View
                        style={[
                          tw`bg-[#2d757c] rounded-full py-1 px-2 w-fit`,
                          { fontFamily: "Inter-B" },
                        ]}
                      >
                        <Text style={[tw`text-[#f5f3eb] capitalize`]}>
                          {campaign?.campaignType}
                        </Text>
                      </View>
                    </View>
                    <Text>
                      Until:{" "}
                      {moment(campaign?.effectivityDate, "DD MMMM YYYY").format(
                        "MMMM D, YYYY"
                      )}
                    </Text>
                    <Text numberOfLines={1} ellipsizeMode="tail">
                      {campaign?.description}
                    </Text>
                  </LinearGradient>
                </View>
                <View>
                  <LinearGradient
                    style={tw`w-fit rounded-lg p-3 flex flex-col gap-2`}
                    colors={["#a9e6c2", "#a9e6c2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Text
                      style={[
                        tw`text-xl text-center`,
                        { fontFamily: "Inter-B" },
                      ]}
                    >
                      Qoute of the Day
                    </Text>
                    <Text style={[tw`text-center`]}>{quote?.quote}</Text>
                    <Text style={[tw`text-center`, { fontFamily: "Inter-B" }]}>
                      {quote?.author}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
              <View
                style={tw`flex items-center gap-3 w-full justify-end pb-10`}
              >
                <Text>Click to choose</Text>
                <TouchableOpacity
                  style={tw`text-sm px-5 py-2 rounded-full bg-[#2d757c] border-2 border-[#2d757c]`}
                  onPress={() => {
                    setIsPrivacyPolicyChecked(false);
                    setIsPrivacyPolicyVisible([true, 1]);
                    actionMessage("DELETE_MESSAGE", {});
                  }}
                >
                  <Text style={tw`text-[#f5f3eb] font-medium`}>
                    Counselor-Guided Mode
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`text-sm px-5 py-2 rounded-full bg-[#2d757c] border-2 border-[#2d757c]`}
                  onPress={() => {
                    setIsPrivacyPolicyChecked(false);
                    setIsPrivacyPolicyVisible([true, 2]);
                    actionMessage("DELETE_MESSAGE", {});
                  }}
                >
                  <Text style={tw`text-[#f5f3eb] font-medium`}>
                    Friendly Conversation Mode
                  </Text>
                </TouchableOpacity>
                <Text style={tw`flex flex-row`}>
                  Learn more about our
                  <Text
                    style={[tw`text-[#2d757c]`, { fontFamily: "Inter-B" }]}
                    onPress={() => {
                      setIsPrivacyPolicyVisible([true, 3]);
                    }}
                  >
                    {" "}
                    Privacy Policy
                  </Text>
                  .
                </Text>
                <Text style={tw`flex flex-row text-center mb-10 w-2/3`}>
                  <Text style={[tw`text-[#ff6961]`, { fontFamily: "Inter-B" }]}>
                    {" "}
                    Reminder
                  </Text>
                  : To schedule an appointment, please visit our
                  <Text
                    style={[tw`text-[#2d757c]`, { fontFamily: "Inter-B" }]}
                    onPress={() => {
                      Linking.openURL("https://katoto.live");
                    }}
                  >
                    {" "}
                    website
                  </Text>
                  .
                </Text>
              </View>
            </View>
          </>
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
      {/* </LinearGradient> */}
      <ToastComponent />
    </SafeAreaView>
  );
});

export default Chat;
