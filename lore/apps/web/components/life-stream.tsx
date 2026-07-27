"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { formatWhen, recordHeadline } from "../lib/display";
import type { LocalRecord, LocalRecordType } from "../lib/store/entities";
import { TypeIcon } from "./icons";

/**
 * The Stream — 홈의 시그니처 인터랙션.
 *
 * 이 프로젝트의 핵심 통찰("모든 기록 종류가 하나의 시간축을 공유한다")을 손으로 만든
 * 시간축 시각화로 보여준다. 종류는 lane, 기록은 시간 위의 mark.
 *  - 관성(momentum) 드래그 스크러빙
 *  - 포인터 자기장(magnetism): 커서 근처의 mark가 스프링처럼 부풀어 오른다
 *  - "지금" 펄스 + 스크럽 후 되돌아오기
 *  - 터치(수평 팬) · 키보드 · reduced-motion 대응
 *
 * 성능을 위해 프레임 루프에서 DOM transform을 직접 갱신한다(React 상태 우회).
 */

const DAY = 86_400_000;
const PX_PER_DAY = 92;
const RIGHT_PAD = 64;
const LEFT_PAD = 28;
const TOP = 16;
const BOTTOM = 30;
const MAX_LANES = 6;
const MAGNET_R = 82;

interface Mark {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  headline: string;
  when: string;
}

