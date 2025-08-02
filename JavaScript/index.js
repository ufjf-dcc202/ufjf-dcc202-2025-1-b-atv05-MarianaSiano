document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const resetButton = document.getElementById('resetButton');
    let selectPiece = null;

    const initialBoardState = [
        'black-piece', 'black-piece', 'black-piece',
        '', //slot vazio
        'white-piece', 'white-piece', 'white-piece'
    ];

    let currentBoardState = [...initialBoardState]; //Faça uma cópia

    function renderBoard() {
        boardElement.innerHTML = '';
        currentBoardState.forEach((pieceClass, index) => {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.dataset.index = index;

            if(pieceClass) {
                const piece = document.createElement('div');
                piece.classList.add(pieceClass);
                piece.dataset.index = index; //A peça também precisa de seu índice para seleção
                slot.appendChild(piece);
            }
            boardElement.appendChild(slot);
        });
        addPieceEventListeners();
    }

    function handlePieceClick(event) {
        const clickedPiece = event.target;
        const clickedIndex = parseInt(clickedPiece.dataset.index);

        if(selectedPiece === clickedPiece) {
            //Desmarque se a mesma peça for clicada novamente
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
        } else if(selectedPiece) {
            //Uma peça já está selecionada, tente mover
            const selectedIndex = parseInt(selectedPiece.dataset.index);
            const targetIndex = clickedIndex;

            if(isValidMove(selectedIndex, targetIndex)) {
                movePiece(selectedIndex, targetIndex);
            } else {
                //Se o movimento for inválido, desmarque o atual e selecione o novo
                selectedPiece.classList.remove('selected');
                selectedPiece = clickedPiece;
                selectedPiece.classList.add('selected');
            }
        } else {
            //Nenhuma peça selecionada, selecione esta
            selectedPiece = clickedPiece;
            selectedPiece.classList.add('selected');
        }
    }

    function isValidMove(startIndex, targetIndex) {
        const pieceType = currentBoardState[startIndex];
        const emptySlotIndex = currentBoardState.indexOf('');

        //Regra 1: Deslize uma peça para uma posição vazia adjacente
        if(Math.abs(startIndex - emptySlotIndex) === 1 && targetIndex === emptySlotIndex) {
            return true;
        }

        //Regra 2: Pule uma única peça para a próxima posição se estiver vazia
        //Verifique se as peças pretas estão saltando para a frente
        if(pieceType === 'black-piece' && startIndex < emptySlotIndex) {
            if(emptySlotIndex - startIndex === 2) {
                //Verifique se há uma peça branca no meio
                if(currentBoardState[startIndex + 1] === 'white-piece') {
                    return true;
                }
            }
        }
        //Verifique se as peças brancas saltam para trás
        if(pieceType === 'white-piece' && startIndex > emptySlotIndex) {
            if(startIndex - emptySlotIndex === 2) {
                //Verifique se há uma peça preta no meio
                if(currentBoardState[startIndex - 1] === 'black-piece') {
                    return true;
                }
            }
        }
        return false;
    }

    function movePiece(startIndex, targetIndex) {
        //Encontre o slot vazio real
        const emptySlotIndex = currentBoardState.indexOf('');

        //Execute a movimentação no array currentBoardState
        currentBoardState[emptySlotIndex] = currentBoardState[startIndex]; //Mova a peça para o espaço vazio
        currentBoardState[startIndex] = ''; //A posição original fica vazia

        renderBoard(); //Re-renderize o tabuleiro para refletir o novo estado
        selectedPiece = null; //Desmarque a peça após o movimento
    }

    function resetGame() {
        currentBoardState = [...initialBoardState];
        renderBoard();
        selectedPiece = null;
    }

    resetButton.addEventListener('click', resetGame);

    //Renderização inicial
    renderBoard();
})