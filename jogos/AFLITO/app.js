let chutesRestantes = 0; // Contador de tentativas (variável)

const maxChutes = 8; // Número máximo de tentativas (constante)
const porta = Math.floor(Math.random() * 100) + 1; // Número aleatório entre 1 e 100 (constante)
const chuteInput = document.querySelector("#chute"); // Seleciona o input do chute (constante)
const resultado = document.querySelector("#resultado"); // Seleciona o elemento de mensagem (constante)
const jsConfetti = new JSConfetti(); // Instancia o JSConfetti (constante)

// Função para verificar o chute do jogador
function verificarChute() {
    const chute = document.querySelector("#chute").value; // Obtém o valor do input (constante)

    if (chute < 1 || chute > 100) {
        resultado.innerHTML = "It must be a number between 1 and 100!<br>";
        return;
    }

    chutesRestantes++;

    if (chute != porta && chutesRestantes >= maxChutes) {
        resultado.innerHTML += `Last gess : ${chute} -> <strong>Game over</strong>!<br> The door was ${porta}.<br>`;
        document.querySelector("#botaoAdvinhar").disabled = true;
        document
            .querySelector("#botaoAdvinhar")
            .removeEventListener("click", verificarChute);
        return;
    }

    if (chute < porta) {
        resultado.innerHTML += `Gess #${chutesRestantes} : ${chute} -> <strong>Higher</strong>.<br>`;
    } else if (chute > porta) {
        resultado.innerHTML += `Gess #${chutesRestantes} : ${chute} -> <strong>Lower</strong>.<br>`;
    } else {
        resultado.innerHTML += `Gess #${chutesRestantes} : ${chute} -> <strong>You got it!</strong><br>`;
        jsConfetti.addConfetti();
    }

    chuteInput.value = ""; // Limpa o input do chute
    chuteInput.focus(); // Coloca o foco de volta no input do chute
}

document
    .querySelector("#botaoAdvinhar")
    .addEventListener("click", verificarChute); // Adiciona o evento de clique ao botão (constante)
