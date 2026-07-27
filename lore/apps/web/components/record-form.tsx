"use client";

import { emptyRecordData, type FieldDef, type Money } from "@lore/schema-core";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createRecord, RecordValidationError, updateRecord } from "../lib/service/records";
import type { LocalRecord, LocalRecordType } from "../lib/store/entities";
import { useData } from "./data-provider";

/** ISO ↔ datetime-local(input) 변환. */
function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function localInputToISO(local: string): string {
  return new Date(local).toISOString();
}

export function RecordForm({
  type,
  record,
}: {
  type: LocalRecordType;
  record?: LocalRecord;
}) {
  const router = useRouter();
  const { refresh, toast } = useData();

  const [title, setTitle] = useState(record?.title ?? "");
  const [occurredLocal, setOccurredLocal] = useState(
    isoToLocalInput(record?.occurredAt ?? new Date().toISOString()),
  );
  const [data, setData] = useState<Record<string, unknown>>(
    record ? { ...record.data } : emptyRecordData(type.fields),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const setField = (key: string, value: unknown) =>
    setData((d) => ({ ...d, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const input = {
      title: title.trim() || undefined,
      occurredAt: localInputToISO(occurredLocal),
      data,
    };
    try {
      if (record) await updateRecord(record.id, input);
      else await createRecord(type.id, input);
      refresh();
      toast(record ? "수정했어요" : "기록했어요");
      router.push(`/type/${type.id}`);
    } catch (err) {
      if (err instanceof RecordValidationError) {
        setErrors(err.issues);
      } else {
        toast(err instanceof Error ? err.message : "저장에 실패했어요");
      }
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="field">
        <label className="field-label" htmlFor="rec-title">
          제목 <span className="muted" style={{ fontWeight: 400 }}>(선택)</span>
        </label>
        <input
          id="rec-title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="한 줄 제목"
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="rec-when">
          시각
        </label>
        <input
          id="rec-when"
          className="input"
          type="datetime-local"
          value={occurredLocal}
          onChange={(e) => setOccurredLocal(e.target.value)}
        />
      </div>

      {type.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={data[field.key]}
          error={errors[field.key]}
          onChange={(v) => setField(field.key, v)}
        />
      ))}

      <div className="form-actions">
        <button className="btn btn-ghost" type="button" onClick={() => router.back()}>
          취소
        </button>
        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? "저장 중…" : record ? "수정" : "기록"}
        </button>
      </div>
    </form>
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
  const currency = useMemo(
    () => (field.type === "money" ? field.defaultCurrency ?? "KRW" : "KRW"),
    [field],
  );
  const label = (
    <label className="field-label" htmlFor={`f-${field.key}`}>
      {field.label}
      {field.required && <span className="field-req">*</span>}
    </label>
  );

  let control: React.ReactNode;
  switch (field.type) {
    case "longtext":
      control = (
        <textarea
          id={`f-${field.key}`}
          className={`textarea ${error ? "invalid" : ""}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      );
      break;
    case "number":
      control = (
        <input
          id={`f-${field.key}`}
          className={`input ${error ? "invalid" : ""}`}
          type="number"
          inputMode="decimal"
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );
      break;
    case "money": {
      const money = value as Money | undefined;
      control = (
        <div className="money-input">
          <span className="cur">{currency === "KRW" ? "₩" : currency}</span>
          <input
            id={`f-${field.key}`}
            className={`input ${error ? "invalid" : ""}`}
            type="number"
            inputMode="decimal"
            value={money?.amount === undefined ? "" : String(money.amount)}
            onChange={(e) =>
              onChange(
                e.target.value === ""
                  ? undefined
                  : { amount: Number(e.target.value), currency },
              )
            }
          />
        </div>
      );
      break;
    }
    case "boolean":
      control = (
        <div className="switch-row">
          <span>{value ? "예" : "아니오"}</span>
          <input
            id={`f-${field.key}`}
            className="switch"
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
        </div>
      );
      break;
    case "date":
      control = (
        <input
          id={`f-${field.key}`}
          className={`input ${error ? "invalid" : ""}`}
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      );
      break;
    case "datetime":
      control = (
        <input
          id={`f-${field.key}`}
          className={`input ${error ? "invalid" : ""}`}
          type="datetime-local"
          value={value ? isoToLocalInput(value as string) : ""}
          onChange={(e) => onChange(e.target.value ? localInputToISO(e.target.value) : undefined)}
        />
      );
      break;
    case "select":
      control = (
        <div className="segmented">
          {field.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`seg ${value === opt.value ? "active" : ""}`}
              onClick={() => onChange(value === opt.value && !field.required ? undefined : opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
      break;
    case "multiselect": {
      const arr = (value as string[] | undefined) ?? [];
      control = (
        <div className="segmented">
          {field.options.map((opt) => {
            const on = arr.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                className={`seg ${on ? "active" : ""}`}
                onClick={() =>
                  onChange(on ? arr.filter((v) => v !== opt.value) : [...arr, opt.value])
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
      break;
    }
    default:
      control = (
        <input
          id={`f-${field.key}`}
          className={`input ${error ? "invalid" : ""}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      );
  }

  return (
    <div className="field">
      {label}
      {field.description && <div className="field-hint">{field.description}</div>}
      {control}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
