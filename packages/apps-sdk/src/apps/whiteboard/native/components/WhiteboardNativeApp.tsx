import React, { useMemo } from "react";
import { StyleSheet, View, Pressable, Text, ScrollView } from "react-native";
import { useAppDoc } from "../../../../sdk/hooks/useAppDoc";
import { useAppPresence } from "../../../../sdk/hooks/useAppPresence";
import { useApps } from "../../../../sdk/hooks/useApps";
import { useToolState } from "../../shared/hooks/useToolState";
import { WhiteboardNativeCanvas } from "./WhiteboardNativeCanvas";
import { WhiteboardNativeToolbar } from "./WhiteboardNativeToolbar";
import { useWhiteboardPages } from "../../shared/hooks/useWhiteboardPages";

export function WhiteboardNativeApp() {
  const { user, isAdmin } = useApps();
  const { doc, awareness, locked } = useAppDoc("whiteboard");
  const { states } = useAppPresence("whiteboard");
  const { tool, setTool, settings, setSettings } = useToolState();
  const isReadOnly = locked && !isAdmin;
  const { pages, activePageId, createPage, setActive, deletePage } = useWhiteboardPages(
    doc,
    { readOnly: isReadOnly }
  );

  const activePage = useMemo(() => {
    return pages.find((page) => page.id === activePageId) ?? pages[0];
  }, [pages, activePageId]);

  const handleExport = () => {
    // TODO: implement native export to PNG/PDF
  };

  if (!activePage) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Loading whiteboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Whiteboard</Text>
        <View style={styles.headerActive}>
          <View style={styles.headerDot} />
          <Text style={styles.headerMeta}>{states.length} active</Text>
        </View>
        {locked ? (
          <View style={styles.lockedPill}>
            <Text style={styles.lockedText}>Locked</Text>
          </View>
        ) : null}
      </View>
      <WhiteboardNativeToolbar
        tool={tool}
        onToolChange={setTool}
        settings={settings}
        onSettingsChange={setSettings}
        locked={isReadOnly}
        onExport={handleExport}
      />
      <View style={styles.pageRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pageScrollContent}
        >
          {pages.map((page) => (
            <Pressable
              key={page.id}
              onPress={() => setActive(page.id)}
              style={[styles.pageButton, page.id === activePage.id && styles.pageButtonActive]}
            >
              <Text style={styles.pageText}>{page.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.pageActions}>
          <Pressable
            onPress={() => createPage()}
            disabled={isReadOnly}
            style={[styles.pageButton, styles.pageActionButton, isReadOnly && styles.buttonDisabled]}
          >
            <Text style={styles.pageText}>+ Page</Text>
          </Pressable>
          <Pressable
            onPress={() => deletePage(activePage.id)}
            disabled={isReadOnly || pages.length <= 1}
            style={[
              styles.pageButton,
              styles.pageActionButton,
              (isReadOnly || pages.length <= 1) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.pageText}>Delete</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.canvasContainer}>
        <WhiteboardNativeCanvas
          doc={doc}
          awareness={awareness}
          pageId={activePage.id}
          tool={tool}
          settings={settings}
          locked={isReadOnly}
          user={user}
          states={states}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060606",
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 6,
  },
  headerLabel: {
    color: "rgba(254,252,217,0.65)",
    fontSize: 11,
    letterSpacing: 2.8,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  headerActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(74, 222, 128, 0.85)",
  },
  headerMeta: {
    color: "rgba(254,252,217,0.5)",
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  lockedPill: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.35)",
    backgroundColor: "rgba(251,191,36,0.12)",
  },
  lockedText: {
    color: "rgba(253,230,138,0.95)",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#FEFCD9",
  },
  pageRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 6,
  },
  pageScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 4,
  },
  pageActions: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  pageButtonActive: {
    backgroundColor: "#F95F4A",
  },
  pageActionButton: {
    minWidth: 64,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  pageText: {
    color: "#FEFCD9",
    fontSize: 12,
  },
  canvasContainer: {
    flex: 1,
  },
});
