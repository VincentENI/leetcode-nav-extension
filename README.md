# LeetCode 题单导航助手

> 在 LeetCode 题单讨论页面左侧自动生成目录导航，支持快速定位和搜索标题。

## ✨ 功能特性

- 🗂 **自动提取标题** — 识别页面中的 H1~H6 标题，自动构建目录树
- 📍 **快速定位** — 点击目录项，页面平滑滚动至对应位置
- 🔍 **标题搜索** — 顶部搜索框实时过滤目录项
- 🎯 **滚动高亮** — 随页面滚动自动高亮当前所在章节
- 🌙 **深色模式** — 自动适配 LeetCode 深色主题
- 📌 **可折叠** — 点击左侧橙色按钮展开/收起侧边栏

## 📦 安装方法

### Chrome / Edge 安装

1. 下载并**解压** `leetcode-nav-extension.zip`
2. 打开浏览器，地址栏输入：
   - Chrome：`chrome://extensions`
   - Edge：`edge://extensions`
3. 开启右上角 **"开发者模式"**
4. 点击 **"加载已解压的扩展程序"**
5. 选择解压后的 `leetcode-nav-extension` 文件夹
6. 安装完成！🎉

## 🚀 使用方法

1. 打开任意 LeetCode 题单讨论页面，例如：  
   `https://leetcode.cn/discuss/...`
2. 页面左侧会自动出现橙色导航栏
3. 点击目录项即可跳转
4. 顶部搜索框可快速过滤标题
5. 点击左侧橙色 `☰` 按钮可折叠/展开侧边栏

## 📁 文件结构

```
leetcode-nav-extension/
├── manifest.json    # 插件配置文件
├── content.js       # 核心逻辑脚本
├── sidebar.css      # 侧边栏样式
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## ⚙️ 兼容性

- ✅ Google Chrome 88+
- ✅ Microsoft Edge 88+
- ✅ 支持 leetcode.cn 和 leetcode.com
- ✅ 支持亮色/深色主题
