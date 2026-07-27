import js from "@eslint/js";
import tseslint from "typescript-eslint";

// 루트 flat config. 각 패키지의 `eslint .`가 상위로 올라와 이 설정을 공유한다.
export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.expo/**",
      "**/.turbo/**",
      "**/drizzle/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
