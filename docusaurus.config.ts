import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'OpenEmber',
  tagline: '面向嵌入式 Linux 的分布式应用框架与轻量级运行时（EmberLite / OpenEmber）',
  favicon: 'img/logo.png',

  future: {
    v4: true,
  },

  url: 'https://openember.org',
  baseUrl: '/',

  organizationName: 'openember',
  projectName: 'openember-docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
    localeConfigs: {
      'zh-Hans': {
        label: '简体中文',
        htmlLang: 'zh-Hans',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/openember/openember-docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/openember/openember-docs/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'OpenEmber',
      logo: {
        alt: 'OpenEmber',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '文档',
        },
        {to: '/blog', label: '博客', position: 'left'},
        {
          href: 'https://github.com/openember/openember',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '文档首页',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: '仓库',
          items: [
            {
              label: 'OpenEmber',
              href: 'https://github.com/openember/openember',
            },
            {
              label: 'EmberLite',
              href: 'https://github.com/openember/emberlite',
            },
            {
              label: 'openember-cli',
              href: 'https://github.com/openember/openember-cli',
            },
            {
              label: 'openember-docs',
              href: 'https://github.com/openember/openember-docs',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: '博客',
              to: '/blog',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenEmber 项目贡献者。文档使用 Docusaurus 构建。`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
