import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { DynamicForm } from "../../components/DynamicForm";
import { getType, type TypeRow } from "../../lib/store";
import { useTheme } from "../../lib/theme";

export default function NewRecordScreen() {
  const t = useTheme();
  const { typeId } = useLocalSearchParams<{ typeId: string }>();
  const [type, setType] = useState<TypeRow | undefined>();

  useEffect(() => {
    getType(typeId).then(setType).catch(() => undefined);
  }, [typeId]);

  if (!type) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  return (
    <>
      <Stack.Screen options={{ title: `${type.name} 기록` }} />
      <DynamicForm type={type} />
    </>
  );
}
