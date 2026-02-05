async function loadTop5() {
  const featuredEl = document.getElementById("featuredPost");
  const grid = document.getElementById("top5Posts");

  const res = await fetch("./top5.json");
  const data = await res.json();

  // Featured
  const f = data.featured;
  featuredEl.innerHTML = `
    <div class="featuredInner">
      <img class="thumb" src="https://i.ytimg.com/vi/${f.id}/hqdefault.jpg" alt="${f.title}">
      <div class="featuredText">
        <div class="meta">Featured • ${f.date}</div>
        <h2>${f.title}</h2>
        <p>${f.excerpt}</p>
        <a class="btn" href="./post.html?id=${f.id}">Read post</a>
      </div>
    </div>
  `;

  // Top 5 cards
  grid.innerHTML = "";
  data.videos.slice(0,5).forEach((v, i) => {
    const card = document.createElement("article");
    card.className = "postCard";
    card.innerHTML = `
      <img class="thumb" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="${v.title}">
      <div class="postBody">
        <div class="meta">#${i+1} • ${v.date || ""}</div>
        <h3>${v.title}</h3>
        <p>${v.excerpt || ""}</p>
        <a class="link" href="./post.html?id=${v.id}">Read post →</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

loadTop5();
