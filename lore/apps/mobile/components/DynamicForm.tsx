import { compileRecordSchema, emptyRecordData, type FieldDef, type Money } from "@lore/schema-core";
import { useRouter } from "expo-router";
import { type ReactNode, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { addRecord, type TypeRow } from "../lib/store";
import { useTheme } from "../lib/theme";

/**
 * 동적 폼(네이티브) — FieldDef[]에서 입력 UI를 만들고, 저장 시
 * @lore/schema-core의 compileRecordSchema로 검증한다. 웹과 "같은 검증 코드".
 */
export function DynamicForm({ type }: { type: TypeRow }) {
  const t = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [data, setData] = useState<Record<string, unknown>>(emptyRecordData(type.fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setData((d) => ({ ...d, [k]: v }));

  async function save() {
    setSaving(true);
    setErrors({});
    const result = compileRecordSchema(type.fields).safeParse(data);
    if (!result.success) {
      const e: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const k = String(issue.path[0] ?? "");
        if (k && !e[k]) e[k] = issue.message;
      }
      setErrors(e);
      setSaving(false);
      return;
    }
    await addRecord(type.id, {
      title: title.trim() || undefined,
      occurredAt: new Date().toISOString(),
      data: result.data as Record<string, unknown>,
    });
    router.replace(`/type/${type.id}`);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 40 }}
    >
      <Field label="제목 (선택)" theme={t}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="한 줄 제목"
          placeholderTextColor={t.faint}
          style={inputStyle(t)}
        />
      </Field>

      {type.fields.map((f) => (
        <FieldInput
          key={f.key}
          field={f}
          value={data[f.key]}
          error={errors[f.key]}
          onChange={(v) => set(f.key, v)}
        />
      ))}

      <Pressable
        onPress={save}
        disabled={saving}
        style={({ pressed }) => ({
          backgroundColor: t.amber,
          borderRadius: 12,
          paddingVertical: 15,
          alignItems: "center",
          opacity: pressed || saving ? 0.85 : 1,
          marginTop: 4,
        })}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          {saving ? "저장 중…" : "기록"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  required,
  error,
  theme,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  theme: ReturnType<typeof useTheme>;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>
        {label}
        {required ? <Text style={{ color: theme.amber }}> *</Text> : null}
      </Text>
      {children}
      {error ? <Text style={{ color: theme.danger, fontSize: 12.5 }}>{error}</Text> : null}
    </View>
  );
}

function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  error?: string;
  onChange: (v: unknown) => void;
}) {
  const t = useTheme();
  let control: ReactNode;

  switch (field.type) {
    case "longtext":
      control = (
        <TextInput
          value={(value as string) ?? ""}
          onChangeText={(v) => onChange(v || undefined)}
          multiline
          style={[inputStyle(t), { minHeight: 96, textAlignVertical: "top" }]}
          placeholderTextColor={t.faint}
        />
      );
      break;
    case "number":
      control = (
        <TextInput
          value={value == null ? "" : String(value)}
          onChangeText={(v) => onChange(v === "" ? undefined : Number(v))}
          keyboardType="numeric"
          style={inputStyle(t)}
        />
      );
      break;
    case "money": {
      const m = value as Money | undefined;
      const cur = field.defaultCurrency ?? "KRW";
      control = (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ color: t.muted, fontWeight: "700", fontSize: 16 }}>
            {cur === "KRW" ? "₩" : cur}
          </Text>
          <TextInput
            value={m?.amount == null ? "" : String(m.amount)}
            onChangeText={(v) =>
              onChange(v === "" ? undefined : { amount: Number(v), currency: cur })
            }
            keyboardType="numeric"
            style={[inputStyle(t), { flex: 1 }]}
          />
        </View>
      );
      break;
    }
    case "boolean":
      control = (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            ...cardStyle(t),
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: t.text }}>{value ? "예" : "아니오"}</Text>
          <Switch
            value={Boolean(value)}
            onValueChange={onChange}
            trackColor={{ true: t.amber, false: t.border }}
          />
        </View>
      );
      break;
    case "select":
      control = (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {field.options.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              active={value === o.value}
              onPress={() => onChange(value === o.value && !field.required ? undefined : o.value)}
            />
          ))}
        </View>
      );
      break;
    case "multiselect": {
      const arr = (value as string[] | undefined) ?? [];
      control = (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {field.options.map((o) => {
            const on = arr.includes(o.value);
            return (
              <Chip
                key={o.value}
                label={o.label}
                active={on}
                onPress={() =>
                  onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])
                }
              />
            );
          })}
        </View>
      );
      break;
    }
    default:
      control = (
        <TextInput
          value={(value as string) ?? ""}
          onChangeText={(v) => onChange(v || undefined)}
          style={inputStyle(t)}
          placeholderTextColor={t.faint}
        />
      );
  }

  return (
    <Field label={field.label} required={field.required} error={error} theme={t}>
      {control}
    </Field>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: active ? t.amber : t.border,
        backgroundColor: active ? t.amberWeak : t.surface,
      }}
    >
      <Text style={{ color: active ? t.amber : t.muted, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

function inputStyle(t: ReturnType<typeof useTheme>) {
  return {
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 16,
    color: t.text,
  } as const;
}
function cardStyle(t: ReturnType<typeof useTheme>) {
  return {
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 8,
    paddingHorizontal: 13,
  } as const;
}
