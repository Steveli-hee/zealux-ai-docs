// app.js — 搜索 + 目录高亮
const PAGE = window.__PAGE__ || "";

// ---------- 侧边栏当前页滚动到可视区 ----------
const active = document.querySelector(".sidebar a.active");
if (active) active.scrollIntoView({ block: "center" });

// ---------- 搜索 ----------
const input = document.getElementById("search-input");
const box = document.getElementById("search-results");
let index = null;
let selIdx = -1;
let results = [];

async function loadIndex() {
  if (index) return index;
  const depth = (PAGE.match(///g) || []).length;
  const base = "../".repeat(depth) + "assets";
  const res = await fetch(base + "/search-index.json");
  index = await res.json();
  return index;
}

function score(chunk, q) {
  const t = chunk.t.toLowerCase();
  const c = chunk.c.toLowerCase();
  let s = 0;
  if (t.includes(q)) s += 100 - t.indexOf(q);
  const terms = q.split(/\s+/).filter(Boolean);
  for (const term of terms) {
    if (c.includes(term)) s += 5;
    else if (t.includes(term)) s += 10;
    else return 0;
  }
  return s;
}

function renderResults(q) {
  if (!q.trim()) { box.hidden = true; return; }
  results = index
    .map((ch) => ({ ch, s: score(ch, q.toLowerCase()) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12);
  selIdx = -1;
  box.innerHTML = results.length
    ? results
        .map((r, i) => {
          const pos = r.ch.c.toLowerCase().indexOf(q.toLowerCase().split(/\s+/)[0]);
          const snip = pos >= 0 ? "…" + r.ch.c.slice(Math.max(0, pos - 20), pos + 80) + "…" : r.ch.c.slice(0, 80);
          const u = (PAGE ? "../".repeat((PAGE.match(///g) || []).length) : "") + r.ch.u;
          return `<a href="${u}" data-i="${i}"><div class="st">${r.ch.t}</div><div class="ss">${r.ch.s}</div><div class="snippet">${snip}</div></a>`;
        })
        .join("")
    : `<div class="empty">没有找到与「${q}」相关的内容</div>`;
  box.hidden = false;
}

input?.addEventListener("focus", loadIndex);
input?.addEventListener("input", async (e) => {
  await loadIndex();
  renderResults(e.target.value);
});
input?.addEventListener("keydown", (e) => {
  if (box.hidden) return;
  const items = box.querySelectorAll("a");
  if (e.key === "ArrowDown") { e.preventDefault(); selIdx = Math.min(selIdx + 1, items.length - 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); selIdx = Math.max(selIdx - 1, 0); }
  else if (e.key === "Enter" && selIdx >= 0) { items[selIdx].click(); return; }
  else if (e.key === "Escape") { box.hidden = true; return; }
  else return;
  items.forEach((el, i) => el.classList.toggle("sel", i === selIdx));
  items[selIdx]?.scrollIntoView({ block: "nearest" });
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".searchbox")) box.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); input.focus(); }
});

// ---------- Mermaid 图渲染 ----------
if (document.querySelector(".mermaid")) {
  const depth = (PAGE.match(///g) || []).length;
  const base = "../".repeat(depth) + "assets";
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
  script.onload = () => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    window.mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "neutral", securityLevel: "loose" });
    window.mermaid.run({ querySelector: ".mermaid" }).catch(() => {
      document.querySelectorAll(".mermaid").forEach((el) => el.classList.add("mermaid-error"));
    });
  };
  script.onerror = () => {
    document.querySelectorAll(".mermaid").forEach((el) => {
      const tip = document.createElement("div");
      tip.className = "mermaid-tip";
      tip.textContent = "（图表渲染失败：未能加载 mermaid 库，以下为源码）";
      el.before(tip);
    });
  };
  document.head.appendChild(script);
}

// ---------- 右侧目录滚动高亮 ----------
const tocLinks = [...document.querySelectorAll(".toc a")];
if (tocLinks.length) {
  const heads = tocLinks.map((a) => document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)))).filter(Boolean);
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          tocLinks.forEach((a) => a.classList.toggle("active", decodeURIComponent(a.getAttribute("href").slice(1)) === en.target.id));
        }
      });
    },
    { rootMargin: "-60px 0px -70% 0px" }
  );
  heads.forEach((h) => obs.observe(h));
}
