const board = document.getElementById("tablero");
const message = document.getElementById("mensaje");
const gridSize = 10;
const mineCount = 6;
let minesRemaining = mineCount,
    revealedCells = 0,
    gameBoard = [];

// Función para crear el tablero
function createBoard() {
    // Establecer el tamaño del tablero en el CSS
    document.documentElement.style.setProperty("--num-filas", gridSize);
    document.documentElement.style.setProperty("--num-columnas", gridSize);
    // Crear el tablero y llenarlo con casillas vacías
    for (let row = 0; row < gridSize; row++) {
        const rowArray = [];
        for (let col = 0; col < gridSize; col++) {
            rowArray.push({isMine: false, isRevealed: false, isFlagged: false, neighbors: 0});
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

// Función para colocar las minas en el tablero
function plantMines() {
    for (let i = 0; i < mineCount;) {
        let row = Math.floor(Math.random() * gridSize);
        let col = Math.floor(Math.random() * gridSize);
        if (!gameBoard[row][col].isMine) {
            gameBoard[row][col].isMine = true;
            i++;
        }
    }
}
// Función para calcular el número de minas vecinas para cada casilla
function calculateNeighbors() {
    for (let row = 0; row < gridSize; row++)
        for (let col = 0; col < gridSize; col++)
            if (!gameBoard[row][col].isMine)
                for (let r = row - 1; r <= row + 1; r++)
                    for (let c = col - 1; c <= col + 1; c++)
                        if (r >= 0 && c >= 0 && r < gridSize && c < gridSize && gameBoard[r][c].isMine)
                            gameBoard[row][col].neighbors++;
}

// Función para revelar una casilla del tablero
function revealCell(row, col) {
    if ((row < 0 || col < 0 || row >= gridSize || col >= gridSize) || gameBoard[row][col].isRevealed || gameBoard[row][col].isFlagged) return; //Evitar desbordamiento
    const cell = gameBoard[row][col];
    cell.isRevealed = true;
    revealedCells++;
    if (cell.isMine) endGame(false); //Si la casilla es una mina, se acaba el juego
    else if (cell.neighbors === 0)
        for (let r = row - 1; r <= row + 1; r++)
            for (let c = col - 1; c <= col + 1; c++)
                revealCell(r, c);
    updateBoard();
    if (revealedCells === gridSize * gridSize - mineCount) endGame(true);
}

// Manejador de clics en una casilla
function handleClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    revealCell(row, col);
}

// Manejador de clics con el botón derecho del ratón en una casilla
function handleRightClick(event) {
    event.preventDefault();
    const cell = gameBoard[parseInt(event.target.dataset.row)][parseInt(event.target.dataset.col)];
    if (!cell.isRevealed && (minesRemaining > 0 || cell.isFlagged)) {
        cell.isFlagged = !cell.isFlagged;
        event.target.classList.toggle("icon-bandera", cell.isFlagged);
        minesRemaining += cell.isFlagged ? -1 : 1;
        updateMinesRemaining();
    }
}

// Función para actualizar el contador de minas restantes
function updateMinesRemaining() {
    message.textContent = `Minas restantes: ${minesRemaining}`;
}

// Función para actualizar el tablero después de revelar una casilla
function updateBoard() {
    for (let row = 0; row < gridSize; row++)
        for (let col = 0; col < gridSize; col++) {
            const cell = board.children[row * gridSize + col];
            if (gameBoard[row][col].isRevealed) {
                cell.classList.add(gameBoard[row][col].isMine ? "icon-bomba" : "destapado", `c${gameBoard[row][col].neighbors}`);
                cell.textContent = gameBoard[row][col].neighbors || "";
            } else cell.className = gameBoard[row][col].isFlagged ? "icon-bandera" : "cell";
        }
}

// Función para finalizar el juego (victoria o derrota)
function endGame(isWin) {
    for (let row = 0; row < gridSize; row++)
        for (let col = 0; col < gridSize; col++) {
            const cell = board.children[row * gridSize + col];
            cell.removeEventListener("click", handleClick);
            cell.removeEventListener("contextmenu", handleRightClick);
            if (gameBoard[row][col].isMine) gameBoard[row][col].isRevealed = true;
            if (gameBoard[row][col].isFlagged && !gameBoard[row][col].isMine) cell.classList.add("banderaErronea");
        }
    message.textContent = isWin ? "Felicidades, has ganado!" : "Has perdido! Intentalo de nuevo.";
}

// Inicialización del juego
createBoard();
plantMines();
calculateNeighbors();
updateMinesRemaining();