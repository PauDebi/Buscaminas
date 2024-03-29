/*Pau y Jose*/
const board = document.getElementById("tablero");
const message = document.getElementById("mensaje");
const easy = {
    minas: 10,
    tamano: 10,
    button: document.getElementById("facil")
};
const medium = {
    minas: 40,
    tamano: 15,
    button: document.getElementById("medio")
};
const hard = {
    minas: 70,
    tamano: 20,
    button: document.getElementById("dificil")
};
let gridSize,
    mineCount,
    minesRemaining,
    revealedCells,
    gameBoard = [];

// Inicialización del juego
function start(){
    resetBoard();
    minesRemaining = mineCount;
    createBoard();
    plantMines();
    calculateNeighbors();
    updateMinesRemaining();
}

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

    const casilla = board.children[row * gridSize + col];
    const cell = gameBoard[row][col];

    cell.isRevealed = true;
    if (!cell.isMine)
        revealedCells++;
    if (cell.isMine){
        casilla.classList.add("minaExplotada");
        board.classList.add("minaExplotadaAnimacion");
        endGame(false); //Si la casilla es una mina, se acaba el juego
    }
    else if (cell.neighbors === 0)
        for (let r = row - 1; r <= row + 1; r++)
            for (let c = col - 1; c <= col + 1; c++) {
                revealCell(r, c);
            }
    updateBoard(row, col);
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
function updateBoard(row, col) {
    const cell = board.children[row * gridSize + col];
    if (gameBoard[row][col].isRevealed) {
        if (gameBoard[row][col].isMine)
            cell.classList.add("icon-bomba");
        else {
            cell.textContent = gameBoard[row][col].neighbors || ""; // Esto mete un string al div con la cantidad de vecinos (minas) que tiene la casilla
            cell.classList.add("destapado");
            cell.classList.add("c" + gameBoard[row][col].neighbors); // Esto le da el color al numero segun la canitdad de minas que tenga cerca
        }
    } else if (gameBoard[row][col].isFlagged)
        cell.classList.add("icon-bandera");
    else
        cell.className = "cell";
}

// Función para finalizar el juego (victoria o derrota)
function endGame(isWin) {
    for (let row = 0; row < gridSize; row++)
        for (let col = 0; col < gridSize; col++) {
            const cell = board.children[row * gridSize + col];
            cell.removeEventListener("click", handleClick);// Se desactivan los eventListener para no desperdiciar memoria
            cell.removeEventListener("contextmenu", handleRightClick);
            if (gameBoard[row][col].isMine && !gameBoard[row][col].isFlagged && isWin) cell.classList.add("icon-bandera"); // Si es una mina, no tiene bandera y has ganado, la celda se marca como bandera
            if (gameBoard[row][col].isMine && !gameBoard[row][col].isFlagged && !isWin) cell.classList.add("icon-bomba");// Si es una mina, no tiene bandera y has perdido, la celda se revela como mina
            if (gameBoard[row][col].isFlagged && !gameBoard[row][col].isMine) cell.classList.add("banderaErronea"); // Si tiene una bandera donde no hay una mina, se marca como erronea
            if (isWin && !cell.classList.contains("icon-bandera")) {
                cell.classList.remove("destapado");
                cell.textContent = ("");
                cell.classList.add("spawnAnimation");
            }
        }
    message.textContent = isWin ? "Felicidades, has ganado!" : "Has perdido! Intentalo de nuevo.";
    message.style.backgroundColor = isWin ? "lime" : "crimson";
}

function onButtonClick(str) {
    switch (str){
        case ("easy"):
            mineCount = easy.minas;
            gridSize = easy.tamano;
            start()
            break;
        case ("medium"):
            mineCount = medium.minas;
            gridSize = medium.tamano;
            start()
            break;
        case ("hard"):
            mineCount = hard.minas;
            gridSize = hard.tamano;
            start()
    }
}

function resetBoard() {
    board.innerHTML = ""; // Eliminar todos los divs dentro del tablero
    gameBoard = []; //Limpiar el array de gameBoard

    // Recuperar valores originales
    message.style.backgroundColor = "lightskyblue";
    board.classList.remove("minaExplotadaAnimacion");

    revealedCells = 0; // Reiniciar el contador de celdas reveladas
}

easy.button.textContent = "Facil Tamaño: " + easy.tamano + "  Minas: " + easy.minas;
medium.button.textContent = "Medio Tamaño: " + medium.tamano + "  Minas: " + medium.minas;
hard.button.textContent = "Dificil Tamaño: " + hard.tamano + "  Minas: " + hard.minas;