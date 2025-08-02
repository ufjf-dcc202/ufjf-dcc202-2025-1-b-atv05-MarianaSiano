document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const resetButton = document.getElementById('resetButton');
    const executeSolutionButton = document.getElementById('executeSolutionButton');
    const gameMessagesElement = document.getElementById('game-messages');
    let selectedPiece = null; // A peça atualmente selecionada

    //Estado inicial do tabuleiro: 3 peças pretas, 1 slot vazio, 3 peças brancas
    const initialBoardState = [
        'black-piece', 'black-piece', 'black-piece',
        '', //Slot vazio
        'white-piece', 'white-piece', 'white-piece'
    ];

    //Estado final desejado (solução): 3 peças brancas, 1 slot vazio, 3 peças pretas
    const solvedBoardState = [
        'white-piece', 'white-piece', 'white-piece',
        '', //Slot vazio
        'black-piece', 'black-piece', 'black-piece'
    ];

    let currentBoardState = [...initialBoardState]; //Copia o estado inicial para o estado atual do jogo

    //Sequência de ações fornecida na imagem
    //Formato: { type: 'move'/'jump', from: index, to: index }
    const solutionSequence = [
        { type: 'move', from: 2, to: 3 },
        { type: 'jump', from: 4, to: 2 },
        { type: 'move', from: 5, to: 4 },
        { type: 'jump', from: 3, to: 5 },
        { type: 'jump', from: 1, to: 3 },
        { type: 'move', from: 0, to: 1 },
        { type: 'jump', from: 2, to: 0 },
        { type: 'jump', from: 4, to: 2 },
        { type: 'jump', from: 6, to: 4 },
        { type: 'move', from: 5, to: 6 },
        { type: 'jump', from: 3, to: 5 },
        { type: 'jump', from: 1, to: 3 },
        { type: 'move', from: 2, to: 1 },
        { type: 'jump', from: 4, to: 2 },
        { type: 'move', from: 3, to: 4 }
    ];

    //Renderiza o tabuleiro no HTML com base no currentBoardState.
    //Remove todos os elementos existentes e os recria.
    function renderBoard() {
        boardElement.innerHTML = ''; //Limpa o tabuleiro atual
        currentBoardState.forEach((pieceClass, index) => {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.dataset.index = index; //Armazena o índice do slot

            if(pieceClass) {
                //Se houver uma peça neste slot, cria e adiciona a peça
                const piece = document.createElement('div');
                piece.classList.add(pieceClass);
                piece.dataset.index = index; //A peça também precisa do seu índice para seleção
                slot.appendChild(piece);
            }
            boardElement.appendChild(slot); //Adiciona o slot (com ou sem peça) ao tabuleiro
        });
        addPieceEventListeners(); //Adiciona os event listeners às novas peças
    }

    //Adiciona event listeners de clique a todas as peças no tabuleiro.
    function addPieceEventListeners() {
        document.querySelectorAll('.black-piece, .white-piece').forEach(piece => {
            piece.addEventListener('click', handlePieceClick);
        });
    }

    /**
     * Lida com o clique em uma peça.
     * Gerencia a seleção de peças e tenta realizar movimentos.
     * @param {Event} event - O evento de clique.
     */
    function handlePieceClick(event) {
        //Limpa mensagens anteriores
        displayMessage('');

        const clickedPiece = event.target;
        const clickedIndex = parseInt(clickedPiece.dataset.index); //Índice da peça clicada

        if(selectedPiece === clickedPiece) {
            //Se a mesma peça for clicada novamente, deseleciona-a
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
        } else if(selectedPiece) {
            //Se já houver uma peça selecionada, tenta mover a peça selecionada para o slot da peça clicada
            const selectedIndex = parseInt(selectedPiece.dataset.index);
            const targetIndex = clickedIndex; //O slot da peça clicada é o alvo potencial

            if(isValidMove(selectedIndex, targetIndex)) {
                movePiece(selectedIndex, targetIndex);
            } else {
                //Se o movimento for inválido, deseleciona a peça atual e seleciona a nova peça clicada
                selectedPiece.classList.remove('selected');
                selectedPiece = clickedPiece;
                selectedPiece.classList.add('selected');
                displayMessage('Movimento inválido. Tente novamente.', 'error');
            }
        } else {
            //Nenhuma peça selecionada, então seleciona esta peça
            selectedPiece = clickedPiece;
            selectedPiece.classList.add('selected');
        }
    }

    /**
     * Verifica se um movimento é válido de acordo com as regras do jogo.
     * @param {number} startIndex - O índice da peça a ser movida.
     * @param {number} targetIndex - O índice do slot de destino.
     * @returns {boolean} - Verdadeiro se o movimento for válido, falso caso contrário.
     */
    function isValidMove(startIndex, targetIndex) {
        const pieceType = currentBoardState[startIndex]; //Tipo da peça que se quer mover
        const emptySlotIndex = currentBoardState.indexOf(''); //Índice do slot vazio

        //Um movimento é válido APENAS se o targetIndex for o slot vazio.
        //A lógica de "pular uma peça" ou "deslizar" se refere à distância entre a peça e o slot vazio.
        if (targetIndex !== emptySlotIndex) {
            return false; //Só pode mover para um slot vazio
        }

        //Regra 1: Deslizar uma peça para a posição vizinha se estiver vazia
        if(Math.abs(startIndex - emptySlotIndex) === 1) {
            return true;
        }

        //Regra 2: Pular uma única peça até a posição seguinte, se esta estiver vazia
        //Verifica para peças pretas pulando para frente (índice da peça < índice do vazio)
        if(pieceType === 'black-piece' && startIndex < emptySlotIndex) {
            if(emptySlotIndex - startIndex === 2) {
                //Verifica se há uma peça branca entre a peça preta e o slot vazio
                if(currentBoardState[startIndex + 1] === 'white-piece') {
                    return true;
                }
            }
        }

        //Verifica para peças brancas pulando para trás (índice da peça > índice do vazio)
        if(pieceType === 'white-piece' && startIndex > emptySlotIndex) {
            if(startIndex - emptySlotIndex === 2) {
                //Verifica se há uma peça preta entre a peça branca e o slot vazio
                if(currentBoardState[startIndex - 1] === 'black-piece') {
                    return true;
                }
            }
        }
        return false; //Movimento inválido
    }

    /**
     * Realiza o movimento de uma peça no tabuleiro.
     * @param {number} startIndex - O índice da peça a ser movida.
     * @param {number} targetIndex - O índice do slot de destino.
     */
    function movePiece(startIndex, targetIndex) {
        const emptySlotIndex = currentBoardState.indexOf(''); //Encontra o índice atual do slot vazio

        //Troca a peça selecionada com o slot vazio
        currentBoardState[emptySlotIndex] = currentBoardState[startIndex]; //Move a peça para o slot vazio
        currentBoardState[startIndex] = ''; //A posição original da peça se torna vazia

        renderBoard(); //Re-renderiza o tabuleiro para refletir o novo estado
        selectedPiece = null; //Desseleciona a peça após o movimento

        //Verifica a condição de vitória após cada movimento
        if(checkWinCondition()) {
            displayMessage('Parabéns! Você resolveu o problema!', 'success');
        }
    }

    /**
     * Verifica se o estado atual do tabuleiro corresponde ao estado de vitória.
     * @returns {boolean} - Verdadeiro se o jogo estiver resolvido, falso caso contrário.
     */
    function checkWinCondition() {
        // Compara o estado atual com o estado final desejado
        for(let i = 0; i < currentBoardState.length; i++) {
            if(currentBoardState[i] !== solvedBoardState[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Exibe uma mensagem para o usuário.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - O tipo da mensagem ('success' ou 'error').
     */
    function displayMessage(message, type = 'error') {
        gameMessagesElement.textContent = message;
        gameMessagesElement.className = ''; //Limpa classes anteriores
        gameMessagesElement.classList.add(type === 'success' ? 'message-success' : 'message-error');
    }

    //Reinicia o jogo para o estado inicial.
    function resetGame() {
        currentBoardState = [...initialBoardState]; //Restaura o estado inicial
        renderBoard(); //Renderiza o tabuleiro com o estado reiniciado
        selectedPiece = null; //Garante que nenhuma peça esteja selecionada
        displayMessage(''); //Limpa as mensagens
    }

    //Executa a sequência de movimentos pré-definida.
    //Adiciona um pequeno atraso entre os movimentos para visualização.
    async function executeSolution() {
        resetGame(); //Reinicia o jogo antes de executar a solução
        displayMessage('Executando a solução...', 'info');

        for(let i = 0; i < solutionSequence.length; i++) {
            const move = solutionSequence[i];
            const startIndex = move.from;
            const targetIndex = currentBoardState.indexOf(''); // O slot vazio é sempre o alvo

            //Verifica se o movimento é válido antes de executá-lo
            //Isso é importante porque a sequência pode ter sido gerada para um estado específico e o isValidMove verifica o estado atual do tabuleiro.
            if(isValidMove(startIndex, targetIndex)) {
                movePiece(startIndex, targetIndex);
                await new Promise(resolve => setTimeout(resolve, 500)); //Pequeno atraso para visualização
            } else {
                displayMessage(`Falha na solução: Movimento inválido na etapa ${i + 1} (de ${startIndex} para ${targetIndex}).`, 'error');
                break; //Para a execução se um movimento for inválido
            }
        }

        if(checkWinCondition()) {
            displayMessage('A solução proposta resolveu o problema!', 'success');
        } else {
            displayMessage('A execução da solução terminou, mas o problema não foi resolvido.', 'error');
        }
    }

    //Adiciona os event listeners para os botões
    resetButton.addEventListener('click', resetGame);
    executeSolutionButton.addEventListener('click', executeSolution);

    //Renderiza o tabuleiro pela primeira vez quando a página é carregada
    renderBoard();
});