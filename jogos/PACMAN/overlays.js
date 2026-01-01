export function createOverlay({ title = "", html = "", buttons = [] }) {
    const overlay = document.createElement("div");
    overlay.className = "pac-overlay";
    overlay.style = `
        position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.6);z-index:9999;padding:20px;
    `;

    overlay.tabIndex = 0;

    const card = document.createElement("div");
    card.style = `
        background:#0f1724;color:#fff;padding:20px;border-radius:8px;
        max-width:720px;width:100%;box-shadow:0 10px 30px rgba(0,0,0,0.8);
        font-family:system-ui,Segoe UI,Roboto,Arial;
    `;
    const h = document.createElement("h2");
    h.textContent = title;
    h.style = "margin:0 0 12px 0;font-size:1.25rem;";
    const content = document.createElement("div");
    content.innerHTML = html;
    content.style = "margin-bottom:12px;max-height:60vh;overflow:auto;";
    const footer = document.createElement("div");
    footer.style = "display:flex;gap:8px;justify-content:flex-end;";

    const btnEls = [];
    buttons.forEach((b, idx) => {
        const btn = document.createElement("button");
        btn.textContent = b.text;
        btn.type = "button";
        btn.tabIndex = 0;
        btn.style =
            "padding:8px 12px;border-radius:6px;border:none;cursor:pointer;";
        btn.dataset.index = String(idx);
        if (b.primary) btn.style.background = "#06f";
        else btn.style.background = "#444";

        btn.onclick = (ev) => {
            if (b.onClick) b.onClick(ev);
            cleanup();
        };

        footer.appendChild(btn);
        btnEls.push(btn);
    });

    card.appendChild(h);
    card.appendChild(content);
    card.appendChild(footer);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const input = content.querySelector("input, textarea, [role='textbox']");

    const focusables = [];
    if (input) {
        input.tabIndex = 0;
        focusables.push(input);
    }
    btnEls.forEach((b) => focusables.push(b));

    let focusedIndex = focusables.length ? 0 : -1;
    function focusIndex(i) {
        if (focusables.length === 0) return;
        focusedIndex = (i + focusables.length) % focusables.length;
        try {
            focusables[focusedIndex].focus();
        } catch (e) {}

        btnEls.forEach((be, bi) => {
            if (focusables[focusedIndex] === be)
                be.classList.add("pac-btn-focused");
            else be.classList.remove("pac-btn-focused");
        });
    }

    if (focusables.length === 0) overlay.focus();
    else focusIndex(0);

    const primaryBtnIndex = buttons.findIndex((b) => b.primary);
    const primaryIndexInFocusables =
        primaryBtnIndex >= 0
            ? input
                ? 1 + primaryBtnIndex
                : primaryBtnIndex
            : input
            ? 1
            : 0;

    function handleKeyDown(e) {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (focusables.length) focusIndex(focusedIndex + 1);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (focusables.length) focusIndex(focusedIndex - 1);
        } else if (e.key === "Enter") {
            e.preventDefault();

            if (document.activeElement === input && primaryBtnIndex >= 0) {
                const btnToClick = btnEls[primaryBtnIndex];
                if (btnToClick) btnToClick.click();
                return;
            }

            if (
                focusables[focusedIndex] &&
                btnEls.includes(focusables[focusedIndex])
            ) {
                focusables[focusedIndex].click();
                return;
            }

            if (focusables.length === 0) cleanup();
        } else if (e.key === "Escape") {
            e.preventDefault();
            cleanup();
        }
    }

    function cleanup() {
        try {
            document.removeEventListener("keydown", handleKeyDown, true);
        } catch (e) {}
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return overlay;
}