export function LifeStream({
  types,
  records,
}: {
  types: LocalRecordType[];
  records: LocalRecord[];
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const markEls = useRef<Array<HTMLButtonElement | null>>([]);
  const [size, setSize] = useState({ w: 0, h: 232 });
  const [tip, setTip] = useState<{ headline: string; when: string } | null>(null);
  const reduced = useRef(false);

  // 측정
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lanes = useMemo(() => types.slice(0, MAX_LANES), [types]);
  const laneIndex = useMemo(() => {
    const m = new Map<string, number>();
    lanes.forEach((t, i) => m.set(t.id, i));
    return m;
  }, [lanes]);

  const now = useMemo(() => Date.now(), []);

  const geom = useMemo(() => {
    const w = size.w || 600;
    const h = size.h || 232;
    const laneCount = Math.max(1, lanes.length);
    const laneAreaTop = TOP;
    const laneAreaBottom = h - BOTTOM;
    const laneH = (laneAreaBottom - laneAreaTop) / laneCount;
    const laneCenter = (i: number) => laneAreaTop + laneH * (i + 0.5);

    let maxDaysAgo = 8;
    for (const r of records) {
      const d = (now - new Date(r.occurredAt).getTime()) / DAY;
      if (d > maxDaysAgo) maxDaysAgo = d;
    }
    const minContent = (w - RIGHT_PAD - LEFT_PAD) / PX_PER_DAY;
    if (maxDaysAgo < minContent) maxDaysAgo = minContent;
    const contentW = Math.max(w, RIGHT_PAD + LEFT_PAD + maxDaysAgo * PX_PER_DAY);
    const nowX = contentW - RIGHT_PAD;
    const xForDaysAgo = (d: number) => nowX - d * PX_PER_DAY;

    const marks: Mark[] = [];
    for (const r of records) {
      const li = laneIndex.get(r.typeId);
      if (li === undefined) continue;
      const type = lanes[li]!;
      const daysAgo = (now - new Date(r.occurredAt).getTime()) / DAY;
      marks.push({
        id: r.id,
        x: xForDaysAgo(daysAgo),
        y: laneCenter(li),
        color: type.color ?? "var(--primary)",
        size: 13,
        headline: recordHeadline(type, r),
        when: formatWhen(r.occurredAt),
      });
    }

    const step = maxDaysAgo <= 12 ? 2 : maxDaysAgo <= 45 ? 7 : 30;
    const ticks: { x: number; label: string }[] = [];
    // d=0(오늘)은 "지금" 마커가 소유하므로 건너뛴다(라벨 충돌 방지).
    for (let d = step; d <= Math.ceil(maxDaysAgo); d += step) {
      const date = new Date(now - d * DAY);
      ticks.push({ x: xForDaysAgo(d), label: `${date.getMonth() + 1}/${date.getDate()}` });
    }

    return { w, h, contentW, nowX, laneH, laneCenter, laneCount, marks, ticks, minOffset: w - contentW };
  }, [size, lanes, laneIndex, records, now]);

  // 인터랙션 상태(리렌더 없이)
  const st = useRef({
    offset: 0,
    vel: 0,
    dragging: false,
    moved: false,
    startX: 0,
    startOffset: 0,
    lastX: 0,
    lastT: 0,
    px: -9999,
    py: -9999,
    hovering: false,
    minOffset: 0,
    tipId: null as string | null,
  });

  // geom이 바뀌면 초기 오프셋을 "지금(오른쪽)"으로
  useEffect(() => {
    st.current.minOffset = geom.minOffset;
    st.current.offset = geom.minOffset;
    st.current.vel = 0;
  }, [geom.minOffset]);

  // 애니메이션 루프
  useEffect(() => {
    let raf = 0;
    const clamp = (o: number) => Math.min(0, Math.max(st.current.minOffset, o));

    const loop = () => {
      const s = st.current;
      if (!s.dragging && Math.abs(s.vel) > 0.12) {
        s.offset = clamp(s.offset + s.vel);
        s.vel *= 0.92;
        if (s.offset === 0 || s.offset === s.minOffset) s.vel = 0;
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${s.offset}px,0,0)`;
      }

      const marks = geom.marks;
      let nearest: Mark | null = null;
      let nearestD = 26;
      const doMagnet = s.hovering && !reduced.current;

      for (let i = 0; i < marks.length; i++) {
        const el = markEls.current[i];
        if (!el) continue;
        const m = marks[i]!;
        let scale = 1;
        let lift = 0;
        if (doMagnet) {
          const sx = m.x + s.offset;
          const dx = s.px - sx;
          const dy = s.py - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAGNET_R) {
            const k = 1 - dist / MAGNET_R;
            scale = 1 + k * k * 1.35;
            lift = -k * k * 6;
            if (dist < nearestD) {
              nearestD = dist;
              nearest = m;
            }
          }
        }
        el.style.transform = `translate(-50%,-50%) translateY(${lift.toFixed(2)}px) scale(${scale.toFixed(3)})`;
        el.style.zIndex = scale > 1.05 ? "6" : "";
      }

      const tipEl = tipRef.current;
      if (nearest && doMagnet) {
        if (tipEl) {
          tipEl.style.left = `${nearest.x + s.offset}px`;
          tipEl.style.top = `${nearest.y}px`;
          tipEl.style.opacity = "1";
        }
        if (s.tipId !== nearest.id) {
          s.tipId = nearest.id;
          setTip({ headline: nearest.headline, when: nearest.when });
        }
      } else {
        if (tipEl) tipEl.style.opacity = "0";
        if (s.tipId !== null) {
          s.tipId = null;
          setTip(null);
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [geom]);

  // 포인터 핸들러
  function onPointerDown(e: React.PointerEvent) {
    const s = st.current;
    s.dragging = false;
    s.moved = false;
    s.startX = e.clientX;
    s.startOffset = s.offset;
    s.lastX = e.clientX;
    s.lastT = performance.now();
    s.vel = 0;
  }
  function onPointerMove(e: React.PointerEvent) {
    const s = st.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      s.px = e.clientX - rect.left;
      s.py = e.clientY - rect.top;
      s.hovering = true;
    }
    if (e.buttons & 1) {
      const dx = e.clientX - s.startX;
      if (!s.dragging && Math.abs(dx) > 4) {
        s.dragging = true;
        s.moved = true;
        canvasRef.current?.setPointerCapture(e.pointerId);
        canvasRef.current?.classList.add("dragging");
      }
      if (s.dragging) {
        s.offset = Math.min(0, Math.max(s.minOffset, s.startOffset + dx));
        const t = performance.now();
        const dt = t - s.lastT;
        if (dt > 0) s.vel = ((e.clientX - s.lastX) / dt) * 16 * (reduced.current ? 0 : 1);
        s.lastX = e.clientX;
        s.lastT = t;
      }
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    const s = st.current;
    if (s.dragging) {
      canvasRef.current?.releasePointerCapture(e.pointerId);
      canvasRef.current?.classList.remove("dragging");
    }
    s.dragging = false;
  }
  function onPointerLeave() {
    const s = st.current;
    s.hovering = false;
    s.px = -9999;
    s.py = -9999;
  }

  function goNow() {
    // 부드럽게 최근(오른쪽)으로
    const s = st.current;
    s.vel = (s.minOffset - s.offset) * 0.14;
    const animate = () => {
      s.offset = s.offset + (s.minOffset - s.offset) * 0.18;
      if (Math.abs(s.offset - s.minOffset) < 0.5) s.offset = s.minOffset;
      else requestAnimationFrame(animate);
    };
    animate();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const s = st.current;
    if (e.key === "ArrowLeft") {
      s.offset = Math.min(0, s.offset + PX_PER_DAY);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      s.offset = Math.max(s.minOffset, s.offset - PX_PER_DAY);
      e.preventDefault();
    } else if (e.key === "Home") {
      goNow();
      e.preventDefault();
    }
  }

  const hasRecords = geom.marks.length > 0;

  return (
    <div className="stream-wrap reveal">
      <div className="stream-head">
        <div className="stream-kicker">
          <span className="t">The Stream</span>
          <span className="big">시간 위의 나</span>
        </div>
        <span className="stream-range">모든 종류 · 하나의 축</span>
      </div>

      <div
        className="stream-canvas"
        ref={canvasRef}
        role="group"
        aria-label="기록 시간축. 드래그하거나 방향키로 시간을 이동하세요."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
      >
        <div className="stream-lanes">
          {lanes.map((t, i) => (
            <div key={t.id} className="lane" style={{ top: geom.laneCenter(i) - geom.laneH / 2 }}>
              <span className="lane-label">
                <span
                  className="lane-ico"
                  style={{ color: t.color ?? "var(--primary)" }}
                >
                  <TypeIcon icon={t.icon} size={14} />
                </span>
                {t.name}
              </span>
            </div>
          ))}
        </div>

        <div className="stream-track" ref={trackRef}>
          {geom.ticks.map((tk, i) => (
            <div key={i} className="daytick" style={{ left: tk.x }}>
              <span className="lbl">{tk.label}</span>
            </div>
          ))}
          <div className="now-line" style={{ left: geom.nowX }} />
          <div className="now-dot" style={{ left: geom.nowX, top: TOP + 2 }} />
          <span className="now-tag" style={{ left: geom.nowX }}>지금</span>

          {geom.marks.map((m, i) => (
            <button
              key={m.id}
              ref={(el) => {
                markEls.current[i] = el;
              }}
              className="mark"
              style={
                {
                  left: m.x,
                  top: m.y,
                  width: m.size,
                  height: m.size,
                  "--mk": m.color,
                } as React.CSSProperties & Record<`--${string}`, string>
              }
              aria-label={`${m.headline} · ${m.when}`}
              onClick={() => {
                if (!st.current.moved) router.push(`/record/${m.id}`);
              }}
            />
          ))}
        </div>

        <div className="stream-tip" ref={tipRef} style={{ opacity: 0 }}>
          {tip?.headline}
          {tip?.when && <span className="m">{tip.when}</span>}
        </div>

        {!hasRecords && (
          <div className="stream-empty">
            <div className="big">아직 이 축은 비어 있어요</div>
            <div className="e">첫 기록을 남기면 여기 시간 위에 나타나요.</div>
          </div>
        )}
      </div>

      <div className="stream-foot">
        <span className="stream-hint">← 드래그로 과거를 스크럽 · 점 위에 커서를 올려보세요</span>
        <button className="stream-now-btn" type="button" onClick={goNow}>
          지금으로 ⟶
        </button>
      </div>
    </div>
  );
}
