import { defineConfig } from 'vite'
import fs from 'fs'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(
        "XXXXXXXXXXXXXXX"
      ),
      cert: fs.readFileSync(
        "XXXXXXXXXXXXXXX"
      ),
    },
    port: 3000,
  },
});