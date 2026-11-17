// 포트폴리오 렌더러 — 내용은 전부 content/ 폴더에서 읽어온다.
// 구조/문구 수정은 content/ 파일만 고치면 되고, 이 파일은 건드릴 필요 없음.
(() => {
  const showDrafts = new URLSearchParams(location.search).has("draft");
  const app = document.getElementById("app");
  let profile = null, about = "", projects = [], activeTag = "전체";

  const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const md = s => marked.parse(s || "");
  const stripFrontmatter = text => text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const fetchText = async url => { const r = await fetch(url, { cache: "no-cache" }); if (!r.ok) throw new Error(url); return r.text(); };

  // theme
  const root = document.documentElement;
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch (e) {}
  document.getElementById("themeToggle").onclick = () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  };

  // nav: 홈으로 이동 후 해당 섹션으로 스크롤
  document.querySelectorAll("[data-scroll]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    const id = a.dataset.scroll;
    if (location.hash && location.hash !== "#/") { location.hash = "#/"; setTimeout(() => scrollToId(id), 60); }
    else scrollToId(id);
  }));
  const scrollToId = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const visible = p => showDrafts || (p.status || "published") !== "draft";
  const linkLabel = { github: "GitHub", demo: "Demo", youtube: "YouTube", app: "앱 체험", demo2: "데모 2", blog: "Blog", linkedin: "LinkedIn", notion: "Notion", velog: "velog", video: "영상", slides: "발표자료", paper: "논문" };

  function renderHome() {
    document.title = `${profile.name} · ${profile.role || "Portfolio"}`;
    const list = projects.filter(visible);
    const tags = ["전체", ...new Set(list.flatMap(p => p.tags || []))];
    const shown = activeTag === "전체" ? list : list.filter(p => (p.tags || []).includes(activeTag));

    app.innerHTML = `
      <div class="hero">
        <p class="role">${esc(profile.role)}</p>
        <h1>${esc(profile.headline || profile.name)}</h1>
        <p class="tagline">${esc(profile.tagline)}</p>
        <div class="links">
          ${profile.email ? `<a class="btn primary" href="mailto:${esc(profile.email)}">이메일 보내기</a>` : ""}
          ${Object.entries(profile.links || {}).filter(([, v]) => v).map(([k, v]) => `<a class="btn" href="${esc(v)}" target="_blank" rel="noopener">${esc(linkLabel[k] || k)} ↗</a>`).join("")}
          ${profile.resume ? `<a class="btn" href="${esc(profile.resume)}" target="_blank">이력서 PDF</a>` : ""}
        </div>
      </div>

      <section id="about">
        <h2>소개</h2>
        <div class="prose">${md(about)}</div>
      </section>

      ${profile.skills && Object.keys(profile.skills).length ? `
      <section id="skills">
        <h2>기술 · 역량</h2>
        <div class="skill-groups">
          ${Object.entries(profile.skills).map(([g, items]) => `
            <div class="skill-group"><h3>${esc(g)}</h3>
              <div class="tags">${items.map(i => `<span class="tag">${esc(i)}</span>`).join("")}</div>
            </div>`).join("")}
        </div>
      </section>` : ""}

      <section id="projects">
        <h2>프로젝트</h2>
        <div class="filters">${tags.map(t => `<button class="filter ${t === activeTag ? "active" : ""}" data-tag="${esc(t)}">${esc(t)}</button>`).join("")}</div>
        <div class="grid">
          ${shown.map(p => `
            <a class="card" href="#/project/${encodeURIComponent(p.slug)}">
              ${p.thumbnail ? `<img class="thumb" src="${esc(p.thumbnail)}" alt="" loading="lazy">` : `<div class="thumb ph">${esc((p.title || "?").slice(0, 1))}</div>`}
              <div class="body">
                ${highlights(p)}
                <h3>${esc(p.title)}${p.status === "draft" ? '<span class="badge">초안</span>' : ""}</h3>
                <p>${esc(p.summary)}</p>
                <div class="meta">${esc(p.period || "")}${p.role ? " · " + esc(p.role) : ""}</div>
                <div class="tags">${(p.stack || []).slice(0, 5).map(s => `<span class="tag">${esc(s)}</span>`).join("")}</div>
              </div>
            </a>`).join("") || '<p class="muted">아직 공개된 프로젝트가 없습니다.</p>'}
        </div>
      </section>

      ${timeline("experience", "경력 · 활동", profile.experience)}
      ${timeline("education", "학력 · 자격", [...(profile.education || []), ...(profile.certificates || [])])}

      <section id="contact">
        <h2>연락처</h2>
        <p>${profile.email ? `<a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>` : ""}${profile.phone ? ` · ${esc(profile.phone)}` : ""}</p>
      </section>`;

    app.querySelectorAll(".filter").forEach(b => b.onclick = () => {
      activeTag = b.dataset.tag; const y = scrollY; renderHome(); window.scrollTo(0, y);
    });
  }

  const highlights = p => (p.highlights || []).length
    ? `<div class="highlights">${p.highlights.map(h => `<span class="hl">${esc(h)}</span>`).join("")}</div>` : "";

  function timeline(id, title, items) {
    if (!items || !items.length) return "";
    return `<section id="${id}"><h2>${title}</h2><ul class="timeline">
      ${items.map(i => `<li><div class="when">${esc(i.period || "")}</div>
        <div class="what"><strong>${esc(i.title)}</strong><span>${esc(i.org || "")}</span>
        ${i.desc ? `<div class="prose">${md(i.desc)}</div>` : ""}</div></li>`).join("")}
    </ul></section>`;
  }

  async function renderProject(slug) {
    const p = projects.find(x => x.slug === slug);
    if (!p || !visible(p)) { app.innerHTML = `<p class="error">프로젝트를 찾을 수 없습니다. <a href="#/">홈으로</a></p>`; return; }
    app.innerHTML = `<p class="loading">불러오는 중…</p>`;
    let body;
    try { body = stripFrontmatter(await fetchText(`content/projects/${p.file}`)); }
    catch (e) { app.innerHTML = `<p class="error">글을 불러오지 못했습니다. 새로고침해 주세요. <a href="#/">홈으로</a></p>`; return; }
    document.title = `${p.title} · ${profile.name}`;
    const facts = [["기간", p.period], ["역할", p.role], ["팀 구성", p.team], ["결과", p.result], ["사용 툴", (p.stack || []).join(", ")]].filter(([, v]) => v);
    const links = Object.entries(p.links || {}).filter(([, v]) => v);
    app.innerHTML = `
      <article class="detail">
        <a class="back" href="#/">← 전체 프로젝트</a>
        ${highlights(p)}
        <h1>${esc(p.title)}${p.status === "draft" ? '<span class="badge">초안</span>' : ""}</h1>
        <p class="summary">${esc(p.summary)}</p>
        ${links.length ? `<div class="links" style="margin-bottom:24px">${links.map(([k, v]) => `<a class="btn" href="${esc(v)}" target="_blank" rel="noopener">${esc(linkLabel[k] || k)} ↗</a>`).join("")}</div>` : ""}
        ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        ${p.cover ? `<img class="cover" src="${esc(p.cover)}" alt="">` : ""}
        <div class="prose">${md(body)}</div>
      </article>`;
    window.scrollTo(0, 0);
  }

  function route() {
    const m = location.hash.match(/^#\/project\/(.+)$/);
    if (m) renderProject(decodeURIComponent(m[1]));
    else renderHome();
  }

  (async () => {
    try {
      const [prof, ab, list] = await Promise.all([
        fetchText("content/profile.json").then(JSON.parse),
        fetchText("content/about.md"),
        fetchText("content/projects.json").then(JSON.parse),
      ]);
      profile = prof; about = stripFrontmatter(ab); projects = list.projects || [];
      document.getElementById("brand").textContent = profile.name;
      document.getElementById("footerName").textContent = `© ${new Date().getFullYear()} ${profile.name}`;
      document.getElementById("updated").textContent = list.generated || "";
      document.getElementById("draftBanner").hidden = !showDrafts;
      window.addEventListener("hashchange", route);
      route();
    } catch (e) {
      app.innerHTML = `<p class="error">콘텐츠를 불러오지 못했습니다 (${esc(e.message)}).<br>
        파일을 더블클릭해서 열면 동작하지 않습니다. 터미널에서 <code>python3 scripts/build.py --serve</code> 실행 후 http://localhost:8000 으로 접속하세요.</p>`;
    }
  })();
})();
