/** 새 엔티티 id. 브라우저·Node 18+ 모두 지원. */
export function newId(): string {
  return crypto.randomUUID();
}

/** 현재 시각 ISO 문자열. */
export function nowISO(): string {
  return new Date().toISOString();
}

/** LWW 병합: b가 a보다 최신이면 true. */
export function isNewer(a: { updatedAt: string }, b: { updatedAt: string }): boolean {
  return b.updatedAt > a.updatedAt;
}
