import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Platform,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import { ThemedText, useThemeColor } from "./Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const backgroundColor = useThemeColor(theme.color.background);
  const borderColor = useThemeColor(theme.color.border);
  const inputBackgroundColor = useThemeColor(theme.color.backgroundElement);
  const textColor = useThemeColor(theme.color.text);
  const tintColor = useThemeColor(theme.color.reactBlue);
  const { bottom } = useSafeAreaInsets();

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  // Tab bar height is approximately 100px on Android, ~80px on iOS
  const tabBarHeight = Platform.select({ android: 100, ios: 80, default: 80 });
  const bottomPadding = Platform.select({
    android: tabBarHeight + bottom,
    ios: tabBarHeight + bottom,
    default: tabBarHeight + bottom,
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View
        style={[
          styles.container,
          { backgroundColor, borderColor, paddingBottom: bottomPadding },
        ]}
      >
        <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor={useThemeColor(theme.color.textSecondary)}
            multiline
            maxLength={1000}
            editable={!isLoading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleSend}
            disabled={!message.trim() || isLoading}
            style={({ pressed }) => [
              styles.sendButton,
              {
                opacity: !message.trim() || isLoading ? 0.5 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="send"
              size={24}
              color={tintColor}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: theme.space16,
    paddingTop: theme.space12,
  },
  inputContainer: {
    alignItems: "center",
    borderRadius: theme.borderRadius20,
    flexDirection: "row",
    paddingHorizontal: theme.space12,
    paddingVertical: Platform.OS === "ios" ? theme.space8 : theme.space4,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize16,
    maxHeight: 100,
    paddingVertical: Platform.OS === "ios" ? theme.space4 : 0,
  },
  sendButton: {
    marginLeft: theme.space8,
    padding: theme.space4,
  },
});

