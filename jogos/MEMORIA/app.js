//ARRAY DE CARTAS
const cardArray = [
    {
        nome: "cheeseburger",
        img: "cheeseburger.png",
    },
    {
        nome: "fries",
        img: "fries.png",
    },
    {
        nome: "hotdog",
        img: "hotdog.png",
    },
    {
        nome: "ice-cream",
        img: "ice-cream.png",
    },
    {
        nome: "milkshake",
        img: "milkshake.png",
    },
    {
        nome: "pizza",
        img: "pizza.png",
    },
    {
        nome: "cheeseburger",
        img: "cheeseburger.png",
    },
    {
        nome: "fries",
        img: "fries.png",
    },
    {
        nome: "hotdog",
        img: "hotdog.png",
    },
    {
        nome: "ice-cream",
        img: "ice-cream.png",
    },
    {
        nome: "milkshake",
        img: "milkshake.png",
    },
    {
        nome: "pizza",
        img: "pizza.png",
    },
];

//EMBARALHA AS CARTAS
cardArray.sort(() => 0.5 - Math.random()); // 50% de chance de trocar dois elementos

//ATRIBUTOS GLOBAIS
const cardCover = "cover.png"; // Imagem da capa do cartão
const cardWhite = ""; // Imagem do cartão branco
const cardPath = "images/"; // Caminho para a pasta de imagens
const score = document.querySelector("#score"); // Elemento para exibir a pontuação

const cardsWon = []; // Array para armazenar os pares de cartas encontrados
let cardsChosen = []; // Array para armazenar as cartas escolhidas (que vai variar a cada escolha)
let cardsChosenIds = []; // Array para armazenar os IDs das cartas escolhidas

let timeStart, timeEnd, timeTotal; // Variáveis para controle de tempo

//FUNÇÃO PARA CRIAR O TABULEIRO
function createBoard() {
    const grid = document.querySelector("#grid");

    cardArray.forEach((cardItem, key) => {
        const card = document.createElement("img");
        //card.setAttribute("src", cardPath + cardCover);
        card.src = cardPath + cardCover; // Define a imagem da capa do cartão
        card.setAttribute("data-id", key); // Define um atributo data-id para identificar a carta
        card.addEventListener("click", flipCard); // Adiciona o evento de clique para virar a carta
        grid.appendChild(card); //acrescenta a carta ao tabuleiro
    });
}

//FUNÇÃO PARA VIRAR A CARTA
function flipCard() {
    if (!timeStart) {
        timeStart = Date.now();
        //alert("O cronômetro começou!");
    }

    const cardId = this.dataset.id; // "dataset" é o conjunto de atributos data-*, que já existe no HTML por default
    //console.log("Virar a carta", cardArray[cardId].img); // Exibe o ID da carta no console
    this.src = cardPath + cardArray[cardId].img; // Muda a imagem da carta para a imagem correspondente

    cardsChosen.push(cardArray[cardId].nome); // Adiciona o nome da carta escolhida ao array cardsChosen
    cardsChosenIds.push(cardId); // Adiciona o ID da carta escolhida ao array cardsChosenIds

    if (cardsChosen.length === 2) {
        // Se duas cartas foram escolhidas
        setTimeout(matchCards, 500); // Chama a função para comparar as cartas após 500ms
    }
}

//FUNÇÃO COMPARAR AS CARTAS
function matchCards() {
    const cards = document.querySelectorAll("#grid img"); // Seleciona todas as imagens (cartas) do tabuleiro
    const jsConfetti = new JSConfetti();

    if (cardsChosenIds[0] == cardsChosenIds[1]) {
        alert("You choose the same card!");
        cards[cardsChosenIds[0]].src = cardPath + cardCover; // Volta a imagem da carta para a capa
    } else if (cardsChosen[0] === cardsChosen[1]) {
        //alert("Você encontrou um par!");
        cards[cardsChosenIds[0]].src = cards[cardsChosenIds[1]].src = cardWhite; // Muda a imagem da carta para a imagem "branca"
        jsConfetti.addConfetti();
        cards[cardsChosenIds[0]].removeEventListener("click", flipCard); // Remove o evento de clique da carta
        cards[cardsChosenIds[1]].removeEventListener("click", flipCard); // Remove o evento de clique da carta

        cards[cardsChosenIds[0]].setAttribute("feito", ""); // Marca a carta como "feita"
        cards[cardsChosenIds[1]].setAttribute("feito", ""); // Marca a carta como "feita"

        cardsWon.push(cardsChosen); // Adiciona o par encontrado ao array cardsWon
    } else {
        //alert("Tente novamente.");
        cards[cardsChosenIds[0]].src = cards[cardsChosenIds[1]].src =
            cardPath + cardCover; // Volta a imagem da carta para a capa
    }

    cardsChosen = []; // Limpa o array cardsChosen para a próxima tentativa
    cardsChosenIds = []; // Limpa o array cardsChosenIds para a próxima tentativa

    if (cardsWon.length < cardArray.length / 2) {
        score.querySelector("span").innerText = cardsWon.length; // Atualiza a pontuação (número de pares encontrados)
    } else {
        timeEnd = Date.now();
        timeTotal = Math.floor((timeEnd - timeStart) / 1000); // Tempo total em segundos
        score.innerText = `Congratulations! You found all pairs in ${timeTotal} seconds!`;
    }
}

createBoard();
