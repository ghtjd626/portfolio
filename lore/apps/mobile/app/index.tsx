import { Link, useFocusEffect } from "expo-router";
import { type ReactNode, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { formatWhen, recordHeadline } from "../lib/display";
import { countByType, listRecent, listTypes, type RecordRow, type TypeRow } from "../lib/store";
import { useTheme } from "../lib/theme";

export default function HomeScreen() {
  const t = useTheme();
  const [types, setTypes] = useState<TypeRow[]>([]);
  const [recent, setRecent] = useState<RecordRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const [ty, rc, cnt] = await Promise.all([listTypes(), listRecent(8), countByType()]);
        if (alive) {
          setTypes(ty);
          setRecent(rc);
          setCounts(cnt);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const byId = new Map(types.map((x) => [x.id, x]));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }}
    >
      <SectionLabel theme={t}>종류</SectionLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {types.map((ty) => (
          <Link key={ty.id} href={`/type/${ty.id}`} asChild>
            <Pressable
              style={{
                width: "47%",
                flexGrow: 1,
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.border,
                borderRadius: 12,
                padding: 15,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  backgroundColor: ty.color + "26",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: ty.color }}
                />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: t.text, fontWeight: "700", fontSize: 15 }}>{ty.name}</Text>
                <Text style={{ color: t.faint, fontSize: 13 }}>{counts[ty.id] ?? 0}</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>

      <SectionLabel theme={t}>최근 기록</SectionLabel>
      {recent.length === 0 ? (
        <View style={{ padding: 32, alignItems: "center" }}>
          <Text style={{ color: t.muted }}>아직 기록이 없어요.</Text>
          <Text style={{ color: t.faint, fontSize: 13, marginTop: 4 }}>
            종류를 눌러 첫 기록을 남겨보세요.
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
          {recent.map((r, i) => {
            const ty = byId.get(r.typeId);
            return (
              <Link key={r.id} href={`/type/${r.typeId}`} asChild>
                <Pressable
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: t.border,
                  }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      backgroundColor: ty?.color ?? t.amber,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontWeight: "600" }} numberOfLines={1}>
                      {ty ? recordHeadline(ty, r) : "기록"}
                    </Text>
                    <Text style={{ color: t.muted, fontSize: 12.5, marginTop: 1 }}>
                      {ty?.name} · {formatWhen(r.occurredAt)}
                    </Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function SectionLabel({
  theme,
  children,
}: {
  theme: ReturnType<typeof useTheme>;
  children: ReactNode;
}) {
  return (
    <Text
      style={{
        color: theme.faint,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
        marginTop: 16,
        marginBottom: 2,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}
