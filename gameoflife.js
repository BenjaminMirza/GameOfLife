// Setup the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Default canvas and grid settings
let canvasWidth = 800;  // Default canvas width in pixels
let canvasHeight = 800; // Default canvas height in pixels
let cellSize = 10;      // Default cell size in pixels

// Number of rows and columns based on canvas size and cell size
let cols = Math.floor(canvasWidth / cellSize);
let rows = Math.floor(canvasHeight / cellSize);

// Create 2D arrays for the current and next grid states
let grid = createGrid();
let nextGrid = createGrid();
let intervalId = null;  // To store the interval ID for stopping the game
let speed = 100;        // Default speed (in ms)

// Update the canvas size and grid based on the user input
function updateCanvasSize() {
    // Get new width and height from the user input
    const newWidth = parseInt(document.getElementById('canvasWidthInput').value);
    const newHeight = parseInt(document.getElementById('canvasHeightInput').value);

    if (newWidth && newHeight) {
        canvasWidth = newWidth;
        canvasHeight = newHeight;

        // Update the canvas element dimensions
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Recalculate the number of rows and columns
        cols = Math.floor(canvasWidth / cellSize);
        rows = Math.floor(canvasHeight / cellSize);

        // Reset the grid with new dimensions
        grid = createGrid();
        nextGrid = createGrid();

        drawGrid();  // Redraw the grid with the updated size
    }
}

// Create an empty 2D grid array based on rows and cols
function createGrid() {
    return new Array(rows).fill(null).map(() => new Array(cols).fill(0));
}

// Randomize the grid with live (1) and dead (0) cells
function randomizeGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid[row][col] = Math.random() > 0.8 ? 1 : 0;  // 20% chance of being alive
        }
    }
    drawGrid();
}

// Draw the grid on the canvas
function drawGrid() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);  // Clear the canvas

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] === 1) {
                ctx.fillStyle = 'black';
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Get the number of live neighbors for a cell
function getLiveNeighbors(row, col) {
    let liveNeighbors = 0;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;  // Skip the cell itself
            const newRow = (row + i + rows) % rows;
            const newCol = (col + j + cols) % cols;
            liveNeighbors += grid[newRow][newCol];
        }
    }

    return liveNeighbors;
}

// Update the grid based on the Game of Life rules
function updateGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const liveNeighbors = getLiveNeighbors(row, col);

            // Game of Life rules
            if (grid[row][col] === 1) {
                if (liveNeighbors < 2 || liveNeighbors > 3) {
                    nextGrid[row][col] = 0;  // Cell dies
                } else {
                    nextGrid[row][col] = 1;  // Cell survives
                }
            } else {
                if (liveNeighbors === 3) {
                    nextGrid[row][col] = 1;  // Cell becomes alive
                } else {
                    nextGrid[row][col] = 0;  // Cell remains dead
                }
            }
        }
    }

    // Swap grids: current grid becomes next grid
    [grid, nextGrid] = [nextGrid, grid];
}

// Controller function to handle each frame update
function NextFrame() {
    updateGrid();  // Update the grid state
    drawGrid();    // Render the new state to the canvas
}

// Start the game loop using setInterval
function startGame() {
    if (!intervalId) {
        randomizeGrid();  // Randomize the grid before starting
        intervalId = setInterval(NextFrame, speed);  // Call NextFrame based on speed
        document.getElementById('startButton').disabled = true;  // Disable Start button
        document.getElementById('stopButton').disabled = false;  // Enable Stop button
    }
}

// Stop the game loop
function stopGame() {
    if (intervalId) {
        clearInterval(intervalId);  // Stop the interval loop
        intervalId = null;
        document.getElementById('startButton').disabled = false;  // Enable Start button
        document.getElementById('stopButton').disabled = true;    // Disable Stop button
    }
}

// Reset the grid and stop the game
function resetGame() {
    stopGame();  // Stop the game if it's running
    grid = createGrid();  // Clear the grid
    drawGrid();  // Re-draw the empty grid
}

// Update the game speed based on the slider value
function updateSpeed() {
    const fps = parseInt(document.getElementById('speedRange').value);  // Get FPS value
    speed = 1000 / fps;  // Convert FPS to milliseconds
    document.getElementById('speedDisplay').textContent = `${fps} FPS`;  // Update display
    if (intervalId) {
        clearInterval(intervalId);  // Clear the current interval
        intervalId = setInterval(NextFrame, speed);  // Restart with the new speed (in ms)
    }
}

// Event listener for canvas size input
document.getElementById('canvasWidthInput').addEventListener('input', updateCanvasSize);
document.getElementById('canvasHeightInput').addEventListener('input', updateCanvasSize);

// Attach event listeners for control buttons
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('stopButton').addEventListener('click', stopGame);
document.getElementById('resetButton').addEventListener('click', resetGame);
document.getElementById('randomizeButton').addEventListener('click', randomizeGrid);
document.getElementById('speedRange').addEventListener('input', updateSpeed);

// Initialize the speed display to 10 FPS as default
document.getElementById('speedDisplay').textContent = "10 FPS";
