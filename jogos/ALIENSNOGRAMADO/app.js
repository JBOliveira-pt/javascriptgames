const grid = document.querySelector("#grid");

document.addEventListener("keydown", validarMovimento);

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

function validarMovimento(event) {
    if (!timeStart) {
        timeStart = Date.now();
    }

    let direction = 0;

    switch (event.key) {
        case "ArrowUp":
            if (posicaoAtual >= gridSize) direction = moveUp;
            break;
        case "ArrowDown":
            if (posicaoAtual < gridSize * gridSize - gridSize)
                direction = moveDown;
            break;
        case "ArrowLeft":
            if (posicaoAtual % gridSize !== 0) direction = moveLeft;
            break;
        case "ArrowRight":
            if (posicaoAtual % gridSize !== gridSize - 1) direction = moveRight;
            break;
    }

    if (direction !== 0) moverBoneco(direction);
}

function moverBoneco(direction) {
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

createGrid();

squares[posicaoAtual].style.backgroundImage = "url(images/boneco-baixo.png)";

for (let i = 0; i < aliens; i++) {
    criarAliens();
}
