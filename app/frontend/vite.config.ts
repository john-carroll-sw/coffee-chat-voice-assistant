import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "../backend/static",
        emptyOutDir: true,
        sourcemap: true, // Ensure sourcemaps are generated
        chunkSizeWarningLimit: 1000, // Adjust the chunk size limit
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return id.toString().split("node_modules/")[1].split("/")[0].toString();
                    }
                },
                // Handle empty chunks
                chunkFileNames: chunkInfo => {
                    if (chunkInfo.isDynamicEntry && chunkInfo.moduleIds.length === 0) {
                        return "empty-chunk-[name].js";
                    }
                    return "[name]-[hash].js";
                }
            }
        }
    },
    resolve: {
        preserveSymlinks: true,
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    server: {
        proxy: {
            "/realtime": {
                target: "ws://localhost:8000",
                ws: true,
                rewriteWsOrigin: true
            }
        }
    }
});
