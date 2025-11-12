import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ThemedText, ThemedView, useThemeColor } from "./Themed";
import { theme } from "@/theme";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { sendMessage, type ChatMessage as ChatMessageType } from "@/utils/geminiService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for the React Conf. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const backgroundColor = useThemeColor(theme.color.background);
  const accentColor = useThemeColor(theme.color.reactBlue);
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessageType = {
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const newMessages = [...messages, userMessage];
      const response = await sendMessage(newMessages);

      const assistantMessage: ChatMessageType = {
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessageType = {
        role: "assistant",
        content:
          error instanceof Error
            ? `Sorry, I encountered an error: ${error.message}`
            : "Sorry, I encountered an error. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: theme.space16,
            paddingBottom: Platform.select({
              android: 100 + bottom,
              default: theme.space16,
            }),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={accentColor}
            />
            <ThemedText
              style={styles.loadingText}
              color={theme.color.textSecondary}
              fontSize={theme.fontSize14}
            >
              Thinking...
            </ThemedText>
          </View>
        )}
      </ScrollView>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space8,
    justifyContent: "center",
    paddingHorizontal: theme.space16,
    paddingVertical: theme.space12,
  },
  loadingText: {
    marginLeft: theme.space8,
  },
});

