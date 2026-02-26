import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/Intent-Driven-UI/',
  title: "Intent Driven UI",
  description: "意图驱动UI",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: '通用AI应用设计',
        items: [
          { text: '架构设计', link: '/design/通用AI应用1-架构设计' },
          { text: '前端AI驱动组件', link: '/design/通用AI应用2-前端AI驱动组件' },
          { text: '多智能体和上下文', link: '/design/通用AI应用3-多智能体和上下文' },
          { text: '前端AI Action', link: '/design/通用AI应用4-前端AI Action' },
          { text: '产品化', link: '/design/通用AI应用5-产品化' }
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
