const grid = document.querySelector("#grid");
const jsConfetti = new JSConfetti();
const squares = [];

let gridSize;
let aliens;
let posicaoInicial;
let posicaoAtual;
let timeStart;
let timeEnd;
let timeTotal;

let moveUp;
let moveDown;
let moveLeft;
let moveRight;

let inputEnabled = true;
let dpadInitialized = false;

/* ---------- Validação de teclado ---------- */
function validarMovimento(event) {
    const map = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
    };
    const dir = map[event.key];
    if (dir) {
        event.preventDefault();
        moverBonecoDirection(dir);
    }
}

/* ---------- Movimento por direção textual (usado pelo D‑pad e teclado) ---------- */
function moverBonecoDirection(directionString) {
    const map = {
        up: moveUp,
        down: moveDown,
        left: moveLeft,
        right: moveRight,
    };
    const direction = map[directionString];
    if (direction === undefined) return;

    switch (directionString) {
        case "up":
            if (posicaoAtual < gridSize) return;
            break;
        case "down":
            if (posicaoAtual >= gridSize * gridSize - gridSize) return;
            break;
        case "left":
            if (posicaoAtual % gridSize === 0) return;
            break;
        case "right":
            if (posicaoAtual % gridSize === gridSize - 1) return;
            break;
    }

    moverBoneco(directionString, direction);
}

/* ---------- Movimento efetivo e colisões ---------- */
function moverBoneco(directionString, directionOffset) {
    if (!timeStart) {
        timeStart = Date.now();
    }

    squares[posicaoAtual].classList.remove("boneco");
    squares[posicaoAtual].style.backgroundImage = "";
    posicaoAtual += directionOffset;
    squares[posicaoAtual].classList.add("boneco");

    // Define sprite com base na direção textual
    switch (directionString) {
        case "up":
            squares[posicaoAtual].style.backgroundImage =
                "url(images/boneco-cima.png)";
            break;
        case "down":
            squares[posicaoAtual].style.backgroundImage =
                "url(images/boneco-baixo.png)";
            break;
        case "left":
            squares[posicaoAtual].style.backgroundImage =
                "url(images/boneco-esquerda.png)";
            break;
        case "right":
            squares[posicaoAtual].style.backgroundImage =
                "url(images/boneco-direita.png)";
            break;
    }

    // Colisão com alien
    if (squares[posicaoAtual].classList.contains("alien")) {
        squares[posicaoAtual].classList.remove("alien");
        const faltam = document.querySelectorAll(".alien").length;

        if (faltam !== 0) {
            alert("Alien captured! " + faltam + " aliens remaining!");
        } else {
            // Vitória
            document.removeEventListener("keydown", validarMovimento);

            timeEnd = Date.now();
            timeTotal = Math.floor((timeEnd - timeStart) / 1000);

            alert(
                "YOU WON! You captured all the aliens in " +
                    timeTotal +
                    " seconds!"
            );

            jsConfetti.addConfetti();

            setTimeout(() => {
                resetGame();
            }, 300);
        }
    }
}

/* ---------- Criação de aliens e grid ---------- */
function criarAliens() {
    const maxAliens = gridSize * gridSize - 1;
    if (aliens > maxAliens) {
        aliens = maxAliens;
    }

    let placed = 0;
    const totalCells = gridSize * gridSize;

    while (placed < aliens) {
        let posicaoAlien = Math.floor(Math.random() * totalCells);

        if (
            squares[posicaoAlien].classList.contains("alien") ||
            squares[posicaoAlien].classList.contains("boneco")
        ) {
            continue;
        }

        squares[posicaoAlien].classList.add("alien");
        placed++;
    }
}

function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
        const square = document.createElement("div");
        squares.push(square);
        grid.appendChild(square);
    }
}

/* ---------- D‑pad (botões) ---------- */
function initDpad() {
    if (dpadInitialized) return;
    const dpad = document.getElementById("dpad");
    if (!dpad) return;

    const buttons = Array.from(dpad.querySelectorAll(".dpad-btn"));

    function handleActivate(dir) {
        if (typeof moverBonecoDirection === "function") {
            moverBonecoDirection(dir);
        }
    }

    if (window.PointerEvent) {
        buttons.forEach((btn) => {
            const onPointerDown = (e) => {
                e.preventDefault();
                btn.classList.add("active");
                handleActivate(btn.dataset.dir);
            };
            const onPointerUp = () => btn.classList.remove("active");
            const onPointerLeave = () => btn.classList.remove("active");
            btn.addEventListener("pointerdown", onPointerDown);
            btn.addEventListener("pointerup", onPointerUp);
            btn.addEventListener("pointercancel", onPointerUp);
            btn.addEventListener("pointerleave", onPointerLeave);
            btn.setAttribute("tabindex", "0");
            btn.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    btn.classList.add("active");
                    handleActivate(btn.dataset.dir);
                    setTimeout(() => btn.classList.remove("active"), 120);
                }
            });
        });
    } else {
        buttons.forEach((btn) => {
            const onClick = (e) => {
                e.preventDefault();
                handleActivate(btn.dataset.dir);
            };
            const onTouchStart = (e) => {
                e.preventDefault();
                btn.classList.add("active");
                handleActivate(btn.dataset.dir);
                setTimeout(() => btn.classList.remove("active"), 120);
            };

            btn.addEventListener("click", onClick);
            btn.addEventListener("touchstart", onTouchStart);
            btn.addEventListener("touchend", () =>
                btn.classList.remove("active")
            );

            btn.setAttribute("tabindex", "0");
            btn.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    btn.classList.add("active");
                    handleActivate(btn.dataset.dir);
                    setTimeout(() => btn.classList.remove("active"), 120);
                }
            });
        });
    }

    dpadInitialized = true;
}

/* ---------- Inicialização ---------- */
function initGame() {
    document.removeEventListener("keydown", validarMovimento);

    grid.innerHTML = "";
    squares.length = 0;

    const defaultSize = 10;
    const defaultAliens = 5;
    const inputSize = parseInt(
        prompt("Choose grid size (e.g., 10 for 10x10):", defaultSize)
    );

    gridSize =
        Number.isInteger(inputSize) && inputSize > 1 ? inputSize : defaultSize;

    const inputAliens = parseInt(
        prompt("Choose number of aliens:", defaultAliens)
    );
    aliens =
        Number.isInteger(inputAliens) && inputAliens > 0
            ? inputAliens
            : defaultAliens;

    const gridWidthHeight = gridSize * 40;
    grid.style.width = gridWidthHeight + "px";
    grid.style.height = gridWidthHeight + "px";

    moveUp = -gridSize;
    moveDown = gridSize;
    moveLeft = -1;
    moveRight = +1;
    posicaoInicial = Math.floor(Math.random() * gridSize * gridSize);
    posicaoAtual = posicaoInicial;
    timeStart = undefined;
    timeEnd = undefined;
    timeTotal = undefined;

    createGrid();

    squares[posicaoAtual].classList.add("boneco");
    squares[posicaoAtual].style.backgroundImage =
        "url(images/boneco-baixo.png)";

    criarAliens();

    document.addEventListener("keydown", validarMovimento);
    initDpad();
}

function resetGame() {
    initGame();
}

initGame();
