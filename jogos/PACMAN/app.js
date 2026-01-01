import { createOverlay } from "./overlays.js";

/* ========= VARIÁVEIS E CONSTANTES GLOBAIS ========= */
let score = 0;
let gameEnded = false;
let pacmanCurrentIndex;
let currentLevel = 0;

let levels = []; //preenchido pelo levels.json

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");

const width = 28;
const grid = document.querySelector(".grid");

const sEatingDots = new Audio("audio/eatingdots.mp3");
const sEatingFruit = new Audio("audio/eatingfruit.mp3");
const sEatingGhost = new Audio("audio/eatingghost.mp3");
const sFail = new Audio("audio/fail.mp3");
const sScaredGhosts = new Audio("audio/scaredghosts.mp3");
const sStart = new Audio("audio/start.mp3");
const sWin = new Audio("audio/win.mp3");

const SCORES_KEY = "pacman_scores_v1";
const SCORES_MAX = 10;
const squares = [];
sScaredGhosts.loop = true;

/* ====== FUNÇÕES DE ARMAZENAMENTO ====== */
function loadScores() {
    try {
        return JSON.parse(localStorage.getItem(SCORES_KEY) || "[]");
    } catch (e) {
        console.error("Erro a ler scores do localStorage:", e);
        return [];
    }
}
function saveScoresArray(scores) {
    try {
        localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    } catch (e) {
        console.error("Error saving to localStorage:", e);
    }
}
function saveScoreLocal(name, points, levelReached) {
    const trimmed = (name || "Jogador").toString().trim().slice(0, 20);
    const scores = loadScores();
    scores.push({
        name: trimmed,
        points: Number(points) || 0,
        level: Number(levelReached) || 0,
        when: new Date().toISOString(),
    });
    scores.sort((a, b) => b.points - a.points);
    saveScoresArray(scores.slice(0, SCORES_MAX));
}
function formatTop10(scores) {
    if (!scores || scores.length === 0) return "No scores saved yet.";
    return scores
        .map(
            (s, i) =>
                `${i + 1} - ${s.name} ..... ${s.points} points (level ${
                    s.level || 0
                }) — ${new Date(s.when).toLocaleString()}`
        )
        .join("\n");
}

function showTop10Overlay() {
    const scores = loadScores();
    const html = `<pre style="white-space:pre-wrap">${formatTop10(
        scores
    )}</pre>`;
    createOverlay({
        title: `Top ${SCORES_MAX} — Highest Scores`,
        html,
        buttons: [{ text: "Close", primary: true }],
    });
}

/* ====== CRIAÇÃO DO TABULEIRO ====== */
let totalPacDotsRemaining = 0;

function createBoardFromLayout(layoutArray) {
    grid.innerHTML = "";
    squares.length = 0;
    totalPacDotsRemaining = 0;

    for (let i = 0; i < layoutArray.length; i++) {
        const square = document.createElement("div");
        grid.appendChild(square);
        squares.push(square);

        if (layoutArray[i] === 0) {
            squares[i].classList.add("pac-dot");
            totalPacDotsRemaining++;
        } else if (layoutArray[i] === 1) {
            squares[i].classList.add("wall");
        } else if (layoutArray[i] === 2) {
            squares[i].classList.add("ghost-lair");
        } else if (layoutArray[i] === 3) {
            squares[i].classList.add("power-pellet");
            totalPacDotsRemaining++;
        }
    }
}

/* ====== GESTÃO DE FANTASMAS POR NÍVEL ====== */
class Ghost {
    constructor(className, startIndex, speed) {
        this.className = className;
        this.startIndex = startIndex;
        this.speed = speed;
        this.currentIndex = startIndex;
        this.isScared = false;
        this.timerId = NaN;
    }
}
let ghosts = [];

function initGhostsForLevel(ghostsMeta) {
    if (ghosts && ghosts.length) {
        ghosts.forEach((g) => clearInterval(g.timerId));
        ghosts.forEach((g) => {
            if (squares[g.currentIndex]) {
                squares[g.currentIndex].classList.remove(
                    g.className,
                    "ghost",
                    "scared-ghost"
                );
            }
        });
    }
    ghosts = [];
    ghostsMeta.forEach((gMeta) => {
        const g = new Ghost(gMeta.className, gMeta.startIndex, gMeta.speed);
        ghosts.push(g);
        if (squares[g.currentIndex]) {
            squares[g.currentIndex].classList.add(g.className, "ghost");
        }
    });
    ghosts.forEach((g) => moveGhost(g));
}

