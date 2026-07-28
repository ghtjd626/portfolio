import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

/**
 * 정적 클라이언트 빌드 타깃 (ADR-0010).
 *
 * Lore는 local-first라 클라이언트가 서버 없이 동작한다 → 그대로 정적 자산으로 빌드해
 * 아무 CDN/edge/GitHub Pages에 올릴 수 있다. 프로덕션 SSR/서버리스 타깃(apps/web, Vercel)과
 * 컴포넌트·@lore/schema-core를 공유하고, Next 전용 API(라우터/링크)만 얇은 어댑터(shim)로 대체한다.
 *
 * base는 배포 경로에 맞춰 주입(GitHub Pages 프로젝트 사이트는 "/<repo>/").
 */
export default defineConfig({
  root: __dirname,
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@lore/schema-core": path.resolve(__dirname, "../../packages/schema-core/src/index.ts"),
      "next/link": path.resolve(__dirname, "src/shims/link.tsx"),
      "next/navigation": path.resolve(__dirname, "src/shims/navigation.tsx"),
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
  },
});
