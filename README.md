# 花信水墨长卷｜项目源码

这是“花信水墨长卷”网页的最新整理版源码，包含 14 种花卉水墨画、真实花瓣图集、上下滚动切换、卷轴展开、墨色渐生、双语植物名、古诗英译和轻量 2.5D 破卷效果。

## 运行环境

- Node.js 22.13 或更高版本
- npm

## 本地运行

```bash
npm install
npm run dev
```

根据终端显示的本地地址在浏览器打开即可。

## 构建生产版本

```bash
npm run build
npm run start
```

## 主要文件

- `app/page.tsx`：花卉、诗词、英译、交互和动画逻辑
- `app/globals.css`：卷轴、毛笔字、响应式布局、2.5D 和花瓣动画
- `public/art/`：14 幅本地水墨花卉图片
- `public/particles/`：花瓣与叶片图集
- `app/layout.tsx`：页面标题及基础布局
- `package.json`：依赖和运行命令

## 说明

- 所有画作和花瓣资源均已放入项目，不依赖外部图片地址。
- 页面本身不要求 ChatGPT 登录，也没有远程接口或数据库依赖。
- `.openai/hosting.json` 仅用于原站点的托管构建；普通本地运行不需要修改它。
- 压缩包未包含 `node_modules`、构建产物、缓存和版本历史，首次运行需要执行 `npm install`。
