const grid = document.querySelector("#grid");
const lastTimeDiv = document.getElementById("last-time");

const gridWidth = 9;
const gridSize = gridWidth * gridWidth;
let squares = [];

let frog;
const initialPosition = 76;
let currentPosition = initialPosition;

const moveUp = -gridWidth;
const moveDown = gridWidth;
const moveLeft = -1;
const moveRight = 1;

let autoMoveInterval = null;
let checkInterval = null;

let timerStarted = false;
let startTime = 0;

let logsTop = [];
let logsBottom = [];
let carsLeft = [];
let carsRight = [];
let dpadInitialized = false;

function formatTime(ms) {
    const s = ms / 1000;
    return s.toFixed(2) + "s";
}

function createBoard() {
    let j = 1;
    for (let i = 0; i < gridSize; i++) {
        const square = document.createElement("div");

        if (i === 4) square.classList.add("end");

        if (i >= 18 && i < 27) {
            square.classList.add("road-left");
            square.classList.add("car-left" + j);
            square.setAttribute("data-car-left", j++);
            if (j > 3) j = 1;
        }
        if (i >= 27 && i < 36) {
            square.classList.add("road-right");
            square.classList.add("car-right" + j);
            square.setAttribute("data-car-right", j++);
            if (j > 3) j = 1;
        }
        if (i >= 45 && i < 54) {
            square.classList.add("river-top");
            square.classList.add("log" + j);
            square.setAttribute("data-log", j++);
            if (j > 5) j = 1;
        }
        if (i >= 54 && i < 63) {
            square.classList.add("river-bottom");
            square.classList.add("log" + j);
            square.setAttribute("data-log", j++);
            if (j > 5) j = 1;
        }
        squares.push(square);
        grid.appendChild(square);
    }
}

function createFrogElement() {
    frog = document.createElement("img");
    frog.src = "images/frog.gif";
    frog.alt = "frog";
    frog.draggable = false;
    frog.classList.add("frog-img");
}

/* Função que move o sapo a partir de uma direção textual (usada pelo D-pad) */
function moveFrogDirection(direction) {
    if (!timerStarted) {
        timerStarted = true;
        startTime = Date.now();
    }
    if (frog.parentElement) frog.parentElement.removeChild(frog);
    switch (direction) {
        case "up":
            if (currentPosition - gridWidth >= 0) currentPosition += moveUp;
            break;
        case "down":
            if (currentPosition + gridWidth < gridSize)
                currentPosition += moveDown;
            break;
        case "left":
            if (currentPosition % gridWidth !== 0) currentPosition += moveLeft;
            break;
        case "right":
            if (currentPosition % gridWidth < gridWidth - 1)
                currentPosition += moveRight;
            break;
        default:
            break;
    }
    squares[currentPosition].appendChild(frog);
}

function moveFrog(e) {
    if (!timerStarted) {
        timerStarted = true;
        startTime = Date.now();
    }
    if (frog.parentElement) frog.parentElement.removeChild(frog);
    switch (e.key) {
        case "ArrowUp":
            if (currentPosition - gridWidth >= 0) currentPosition += moveUp;
            break;
        case "ArrowDown":
            if (currentPosition + gridWidth < gridSize)
                currentPosition += moveDown;
            break;
        case "ArrowLeft":
            if (currentPosition % gridWidth !== 0) currentPosition += moveLeft;
            break;
        case "ArrowRight":
            if (currentPosition % gridWidth < gridWidth - 1)
                currentPosition += moveRight;
            break;
        default:
            break;
    }
    squares[currentPosition].appendChild(frog);
}

function moveLogTop(logCell) {
    logCell.classList.remove("log" + logCell.dataset.log);
    if (logCell.dataset.log == 5) {
        logCell.classList.add("log" + 1);
        logCell.dataset.log = 1;
    } else {
        const nextLog = parseInt(logCell.dataset.log) + 1;
        logCell.classList.add("log" + nextLog);
        logCell.dataset.log = nextLog;
    }
}

function moveLogBottom(logCell) {
    logCell.classList.remove("log" + logCell.dataset.log);
    if (logCell.dataset.log == 1) {
        logCell.classList.add("log" + 5);
        logCell.dataset.log = 5;
    } else {
        logCell.classList.add("log" + (logCell.dataset.log - 1));
        logCell.dataset.log -= 1;
    }
}

