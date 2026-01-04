const grid = document.querySelector("#grid");
const gridSize = parseInt(prompt("Choose grid size (e.g., 10 for 10x10):", 10));

const posicaoInicial = Math.floor(Math.random() * gridSize * gridSize);
let posicaoAtual = posicaoInicial;

let timeStart, timeEnd, timeTotal;

const gridWidthHeight = gridSize * 40;
grid.style.width = gridWidthHeight + "px";
grid.style.height = gridWidthHeight + "px";

const aliens = parseInt(prompt("Choose number of aliens:", 5));

const squares = [];
const moveUp = -gridSize;
const moveDown = gridSize;
const moveLeft = -1;
const moveRight = +1;

const jsConfetti = new JSConfetti();

let dpadInitialized = false;

function validarMovimento(event) {
    if (event.repeat) return;

    let dir = null;
    switch (event.key) {
        case "ArrowUp":
            dir = "up";
            break;
        case "ArrowDown":
            dir = "down";
            break;
        case "ArrowLeft":
            dir = "left";
            break;
        case "ArrowRight":
            dir = "right";
            break;
    }

    if (dir) {
        event.preventDefault();
        moverBonecoDirection(dir);
    }
}

/* wrapper que recebe as direções textuais e chama a função existente moverBoneco */
function moverBonecoDirection(directionString) {
    const map = {
        up: moveUp,
        down: moveDown,
        left: moveLeft,
        right: moveRight,
    };
    const direction = map[directionString];
    if (direction !== undefined) {
        moverBoneco(direction);
    }
}

function moverBoneco(direction) {
    if (!timeStart) {
        timeStart = Date.now();
    }

    squares[posicaoAtual].classList.remove("boneco");
    squares[posicaoAtual].style.backgroundImage = "";

    posicaoAtual += direction;

    squares[posicaoAtual].classList.add("boneco");
    switch (direction) {
        case moveUp:
            squares[posicaoAtual].style.backgroundImage =
                "url(images/boneco-cima.png)";
            break;
        case moveDown:
            squares[posicaoAtual].style.backgroundImage =
                "url(images/boneco-baixo.png)";
            break;
        case moveLeft:
            squares[posicaoAtual].style.backgroundImage =
                "url(images/boneco-esquerda.png)";
            break;
        case moveRight:
            squares[posicaoAtual].style.backgroundImage =
                "url(images/boneco-direita.png)";
            break;
    }

    if (squares[posicaoAtual].classList.contains("alien")) {
        squares[posicaoAtual].classList.remove("alien");
        const faltam = document.querySelectorAll(".alien").length;
        if (faltam !== 0) {
            alert("Alien captured! " + faltam + " aliens remaining!");
        } else {
            timeEnd = Date.now();
            timeTotal = Math.floor((timeEnd - timeStart) / 1000);

            alert(
                "YOU WON! You captured all the aliens in " +
                    timeTotal +
                    " seconds!"
            );

            jsConfetti.addConfetti();

            document.removeEventListener("keydown", validarMovimento);
        }
    }
}

function criarAliens() {
    let posicaoAlien = Math.floor(Math.random() * gridSize * gridSize);

    if (
        squares[posicaoAlien].classList.contains("alien") ||
        squares[posicaoAlien].classList.contains("boneco")
    ) {
        return criarAliens();
    }
    squares[posicaoAlien].classList.add("alien");
}

function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
        const square = document.createElement("div");
        squares.push(square);
        grid.appendChild(square);
    }
    squares[posicaoInicial].classList.add("boneco");
}

/* ---------- D‑pad ---------- */
function initDpad() {
    if (dpadInitialized) return;
    const dpad = document.getElementById("dpad");
    if (!dpad) return;

    const buttons = Array.from(dpad.querySelectorAll(".dpad-btn"));

    function handleActivate(dir) {
        moverBonecoDirection(dir);
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

/* --- Inicialização --- */
createGrid();

squares[posicaoAtual].style.backgroundImage = "url(images/boneco-baixo.png)";
for (let i = 0; i < aliens; i++) {
    criarAliens();
}

document.addEventListener("keydown", validarMovimento);
initDpad();
