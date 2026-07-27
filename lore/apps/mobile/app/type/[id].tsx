import { Link, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { formatWhen, recordHeadline } from "../../lib/display";
import { getType, listRecords, type RecordRow, type TypeRow } from "../../lib/store";
import { useTheme } from "../../lib/theme";

export default function TypeScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [type, setType] = useState<TypeRow | undefined>();
  const [records, setRecords] = useState<RecordRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const ty = await getType(id);
        const rs = await listRecords(id);
        if (alive) {
          setType(ty);
          setRecords(rs);
        }
      })();
      return () => {
        alive = false;
      };
    }, [id]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ title: type?.name ?? "" }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {records.length === 0 ? (
          <View style={{ padding: 44, alignItems: "center" }}>
            <Text style={{ color: t.muted, fontWeight: "600" }}>첫 기록을 남겨보세요</Text>
            <Text style={{ color: t.faint, fontSize: 13, marginTop: 4 }}>
              오른쪽 아래 + 버튼으로 추가
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {records.map((r, i) => (
              <View
                key={r.id}
                style={{ padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.border }}
              >
                <Text style={{ color: t.text, fontWeight: "600" }}>
                  {type ? recordHeadline(type, r) : ""}
                </Text>
                <Text style={{ color: t.muted, fontSize: 12.5, marginTop: 2 }}>
                  {formatWhen(r.occurredAt)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {type ? (
        <Link href={`/record/new?typeId=${type.id}`} asChild>
          <Pressable
            style={{
              position: "absolute",
              right: 20,
              bottom: 28,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: t.amber,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 5,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 30, marginTop: -2 }}>+</Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
