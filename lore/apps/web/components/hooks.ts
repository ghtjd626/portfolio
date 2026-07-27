"use client";

import { useEffect, useState } from "react";
import type { LocalRecord, LocalRecordType } from "../lib/store/entities";
import { getRecordType, listRecordTypes } from "../lib/service/record-types";
import { getRecord, listAllRecords, listRecordsByType } from "../lib/service/records";
import { useData } from "./data-provider";

/** revision/ready가 바뀌면 다시 읽는 범용 로더. */
function useAsync<T>(fn: () => Promise<T>, initial: T, deps: unknown[]) {
  const { revision, ready } = useData();
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fn()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, ready, ...deps]);
  return { data, loading };
}

export function useRecordTypes() {
  return useAsync<LocalRecordType[]>(() => listRecordTypes(), [], []);
}

export function useRecordType(id: string) {
  return useAsync<LocalRecordType | undefined>(() => getRecordType(id), undefined, [id]);
}

export function useRecordsByType(typeId: string) {
  return useAsync<LocalRecord[]>(() => listRecordsByType(typeId), [], [typeId]);
}

export function useRecord(id: string) {
  return useAsync<LocalRecord | undefined>(() => getRecord(id), undefined, [id]);
}

export function useAllRecords() {
  return useAsync<LocalRecord[]>(() => listAllRecords(), [], []);
}