/* ====== MOVIMENTO DOS FANTASMAS ====== */
function moveGhost(ghost) {
    const directions = [-1, +1, -width, +width];
    let direction = directions[Math.floor(Math.random() * directions.length)];

    ghost.timerId = setInterval(function () {
        if (
            !squares[ghost.currentIndex + direction] ||
            (!squares[ghost.currentIndex + direction].classList.contains(
                "ghost"
            ) &&
                !squares[ghost.currentIndex + direction].classList.contains(
                    "wall"
                ))
        ) {
            if (squares[ghost.currentIndex]) {
                squares[ghost.currentIndex].classList.remove(
                    ghost.className,
                    "ghost",
                    "scared-ghost"
                );
            }
            ghost.currentIndex += direction;
            if (squares[ghost.currentIndex]) {
                squares[ghost.currentIndex].classList.add(
                    ghost.className,
                    "ghost"
                );
            }
        } else {
            direction =
                directions[Math.floor(Math.random() * directions.length)];
        }

        if (ghost.isScared && squares[ghost.currentIndex]) {
            squares[ghost.currentIndex].classList.add("scared-ghost");
        }

        if (
            ghost.isScared &&
            squares[ghost.currentIndex] &&
            squares[ghost.currentIndex].classList.contains("pac-man")
        ) {
            if (squares[ghost.currentIndex]) {
                squares[ghost.currentIndex].classList.remove(
                    ghost.className,
                    "ghost",
                    "scared-ghost"
                );
            }
            ghost.currentIndex = ghost.startIndex;
            sEatingGhost.currentTime = 0;
            sEatingGhost.play().catch(() => {});
            score += 100;
            scoreDisplay.innerHTML = score;
            if (squares[ghost.currentIndex]) {
                squares[ghost.currentIndex].classList.add(
                    ghost.className,
                    "ghost"
                );
            }
        }

        checkForGameOver();
    }, ghost.speed);
}

/* ====== CARREGAR NÍVEL ====== */
function loadLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= levels.length) return;
    currentLevel = levelIndex;
    const lvl = levels[levelIndex];

    createBoardFromLayout(lvl.layout);

    pacmanCurrentIndex = lvl.pacStart || 489;
    if (squares[pacmanCurrentIndex]) {
        squares[pacmanCurrentIndex].classList.add("pac-man", "pac-right");
    }

    initGhostsForLevel(lvl.ghostsMeta);

    gameEnded = false;
    document.removeEventListener("keydown", movePacman);
    document.addEventListener("keydown", movePacman);

    scoreDisplay.innerHTML = score;
    levelDisplay.textContent = String(currentLevel + 1);
}

/* ====== AVANÇAR LEVEL ====== */
function advanceLevel() {
    sWin.currentTime = 0;
    sWin.play().catch(() => {});

    const next = currentLevel + 1;
    if (next >= levels.length) {
        handleEndGame("Você venceu todos os níveis!");
    } else {
        createOverlay({
            title: `Nível ${currentLevel + 1} concluído!`,
            html: `<p>Preparando Nível ${next + 1}...</p>`,
            buttons: [
                {
                    text: "Continuar",
                    primary: true,
                    onClick: () => {
                        loadLevel(next);
                    },
                },
            ],
        });
    }
}

/* ====== GESTÃO DO FIM DE JOGO ====== */
function handleEndGame(finalMessage) {
    if (gameEnded) return;
    gameEnded = true;

    document.removeEventListener("keydown", movePacman);
    ghosts.forEach((ghost) => clearInterval(ghost.timerId));

    createOverlay({
        title: finalMessage,
        html: `<p>Score: <strong>${score}</strong></p>
               <p>Reached level: <strong>${currentLevel + 1}</strong></p>
               <label>Name: <input id="pac-name-input" type="text" value="" style="width:100%;box-sizing:border-box;margin-top:6px;padding:8px;border-radius:4px;border:1px solid #333;background:#041122;color:#fff;"></label>`,
        buttons: [
            {
                text: "Save",
                primary: true,
                onClick: () => {
                    const nameEl = document.getElementById("pac-name-input");
                    const name = nameEl ? nameEl.value : "Jogador";
                    saveScoreLocal(name, score, currentLevel + 1);
                    setTimeout(() => showTop10Overlay(), 50);
                },
            },
            {
                text: "Don't Save",
                onClick: () => {
                    setTimeout(() => showTop10Overlay(), 50);
                },
            },
        ],
    });
}

