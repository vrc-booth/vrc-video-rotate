# VRChat 영상 회전

https://vrc-booth.github.io/vrc-video-rotate/

## 사용법

```bash
pnpm install
pnpm run dev
```

브라우저에서 MP4/MOV 파일을 열고 회전 버튼으로 방향을 맞춘 뒤, 미리보기를 확인하고 저장한다. 화면은 한국어, English, 日本語, 简体中文, 繁體中文을 지원한다.

규칙 문서는 [AGENTS.md](AGENTS.md)에 모여 있다.

## 동작 방식

영상 트랙의 `tkhd` 회전 행렬만 바꾼다. 재인코딩하지 않으므로 화질 손실이 없고 즉시 끝나며 파일 크기도 그대로다. 파일은 브라우저 밖으로 전송되지 않는다.

회전 메타데이터를 무시하는 프로그램에서는 원래 방향으로 보인다.

## 테스트

```bash
pnpm run test
```
