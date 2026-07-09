import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages 프로젝트 페이지는 /{repo}/ 하위에 배포되므로 빌드 시 base 지정.
// 로컬 개발(dev)은 루트(/)로 두어 미리보기에 영향 없게 함.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/KBO_statics/' : '/',
  plugins: [react()],
}))
