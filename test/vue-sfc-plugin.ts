import { readFileSync } from 'node:fs';
import { compileScript, parse } from '@vue/compiler-sfc';
import { plugin } from 'bun';

/**
 * Bun has no native `.vue` support (unlike `.tsx`, which its transpiler
 * understands directly). This registers a minimal SFC-to-JS compiler so
 * `bun test` can import Vue components — mirrors what @vitejs/plugin-vue
 * does for dev/build, scoped down for test-time use only.
 */
plugin({
  name: 'vue-sfc',
  setup(build) {
    build.onLoad({ filter: /\.vue$/ }, (args) => {
      const source = readFileSync(args.path, 'utf-8');
      const { descriptor } = parse(source, { filename: args.path });

      const compiled = compileScript(descriptor, {
        id: args.path,
        inlineTemplate: true,
      });

      return { contents: compiled.content, loader: 'ts' };
    });
  },
});
