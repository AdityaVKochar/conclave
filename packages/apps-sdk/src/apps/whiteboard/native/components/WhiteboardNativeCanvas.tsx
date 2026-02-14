import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  View,
  Text as RNText,
  Image,
  type LayoutChangeEvent,
} from "react-native";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import { Canvas, Path, Rect, Oval, Line, Skia } from "@shopify/react-native-skia";
import { buildRenderList } from "../../core/exports/renderList";
import type { ToolKind, ToolSettings } from "../../core/tools/engine";
import { ToolEngine } from "../../core/tools/engine";
import { useWhiteboardElements } from "../../shared/hooks/useWhiteboardElements";
import type { AppUser } from "../../../../sdk/types/index";
import { getColorForUser } from "../../core/presence/colors";
import type { WhiteboardElement } from "../../core/model/types";
import type { PresenceState } from "../../../../sdk/hooks/useAppPresence";
import { getBoundsForElement } from "../../core/model/geometry";

export type WhiteboardNativeCanvasProps = {
  doc: Y.Doc;
  awareness: Awareness;
  pageId: string;
  tool: ToolKind;
  settings: ToolSettings;
  locked: boolean;
  user?: AppUser;
  states?: PresenceState[];
};

const seedFrom = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRng = (seed: number) => {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const jitterOffset = (id: string, pass: number, amount: number) => {
  const rng = createRng(seedFrom(id) + pass * 1699);
  return {
    x: (rng() * 2 - 1) * amount,
    y: (rng() * 2 - 1) * amount,
  };
};

const buildPath = (
  points: { x: number; y: number }[],
  offsetX = 0,
  offsetY = 0,
) => {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;
  path.moveTo(points[0].x + offsetX, points[0].y + offsetY);
  for (let i = 1; i < points.length; i += 1) {
    path.lineTo(points[i].x + offsetX, points[i].y + offsetY);
  }
  return path;
};

const renderElement = (element: WhiteboardElement) => {
  switch (element.type) {
    case "stroke": {
      const rough = jitterOffset(element.id, 1, Math.max(0.8, element.width * 0.25));
      return (
        <React.Fragment key={element.id}>
          <Path
            path={buildPath(element.points)}
            style="stroke"
            strokeWidth={element.width}
            color={element.color}
            opacity={element.opacity ?? 1}
            strokeJoin="round"
            strokeCap="round"
          />
          <Path
            path={buildPath(element.points, rough.x, rough.y)}
            style="stroke"
            strokeWidth={Math.max(1, element.width * 0.85)}
            color={element.color}
            opacity={(element.opacity ?? 1) * 0.58}
            strokeJoin="round"
            strokeCap="round"
          />
        </React.Fragment>
      );
    }
    case "shape": {
      const rough = jitterOffset(element.id, 2, Math.max(0.9, element.strokeWidth * 0.5));
      if (element.shape === "rect") {
        const x = Math.min(element.x, element.x + element.width);
        const y = Math.min(element.y, element.y + element.height);
        const width = Math.abs(element.width);
        const height = Math.abs(element.height);
        return (
          <React.Fragment key={element.id}>
            {element.fillColor ? (
              <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                style="fill"
                color={element.fillColor}
                opacity={0.28}
              />
            ) : null}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              style="stroke"
              color={element.strokeColor}
              strokeWidth={element.strokeWidth}
            />
            <Rect
              x={x + rough.x}
              y={y + rough.y}
              width={width}
              height={height}
              style="stroke"
              color={element.strokeColor}
              opacity={0.62}
              strokeWidth={Math.max(1, element.strokeWidth * 0.85)}
            />
          </React.Fragment>
        );
      }

      if (element.shape === "ellipse") {
        const x = Math.min(element.x, element.x + element.width);
        const y = Math.min(element.y, element.y + element.height);
        const width = Math.abs(element.width);
        const height = Math.abs(element.height);
        return (
          <React.Fragment key={element.id}>
            {element.fillColor ? (
              <Oval
                x={x}
                y={y}
                width={width}
                height={height}
                style="fill"
                color={element.fillColor}
                opacity={0.28}
              />
            ) : null}
            <Oval
              x={x}
              y={y}
              width={width}
              height={height}
              style="stroke"
              color={element.strokeColor}
              strokeWidth={element.strokeWidth}
            />
            <Oval
              x={x + rough.x}
              y={y + rough.y}
              width={width}
              height={height}
              style="stroke"
              color={element.strokeColor}
              opacity={0.62}
              strokeWidth={Math.max(1, element.strokeWidth * 0.85)}
            />
          </React.Fragment>
        );
      }

      if (element.shape === "line") {
        return (
          <React.Fragment key={element.id}>
            <Line
              p1={{ x: element.x, y: element.y }}
              p2={{ x: element.x + element.width, y: element.y + element.height }}
              color={element.strokeColor}
              strokeWidth={element.strokeWidth}
            />
            <Line
              p1={{ x: element.x + rough.x, y: element.y + rough.y }}
              p2={{
                x: element.x + element.width + rough.x,
                y: element.y + element.height + rough.y,
              }}
              color={element.strokeColor}
              opacity={0.62}
              strokeWidth={Math.max(1, element.strokeWidth * 0.85)}
            />
          </React.Fragment>
        );
      }

      return null;
    }
    default:
      return null;
  }
};

export function WhiteboardNativeCanvas({
  doc,
  awareness,
  pageId,
  tool,
  settings,
  locked,
  user,
  states = [],
}: WhiteboardNativeCanvasProps) {
  const engineRef = useRef<ToolEngine | null>(null);
  const cursorRafRef = useRef<number | null>(null);
  const latestCursorRef = useRef<{ x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const elements = useWhiteboardElements(doc, pageId);
  const renderList = useMemo(() => buildRenderList(elements), [elements]);

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new ToolEngine(doc, pageId, tool, settings);
    }
    engineRef.current.setPage(pageId);
    engineRef.current.setTool(tool);
    engineRef.current.setSettings(settings);
  }, [doc, pageId, tool, settings]);

  useEffect(() => {
    const state = awareness.getLocalState() ?? {};
    awareness.setLocalState({
      ...state,
      user: {
        id: user?.id ?? "guest",
        name: user?.name ?? "Guest",
        color: getColorForUser(user?.id ?? "guest"),
      },
    });
  }, [awareness, user]);

  useEffect(() => {
    if (!selectedId) return;
    if (!elements.some((element) => element.id === selectedId)) {
      setSelectedId(null);
    }
  }, [elements, selectedId]);

  const scheduleCursorSync = useCallback(
    (x: number, y: number) => {
      latestCursorRef.current = { x, y };
      if (cursorRafRef.current !== null) return;
      cursorRafRef.current = requestAnimationFrame(() => {
        cursorRafRef.current = null;
        const cursor = latestCursorRef.current;
        if (!cursor) return;
        awareness.setLocalStateField("cursor", cursor);
      });
    },
    [awareness],
  );

  const clearCursor = useCallback(() => {
    latestCursorRef.current = null;
    awareness.setLocalStateField("cursor", null);
  }, [awareness]);

  useEffect(() => {
    return () => {
      if (cursorRafRef.current !== null) {
        cancelAnimationFrame(cursorRafRef.current);
      }
      clearCursor();
    };
  }, [clearCursor]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY, force } = event.nativeEvent;
          if (!locked) {
            engineRef.current?.onPointerDown({ x: locationX, y: locationY, pressure: force });
            setSelectedId(engineRef.current?.getSelectedId() ?? null);
          }
          scheduleCursorSync(locationX, locationY);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY, force } = event.nativeEvent;
          if (!locked) {
            engineRef.current?.onPointerMove({ x: locationX, y: locationY, pressure: force });
          }
          scheduleCursorSync(locationX, locationY);
        },
        onPanResponderRelease: () => {
          if (!locked) {
            engineRef.current?.onPointerUp();
            setSelectedId(engineRef.current?.getSelectedId() ?? null);
          }
          clearCursor();
        },
        onPanResponderTerminate: () => {
          if (!locked) {
            engineRef.current?.onPointerUp();
            setSelectedId(engineRef.current?.getSelectedId() ?? null);
          }
          clearCursor();
        },
      }),
    [locked, clearCursor, scheduleCursorSync],
  );

  const textElements = useMemo(
    () => elements.filter((element) => element.type === "text" || element.type === "sticky"),
    [elements],
  );

  const imageElements = useMemo(
    () => elements.filter((element) => element.type === "image"),
    [elements],
  );

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedId) ?? null,
    [elements, selectedId],
  );

  const selectionBounds = useMemo(
    () => (selectedElement ? getBoundsForElement(selectedElement) : null),
    [selectedElement],
  );

  const remoteCursors = useMemo(
    () =>
      states
        .filter(
          (state) =>
            state.clientId !== awareness.clientID &&
            Boolean(state.cursor) &&
            Boolean(state.user?.name),
        )
        .map((state) => ({
          clientId: state.clientId,
          x: state.cursor?.x ?? 0,
          y: state.cursor?.y ?? 0,
          color: state.user?.color ?? "#F95F4A",
          name: state.user?.name ?? "Guest",
        })),
    [states, awareness.clientID],
  );

  const gridLines = useMemo(() => {
    const minorStep = 24;
    const majorStep = minorStep * 5;
    const minorVertical: number[] = [];
    const minorHorizontal: number[] = [];
    const majorVertical: number[] = [];
    const majorHorizontal: number[] = [];

    if (canvasSize.width <= 0 || canvasSize.height <= 0) {
      return { minorVertical, minorHorizontal, majorVertical, majorHorizontal };
    }

    for (let x = 0; x <= canvasSize.width; x += minorStep) {
      minorVertical.push(x);
    }
    for (let y = 0; y <= canvasSize.height; y += minorStep) {
      minorHorizontal.push(y);
    }
    for (let x = 0; x <= canvasSize.width; x += majorStep) {
      majorVertical.push(x);
    }
    for (let y = 0; y <= canvasSize.height; y += majorStep) {
      majorHorizontal.push(y);
    }

    return { minorVertical, minorHorizontal, majorVertical, majorHorizontal };
  }, [canvasSize.height, canvasSize.width]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({
      width: Math.max(0, Math.round(width)),
      height: Math.max(0, Math.round(height)),
    });
  }, []);

  return (
    <View style={styles.container} {...panResponder.panHandlers} onLayout={handleLayout}>
      <Canvas style={StyleSheet.absoluteFill}>
        {gridLines.minorVertical.map((x) => (
          <Line
            key={`grid-minor-v-${x}`}
            p1={{ x, y: 0 }}
            p2={{ x, y: canvasSize.height }}
            color="rgba(254,252,217,0.035)"
            strokeWidth={1}
          />
        ))}
        {gridLines.minorHorizontal.map((y) => (
          <Line
            key={`grid-minor-h-${y}`}
            p1={{ x: 0, y }}
            p2={{ x: canvasSize.width, y }}
            color="rgba(254,252,217,0.035)"
            strokeWidth={1}
          />
        ))}
        {gridLines.majorVertical.map((x) => (
          <Line
            key={`grid-major-v-${x}`}
            p1={{ x, y: 0 }}
            p2={{ x, y: canvasSize.height }}
            color="rgba(249,95,74,0.08)"
            strokeWidth={1}
          />
        ))}
        {gridLines.majorHorizontal.map((y) => (
          <Line
            key={`grid-major-h-${y}`}
            p1={{ x: 0, y }}
            p2={{ x: canvasSize.width, y }}
            color="rgba(249,95,74,0.08)"
            strokeWidth={1}
          />
        ))}
        {renderList.map((element) => renderElement(element))}
        {elements
          .filter((element) => element.type === "sticky")
          .map((element) => {
            if (element.type !== "sticky") return null;
            return (
              <Rect
                key={element.id}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                color={element.color}
                style="fill"
                opacity={0.94}
              />
            );
          })}
        {elements
          .filter((element) => element.type === "sticky")
          .map((element) => {
            if (element.type !== "sticky") return null;
            return (
              <Rect
                key={`${element.id}-border`}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                color="rgba(0,0,0,0.22)"
                style="stroke"
                strokeWidth={1.2}
              />
            );
          })}
      </Canvas>

      {textElements.map((element) => {
        if (element.type === "text") {
          return (
            <RNText
              key={element.id}
              style={{
                position: "absolute",
                left: element.x,
                top: element.y,
                color: element.color,
                fontSize: element.fontSize,
              }}
            >
              {element.text}
            </RNText>
          );
        }

        if (element.type === "sticky") {
          return (
            <RNText
              key={element.id}
              style={{
                position: "absolute",
                left: element.x + 8,
                top: element.y + 8,
                color: element.textColor,
                fontSize: element.fontSize,
              }}
            >
              {element.text}
            </RNText>
          );
        }

        return null;
      })}

      {imageElements.map((element) => {
        if (element.type !== "image") return null;
        return (
          <Image
            key={element.id}
            source={{ uri: element.src }}
            style={{
              position: "absolute",
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              resizeMode: "contain",
            }}
          />
        );
      })}

      {selectionBounds && tool === "select" ? (
        <View
          pointerEvents="none"
          style={[
            styles.selectionBox,
            {
              left: selectionBounds.x,
              top: selectionBounds.y,
              width: Math.max(1, selectionBounds.width),
              height: Math.max(1, selectionBounds.height),
            },
          ]}
        >
          <View style={[styles.selectionHandle, styles.handleTopLeft]} />
          <View style={[styles.selectionHandle, styles.handleTopRight]} />
          <View style={[styles.selectionHandle, styles.handleBottomLeft]} />
          <View style={[styles.selectionHandle, styles.handleBottomRight]} />
        </View>
      ) : null}

      {remoteCursors.map((cursor) => (
        <View
          key={cursor.clientId}
          pointerEvents="none"
          style={[styles.cursor, { transform: [{ translateX: cursor.x }, { translateY: cursor.y }] }]}
        >
          <View style={[styles.cursorDot, { backgroundColor: cursor.color }]} />
          <View style={styles.cursorLabel}>
            <RNText style={styles.cursorLabelText} numberOfLines={1}>
              {cursor.name}
            </RNText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  selectionBox: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(249,95,74,0.95)",
    borderRadius: 6,
  },
  selectionHandle: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: "#F95F4A",
    borderWidth: 1,
    borderColor: "rgba(254,252,217,0.92)",
  },
  handleTopLeft: {
    left: -5,
    top: -5,
  },
  handleTopRight: {
    right: -5,
    top: -5,
  },
  handleBottomLeft: {
    left: -5,
    bottom: -5,
  },
  handleBottomRight: {
    right: -5,
    bottom: -5,
  },
  cursor: {
    position: "absolute",
  },
  cursorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    boxShadow: "0 0 12px rgba(0,0,0,0.4)",
  },
  cursorLabel: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.65)",
    maxWidth: 140,
  },
  cursorLabelText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
});
