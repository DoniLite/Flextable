import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // vue-tsc --emitDeclarationOnly writes dist/*.d.ts before this runs;
    // Vite's default emptyOutDir would otherwise wipe them out again.
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'flextable-vue-crud.js',
    },
    rollupOptions: {
      external: ['vue', '@flextable/core', '@flextable/vue'],
    },
  },
});
