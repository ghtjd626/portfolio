import { type ComponentType, useMemo } from "react";
import { AppShell } from "../../web/components/app-shell";
import { DataProvider } from "../../web/components/data-provider";
import Dashboard from "../../web/app/page";
import QuickAdd from "../../web/app/new/page";
import RecordDetail from "../../web/app/record/[recordId]/page";
import Settings from "../../web/app/settings/page";
import EditType from "../../web/app/type/[typeId]/edit/page";
import NewRecord from "../../web/app/type/[typeId]/record/new/page";
import TypeRecords from "../../web/app/type/[typeId]/page";
import NewType from "../../web/app/type/new/page";
import { __setParams, usePathname } from "./shims/navigation";

function match(path: string): { Comp: ComponentType; params: Record<string, string> } {
  const seg = path.split("/").filter(Boolean);
  if (path === "/") return { Comp: Dashboard, params: {} };
  if (path === "/new") return { Comp: QuickAdd, params: {} };
  if (path === "/settings") return { Comp: Settings, params: {} };
  if (path === "/type/new") return { Comp: NewType, params: {} };
  if (seg[0] === "type" && seg[2] === "edit" && seg[1]) {
    return { Comp: EditType, params: { typeId: seg[1] } };
  }
  if (seg[0] === "type" && seg[2] === "record" && seg[3] === "new" && seg[1]) {
    return { Comp: NewRecord, params: { typeId: seg[1] } };
  }
  if (seg[0] === "type" && seg.length === 2 && seg[1]) {
    return { Comp: TypeRecords, params: { typeId: seg[1] } };
  }
  if (seg[0] === "record" && seg.length === 2 && seg[1]) {
    return { Comp: RecordDetail, params: { recordId: seg[1] } };
  }
  return { Comp: Dashboard, params: {} };
}

export default function App() {
  const path = usePathname();
  const { Comp, params } = useMemo(() => match(path), [path]);
  __setParams(params);
  return (
    <DataProvider>
      <AppShell>
        <Comp key={path} />
      </AppShell>
    </DataProvider>
  );
}
