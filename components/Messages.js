import { useCallback, memo, useRef, useState } from "react";
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { AnimatePresence, Motion } from "@legendapp/motion";

import tw from "twrnc";

const Messages = ({
  messages,
  handleGetConversation,
  setLimit,
  limit,
  isGuided,
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
        <View style={tw`flex flex-row w-full justify-start gap-3`} key={index}>
          <Motion.Image
            // initial={{ opacity: 1, scale: 0 }}
            // animate={{
            //   opacity: 1,
            //   scale: 1,
            // }}
            // transition={{
            //   type: "spring",
            //   delayChildren: 0.2,
            //   staggerChildren: 0.2,
            // }}
            style={tw`h-[30px] w-[30px]`}
            source={require("../assets/katoto/katoto-logo.png")}
          />

          <Motion.Text
            // initial={{ opacity: 1, scale: 0, x: -100 }}
            // animate={{
            //   opacity: 1,
            //   scale: 1,
            //   x: 0,
            // }}
            // transition={{
            //   type: "spring",
            //   delayChildren: 0.2,
            //   staggerChildren: 0.2,
            // }}
            style={tw`bg-black/10 max-w-[80%] py-3 px-4 rounded-b-3xl rounded-tr-3xl text-sm flex items-center text-left my-5`}
          >
            {item?.message}
          </Motion.Text>
        </View>
      ) : (
        <View style={tw`flex flex-row w-full justify-end`} key={index}>
          <Motion.Text
            // initial={{ opacity: 1, scale: 0, x: 100 }}
            // animate={{
            //   opacity: 1,
            //   scale: 1,
            //   x: 0,
            // }}
            // transition={{
            //   type: "spring",
            //   delayChildren: 0.2,
            //   staggerChildren: 0.2,
            // }}
            style={tw`bg-[#a9e6c2] max-w-[80%] py-3 px-4 rounded-t-3xl rounded-bl-3xl text-sm flex items-center text-left mr-3`}
          >
            {item?.message}
          </Motion.Text>
        </View>
      );
    },
    [messages]
  );

  const keyExtractor = useCallback((item, index) => index);

  const listHeaderComponent = useCallback(() => {
    return (
      <View style={tw`mt-5`}>
        <ActivityIndicator size="large" color="#2d757c" />
      </View>
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
      style={tw`h-full flex flex-col gap-3 px-2 `}
      renderItem={item}
      initialNumToRender={messages.length}
      ref={bottomRef}
      keyExtractor={keyExtractor}
      windowSize={11}
      onStartReachedThreshold={1}
      ListHeaderComponent={isLoading ? listHeaderComponent : null}
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
      // onStartReached={() => {
      //   if (isReady && isGuided) {
      //     setIsLoading(true);
      //     setIsReady(false);
      //     setTimeout(async () => {
      //       setLimit((prev) => prev + 20);
      //       await handleGetConversation(limit + 20);
      //       setIsLoading(false);
      //       setOffset(70);
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
};

export default memo(Messages);
