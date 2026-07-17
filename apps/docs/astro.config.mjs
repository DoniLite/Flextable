// @ts-check

import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';
import { createStarlightTypeDocPlugin } from 'starlight-typedoc';

const packages = [
  { name: 'core', label: 'Core' },
  { name: 'react', label: 'React' },
  { name: 'react-ui', label: 'React UI' },
  { name: 'react-crud', label: 'React CRUD' },
  { name: 'vue', label: 'Vue' },
  { name: 'vue-ui', label: 'Vue UI' },
  { name: 'vue-crud', label: 'Vue CRUD' },
];

// Each package gets its own plugin instance + sidebar group — the default
// `starlight-typedoc` export shares a single sidebar placeholder, which would
// make every later package overwrite the previous one's sidebar entry.
const typeDocPlugins = packages.map(({ name, label }) => {
  const [plugin, sidebarGroup] = createStarlightTypeDocPlugin();
  return {
    name,
    label,
    plugin: plugin({
      entryPoints: [`../../packages/${name}/src/index.ts`],
      tsconfig: `../../packages/${name}/tsconfig.json`,
      output: `api/${name}`,
      sidebar: { label, collapsed: true },
      pagination: true,
      typeDoc: {
        plugin: ['typedoc-plugin-markdown'],
        excludePrivate: true,
        excludeInternal: true,
        skipErrorChecking: true,
        gitRevision: 'main',
      },
    }),
    sidebarGroup,
  };
});

// https://astro.build/config
export default defineConfig({
  site: 'https://donilite.github.io',
  base: '/Flextable',
  integrations: [
    starlight({
      title: 'FlexTable',
      customCss: ['./src/styles/global.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/DoniLite/Flextable',
        },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Introduction', slug: 'guides/introduction' },
            { label: 'Getting started — React', slug: 'guides/getting-started-react' },
            { label: 'Getting started — Vue', slug: 'guides/getting-started-vue' },
            { label: 'Live demo', slug: 'guides/live-demo' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'ColumnFactory & column kinds', slug: 'guides/column-factory' },
            { label: 'Theming & styling', slug: 'guides/theming' },
            { label: 'Internationalization', slug: 'guides/internationalization' },
            {
              label: 'Pagination, filtering & sorting',
              slug: 'guides/pagination-filtering-sorting',
            },
            { label: 'CRUD add-on packages', slug: 'guides/crud-packages' },
          ],
        },
        {
          label: 'API reference',
          items: typeDocPlugins.map(({ sidebarGroup }) => sidebarGroup),
        },
      ],
      plugins: typeDocPlugins.map(({ plugin }) => plugin),
    }),
    react(),
    vue(),
  ],
});
