"use client";

import type { FieldDef, FieldType } from "@lore/schema-core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createRecordType,
  type RecordTypeInput,
  updateRecordType,
} from "../lib/service/record-types";
import type { LocalRecordType } from "../lib/store/entities";
import { useData } from "./data-provider";

const TYPE_LABELS: Record<FieldType, string> = {
  text: "한 줄 텍스트",
  longtext: "긴 텍스트",
  number: "숫자",
  money: "금액",
  boolean: "예/아니오",
  date: "날짜",
  datetime: "날짜+시간",
  select: "선택 (하나)",
  multiselect: "선택 (여럿)",
};

const COLORS = [
  "#16a34a",
  "#2563eb",
  "#9333ea",
  "#dc2626",
  "#ea580c",
  "#0d9488",
  "#db2777",
  "#475569",
];

const genKey = () => "f" + Math.random().toString(36).slice(2, 9);
const genOpt = () => "o" + Math.random().toString(36).slice(2, 7);

interface EditField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: { value: string; label: string }[];
  defaultCurrency?: string;
}

function toEdit(f: FieldDef): EditField {
  return {
    key: f.key,
    label: f.label,
    type: f.type,
    required: Boolean(f.required),
    options: f.type === "select" || f.type === "multiselect" ? f.options : [],
    defaultCurrency: f.type === "money" ? f.defaultCurrency : undefined,
  };
}

function toFieldDef(f: EditField): FieldDef {
  const base = { key: f.key, label: f.label.trim(), required: f.required };
  switch (f.type) {
    case "select":
    case "multiselect":
      return { ...base, type: f.type, options: f.options };
    case "money":
      return { ...base, type: "money", defaultCurrency: f.defaultCurrency ?? "KRW" };
    case "number":
      return { ...base, type: "number" };
    case "boolean":
      return { ...base, type: "boolean" };
    case "date":
    case "datetime":
      return { ...base, type: f.type };
    case "text":
    case "longtext":
      return { ...base, type: f.type };
  }
}

function newField(): EditField {
  return { key: genKey(), label: "", type: "text", required: false, options: [] };
}

export function RecordTypeForm({ existing }: { existing?: LocalRecordType }) {
  const router = useRouter();
  const { refresh, toast } = useData();

  const [name, setName] = useState(existing?.name ?? "");
  const [icon, setIcon] = useState(existing?.icon ?? "🗂️");
  const [color, setColor] = useState(existing?.color ?? COLORS[0]);
  const [fields, setFields] = useState<EditField[]>(
    existing ? existing.fields.map(toEdit) : [{ ...newField(), label: "" }],
  );
  const [saving, setSaving] = useState(false);

  const patch = (i: number, p: Partial<EditField>) =>
    setFields((fs) => fs.map((f, idx) => (idx === i ? { ...f, ...p } : f)));
  const remove = (i: number) => setFields((fs) => fs.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setFields((fs) => {
      const j = i + dir;
      if (j < 0 || j >= fs.length) return fs;
      const copy = [...fs];
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
      return copy;
    });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const input: RecordTypeInput = {
      name,
      icon: icon.trim() || undefined,
      color,
      fields: fields.map(toFieldDef),
    };
    try {
      if (existing) {
        await updateRecordType(existing.id, input);
        refresh();
        toast("수정했어요");
        router.push(`/type/${existing.id}`);
      } else {
        const created = await createRecordType(input);
        refresh();
        toast("새 종류를 만들었어요");
        router.push(`/type/${created.id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? (err.message.split("\n")[0] ?? err.message) : "저장에 실패했어요";
      toast(msg);
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="field">
        <label className="field-label" htmlFor="rt-name">
          종류 이름 <span className="field-req">*</span>
        </label>
        <input
          id="rt-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 운동 기록, 독서, 지출…"
        />
      </div>

      <div className="fb-grid">
        <div className="field">
          <label className="field-label" htmlFor="rt-icon">
            아이콘
          </label>
          <input
            id="rt-icon"
            className="input"
            value={icon}
            maxLength={2}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🗂️"
          />
        </div>
        <div className="field">
          <span className="field-label">색상</span>
          <div className="segmented">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`색상 ${c}`}
                onClick={() => setColor(c)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: c,
                  border: color === c ? "3px solid var(--text)" : "2px solid var(--border)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="row-between" style={{ marginTop: 8 }}>
        <span className="section-title" style={{ margin: 0 }}>
          필드 ({fields.length})
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setFields((fs) => [...fs, newField()])}
        >
          + 필드 추가
        </button>
      </div>

      {fields.map((f, i) => (
        <FieldEditor
          key={f.key}
          field={f}
          index={i}
          count={fields.length}
          onPatch={(p) => patch(i, p)}
          onRemove={() => remove(i)}
          onMove={(d) => move(i, d)}
        />
      ))}

      <div className="form-actions">
        <button className="btn btn-ghost" type="button" onClick={() => router.back()}>
          취소
        </button>
        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? "저장 중…" : existing ? "수정" : "만들기"}
        </button>
      </div>
    </form>
  );
}

function FieldEditor({
  field,
  index,
  count,
  onPatch,
  onRemove,
  onMove,
}: {
  field: EditField;
  index: number;
  count: number;
  onPatch: (p: Partial<EditField>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const hasOptions = field.type === "select" || field.type === "multiselect";
  return (
    <div className="fb-field">
      <div className="fb-grid">
        <div className="field">
          <span className="field-hint">라벨</span>
          <input
            className="input"
            value={field.label}
            onChange={(e) => onPatch({ label: e.target.value })}
            placeholder="필드 이름"
          />
        </div>
        <div className="field">
          <span className="field-hint">타입</span>
          <select
            className="select"
            value={field.type}
            onChange={(e) => {
              const type = e.target.value as FieldType;
              const willHaveOptions = type === "select" || type === "multiselect";
              onPatch({
                type,
                options:
                  willHaveOptions && field.options.length === 0
                    ? [{ value: genOpt(), label: "" }]
                    : field.options,
              });
            }}
          >
            {(Object.keys(TYPE_LABELS) as FieldType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasOptions && (
        <div className="fb-options">
          <span className="field-hint">선택 항목</span>
          {field.options.map((opt, oi) => (
            <div className="fb-opt-row" key={opt.value}>
              <input
                className="input"
                value={opt.label}
                placeholder={`항목 ${oi + 1}`}
                onChange={(e) =>
                  onPatch({
                    options: field.options.map((o, idx) =>
                      idx === oi ? { ...o, label: e.target.value } : o,
                    ),
                  })
                }
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-label="항목 삭제"
                onClick={() =>
                  onPatch({ options: field.options.filter((_, idx) => idx !== oi) })
                }
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              onPatch({ options: [...field.options, { value: genOpt(), label: "" }] })
            }
          >
            + 항목
          </button>
        </div>
      )}

      <div className="row-between">
        <label className="pill" style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onPatch({ required: e.target.checked })}
            style={{ accentColor: "var(--primary)" }}
          />
          필수
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label="위로"
          >
            ↑
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            aria-label="아래로"
          >
            ↓
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onRemove}
            aria-label="필드 삭제"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
