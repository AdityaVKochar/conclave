
export interface HotkeyDefinition {
  keys: string;
  label: string;
  description: string;
}

export type HotkeyAction =
  | "toggleMute"
  | "toggleCamera"
  | "toggleHandRaise"
  | "toggleChat"
  | "toggleLockMeeting"
  | "toggleReactions"
  | "toggleScreenShare"
  | "toggleApps"
  | "toggleMiniView"
  | "toggleParticipants";

export const HOTKEYS: Record<HotkeyAction, HotkeyDefinition> = {
  toggleMute: {
    keys: "Mod+D",
    label: "Mute / Unmute",
    description: "Toggle your microphone on or off.",
  },
  toggleCamera: {
    keys: "Mod+E",
    label: "Camera on / off",
    description: "Toggle your camera on or off.",
  },
  toggleHandRaise: {
    keys: "Mod+H",
    label: "Raise / Lower hand",
    description: "Raise or lower your hand to get the presenter's attention.",
  },
  toggleChat: {
    keys: "Mod+Shift+C",
    label: "Chat",
    description: "Open or close the chat panel.",
  },
  toggleParticipants: {
    keys: "Mod+Shift+P",
    label: "Participants",
    description: "Open or close the participants panel.",
  },
  toggleLockMeeting: {
    keys: "Mod+Shift+L",
    label: "Lock Meeting",
    description: "To lock the meeting, so no one can enter the meeting",
  },
  toggleScreenShare: {
    keys: "Mod+Shift+S",
    label: "Share Screen",
    description: "Open or close the participants panel.",
  },
  toggleReactions: {
    keys: "",
    label: "Reactions",
    description: "Panel to emote with multiple reations",
  },
  toggleApps: {
    keys: "",
    label: "Apps",
    description: "See different apps to be used",
  },
  toggleMiniView: {
    keys: "Mod+M",
    label: "Pop out Mini-view",
    description: "Pops out a mini view panel.",
  },
} as const;

export const HOTKEY_LIST: (HotkeyDefinition & { action: HotkeyAction })[] =
  (Object.entries(HOTKEYS) as [HotkeyAction, HotkeyDefinition][]).map(
    ([action, definition]) => ({ action, ...definition }),
  );
