/** @type {import('next').NextConfig} */
const nextConfig = {
  // 모노레포 패키지를 별도 빌드 없이 소스로 트랜스파일한다(main이 src를 가리킴).
  transpilePackages: ["@lore/schema-core", "@lore/db", "@lore/ui"],
};

export default nextConfig;
