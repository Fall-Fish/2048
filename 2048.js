//Constant
CANVAS_SIZE = 600;
GAME_SIZE = 4;
BLOCK_SIZE = 130;
PADDING_SIZE = (CANVAS_SIZE - GAME_SIZE * BLOCK_SIZE) / 5;
CANVAS_BACKGROUND_COLOR = "#D4DFE6";
BLOCK_PALCEHOLDER_COLOR = "#C4CfD6";
BLOCK_BACKGROUND_COLOR_START = "#cae2e9ff";
BLOCK_BACKGROUND_COLOR_END = "#8c59e5ff";
BLOCK_FONT_COLOR = "#444444";
FRAME_PER_SECOND = 200;
ANIMATION_TIME = 200;
//Global Utility Functions
randInt = function (a, b) {
    return a + Math.floor(Math.random() * (b + 1 - a));
}

randChoice = function (arr) {
    return arr[randInt(0, arr.length - 1)];
}
//Model
class Game {
    constructor() {
        this.data = [];
        this.initializeData();
        this.points = 0;
    }
    initializeData() {
        this.points = 0;
        this.data = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = [];
            for (let j = 0; j < GAME_SIZE; j++) {
                tmp.push(null);
            }
            this.data.push(tmp);
        }
        this.generateNewBlock();
        this.generateNewBlock();
    }

    generateNewBlock() {
        let possiblePositions = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                if (this.data[i][j] == null) {
                    possiblePositions.push([i, j]);
                }
            }
        }
        let position = randChoice(possiblePositions);
        this.data[position[0]][position[1]] = 2;
    }
    shiftBlock(arr, reverse = false) {
        let head = 0;
        let tail = 1;
        let incr = 1;
        let moves = [];
        let points = 0;
        if (reverse == true) {
            head = arr.length - 1;
            tail = head - 1;
            incr = -1;
        }
        while (tail < arr.length && tail >= 0) {
            if (arr[tail] == null) {
                tail += incr;
            } else {
                if (arr[head] == null) {
                    arr[head] = arr[tail];
                    arr[tail] = null;
                    moves.push([tail, head]);
                    tail += incr;
                } else if (arr[head] == arr[tail]) {
                    arr[head] = arr[head] * 2;
                    arr[tail] = null;
                    points += arr[head];
                    moves.push([tail, head]);
                    head += incr;
                    tail += incr;
                } else {
                    head += incr;
                    if (head == tail) {
                        tail += incr;
                    }
                }
            }
        }
        return {
            "moves": moves,
            "points": points
        };
    }

    advance(command) {
        let reverse = false;
        let moves = [];
        let points = 0;
        if (command == "left" || command == "right") {
            if (command == "right") {
                reverse = true;
            }
            for (let i = 0; i < GAME_SIZE; i++) {
                let result = this.shiftBlock(this.data[i], reverse);
                for (let move of result.moves) {
                    moves.push([[i, move[0]], [i, move[1]]]);
                }
                this.points += result.points;
            }
        } else if (command == "up" || command == "down") {
            if (command == "down") {
                reverse = true;
            }
            let row = [];
            for (let i = 0; i < GAME_SIZE; i++) {
                for (let j = 0; j < GAME_SIZE; j++) {
                    row[j] = this.data[j][i];
                }
                let result = this.shiftBlock(row, reverse);
                for (let move of result.moves) {
                    moves.push([[move[0], i], [move[1], i]]);
                }
                this.points += result.points;
                for (let j = 0; j < GAME_SIZE; j++) {
                    this.data[j][i] = row[j];
                }
            }
        }
        if (moves.length != 0) {
            this.generateNewBlock();
        }
        return moves;
    }
}
//Tests
class Test {
    static compareArray(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false;
            }
        }
        return true;
    }
    static test_shiftBlock() {
        let gameTest = new Game();
        let testCases = [
            [[2, 2, 2, 2], [4, 4, null, null]],
            [[2, 2, null, 2], [4, 2, null, null]],
            [[4, 2, null, 2], [4, 4, null, null]],
            [[2, 4, null, 8], [2, 4, 8, null]],
            [[null, null, null, null], [null, null, null, null]],
            [[null, 4, 4, 8], [8, 8, null, null]]
        ]
        let flag = false;
        for (let test of testCases) {
            for (let reverse of [true, false]) {
                let input = test[0].slice();
                let result = test[1].slice();
                if (reverse == true) {
                    input.reverse();
                    result.reverse();
                }
                gameTest.shiftBlock(input, reverse);
                if (!Test.compareArray(input, result)) {
                    flag = true;
                    console.log(input, result);
                    console.log("Error");
                }
            }
        }
        if (!flag) {
            console.log("Pass");
        }
    }
}

