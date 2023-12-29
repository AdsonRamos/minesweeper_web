const mainDiv = document.getElementById('main')
const grid = document.getElementById('grid')

const pauseBtn = document.getElementById('pauseBtn')
const minesCountText = document.getElementById('minesCount')

// disable right click box
document.addEventListener('contextmenu', event => event.preventDefault())

let gridWidth = 12
let gridHeight = 12

let nMines
let totalMines
let nMinesDiscovered

let stopped
let paused
let firstClick

let squares
let mines

const MOUSE_BUTTONS = {
  LEFT: 0,
  RIGHT: 2
}

const FLAG_TYPES = {
  OK: 1,
  DOUBT: 2
}

let seconds
let minutes
let hours

let interval

const appendSeconds = document.getElementById('seconds')
const appendMinutes = document.getElementById('minutes')
const appendHours = document.getElementById('hours')

class Square {
  constructor({ }) {
    this.mine = false
    this.discovered = false
    this.adjacentMines = 0
    this.flagType = undefined
  }
}

const setInitialVariables = () => {
  stopped = false
  paused = false
  firstClick = true

  seconds = 0
  minutes = 0
  hours = 0

  nMines = 0
  nMinesDiscovered = 0

  pauseBtn.innerHTML = 'Pause'
  grid.style.visibility = 'visible'

  squares = []
  mines = [[]]

  totalMines = 2 * Math.floor(Math.sqrt(gridHeight * gridWidth))
  grid.innerHTML = ''
  grid.style["grid-template-columns"] = "auto ".repeat(gridWidth)
}

const populateGrid = () => {
  for (let i = 0; i < gridHeight; i++) {
    mines[i] = []
    for (let j = 0; j < gridWidth; j++) {
      mines[i].push(new Square({}))
      const square = document.createElement('div')
      square.className = 'square'
      square.addEventListener('mousedown', (event) => {
        switch (event.button) {
          case MOUSE_BUTTONS.LEFT:
            checkMine(i, j)
            break;
          case MOUSE_BUTTONS.RIGHT:
            putFlag(i, j)

          default:
            break;
        }
      })
      squares.push(square)
      grid.appendChild(square)
    }
  }
}

const setMines = () => {
  let minesToPopulate = totalMines
  while (minesToPopulate > 0) {
    let i = Math.floor(Math.random() * gridHeight)
    let j = Math.floor(Math.random() * gridWidth)

    if (!mines[i][j].mine) {
      mines[i][j].mine = true
      minesToPopulate--
    }
  }
}

const getValidNeighbors = (i, j, length) => {
  const possibleNeighbors = [
    { i: i - 1, j: j - 1 },
    { i: i - 1, j },
    { i: i - 1, j: j + 1 },
    { i, j: j - 1 },
    { i, j: j + 1 },
    { i: i + 1, j: j - 1 },
    { i: i + 1, j },
    { i: i + 1, j: j + 1 },
  ]

  return possibleNeighbors.filter(neighborh =>
    neighborh.i >= 0 && neighborh.j >= 0 &&
    neighborh.i < length && neighborh.j < length)
}

const setAdjancentMines = () => {
  for (let i = 0; i < mines.length; i++) {
    for (let j = 0; j < mines[i].length; j++) {
      if (!mines[i][j].mine) {

        const validNeighbors = getValidNeighbors(i, j, mines[i].length)

        let n = 0
        validNeighbors.forEach(neighborh => {
          if (mines[neighborh.i][neighborh.j].mine) {
            n++
          }
        })

        mines[i][j].adjacentMines = n

        squares[i * gridWidth + j].innerHTML = n
      }
      else {
        squares[i * gridWidth + j].innerHTML = '💣'
      }
    }
  }
}

const checkMine = (i, j) => {
  if (stopped) return
  if (firstClick) {
    firstClick = false
    startTimer()
  }
  if (mines[i][j].flagType === FLAG_TYPES.OK) {
    return
  }
  if (mines[i][j].mine) {
    blow()
    stopped = true
  } else {
    floodFill(i, j)
  }
}

