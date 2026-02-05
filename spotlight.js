async function loadSpotlight() {
  const el = document.getElementById("spotlightCard");
  if (!el) return;

  try {
    const res = await fetch("./spotlight.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Couldn't load spotlight.json");

    const data = await res.json();
    const item = data.spotlight?.[0];

    if (!item) {
      el.innerHTML = "";
      return;
    }

    el.innerHTML = `
      <div class="card" style="background: rgba(0,0,0,0.18); border-color: rgba(255,255,255,0.10);">
        <h3 style="margin-bottom:6px;">${item.name || "Creator Spotlight"}</h3>
        ${item.tagline ? `<p class="muted" style="margin-top:0;">${item.tagline}</p>` : ""}

        ${item.price ? `<p class="muted"><strong>${item.price}</strong></p>` : ""}

        <div class="btnRow">
          ${item.ctaUrl ? `<a class="btn btnPrimary" href="${item.ctaUrl}" target="_blank" rel="noopener">${item.ctaText || "Get Featured"}</a>` : ""}
          ${item.secondaryUrl ? `<a class="btn" href="${item.secondaryUrl}" target="_blank" rel="noopener">${item.secondaryText || "Email Us"}</a>` : ""}
        </div>

        ${item.notes ? `<p class="muted" style="margin-top:10px;">${item.notes}</p>` : ""}
        ${data.updated ? `<p class="muted" style="margin-top:8px; font-size:13px;">Updated: ${data.updated}</p>` : ""}
      </div>
    `;
  } catch (err) {
    console.error(err);
    el.innerHTML = `
      <div class="card" style="background: rgba(0,0,0,0.18); border-color: rgba(255,255,255,0.10);">
        <p class="muted">Spotlight unavailable.</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadSpotlight);
