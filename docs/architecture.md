# 구조와 코드 규칙

## 파일

| 파일 | 맡은 일 | 아는 것 |
| --- | --- | --- |
| `src/lib/rotate.js` | `rotateMp4(file, degrees)`: 영상 트랙의 회전 정보를 바꾼 새 `Blob`을 돌려준다 | MP4 박스 구조. DOM과 언어는 모른다 |
| `src/i18n.svelte.js` + `src/locales/*.js` | 현재 언어(`i18n.locale`, `$state`), `pickLocale`, `t` | 언어 사전 |
| `src/App.svelte` | 화면 전체: 열기, 끌어다 놓기, 회전, 미리보기, 저장, 언어 선택 | `rotateMp4`, `t` |
| `src/Icon.svelte` | 선 아이콘 | SVG 경로 |
| `src/app.css` | 색 변수와 모든 스타일 | [design.md](design.md) |

## 회전 방식

- 프레임을 다시 인코딩하지 않는다. `moov` 안 각 `trak` 중 `hdlr`이 `vide`인 트랙의 `tkhd` 변환 행렬만 바꾼다. 화질 손실이 없고, 파일 크기가 그대로이며, 큰 파일도 즉시 끝난다.
- 파일 전체를 메모리에 올리지 않는다. 최상위 박스 헤더만 훑어 `moov`를 찾고, `moov`만 읽어 고친 뒤 `Blob([앞부분, 고친 moov, 뒷부분])`으로 잇는다. 크기가 같으므로 `stco`/`co64` 오프셋을 고칠 필요가 없다.
- 각도는 시계 방향 0, 90, 180, 270이고, 기존 행렬에 곱하지 않고 덮어쓴다. 이동 성분은 `tkhd`의 폭과 높이로 채운다(ffmpeg가 쓰는 행렬과 같다).
- 64비트 박스 크기(`size == 1`)와 파일 끝까지 가는 박스(`size == 0`)를 처리한다. `moov`가 앞(faststart)에 있든 뒤에 있든 동작한다.
- MP4/MOV가 아니거나 영상 트랙이 없으면 `Error`를 던진다. 화면은 이를 `loadFailed` 문구로 보여 준다([i18n.md](i18n.md#화면-문구)).
- 한계: 회전 정보를 무시하는 재생기에서는 원래 방향으로 보인다. WebM·MKV는 지원하지 않는다. 지원하려면 재인코딩이 필요하다.

## 화면 상태

- 상태는 `file`, `degrees`, `result`(미리보기·저장용 object URL과 파일 이름), `failed`, `dragging`뿐이다.
- `file`이나 `degrees`가 바뀌면 하나의 `$effect`가 `rotateMp4`를 다시 부른다. 이전 실행은 취소 표시로 결과를 버리고, 만든 object URL은 정리 함수에서 `revokeObjectURL`한다.
- 미리보기는 브라우저 `<video>`가 회전 정보를 적용해 보여 주는 결과다. 별도로 그리지 않는다.

## 코드 규칙

- 패키지 관리는 pnpm만 쓴다. `pnpm install`, `pnpm run dev`, `pnpm run build`, `pnpm run test`.
- JavaScript와 Svelte 5 runes(`$state`, `$effect`, `$props`)를 쓴다. 따옴표는 작은따옴표, 들여쓰기는 2칸이다.
- 테스트는 `node:test`로 `src/**/*.test.js`에 둔다. 브라우저 없이 돌 수 있는 순수 로직(`rotate.js`, `pickLocale`, 사전 키)을 검사한다.
- 화면 코드는 색 값을 직접 쓰지 않고 [design.md](design.md#색)의 변수를 쓴다.
- 사용자에게 보이는 문구는 사전에 둔다([i18n.md](i18n.md)).
- 서버, 업로드, 분석 도구를 넣지 않는다. 모든 처리는 브라우저 안에서 끝난다.
