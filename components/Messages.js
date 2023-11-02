import { useCallback, memo, useRef, useState } from "react";
import {
  FlatList,
  View,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { TypingAnimation } from "react-native-typing-animation";

import tw from "twrnc";

const Messages = memo(
  ({
    messages,
    isTyping,
    isLoadMore,
    handleGetConversation,
    setLimit,
    limit,
  }) => {
    const bottomRef = useRef(null);
    const [offset, setOffset] = useState(70);

    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [percVal, setPercVal] = useState(100);

    // useState(() => {
    //   bottomRef?.current?.scrollToOffset({ animated: true, offset: offset });
    // }, [offset]);

    const item = useCallback(
      ({ item, index }) => {
        return item?.sender === "Katoto" ? (
          <View
            style={tw`flex flex-row w-full justify-start gap-3`}
            key={index}
          >
            <Image
              style={tw`h-[30px] w-[30px]`}
              source={require("../assets/katoto/katoto-logo.png")}
            />

            <Text
              style={tw`bg-black/10 max-w-[80%] py-3 px-4 rounded-b-3xl rounded-tr-3xl text-sm flex items-center text-left mt-5`}
            >
              {item?.message}
            </Text>
          </View>
        ) : (
          <View style={tw`flex flex-row w-full justify-end`}>
            <Text
              style={tw`bg-[#a9e6c2] max-w-[80%] py-3 px-4 rounded-t-3xl rounded-bl-3xl text-sm flex items-center text-left mt-5 mr-3`}
            >
              {item?.message}
            </Text>
          </View>
        );
      },
      [messages]
    );

    const keyExtractor = useCallback((item, index) => index);

    const listHeaderComponent = useCallback(() => {
      return (
        <>
          <ActivityIndicator size="large" color="#2d757c" />
        </>
      );
    }, []);

    const downComponent = useCallback(() => {
      return (
        <>
          <TouchableOpacity
            style={tw`t.absolute text-sm px-5 py-2 rounded-full bg-[#2d757c] border-2 border-[#2d757c]`}
          >
            <Text style={tw`text-[#f5f3eb] font-medium`}>
              Counselor-Guided Mode
            </Text>
          </TouchableOpacity>
        </>
      );
    }, []);

    return (
      <FlatList
        data={messages}
        style={tw`h-full flex flex-col gap-3 my-3 px-2 t.relative`}
        renderItem={item}
        initialNumToRender={messages.length}
        ref={bottomRef}
        keyExtractor={keyExtractor}
        windowSize={11}
        onStartReachedThreshold={1}
        ListHeaderComponent={isLoading ? listHeaderComponent : null}
        // ListFooterComponent={true ? downComponent : null}
        onScroll={(event) => {
          const currentOffset = event.nativeEvent.contentOffset.y;
          const totalOffset =
            event.nativeEvent.contentSize.height -
            event.nativeEvent.layoutMeasurement.height;
          let perc = (currentOffset / totalOffset) * 100;
          setPercVal((prev) => perc);
          if (perc > 2 && perc < 90) {
            setIsReady(true);
          }
        }}
        onStartReached={() => {
          if (isReady) {
            setIsLoading(true);
            setIsReady(false);
            setTimeout(async () => {
              setLimit((prev) => prev + 20);
              await handleGetConversation(limit + 20);
              setIsLoading(false);
              setOffset(70);
            }, 3000);
          }
        }}
        // onEndReached={() => {
        //   if (limit > 20 && isReady) {
        //     console.log("pumasok");
        //     setIsLoading(true);
        //     setIsReady(false);
        //     setTimeout(async () => {
        //       setLimit((prev) => prev - 20);
        //       await handleGetConversation();
        //       setIsLoading(false);
        //       setOffset(100);
        //     }, 3000);
        //   }
        // }}
        onContentSizeChange={() => {
          if (!(percVal <= 0)) {
            setIsReady(false);
            return bottomRef.current.scrollToEnd({
              animated: true,
              behavior: "smooth",
            });
          }
        }}
        onLayout={() => {
          if (!(percVal <= 0)) {
            setIsReady(false);
            return bottomRef.current.scrollToEnd({
              animated: true,
              behavior: "smooth",
            });
          }
        }}
      />
    );
  }
);

export default Messages;
