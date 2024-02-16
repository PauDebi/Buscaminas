// El jugador gana si todas las casillas no minadas están reveladas.
const board = document.getElementById("tablero");
const message = document.getElementById("mensaje");
const gridSize = 10; // Tamaño del tablero
const mineCount = 7; // Cantidad de minas
let minesRemaining = mineCount;
let revealedCells = 0;
let gameBoard = [];

function createBoard() {
    document.querySelector("html").style.setProperty("--num-filas", gridSize);
    document.querySelector("html").style.setProperty("--num-columnas", gridSize);

    // Crea el tablero y llena con casillas vacías.
    for (let row = 0; row < gridSize; row++) {
        const rowArray = [];    
        for (let col = 0; col < gridSize; col++) {
            rowArray.push({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighbors: 0,
                isFaggedWrong: false
            });
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", handleClick);
            cell.addEventListener("contextmenu", handleRightClick);
            board.appendChild(cell);
        }
        gameBoard.push(rowArray);
    }
}

function plantMines() {
    // Coloca minas en ubicaciones aleatorias.
    for (let i = 0; i < mineCount;) {
        let row = Math.floor(Math.random() * gridSize);
        let col = Math.floor(Math.random() * gridSize);
        if (!gameBoard[row][col].isMine) {
            gameBoard[row][col].isMine = true;
            i++;
        }
    }
}

function revealCell(row, col) {
    if (row < 0 || col < 0 || row >= gridSize || col >= gridSize) 
        return; // Evitar desbordamiento del tablero.
    
    const cell = gameBoard[row][col];
    if (cell.isRevealed || cell.isFlagged) 
        return; // No reveles una casilla ya revelada o marcada.

    cell.isRevealed = true;
    revealedCells++;

    if (cell.isMine) 
        endGame(false);
    else if (cell.neighbors === 0) {
        // Si la casilla no tiene minas vecinas, revela las casillas adyacentes.
        for (let r = row - 1; r <= row + 1; r++)
            for (let c = col - 1; c <= col + 1; c++)
                revealCell(r, c);
    }
    updateBoard();
    if (revealedCells === gridSize * gridSize - mineCount) // Verifica si el jugador ha ganado.
        endGame(true); 
}

function calculateNeighbors() {
    // Calcula el número de minas vecinas para cada casilla.
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (gameBoard[row][col].isMine)
                continue;

            for (let r = row - 1; r <= row + 1; r++)
                for (let c = col - 1; c <= col + 1; c++)
                    if (r >= 0 && c >= 0 && r < gridSize && c < gridSize && gameBoard[r][c].isMine)
                        gameBoard[row][col].neighbors++;
        }
    }
}

function endGame(isWin) {
    // Muestra un mensaje de victoria o derrota.
    const resultMessage = isWin ? "¡Felicidades, has ganado!" : "¡Has perdido! Inténtalo de nuevo.";
    message.textContent = resultMessage;
        revealAllMines();
    
    // Deshabilita los clics en el tablero para finalizar el juego.
    board.removeEventListener("click", handleClick);
    board.removeEventListener("contextmenu", handleRightClick);
}

function revealAllMines() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (gameBoard[row][col].isMine)
                gameBoard[row][col].isRevealed = true;
        }
    }
    updateBoard();
}

function handleClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    revealCell(row, col);
}

function handleRightClick(event) {
    event.preventDefault();
    const row = parseInt(event.target.dataset.row); 
    const col = parseInt(event.target.dataset.col);
    const cell = gameBoard[row][col];

    if (!cell.isRevealed) {
        if (minesRemaining > 0 || cell.isFlagged) {
            cell.isFlagged = !cell.isFlagged;
            if (cell.isFlagged) {
                event.target.classList.add("icon-bandera");
                minesRemaining--;
            } else {
                event.target.classList.remove("icon-bandera");
                minesRemaining++;
            }
            updateMinesRemaining();
        }
    }
}

function updateMinesRemaining() {
    // Actualiza el contador de minas restantes.
    message.textContent = `Minas restantes: ${minesRemaining}`;
}

function updateBoard() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = board.children[row * gridSize + col];

            if (gameBoard[row][col].isRevealed) {
                if (gameBoard[row][col].isMine) 
                    cell.classList.add("icon-bomba");
                else {
                    cell.textContent = gameBoard[row][col].neighbors || "";
                    cell.classList.add("destapado");
                }
            } else if (gameBoard[row][col].isFlagged) 
                cell.classList.add("icon-bandera");
            else 
                cell.className = "cell";
        }
    }
}

createBoard();
plantMines();
calculateNeighbors();
updateMinesRemaining();
updateBoard();