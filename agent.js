class GameEvaluation extends Game {
    constructor(game) {
        super();
        this.data = JSON.parse(JSON.stringify(game.data));
        this.children = {};
        this.parent = null;
        this.points = game.points;
        this.bestChildren = null;
        this.move = null;
    }

    copy() {
        let ret = new GameEvaluation(this);
        return ret;
    }

    evaluateNextStep() {
        for (let command of ["left", "right", "up", "down"]) {
            let next = this.copy();
            let moves = next.advance(command);
            if (moves && moves.length > 0) {
                this.children[command] = next;
                next.parent = this;
                next.move = command;
            } else {
                this.children[command] = null;
            }
        }
    }

    backPropagate() {
        let node = this;
        let points = this.points;
        while (node.parent) {
            if (node.parent.bestChildren == null ||
                node.parent.bestChildren.points < points) {
                node.parent.bestChildren = {
                    "move": node.move,
                    "points": points
                }
            }
            node = node.parent;
        }
    }
}

class GameAgent {
    constructor(game) {
        this.game = game;
    }

    evaluate(depth = 4) {
        let currGame = new GameEvaluation(this.game);
        let queue = [currGame];
        let nextQueue = [];

        for (let i = 0; i < depth; i++) {
            for (let g of queue) {
                g.evaluateNextStep();
                for (let cmd in g.children) {
                    if (g.children[cmd]) {
                        nextQueue.push(g.children[cmd]);
                    }
                }
            }
            queue = nextQueue;
            nextQueue = [];
        }

        for (let g of queue) {
            g.backPropagate();
        }

        return currGame.bestChildren;
    }

    issueCommand(command) {
        let mapping = {
            "left": "ArrowLeft",
            "right": "ArrowRight",
            "up": "ArrowUp",
            "down": "ArrowDown"
        }

        var e = new KeyboardEvent("keydown", { "key": mapping[command] });
        document.dispatchEvent(e);
    }

    play(rounds = 10) {
        if (rounds > 0) {
            let result = this.evaluate();
            this.issueCommand(result.move);
            setTimeout(() => {
                this.play(rounds - 1);
            }, 300);
        }

    }
}
const button = document.createElement('button');
button.innerHTML = 'Let AI play 10 round';
button.style.cssText = `
    position: fixed;
    bottom: 40px;
    right: 40px;
    padding: 15px 35px;
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
    background-size: 200% 200%;
    color: white;
    border: none;
    border-radius: 40px;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.4s ease;
    z-index: 9999;
    animation: gradientBG 3s ease infinite;
`;

// 添加动画关键帧
const style = document.createElement('style');
style.textContent = `
    @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
`;
document.head.appendChild(style);

button.onmouseover = () => {
    button.style.transform = 'scale(1.1) rotate(2deg)';
    button.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
};
button.onmouseout = () => {
    button.style.transform = 'scale(1) rotate(0deg)';
    button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
};

document.body.appendChild(button);

function myFunction() {
    var a = new GameAgent(game);
    a.play();
}
button.addEventListener('click', myFunction);

// 创建刷新按钮
const refreshButton = document.createElement('button');
refreshButton.innerHTML = 'Play Again!';
refreshButton.style.cssText = `
    position: fixed;
    bottom: 120px;
    right: 40px;
    padding: 15px 35px;
    background: linear-gradient(45deg, #4ECDC4, #45B7D1);
    background-size: 200% 200%;
    color: white;
    border: none;
    border-radius: 40px;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.4s ease;
    z-index: 9999;
    animation: gradientBG 3s ease infinite;
`;

// 悬停效果
refreshButton.onmouseover = () => {
    refreshButton.style.transform = 'scale(1.1) rotate(2deg)';
    refreshButton.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
};
refreshButton.onmouseout = () => {
    refreshButton.style.transform = 'scale(1) rotate(0deg)';
    refreshButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
};

// 点击刷新页面
refreshButton.addEventListener('click', () => {
    location.reload();
});

// 添加到页面
document.body.appendChild(refreshButton);