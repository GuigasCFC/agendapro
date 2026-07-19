import "dotenv/config"
import path from "path"
import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // Next.js resolve "server-only" sozinho via webpack; fora do bundler
      // dele (Vitest/Vite) o pacote nem existe em node_modules.
      "server-only": path.resolve(__dirname, "src/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
