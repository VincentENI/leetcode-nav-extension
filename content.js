// LeetCode 题单导航助手 - Content Script

(function () {
  'use strict';

  let sidebar = null;
  let toggleBtn = null;
  let isCollapsed = false;
  let observer = null;
  let scrollHighlightTimer = null;

  // 初始化
  function init() {
    // 等待页面内容加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trySetup);
    } else {
      trySetup();
    }

    // 监听 URL 变化（SPA 路由）
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(trySetup, 1500);
      }
    });
    urlObserver.observe(document.body, { childList: true, subtree: true });
  }

  function isDiscussionPage() {
    return location.href.includes('/discuss/') || location.href.includes('/topic/') || location.href.includes('/post/');
  }

  function trySetup() {
    if (!isDiscussionPage()) {
      removeSidebar();
      return;
    }
    setTimeout(setupSidebar, 800);
  }

  function removeSidebar() {
    if (sidebar) {
      sidebar.remove();
      sidebar = null;
    }
    if (toggleBtn) {
      toggleBtn.remove();
      toggleBtn = null;
    }
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function getArticleContainer() {
    // 尝试多种选择器找到文章主体
    const selectors = [
      '.topic-content',
      '.discuss-markdown-container',
      '[class*="content__"]',
      '[class*="post-content"]',
      '.post-body',
      'article',
      '[class*="topic__"]',
      '.markdown-body',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 100) return el;
    }

    // 回退：找包含大量内容的 div
    const divs = Array.from(document.querySelectorAll('div'));
    return divs.find(d => d.querySelectorAll('h1, h2, h3, h4').length >= 2) || null;
  }

  function extractHeadings(container) {
    if (!container) return [];

    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return headings
      .filter(h => h.textContent.trim().length > 0)
      .map((h, index) => {
        // 给标题添加锚点 id
        if (!h.id) {
          h.id = `lc-nav-heading-${index}`;
        }
        return {
          level: parseInt(h.tagName[1]),
          text: h.textContent.trim(),
          el: h,
          id: h.id,
        };
      });
  }

  function getMinLevel(headings) {
    if (headings.length === 0) return 1;
    return Math.min(...headings.map(h => h.level));
  }

  function createSidebar(headings) {
    removeSidebar();

    if (headings.length === 0) return;

    const minLevel = getMinLevel(headings);

    // 创建悬浮按钮
    toggleBtn = document.createElement('div');
    toggleBtn.id = 'lc-nav-toggle';
    toggleBtn.title = '切换目录导航';
    toggleBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="15" y2="12"/>
        <line x1="3" y1="18" x2="18" y2="18"/>
      </svg>
    `;
    toggleBtn.addEventListener('click', toggleSidebar);
    document.body.appendChild(toggleBtn);

    // 创建侧边栏
    sidebar = document.createElement('div');
    sidebar.id = 'lc-nav-sidebar';

    // 标题区
    const header = document.createElement('div');
    header.className = 'lc-nav-header';
    header.innerHTML = `
      <span class="lc-nav-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M4 6h16M4 10h16M4 14h8M4 18h10"/>
        </svg>
        目录导航
      </span>
      <button class="lc-nav-close" title="关闭">✕</button>
    `;
    header.querySelector('.lc-nav-close').addEventListener('click', toggleSidebar);

    // 搜索框
    const searchWrap = document.createElement('div');
    searchWrap.className = 'lc-nav-search-wrap';
    searchWrap.innerHTML = `
      <input type="text" class="lc-nav-search" placeholder="搜索标题..." />
      <span class="lc-nav-search-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
    `;

    // 目录列表
    const list = document.createElement('div');
    list.className = 'lc-nav-list';

    headings.forEach(({ level, text, el, id }) => {
      const item = document.createElement('div');
      item.className = `lc-nav-item lc-nav-level-${level - minLevel + 1}`;
      item.setAttribute('data-id', id);
      item.setAttribute('data-text', text.toLowerCase());
      item.title = text;

      const indent = (level - minLevel) * 12;
      item.style.paddingLeft = `${12 + indent}px`;

      // 层级指示线
      const dot = document.createElement('span');
      dot.className = 'lc-nav-dot';
      dot.style.marginLeft = `${indent > 0 ? 0 : 0}px`;

      const label = document.createElement('span');
      label.className = 'lc-nav-label';
      label.textContent = text;

      item.appendChild(dot);
      item.appendChild(label);

      item.addEventListener('click', () => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // 高亮当前选中
          document.querySelectorAll('.lc-nav-item.active').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        }
      });

      list.appendChild(item);
    });

    // 搜索功能
    const searchInput = searchWrap.querySelector('.lc-nav-search');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      list.querySelectorAll('.lc-nav-item').forEach(item => {
        const text = item.getAttribute('data-text') || '';
        item.style.display = q === '' || text.includes(q) ? '' : 'none';
      });
    });

    // 统计信息
    const footer = document.createElement('div');
    footer.className = 'lc-nav-footer';
    footer.textContent = `共 ${headings.length} 个标题`;

    sidebar.appendChild(header);
    sidebar.appendChild(searchWrap);
    sidebar.appendChild(list);
    sidebar.appendChild(footer);
    document.body.appendChild(sidebar);

    // 滚动高亮
    setupScrollHighlight(headings);

    // 初始化不折叠
    isCollapsed = false;
  }

  function toggleSidebar() {
    if (!sidebar) return;
    isCollapsed = !isCollapsed;
    sidebar.classList.toggle('collapsed', isCollapsed);
    toggleBtn.classList.toggle('active', !isCollapsed);
  }

  function setupScrollHighlight(headings) {
    const listEl = sidebar && sidebar.querySelector('.lc-nav-list');
    if (!listEl) return;

    const handleScroll = () => {
      clearTimeout(scrollHighlightTimer);
      scrollHighlightTimer = setTimeout(() => {
        const scrollY = window.scrollY + 120;
        let current = null;

        for (const { el, id } of headings) {
          if (el.offsetTop <= scrollY) {
            current = id;
          }
        }

        listEl.querySelectorAll('.lc-nav-item').forEach(item => {
          const isActive = item.getAttribute('data-id') === current;
          item.classList.toggle('active', isActive);
          if (isActive) {
            // 确保活跃项目在视口内
            item.scrollIntoView({ block: 'nearest' });
          }
        });
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  function setupSidebar() {
    const container = getArticleContainer();
    if (!container) {
      // 重试一次
      setTimeout(() => {
        const c = getArticleContainer();
        if (c) {
          const headings = extractHeadings(c);
          if (headings.length > 0) createSidebar(headings);
          watchContent(c);
        }
      }, 2000);
      return;
    }

    const headings = extractHeadings(container);
    if (headings.length > 0) {
      createSidebar(headings);
    }
    watchContent(container);
  }

  function watchContent(container) {
    if (observer) observer.disconnect();

    let debounceTimer = null;
    observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const headings = extractHeadings(container);
        if (headings.length > 0) {
          createSidebar(headings);
        }
      }, 500);
    });

    observer.observe(container, { childList: true, subtree: true });
  }

  init();
})();