//View
class View {
    constructor(game, container) {
        this.game = game;
        this.blocks = [];
        this.container = container;
        this.initializeContainer();
        this.animating = false;
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.backgroundColor = CANVAS_BACKGROUND_COLOR;
        this.container.style.position = "relative";
        this.container.style.display = "inline-block"
        this.container.style.fontSize = 60;
        this.container.zIndex = 1;
        this.container.style.borderRadius = "15px";
        this.container.style.color = BLOCK_FONT_COLOR;
    }
    gridToPosition(i, j) {
        let top = i * (BLOCK_SIZE + PADDING_SIZE) + PADDING_SIZE;
        let left = j * (BLOCK_SIZE + PADDING_SIZE) + PADDING_SIZE;
        return [top, left];
    }
    animate(moves) {
        this.animating = true;
        this.doFrame(moves, 0, ANIMATION_TIME);
    }

    doFrame(moves, currTime, totalTime) {
        if (currTime < totalTime) {
            setTimeout(() => {
                this.doFrame(moves, currTime + 1 / FRAME_PER_SECOND * 1000, totalTime);
            }, 1 / FRAME_PER_SECOND * 1000);
            for (let move of moves) {
                let block = this.blocks[move[0][0]][move[0][1]];
                let origin = this.gridToPosition(move[0][0], move[0][1]);
                let destination = this.gridToPosition(move[1][0], move[1][1]);
                let currPosition = [
                    origin[0] + currTime / totalTime * (destination[0] - origin[0]),
                    origin[1] + currTime / totalTime * (destination[1] - origin[1])
                ]
                block.style.top = currPosition[0];
                block.style.left = currPosition[1];
            }
        } else {
            this.animating = false;
            view.drawGame();
        }
    }

    drawGame() {
        this.container.innerHTML = "";
        this.blocks = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = [];
            for (let j = 0; j < GAME_SIZE; j++) {
                this.drawBackgroundBlock(i, j, BLOCK_PALCEHOLDER_COLOR);
                let block = null;
                if (this.game.data[i][j]) {
                    block = this.drawBlock(i, j, this.game.data[i][j]);
                }
                tmp.push(block);
            }
            this.blocks.push(tmp);
        }
    }

    drawBackgroundBlock(i, j, color) {
        let block = document.createElement("div");
        block.style.width = BLOCK_SIZE;
        block.style.height = BLOCK_SIZE;
        block.style.backgroundColor = color;
        block.style.position = "absolute";
        block.style.top = i * BLOCK_SIZE + (i + 1) * PADDING_SIZE;
        block.style.left = j * BLOCK_SIZE + (j + 1) * PADDING_SIZE;
        block.style.zIndex = 3;
        block.style.borderRadius = "15px";
        this.container.append(block);
        return block;
    }

    drawBlock(i, j, number) {
        let span = document.createElement("span");
        let text = document.createTextNode(number);
        let block = this.drawBackgroundBlock(i, j, this.getColor(number));
        span.appendChild(text);
        block.appendChild(span);
        block.style.zIndex = 5;
        span.style.position = "absolute";
        span.style.top = (BLOCK_SIZE - span.offsetHeight) / 2;
        span.style.left = (BLOCK_SIZE - span.offsetWidth) / 2;
        span.style.fontFamily = "'Oleo Script', cursive";
        return block;
    }

    getColor(number) {
        let level = Math.log2(number);
        let rgbSatrt = this.hexToRGB(BLOCK_BACKGROUND_COLOR_START);
        let rgbEND = this.hexToRGB(BLOCK_BACKGROUND_COLOR_END);
        let color = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            color[i] = Math.floor(rgbSatrt[i] + (rgbEND[i] - rgbSatrt[i]) * (level / 12));
        }
        return `rgb(${color[0]},${color[1]},${color[2]})`;
    }

    hexToRGB(s) {
        let r = s.slice(1, 3);
        let g = s.slice(3, 5);
        let b = s.slice(5, 7);
        return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
    }

}

//Controller
var container = document.getElementById("game-container");
var game = new Game();
var view = new View(game, container);
var points = document.getElementById("points");
view.drawGame();

document.onkeydown = function (event) {
    if (view.animating) { return; }
    let moves = null;
    if (event.key == "ArrowLeft") {
        moves = game.advance("left");
    } else if (event.key == "ArrowRight") {
        moves = game.advance("right");
    } else if (event.key == "ArrowUp") {
        moves = game.advance("up");
    } else if (event.key == "ArrowDown") {
        moves = game.advance("down");
    }
    if (moves && moves.length > 0) {
        points.innerHTML = `Points:${game.points}`;
        view.animate(moves);
    }
}
