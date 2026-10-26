## 명령

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run test
```

## 문서

| 문서 | 내용 |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | 파일 구성, 회전 방식, 화면 상태, 코드 규칙 |
| [docs/design.md](docs/design.md) | 색, 글꼴, 간격, 배치, 구성 요소, 상호 작용 |
| [docs/i18n.md](docs/i18n.md) | 지원 언어, 언어 고르기, 사전과 문체, 언어 더하기 |
| [GLOSSARY.md](GLOSSARY.md) | 용어 정의와 다섯 언어 번역 |

## 변경 전 확인

- 화면을 바꾸면 [docs/design.md](docs/design.md)를 따르고, 규칙이 바뀌면 문서를 함께 고친다.
- 문구를 더하면 다섯 사전을 함께 고치고 `pnpm run test`로 키를 확인한다.
- `src/lib/rotate.js`를 바꾸면 `pnpm run test`와 함께 실제 MP4로 결과를 확인한다(`ffprobe -show_entries stream_side_data=rotation`).
