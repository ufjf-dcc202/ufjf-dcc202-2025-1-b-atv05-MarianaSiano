document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const resetButton = document.getElementById('resetButton');
    let selectedPiece = null; //A peça atualmente selecionada

    //Estado inicial do tabuleiro: 3 peças pretas, 1 slot vazio, 3 peças brancas
    const initialBoardState = [
        'black-piece', 'black-piece', 'black-piece',
        '', //Slot vazio
        'white-piece', 'white-piece', 'white-piece'
    ];

    let currentBoardState = [...initialBoardState]; //Copia o estado inicial para o estado atual do jogo

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
     * @param {number} targetIndex - O índice do slot de destino (onde a peça clicada está).
     * @returns {boolean} - Verdadeiro se o movimento for válido, falso caso contrário.
     */
    function isValidMove(startIndex, targetIndex) {
        const pieceType = currentBoardState[startIndex]; // Tipo da peça que se quer mover
        const emptySlotIndex = currentBoardState.indexOf(''); // Índice do slot vazio

        //Regra 1: Deslizar uma peça para a posição vizinha se estiver vazia
        //Verifica se o slot de destino é o slot vazio e se é adjacente
        if(targetIndex === emptySlotIndex && Math.abs(startIndex - emptySlotIndex) === 1) {
            return true;
        }

        //Regra 2: Pular uma única peça até a posição seguinte, se esta estiver vazia
        //Verifica para peças pretas pulando para frente
        if(pieceType === 'black-piece' && startIndex < emptySlotIndex) {
            if(emptySlotIndex - startIndex === 2) {
                //Verifica se há uma peça branca entre a peça preta e o slot vazio
                if(currentBoardState[startIndex + 1] === 'white-piece') {
                    return true;
                }
            }
        }

        //Verifica para peças brancas pulando para trás
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
    }

    //Reinicia o jogo para o estado inicial.
    function resetGame() {
        currentBoardState = [...initialBoardState]; //Restaura o estado inicial
        renderBoard(); //Renderiza o tabuleiro com o estado reiniciado
        selectedPiece = null; //Garante que nenhuma peça esteja selecionada
    }

    //Adiciona o event listener para o botão de reiniciar
    resetButton.addEventListener('click', resetGame);

    //Renderiza o tabuleiro pela primeira vez quando a página é carregada
    renderBoard();
});