const floodFill = (i, j) => {
  const cell = mines[i]?.[j];

  if (!cell || cell.discovered || cell.mine) {
    return;
  }

  cell.discovered = true;
  squares[i * gridWidth + j].style.background = "#c8def1";
  nMinesDiscovered++;

  if (nMinesDiscovered === gridWidth * gridHeight - totalMines) {
    alert("You won the game!! Press New Game to play again!");
    stopped = true;
  }

  if (cell.adjacentMines !== 0) {
    squares[i * gridWidth + j].innerText = cell.adjacentMines;
    return;
  }

  const directions = [-1, 0, 1];

  for (const x of directions) {
    for (const y of directions) {
      if (x !== 0 || y !== 0) {
        floodFill(i + x, j + y);
      }
    }
  }
};

const blow = () => {
  for (let i = 0; i < mines.length; i++) {
    for (let j = 0; j < mines[i].length; j++) {
      if (mines[i][j].mine) {
        squares[i * gridWidth + j].innerHTML = '💣'
      }
    }
  }
}

const putFlag = (i, j) => {
  if (!mines[i][j].flagType) {
    squares[i * gridWidth + j].innerHTML = '⚑'
    nMines++
    minesCountText.innerText = `${nMines}/${totalMines}`
    mines[i][j].flagType = FLAG_TYPES.OK
  } else if (mines[i][j].flagType === FLAG_TYPES.OK) {
    squares[i * gridWidth + j].innerHTML = '⚐'
    nMines--
    minesCountText.innerText = `${nMines}/${totalMines}`
    mines[i][j].flagType = FLAG_TYPES.DOUBT
  } else if (mines[i][j].flagType === FLAG_TYPES.DOUBT) {
    squares[i * gridWidth + j].innerHTML = ''
    mines[i][j].flagType = undefined
  }
}

const stopwatch = () => {
  if (!paused && !stopped) {
    seconds++
  }

  if (seconds <= 9) {
    appendSeconds.innerHTML = "0" + seconds
  }
  if (seconds > 9 && seconds < 60) {
    appendSeconds.innerHTML = seconds
  }
  if (seconds > 59) {
    seconds = 0
    appendSeconds.innerHTML = seconds
    minutes++
  }

  if (minutes <= 9) {
    appendMinutes.innerHTML = "0" + minutes
  }
  if (minutes > 9 && minutes < 60) {
    appendMinutes.innerHTML = minutes
  }
  if (minutes > 59) {
    minutes = 0
    appendMinutes.innerHTML = minutes
    minutes++
  }

  if (hours <= 9) {
    appendHours.innerHTML = "0" + hours
  }
  if (hours > 9 && hours < 60) {
    appendHours.innerHTML = hours
  }
  if (hours > 59) {
    hours = 0
    appendHours.innerHTML = hours
    hours++
  }
}

const clearStopwatch = () => {
  appendSeconds.innerHTML = "00"
  appendMinutes.innerHTML = "00"
  appendHours.innerHTML = "00"
}

const startTimer = () => {
  clearInterval(interval)
  interval = setInterval(stopwatch, 1000)
}

const pause = () => {
  paused = !paused
  if (paused) {
    pauseBtn.innerHTML = 'Continue'
    grid.style.visibility = 'hidden'
  } else {
    pauseBtn.innerHTML = 'Pause'
    grid.style.visibility = 'visible'
  }
}

const newGame = () => {
  const size = document.getElementById('sizeGrid')
  switch (size.value) {
    case 'small':
      gridWidth = 12
      gridHeight = 12
      break;
    case 'medium':
      gridWidth = 16
      gridHeight = 16
      break;
    case 'large':
      gridWidth = 20
      gridHeight = 20
      break;

    default:
      break;
  }
  startGame()
}

const startGame = () => {
  setInitialVariables()
  clearInterval(interval)
  clearStopwatch()
  populateGrid()
  setMines()
  setAdjancentMines()
}

startGame()
