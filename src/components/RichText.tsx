import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText, useThemeColor } from "./Themed";
import { theme } from "@/theme";

type RichTextProps = {
  content: string;
};

type InlinePart = {
  type: "text" | "bold" | "italic" | "code";
  text: string;
};

function parseInline(text: string): InlinePart[] {
  // Parse inline code first to avoid conflicts with bold/italic
  const codeSplit = text.split(/(`[^`]+`)/g);
  const parts: InlinePart[] = [];

  for (const segment of codeSplit) {
    if (segment.startsWith("`") && segment.endsWith("`")) {
      parts.push({ type: "code", text: segment.slice(1, -1) });
      continue;
    }

    // Parse bold: **text**
    const boldSplit = segment.split(/(\*\*[^*]+\*\*)/g);
    for (const b of boldSplit) {
      if (b.startsWith("**") && b.endsWith("**")) {
        parts.push({ type: "bold", text: b.slice(2, -2) });
        continue;
      }
      // Parse italic: *text*
      const italicSplit = b.split(/(\*[^*]+\*)/g);
      for (const i of italicSplit) {
        if (i.startsWith("*") && i.endsWith("*")) {
          parts.push({ type: "italic", text: i.slice(1, -1) });
        } else if (i.length) {
          parts.push({ type: "text", text: i });
        }
      }
    }
  }

  return parts;
}

export function RichText({ content }: RichTextProps) {
  const textColor = useThemeColor(theme.color.text);
  const secondaryBg = useThemeColor(theme.color.backgroundElement);

  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Handle fenced code blocks ```
    if (trimmed.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        // Closing fence
        inCodeBlock = false;
        const codeText = codeBuffer.join("\n");
        blocks.push(
          <View key={`code-${index}`} style={[styles.codeBlock, { backgroundColor: secondaryBg }]}>
            <ThemedText
              color={theme.color.text}
              fontSize={theme.fontSize14}
              style={styles.codeText}
            >
              {codeText}
            </ThemedText>
          </View>,
        );
        codeBuffer = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <ThemedText
          key={`h3-${index}`}
          fontWeight="semiBold"
          fontSize={theme.fontSize18}
          style={styles.block}
        >
          {trimmed.slice(4)}
        </ThemedText>,
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <ThemedText
          key={`h2-${index}`}
          fontWeight="bold"
          fontSize={theme.fontSize20}
          style={styles.block}
        >
          {trimmed.slice(3)}
        </ThemedText>,
      );
      return;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <ThemedText
          key={`h1-${index}`}
          fontWeight="bold"
          fontSize={theme.fontSize24}
          style={styles.block}
        >
          {trimmed.slice(2)}
        </ThemedText>,
      );
      return;
    }

    // Bulleted lists (- or *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemText = trimmed.slice(2);
      const inlineParts = parseInline(itemText);
      blocks.push(
        <View key={`li-${index}`} style={styles.listItem}>
          <View style={[styles.bullet, { backgroundColor: textColor }]} />
          <ThemedText style={styles.listText}>
            {inlineParts.map((p, i) => {
              if (p.type === "bold") {
                return (
                  <ThemedText key={i} fontWeight="semiBold">
                    {p.text}
                  </ThemedText>
                );
              }
              if (p.type === "italic") {
                return (
                  <ThemedText key={i} italic>
                    {p.text}
                  </ThemedText>
                );
              }
              if (p.type === "code") {
                return (
                  <ThemedText key={i} style={styles.inlineCode}>
                    {p.text}
                  </ThemedText>
                );
              }
              return <ThemedText key={i}>{p.text}</ThemedText>;
            })}
          </ThemedText>
        </View>,
      );
      return;
    }

    // Paragraph (with inline formatting)
    if (trimmed.length === 0) {
      blocks.push(<View key={`sp-${index}`} style={styles.spacer} />);
      return;
    }

    const inlineParts = parseInline(line);
    blocks.push(
      <ThemedText key={`p-${index}`} style={styles.block}>
        {inlineParts.map((p, i) => {
          if (p.type === "bold") {
            return (
              <ThemedText key={i} fontWeight="semiBold">
                {p.text}
              </ThemedText>
            );
          }
          if (p.type === "italic") {
            return (
              <ThemedText key={i} italic>
                {p.text}
              </ThemedText>
            );
          }
          if (p.type === "code") {
            return (
              <ThemedText key={i} style={styles.inlineCode}>
                {p.text}
              </ThemedText>
            );
          }
          return <ThemedText key={i}>{p.text}</ThemedText>;
        })}
      </ThemedText>,
    );
  });

  return <View style={styles.container}>{blocks}</View>;
}

const styles = StyleSheet.create({
  container: {
    gap: theme.space8,
  },
  block: {
    lineHeight: 22,
  },
  spacer: {
    height: theme.space8,
  },
  listItem: {
    flexDirection: "row",
    gap: theme.space8,
    alignItems: "flex-start",
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: theme.space8 / 2,
  },
  listText: {
    flex: 1,
    lineHeight: 22,
  },
  inlineCode: {
    fontFamily: theme.fontFamily,
    backgroundColor: "rgba(127,127,127,0.15)",
    borderRadius: 6,
    paddingHorizontal: 4,
    marginHorizontal: 2,
  },
  codeBlock: {
    borderRadius: theme.borderRadius12,
    padding: theme.space12,
  },
  codeText: {
    fontFamily: theme.fontFamily,
  },
});


