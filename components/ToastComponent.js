import Toast, { ErrorToast, BaseToast } from "react-native-toast-message";
import tw from "twrnc";

function ToastComponent() {
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: "#2d757c",
          backgroundColor: "#f5f3eb",
        }}
        text1Style={{
          fontSize: 16,
        }}
        text2Style={{
          fontSize: 14,
        }}
      />
    ),

    error: (props) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: "#ff6961",
          backgroundColor: "#f5f3eb",
        }}
        text1Style={{
          fontSize: 16,
        }}
        text2Style={{
          fontSize: 14,
        }}
      />
    ),
  };
  return (
    <Toast
      position="top"
      topOffset={50}
      // style={{ backgroundColor: "red", borderRadius: 8 }}
      // contentContainerStyle={{ paddingHorizontal: 15 }}
      config={toastConfig}
    />
  );
}

export default ToastComponent;
