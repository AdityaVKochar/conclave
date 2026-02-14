import React from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import type { ToolKind, ToolSettings } from "../../core/tools/engine";
import { TOOL_COLORS } from "../../shared/constants/tools";

const TOOLS: { id: ToolKind; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "pen", label: "Draw" },
  { id: "highlighter", label: "Highlight" },
  { id: "eraser", label: "Erase" },
  { id: "rect", label: "Rectangle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "line", label: "Line" },
  { id: "text", label: "Text" },
  { id: "sticky", label: "Sticky" },
];
const STROKE_WIDTHS = [2, 3, 5, 8, 12];

export function WhiteboardNativeToolbar({
  tool,
  onToolChange,
  settings,
  onSettingsChange,
  locked,
  onExport,
}: {
  tool: ToolKind;
  onToolChange: (tool: ToolKind) => void;
  settings: ToolSettings;
  onSettingsChange: (next: ToolSettings) => void;
  locked: boolean;
  onExport: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {TOOLS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onToolChange(item.id)}
            disabled={locked && item.id !== "select"}
            style={[
              styles.button,
              tool === item.id && styles.buttonActive,
              locked && item.id !== "select" && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <View style={styles.colors}>
          {TOOL_COLORS.map((color) => (
            <Pressable
              key={color}
              disabled={locked}
              onPress={() => onSettingsChange({ ...settings, strokeColor: color, textColor: color })}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                settings.strokeColor === color && styles.colorDotActive,
                locked && styles.buttonDisabled,
              ]}
            />
          ))}
        </View>
        <View style={styles.sizes}>
          {STROKE_WIDTHS.map((size) => (
            <Pressable
              key={size}
              disabled={locked}
              onPress={() => onSettingsChange({ ...settings, strokeWidth: size })}
              style={[
                styles.sizeButton,
                settings.strokeWidth === size && styles.sizeButtonActive,
                locked && styles.buttonDisabled,
              ]}
            >
              <View style={[styles.sizeDot, { width: size + 1, height: size + 1 }]} />
            </Pressable>
          ))}
        </View>
        <Pressable onPress={onExport} style={styles.exportButton}>
          <Text style={styles.exportText}>Export</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    gap: 6,
    backgroundColor: "rgba(10,10,10,0.86)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(254,252,217,0.15)",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  buttonActive: {
    backgroundColor: "#F95F4A",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#FEFCD9",
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  colors: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "transparent",
  },
  colorDotActive: {
    borderColor: "rgba(255,255,255,0.9)",
  },
  sizes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  sizeButton: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  sizeButtonActive: {
    borderColor: "rgba(249,95,74,0.9)",
    backgroundColor: "rgba(249,95,74,0.2)",
  },
  sizeDot: {
    borderRadius: 999,
    backgroundColor: "rgba(254,252,217,0.9)",
  },
  exportButton: {
    marginLeft: "auto",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  exportText: {
    color: "#FEFCD9",
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
