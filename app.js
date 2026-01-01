// app.js — controla o modal com os detalhes de cada jogo
(() => {
    const details = {
        memoria: {
            title: "Pairing Game",
            summary: `
        <p>Cards grid where cards are flipped. Objective: find matching pairs. Scoring system and timer.</p>
      `,
            learned: `
        <h4>What I learned in JavaScript</h4>
        <ul>
          <li>DOM manipulation to dynamically create/remove cards.</li>
          <li>Click events, debouncing (preventing rapid clicks), and matching logic.</li>
          <li>Shuffling (simple Fisher‑Yates algorithm) and game state management (flipped cards, found pairs).</li>
          <li>Timers (setInterval / setTimeout) for stopwatch and effects.</li>
          <li>Basic accessibility: focus, description, and user feedback.</li>
        </ul>
      `,
        },
        aflito: {
            title: "100 Doors",
            summary: `
        <p>Numbered doors 1–100. The player tries to guess the door. Hot/cold feedback, limited attempts, and proximity indication.</p>
      `,
            learned: `
        <h4>What I learned in JavaScript</h4>
        <ul>
          <li>Random number generation and user input validation.</li>
          <li>Comparisons and feedback logic (distance between guess and target).</li>
          <li>Game state: attempts, game reset, and persistence.</li>
          <li>UX: gradual hints and animations to indicate success/failure.</li>
        </ul>
      `,
        },
        aliens: {
            title: "Aliens on the Grass",
            summary: `
        <p>Customizables grid (choose rows/columns) and number of aliens on the map. Time is used as a scoring system.</p>
      `,
            learned: `
        <h4>What I learned in JavaScript</h4>
        <ul>
          <li>Dynamic grid construction (creating elements based on parameters).</li>
          <li>Managing multiple states (alive/caught aliens, time, goal).</li>
          <li>Delegated events to optimize clicks on the grid.</li>
          <li>Pure functions and code modularization for easier configuration.</li>
        </ul>
      `,
        },
        ppt: {
            title: "Rock, Paper, Scissors",
            summary: `
        <p>Game against the computer with move choice, simple AI heuristics, animations, and results (wins/draws/losses).</p>
      `,
            learned: `
        <h4>What I learned in JavaScript</h4>
        <ul>
          <li>Randomization and decision logic for a simple AI.</li>
          <li>DOM manipulation and animations for result transitions.</li>
          <li>Simple reactive programming (updating UI as state changes).</li>
        </ul>
      `,
        },
        frogger: {
            title: "Frogger",
            summary: `
        <p>Control the frog with keyboard. Avoid collisions and obstacles to reach the goal. Multiple objects moving on the screen. Score points by time tracking.</p>
      `,
            learned: `
        <h4>What I learned in JavaScript</h4>
        <ul>
          <li>Game loop with requestAnimationFrame to update positions and animations.</li>
          <li>Collision detection (bounding boxes), life management, and game states.</li>
          <li>Keyboard and touch controls, separation between rendering and logic.</li>
          <li>Simple performance optimizations (avoiding unnecessary reflows).</li>
        </ul>
      `,
        },
        pacman: {
            title: "Pac‑Man",
            summary: `
        <p>Implementation of the classic Pac‑Man: eat pac‑dots, power‑pellets, avoid or eat ghosts when they are scared, and advance through 4 different levels (levels.json). With sounds (audio), top 10 storage (localStorage), and overlay for menus/scoreboard.</p>
      `,
            learned: `
        <h4>What I learned in JavaScript</h4>
        <ul>
          <li>Modularization (separating overlays into modules and loading levels via JSON).</li>
          <li>DOM manipulation to dynamically build the grid and update classes (actors, tiles).</li>
          <li>Managing multiple timers (setInterval for ghosts, setTimeout for power‑pellet), and careful cleanup when switching levels.</li>
          <li>Using the Audio API (preparing currentTime, play/pause) and handling play() promises.</li>
          <li>Persistence with localStorage (top scores) and UX with accessible modal overlays.</li>
        </ul>
      `,
        },
    };

    // abrir modal com conteúdo
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");
    const modalClose = document.getElementById("modalClose");

    function openModal(id) {
        const d = details[id];
        if (!d) return;
        modalContent.innerHTML = `
      <h3>${d.title}</h3>
      ${d.summary}
      ${d.learned}
    `;
        modal.setAttribute("aria-hidden", "false");
        // foco para acessibilidade
        modalContent.focus();
    }

    function closeModal() {
        modal.setAttribute("aria-hidden", "true");
        modalContent.innerHTML = "";
    }

    // Delegate: escuta clicks nos botões 'Detalhes'
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-details]");
        if (btn) {
            const id = btn.getAttribute("data-details");
            openModal(id);
        }
        if (e.target === modalClose) closeModal();
        // fechar ao clicar fora do painel
        if (e.target === modal) closeModal();
    });

    // fechar com ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false")
            closeModal();
    });
})();
