// ===== WEEKLY CLICK STORAGE (auto-reset each week) =====
function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
}

function getCountsStore() {
  const currentWeek = getWeekKey();
  const store = JSON.parse(localStorage.getItem("weeklyCounts") || "{}");

  if (store.week !== currentWeek) {
    const fresh = { week: currentWeek, counts: {} };
    localStorage.setItem("weeklyCounts", JSON.stringify(fresh));
    return fresh;
  }
  if (!store.counts) store.counts = {};
  return store;
}

function incCount(key) {
  const store = getCountsStore();
  store.counts[key] = (store.counts[key] || 0) + 1;
  localStorage.setItem("weeklyCounts", JSON.stringify(store));
  return store.counts[key];
}

function getCount(key) {
  const store = getCountsStore();
  return store.counts[key] || 0;
}

// ===== TOP 5 RENDER =====
(async function () {
  const statusEl = document.getElementById("status");
  const updatedEl = document.getElementById("updated");
  const listEl = document.getElementById("top5List");

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function makeIframe(videoId) {
    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "315";
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = "YouTube video player";
    iframe.frameBorder = "0";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    return iframe;
  }

  function renderPost(post, index) {
    const card = createEl("article", "post-card");
    const vid = (post.id || "").trim();

    const kicker = createEl("div", "post-kicker");
    kicker.textContent = `#${index + 1} • ${post.category || "Top"} • ${post.date || ""}`;
    card.appendChild(kicker);

    card.appendChild(createEl("h3", "post-title", post.title || "Untitled"));
    if (post.excerpt) card.appendChild(createEl("p", "post-excerpt", post.excerpt));

    // Video
    if (vid) {
      const videoWrap = createEl("div", "video-wrap");
      videoWrap.appendChild(makeIframe(vid));
      card.appendChild(videoWrap);

      // Buttons row
      const btnRow = createEl("div", "btn-row");

      // Counter display
      const countEl = createEl("span", "muted small");
      countEl.dataset.count = vid;
      countEl.textContent = `${getCount(`video:${vid}`)} clicks`;

      // Watch link (we count clicks on THIS)
      const watchLink = document.createElement("a");
      watchLink.className = "btn";
      watchLink.href = `https://www.youtube.com/watch?v=${vid}`;
      watchLink.target = "_blank";
      watchLink.rel = "noopener noreferrer";
      watchLink.textContent = "Watch on YouTube";

      // ✅ Count + update UI + then open
      watchLink.addEventListener("click", (e) => {
        e.preventDefault();
        const key = `video:${vid}`;
        const newCount = incCount(key);
        countEl.textContent = `${newCount} clicks`;
        window.open(watchLink.href, "_blank", "noopener,noreferrer");
      });

      btnRow.appendChild(watchLink);
      btnRow.appendChild(countEl);
      card.appendChild(btnRow);
    } else {
      card.appendChild(createEl("p", "post-error", "Missing video ID for this post."));
    }

    // Article paragraphs
    if (Array.isArray(post.article) && post.article.length) {
      const body = createEl("div", "post-body");
      post.article.forEach((p) => body.appendChild(createEl("p", "", p)));
      card.appendChild(body);
    }

    // Notes bullets
    if (Array.isArray(post.notes) && post.notes.length) {
      card.appendChild(createEl("h4", "post-subhead", "Key takeaways"));
      const ul = createEl("ul", "post-notes");
      post.notes.forEach((n) => ul.appendChild(createEl("li", "", n)));
      card.appendChild(ul);
    }

    return card;
  }

  try {
    setStatus("Loading top videos...");

    const res = await fetch("./top5.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`top5.json fetch failed: ${res.status}`);

    const data = await res.json();
    const posts = data?.posts;

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("top5.json has no posts array (or it's empty).");
    }

    setStatus("");
    if (updatedEl) updatedEl.textContent = data.updated ? `Updated: ${data.updated}` : "";

    const first5 = posts.slice(0, 5);

    if (listEl) {
      listEl.innerHTML = "";
      first5.forEach((post, i) => listEl.appendChild(renderPost(post, i)));
    } else {
      console.warn("Missing #top5List element in HTML.");
    }
  } catch (err) {
    console.error(err);
    setStatus("Couldn't load top videos. Check top5.json.");
  }
})();
