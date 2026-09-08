/* R11SE — client */
(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  const list = document.getElementById("track-list");
  const chips = document.querySelectorAll(".chip");
  let tracks = [];
  let currentFilter = "all";
  let playingIdx = null;

  function formatPlays(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K";
    return String(n);
  }
  function svgPlay() {
    return '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2 1v10l9-5z"/></svg>';
  }
  function svgPause() {
    return '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9"/><rect x="7" y="1.5" width="3" height="9"/></svg>';
  }
  function encodeUrl(u) {
    return encodeURIComponent(u);
  }
  function normGenre(g) {
    return (g || "").toLowerCase().trim();
  }

  function matchesFilter(t, f) {
    if (f === "all") return true;
    const g = normGenre(t.genre);
    if (f === "other") {
      return !["dubstep", "drum & bass", "electronic"].includes(g);
    }
    return g === f;
  }

  function render() {
    if (!tracks.length) {
      list.innerHTML =
        '<li style="padding:2rem 0;color:var(--text-muted);text-align:center">Loading vault…</li>';
      return;
    }
    const filtered = tracks.filter((t) => matchesFilter(t, currentFilter));
    list.innerHTML = filtered
      .map((t) => {
        const idx = tracks.indexOf(t);
        const playing = playingIdx === idx;
        const initials = t.title
          .replace(/[^A-Za-z0-9 ]/g, "")
          .split(/\s+/)
          .slice(0, 2)
          .map((s) => s[0] || "")
          .join("")
          .toUpperCase() || "R";
        const artHtml = t.art
          ? `<img src="${t.art}" alt="" loading="lazy" width="56" height="56" />`
          : `<span>${initials}</span>`;
        const artClass = t.art ? "track-art" : "track-art empty";
        return `
          <li class="track${playing ? " playing" : ""}" data-idx="${idx}">
            <div class="track-num">${String(idx + 1).padStart(2, "0")}</div>
            <button class="track-play" data-play="${idx}" aria-label="${
              playing ? "Pause" : "Play"
            } ${t.title}">${playing ? svgPause() : svgPlay()}</button>
            <div class="${artClass}">${artHtml}</div>
            <div class="track-title">
              <h3>${t.title}</h3>
              <p class="genre">${t.genre || "—"} · ${t.year || ""}</p>
            </div>
            <div class="track-stat plays">
              <span class="lab">Plays</span>
              ${formatPlays(t.plays)}
            </div>
            <div class="track-stat length">
              <span class="lab">Length</span>
              ${t.duration}
            </div>
            <a class="track-open" href="${t.url}" target="_blank" rel="noopener" aria-label="Open ${
              t.title
            } on SoundCloud">Open →</a>
            <div class="track-player">${
              playing
                ? `<iframe height="120" scrolling="no" frameborder="no" allow="autoplay" title="${t.title}" src="https://w.soundcloud.com/player/?url=${encodeUrl(
                    t.url
                  )}&color=%23b17dff&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"></iframe>`
                : ""
            }</div>
          </li>
        `;
      })
      .join("");
  }

  list.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-play]");
    if (!btn) return;
    const idx = Number(btn.getAttribute("data-play"));
    playingIdx = playingIdx === idx ? null : idx;
    render();
  });

  chips.forEach((c) => {
    c.addEventListener("click", function () {
      chips.forEach((x) => {
        x.classList.remove("active");
        x.setAttribute("aria-selected", "false");
      });
      c.classList.add("active");
      c.setAttribute("aria-selected", "true");
      currentFilter = c.getAttribute("data-filter");
      playingIdx = null;
      render();
    });
  });

  fetch("data/tracks.json")
    .then((r) => r.json())
    .then((data) => {
      tracks = data;
      render();
    })
    .catch(() => {
      list.innerHTML =
        '<li style="padding:2rem 0;color:var(--text-muted);text-align:center">Could not load track data. See <a style="color:var(--uv)" href="https://soundcloud.com/r11se">SoundCloud</a>.</li>';
    });
})();
