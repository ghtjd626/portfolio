/** @type {import('next').NextConfig} */
const nextConfig = {
  // 모노레포 패키지를 별도 빌드 없이 소스로 트랜스파일한다(main이 src를 가리킴).
  transpilePackages: ["@lore/schema-core", "@lore/db", "@lore/ui"],
  // 린트는 루트 flat config로 별도 수행(turbo lint). 빌드는 타입체크에 집중.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