function moveCarLeft(carLeft) {
    carLeft.classList.remove("car-left" + carLeft.dataset.carLeft);
    if (carLeft.dataset.carLeft == 3) {
        carLeft.classList.add("car-left" + 1);
        carLeft.dataset.carLeft = 1;
    } else {
        const nextCar = parseInt(carLeft.dataset.carLeft) + 1;
        carLeft.classList.add("car-left" + nextCar);
        carLeft.dataset.carLeft = nextCar;
    }
}

function moveCarRight(carRight) {
    carRight.classList.remove("car-right" + carRight.dataset.carRight);
    if (carRight.dataset.carRight == 1) {
        carRight.classList.add("car-right" + 3);
        carRight.dataset.carRight = 3;
    } else {
        carRight.classList.add("car-right" + (carRight.dataset.carRight - 1));
        carRight.dataset.carRight -= 1;
    }
}

function autoMove() {
    logsTop.forEach((cell) => moveLogTop(cell));
    logsBottom.forEach((cell) => moveLogBottom(cell));
    carsLeft.forEach((carLeft) => moveCarLeft(carLeft));
    carsRight.forEach((carRight) => moveCarRight(carRight));
}

function endGame(won) {
    const jsConfetti = new JSConfetti();
    document.removeEventListener("keydown", moveFrog);
    clearInterval(autoMoveInterval);
    clearInterval(checkInterval);
    autoMoveInterval = null;
    checkInterval = null;

    if (won) {
        let elapsedText = "—";
        if (timerStarted) {
            const elapsedMs = Date.now() - startTime;
            elapsedText = formatTime(elapsedMs);
            lastTimeDiv.textContent = `Last time: ${elapsedText}`;
        } else {
            lastTimeDiv.textContent = `Last time: —`;
        }
        jsConfetti.addConfetti();
        alert(`You won! Time: ${elapsedText}`);
        resetGame();
    } else {
        if (frog && frog.tagName === "IMG") {
            frog.src = "images/frog-dead.png";
            frog.alt = "frog dead";
            frog.classList.add("dead");
        }

        const here = squares[currentPosition].classList;
        let loseMsg = "Your frog was squashed!";

        if (here.contains("car-left1") || here.contains("car-right1")) {
            loseMsg = "Your frog was run over by a car!";
        } else if (
            here.contains("log1") ||
            here.contains("log2") ||
            here.contains("log3")
        ) {
            loseMsg = "Your frog was carried away by a log!";
        }
        setTimeout(() => {
            alert(loseMsg);
            resetGame();
        }, 700);
    }
}

function checkWin() {
    const here = squares[currentPosition].classList;
    if (
        here.contains("log1") ||
        here.contains("log2") ||
        here.contains("log3") ||
        here.contains("car-left1") ||
        here.contains("car-right1")
    ) {
        endGame(false);
        return;
    } else if (here.contains("end")) {
        endGame(true);
        return;
    }
}

function initIntervals() {
    autoMoveInterval = setInterval(autoMove, 1000);
    checkInterval = setInterval(checkWin, 50);
}

/* ---------- D‑pad ---------- */
function initDpad() {
    if (dpadInitialized) return;
    const dpad = document.getElementById("dpad");
    if (!dpad) return;

    const buttons = Array.from(dpad.querySelectorAll(".dpad-btn"));

    function handleActivate(dir) {
        if (typeof moveFrogDirection === "function") {
            moveFrogDirection(dir);
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

function initGame() {
    if (autoMoveInterval) {
        clearInterval(autoMoveInterval);
        autoMoveInterval = null;
    }
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
    document.removeEventListener("keydown", moveFrog);

    grid.innerHTML = "";
    squares = [];

    createBoard();
    createFrogElement();

    currentPosition = initialPosition;
    squares[initialPosition].appendChild(frog);

    logsTop = Array.from(document.querySelectorAll(".river-top"));
    logsBottom = Array.from(document.querySelectorAll(".river-bottom"));
    carsLeft = Array.from(document.querySelectorAll(".road-left"));
    carsRight = Array.from(document.querySelectorAll(".road-right"));

    timerStarted = false;
    startTime = 0;

    document.addEventListener("keydown", moveFrog);

    initIntervals();
    initDpad();
}
function resetGame() {
    initGame();
}
initGame();
