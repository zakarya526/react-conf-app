import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText, useThemeColor } from "./Themed";
import { theme } from "@/theme";
import { RichText } from "./RichText";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";
  const backgroundColor = useThemeColor(
    isUser ? theme.color.reactBlue : theme.color.backgroundElement,
  );
  const textColor = useThemeColor(
    isUser
      ? { light: theme.colorWhite, dark: theme.colorWhite }
      : theme.color.text,
  );

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <View style={[styles.bubble, { backgroundColor }]}>
        {isUser ? (
          <ThemedText
            style={[styles.text, { color: textColor }]}
            fontSize={theme.fontSize16}
          >
            {content}
          </ThemedText>
        ) : (
          <RichText content={content} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: theme.space12,
    paddingHorizontal: theme.space16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: theme.borderRadius20,
    maxWidth: "80%",
    paddingHorizontal: theme.space16,
    paddingVertical: theme.space12,
  },
  text: {
    lineHeight: 22,
  },
});