/* ====== MOVIMENTO DO PACMAN ====== */
function movePacman(e) {
    const keyToDirClass = {
        ArrowLeft: "pac-left",
        ArrowRight: "pac-right",
        ArrowUp: "pac-up",
        ArrowDown: "pac-down",
    };
    const desiredDirClass = keyToDirClass[e.key];
    if (!squares[pacmanCurrentIndex]) return;

    squares[pacmanCurrentIndex].classList.remove(
        "pac-man",
        "pac-right",
        "pac-left",
        "pac-up",
        "pac-down"
    );
    switch (e.key) {
        case "ArrowLeft":
            if (
                pacmanCurrentIndex % width !== 0 &&
                !squares[pacmanCurrentIndex - 1].classList.contains("wall") &&
                !squares[pacmanCurrentIndex - 1].classList.contains(
                    "ghost-lair"
                )
            ) {
                pacmanCurrentIndex -= 1;
            }
            if (squares[pacmanCurrentIndex - 1] === squares[363]) {
                pacmanCurrentIndex = 391;
            }
            break;
        case "ArrowRight":
            if (
                pacmanCurrentIndex % width < width - 1 &&
                !squares[pacmanCurrentIndex + 1].classList.contains("wall") &&
                !squares[pacmanCurrentIndex + 1].classList.contains(
                    "ghost-lair"
                )
            ) {
                pacmanCurrentIndex += 1;
            }
            if (squares[pacmanCurrentIndex + 1] === squares[392]) {
                pacmanCurrentIndex = 364;
            }
            break;
        case "ArrowUp":
            if (
                pacmanCurrentIndex - width >= 0 &&
                !squares[pacmanCurrentIndex - width].classList.contains(
                    "wall"
                ) &&
                !squares[pacmanCurrentIndex - width].classList.contains(
                    "ghost-lair"
                )
            ) {
                pacmanCurrentIndex -= width;
            }
            break;
        case "ArrowDown":
            if (
                pacmanCurrentIndex + width < width * width &&
                !squares[pacmanCurrentIndex + width].classList.contains(
                    "wall"
                ) &&
                !squares[pacmanCurrentIndex + width].classList.contains(
                    "ghost-lair"
                )
            ) {
                pacmanCurrentIndex += width;
            }
            break;
    }
    if (desiredDirClass) {
        squares[pacmanCurrentIndex].classList.add("pac-man", desiredDirClass);
    } else {
        squares[pacmanCurrentIndex].classList.add("pac-man");
    }
    pacDotEaten();
    powerPelletEaten();
    checkForGameOver();
    checkForWin();
}

/* ====== PONTOS / POWER PELLET ====== */
function pacDotEaten() {
    if (!squares[pacmanCurrentIndex]) return;
    if (squares[pacmanCurrentIndex].classList.contains("pac-dot")) {
        score++;
        totalPacDotsRemaining = Math.max(0, totalPacDotsRemaining - 1);
        scoreDisplay.innerHTML = score;
        squares[pacmanCurrentIndex].classList.remove("pac-dot");
        sEatingDots.currentTime = 0;
        sEatingDots.play().catch(() => {});
    }
}
function powerPelletEaten() {
    if (!squares[pacmanCurrentIndex]) return;
    if (squares[pacmanCurrentIndex].classList.contains("power-pellet")) {
        score += 10;
        totalPacDotsRemaining = Math.max(0, totalPacDotsRemaining - 1);
        scoreDisplay.innerHTML = score;

        sEatingFruit.currentTime = 0;
        sEatingFruit.play().catch(() => {});

        ghosts.forEach((ghost) => (ghost.isScared = true));
        sScaredGhosts.currentTime = 0;
        sScaredGhosts.play().catch(() => {});
        setTimeout(unScareGhosts, 10000);

        squares[pacmanCurrentIndex].classList.remove("power-pellet");
    }
}
function unScareGhosts() {
    ghosts.forEach((ghost) => (ghost.isScared = false));
    sScaredGhosts.pause();
    sScaredGhosts.currentTime = 0;
}

/* ====== VERIFICAÇÕES DE FIM DE JOGO / VITÓRIA ====== */
function checkForGameOver() {
    if (
        squares[pacmanCurrentIndex] &&
        squares[pacmanCurrentIndex].classList.contains("ghost") &&
        !squares[pacmanCurrentIndex].classList.contains("scared-ghost")
    ) {
        ghosts.forEach((ghost) => clearInterval(ghost.timerId));
        document.removeEventListener("keydown", movePacman);
        sFail.currentTime = 0;
        sFail.play().catch(() => {});
        setTimeout(() => handleEndGame("Game Over!"), 500);
    }
}
function checkForWin() {
    if (totalPacDotsRemaining === 0) {
        ghosts.forEach((ghost) => clearInterval(ghost.timerId));
        document.removeEventListener("keydown", movePacman);
        setTimeout(() => advanceLevel(), 300);
    }
}

/* ====== TOCAR SOM DE INÍCIO E MOSTRAR O PLACAR NO COMEÇO (usando overlay) ====== */
function playStartOnFirstKey() {
    sStart.currentTime = 0;
    sStart.play().catch(() => {});
    setTimeout(() => {
        showTop10Overlay();
    }, 50);

    document.removeEventListener("keydown", playStartOnFirstKey);
}
document.addEventListener("keydown", playStartOnFirstKey);

/* ====== CARREGAR NÍVEIS DE UM FICHEIRO EXTERNO ====== */
(async function initLevelsAndStart() {
    try {
        const res = await fetch("./levels.json");
        if (!res.ok)
            throw new Error(
                "Não foi possível carregar levels.json — status " + res.status
            );
        const data = await res.json();
        if (!Array.isArray(data.levels))
            throw new Error("levels.json com formato inválido");

        levels = data.levels;

        loadLevel(0);
    } catch (err) {
        console.error("Erro a carregar níveis:", err);
    }
})();
