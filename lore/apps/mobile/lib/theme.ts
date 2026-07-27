import { useColorScheme } from "react-native";

/** 웹과 같은 정체성(그래파이트 + 앰버)을 네이티브 StyleSheet 값으로. */
const palette = {
  light: {
    bg: "#eceef2",
    surface: "#ffffff",
    surface2: "#f1f2f5",
    border: "#d3d6dc",
    borderStrong: "#b9bdc6",
    text: "#16181d",
    muted: "#666c78",
    faint: "#949aa6",
    amber: "#b5670a",
    amberWeak: "#f4ead7",
    danger: "#c0392b",
  },
  dark: {
    bg: "#0a0b0e",
    surface: "#131519",
    surface2: "#1a1d22",
    border: "#262a31",
    borderStrong: "#363b45",
    text: "#e8eaef",
    muted: "#929aa6",
    faint: "#6a7280",
    amber: "#f0a63c",
    amberWeak: "#2a2010",
    danger: "#f0776a",
  },
};

export type Theme = typeof palette.light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? palette.dark : palette.light;
}
