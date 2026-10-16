/* 万杖长廊 · 画廊渲染脚本
   功能：主题切换（记忆+系统偏好）、语言判定、画廊筛选＋分页
   数据来源：data/photos.json 或内联 window.__GALLERY_DATA__（由 tools/build_site.py 生成） */
(function () {
  "use strict";

  /* ---- 语言判定：页面 lang="en" 即英文界面 ---- */
  var LANG = (document.documentElement.getAttribute("lang") || "zh").toLowerCase().indexOf("en") === 0 ? "en" : "zh";
  var I18N = {
    zh: {
      gallery: "画廊", submit: "投稿", essay: "一杖万年",
      count: function (total, shown) { return "共 " + total + " 张 · 当前显示 " + shown + " 张"; },
      empty: "这个分类下还没有照片——来投第一张吧！",
      page: " / ", prev: "← 上一批", next: "下一批 →",
      tags: { illustration: "场景图鉴", gentleman: "绅士杖 · 收藏杖", trekking: "徒步杖 · 登山杖", mobility: "助行杖 · 白手杖", craft: "工艺 · 材质", historical: "历史影像", other: "其他" },
      pd: "公有领域"
    },
    en: {
      gallery: "Gallery", submit: "Submit", essay: "The Essay",
      count: function (total, shown) { return total + " photos · showing " + shown; },
      empty: "No photos in this category yet — be the first to submit!",
      page: " / ", prev: "← Prev", next: "Next →",
      tags: { illustration: "Scene Illustrations", gentleman: "Gentleman Canes", trekking: "Trekking Poles", mobility: "Mobility Aids", craft: "Craft & Material", historical: "Historical", other: "Other" },
      pd: "Public Domain"
    }
  };
  var T = I18N[LANG] || I18N.zh;

  /* ---- 明暗主题切换（本地记忆，默认跟随系统） ---- */
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("cane-theme"); } catch (e) { /* 忽略 */ }
  var isDark = savedTheme ? (savedTheme === "dark")
    : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = dark ? "☀" : "☾";
  }
  applyTheme(isDark);
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      isDark = !isDark;
      applyTheme(isDark);
      try { localStorage.setItem("cane-theme", isDark ? "dark" : "light"); } catch (e) { /* 忽略 */ }
    });
  }

  /* ---- 画廊：筛选＋分页（每页 4 张） ---- */
  var cardBox = document.getElementById("card-flow");
  if (cardBox) {
    var PAGE = 4;
    var allPhotos = [];
    var curTag = "all";
    var curPage = 0;
    var prevBtn = document.getElementById("cards-prev");
    var nextBtn = document.getElementById("cards-next");
    var pageEl = document.getElementById("cards-page");
    var countEl = document.getElementById("count-label");
    var emptyEl = document.getElementById("empty-hint");

    function tagOf(p) {
      if ((p.source === "url" || (p.file && p.file.indexOf("historical/") === 0)) && p.license === "PD") {
        return "historical";
      }
      return p.category || "other";
    }

    function visibleList() {
      return allPhotos.filter(function (p) { return curTag === "all" || tagOf(p) === curTag; });
    }
    function pageCount(list) { return Math.max(1, Math.ceil(list.length / PAGE)); }

    function render() {
      var list = visibleList();
      var total = pageCount(list);
      if (curPage > total - 1) { curPage = total - 1; }
      var start = curPage * PAGE;

      emptyEl.hidden = list.length > 0;
      cardBox.innerHTML = "";

      list.slice(start, start + PAGE).forEach(function (p) {
        var card = document.createElement("article");
        card.className = "card";

        var img = document.createElement("img");
        img.src = "photos/" + p.file;
        img.alt = p.alt_text || p.title_zh || "Cane photo";
        img.loading = "lazy";
        card.appendChild(img);

        var body = document.createElement("div");
        body.className = "card-body";

        var tag = document.createElement("span");
        tag.className = "card-tag" + (tagOf(p) === "historical" ? " historical" : "");
        tag.textContent = tagOf(p) === "historical" ? T.pd : (T.tags[p.category] || T.tags.other);
        body.appendChild(tag);

        var title = document.createElement("div");
        title.className = "card-title";
        title.textContent = LANG === "en" ? (p.title_en || p.title_zh || "Untitled") : (p.title_zh || "未命名");
        body.appendChild(title);

        if (p.story_zh) {
          var text = document.createElement("p");
          text.className = "card-text";
          text.textContent = p.story_zh;
          body.appendChild(text);
        }

        var meta = document.createElement("div");
        meta.className = "card-meta";
        var parts = [];
        if (p.era) parts.push(p.era);
        if (p.scene) parts.push(p.scene);
        if (p.year) parts.push(String(p.year));
        if (p.location) parts.push(p.location);
        if (parts.length) {
          var m = document.createElement("span");
          m.textContent = parts.join(" · ");
          meta.appendChild(m);
        }
        if (p.photographer) {
          var credit = document.createElement("span");
          credit.className = "credit";
          credit.textContent = "© " + p.photographer;
          meta.appendChild(credit);
        }
        if (p.source === "url") {
          var src = document.createElement("span");
          src.textContent = T.pd;
          meta.appendChild(src);
        }
        body.appendChild(meta);
        card.appendChild(body);
        cardBox.appendChild(card);
      });

      if (countEl) countEl.textContent = T.count(allPhotos.length, Math.min(list.length, PAGE));
      if (pageEl) pageEl.textContent = (curPage + 1) + T.page + total;
      if (prevBtn) { prevBtn.disabled = curPage === 0; prevBtn.style.opacity = curPage === 0 ? .45 : 1; }
      if (nextBtn) { nextBtn.disabled = curPage >= total - 1; nextBtn.style.opacity = curPage >= total - 1 ? .45 : 1; }
    }

    Array.prototype.forEach.call(document.querySelectorAll(".js-filter"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(document.querySelectorAll(".js-filter"), function (b) { b.classList.remove("on"); });
        btn.classList.add("on");
        curTag = btn.getAttribute("data-tag");
        curPage = 0;
        render();
      });
    });
    if (prevBtn) prevBtn.addEventListener("click", function () { if (curPage > 0) { curPage--; render(); } });
    if (nextBtn) nextBtn.addEventListener("click", function () { if (curPage < pageCount(visibleList()) - 1) { curPage++; render(); } });

    /* ---- 数据加载：优先内联数据（本地 file:// 打开），否则 fetch photos.json ---- */
    function load() {
      if (Array.isArray(window.__GALLERY_DATA__)) {
        allPhotos = window.__GALLERY_DATA__;
        render();
        return;
      }
      fetch((LANG === "en" ? "../" : "") + "data/photos.json")
        .then(function (r) { if (!r.ok) { throw new Error("HTTP " + r.status); } return r.json(); })
        .then(function (data) {
          allPhotos = Array.isArray(data) ? data : [];
          render();
        })
        .catch(function () {
          if (countEl) countEl.textContent = "数据加载失败（请运行 python tools/build_site.py）";
          emptyEl.hidden = false;
          emptyEl.textContent = "Gallery data missing: run `python tools/build_site.py` then refresh.";
        });
    }
    load();
  }
})();
