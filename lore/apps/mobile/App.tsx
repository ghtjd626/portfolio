import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { compileRecordSchema, type FieldDef } from "@lore/schema-core";

// 네이티브에서도 schema-core가 "동일한 코드"로 동작함을 보이는 최소 스모크(ADR-0004/0005).
const demoFields: FieldDef[] = [{ key: "title", label: "내용", type: "text", required: true }];
const ok = compileRecordSchema(demoFields).safeParse({ title: "점심" }).success;

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Lore — Phase 0</Text>
      <Text>schema-core 스모크: {ok ? "통과 ✅" : "실패 ❌"}</Text>
      <StatusBar style="auto" />
    </View>
  );
}
