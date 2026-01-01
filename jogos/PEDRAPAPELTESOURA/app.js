const ROCK = "✊";
const PAPER = "✋";
const SCISSORS = "✌️";
const choices = [ROCK, PAPER, SCISSORS];

const botoes = document.querySelectorAll("#botoes-jogador button");
const userChoiceSpan = document.querySelector("#user-choice .value");
const computerChoiceSpan = document.querySelector("#computer-choice .value");
const resultSpan = document.querySelector("#result .value");
const jsConfetti = new JSConfetti(); // Instancia o JSConfetti (constante)

botoes.forEach((botao) => botao.addEventListener("click", onClick));

function onClick() {
    const raw = this.textContent.trim() || this.dataset.choice || this.id;
    let userChoice = RAW_TO_SYMBOL(raw);
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    const result = getResult(userChoice, computerChoice);

    userChoiceSpan.textContent = userChoice;
    computerChoiceSpan.textContent = computerChoice;
    resultSpan.textContent = result;
}

function getResult(user, computer) {
    if (user === computer) return "Draw.";
    if (
        (user === ROCK && computer === SCISSORS) ||
        (user === PAPER && computer === ROCK) ||
        (user === SCISSORS && computer === PAPER)
    ) {
        jsConfetti.addConfetti();
        return "You won!";
    }
    return "You lost, try again...";
}

function RAW_TO_SYMBOL(raw) {
    if (!raw) return ROCK;
    raw = String(raw).trim();
    if (raw.includes(ROCK)) return ROCK;
    if (raw.includes(PAPER)) return PAPER;
    if (raw.includes("✌")) return SCISSORS;
    const low = raw.toLowerCase();
    if (low.includes("ped")) return ROCK;
    if (low.includes("pap")) return PAPER;
    return SCISSORS;
}
