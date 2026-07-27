# 독립 레포로 분리하기 (Lore → `ghtjd626/lore`)

지금 Lore는 `ghtjd626/portfolio` 안의 **`lore/` 씨앗 폴더**로 산다(이 세션의 GitHub 권한으로는
새 레포를 만들 수 없어서). `lore/`는 처음부터 **독립 레포의 루트가 되도록** 자급자족하게 설계됐다
(`package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.github/workflows/ci.yml` 모두 `lore/` 안에 있음).

아래 중 하나로 독립시키면 된다.

## 옵션 A — 히스토리 보존 (권장)

`git subtree`로 `lore/`의 커밋 히스토리만 뽑아 새 레포로 옮긴다.

```bash
# portfolio 레포 루트에서
git subtree split --prefix=lore -b lore-export

# GitHub에 빈 레포 ghtjd626/lore 를 먼저 만든 뒤:
git push git@github.com:ghtjd626/lore.git lore-export:main

# 이후 새 레포를 클론해서 작업
git clone git@github.com:ghtjd626/lore.git
cd lore && pnpm install
```

## 옵션 B — 간단 (히스토리 없이 새 출발)

```bash
# 어딘가로 lore/ 내용만 복사
cp -r lore ~/lore && cd ~/lore

git init -b main
git add .
git commit -m "Lore: local-first personal record platform (MVP)"

# GitHub에 ghtjd626/lore 생성 후
git remote add origin git@github.com:ghtjd626/lore.git
git push -u origin main
```

## 독립 후 확인

```bash
pnpm install
pnpm --filter @lore/schema-core test   # 11/11
pnpm --filter @lore/web build          # 프로덕션 빌드
pnpm --filter @lore/web dev            # 웹 실행 → http://localhost:3000
```

독립 레포가 되면 루트의 `.github/workflows/ci.yml`이 자동으로 CI(lint·type-check·test)를 돌린다.
