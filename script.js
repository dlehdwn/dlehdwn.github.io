const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BLOCK_SIZE = 30;  // 블록 크기
let score = 0;
let level = 1;
const scoreDisplay = document.getElementById('score');
const gameSpeed = 10;  // 게임 속도 설정

// 더 큰 맵 정의 (0 = 점, 1 = 벽)
const maps = [
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
];

let pacman = { x: BLOCK_SIZE * 1, y: BLOCK_SIZE * 1, speed: BLOCK_SIZE / 3, direction: 'RIGHT' };
let ghost = { x: BLOCK_SIZE * 10, y: BLOCK_SIZE * 7, speed: BLOCK_SIZE / 4 };  // 유령의 속도

let currentMap = maps[level - 1];

// 방향키 이벤트 처리
document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') pacman.direction = 'RIGHT';
    if (e.key === 'ArrowLeft') pacman.direction = 'LEFT';
    if (e.key === 'ArrowUp') pacman.direction = 'UP';
    if (e.key === 'ArrowDown') pacman.direction = 'DOWN';
});

// 벽 충돌 체크
function canMove(x, y) {
    const row = Math.floor(y / BLOCK_SIZE);
    const col = Math.floor(x / BLOCK_SIZE);

    // 맵 범위 내에서 벽이 아닌 경우만 이동 가능
    return row >= 0 && row < currentMap.length && col >= 0 && col < currentMap[row].length && currentMap[row][col] !== 1;
}

function movePacman() {
    let newX = pacman.x;
    let newY = pacman.y;

    if (pacman.direction === 'RIGHT') newX += pacman.speed;
    if (pacman.direction === 'LEFT') newX -= pacman.speed;
    if (pacman.direction === 'UP') newY -= pacman.speed;
    if (pacman.direction === 'DOWN') newY += pacman.speed;

    // 벽을 통과하지 않도록 체크
    if (canMove(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;
    }
}

function drawPacman() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(pacman.x + BLOCK_SIZE / 2, pacman.y + BLOCK_SIZE / 2, BLOCK_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
}

// 유령 AI: 팩맨을 추적하는 로직 추가, 벽을 통과하지 않음
function moveGhost() {
    let newX = ghost.x;
    let newY = ghost.y;

    // 유령이 팩맨을 추적하는 로직: 팩맨의 위치를 따라 이동
    if (ghost.x < pacman.x && canMove(ghost.x + ghost.speed, ghost.y)) {
        newX += ghost.speed;
    } else if (ghost.x > pacman.x && canMove(ghost.x - ghost.speed, ghost.y)) {
        newX -= ghost.speed;
    }

    if (ghost.y < pacman.y && canMove(ghost.x, ghost.y + ghost.speed)) {
        newY += ghost.speed;
    } else if (ghost.y > pacman.y && canMove(ghost.x, ghost.y - ghost.speed)) {
        newY -= ghost.speed;
    }

    // 벽 충돌 시 더 이상 이동하지 않음
    if (canMove(newX, newY)) {
        ghost.x = newX;
        ghost.y = newY;
    }
}

function drawGhost() {
    ctx.fillStyle = 'red';
    ctx.fillRect(ghost.x, ghost.y, BLOCK_SIZE, BLOCK_SIZE);
}

function checkCollision() {
    if (Math.abs(pacman.x - ghost.x) < BLOCK_SIZE && Math.abs(pacman.y - ghost.y) < BLOCK_SIZE) {
        alert('Game Over!');
        document.location.reload();
    }
}

function eatDots(map) {
    const row = Math.floor(pacman.y / BLOCK_SIZE);
    const col = Math.floor(pacman.x / BLOCK_SIZE);

    if (row >= 0 && row < map.length && col >= 0 && col < map[row].length) {
        if (map[row][col] === 0) {
            map[row][col] = -1;
            score += 10;
            scoreDisplay.textContent = score;
        }
    }
}

function checkLevelCompletion(map) {
    if (map.flat().every(cell => cell !== 0)) {
        alert('Stage Completed!');
        level += 1;
        if (level > maps.length) {
            alert('You win!');
            document.location.reload();
        } else {
            currentMap = maps[level - 1];
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(currentMap);
    movePacman();
    drawPacman();
    moveGhost();  // 유령이 팩맨을 추적하게 함
    drawGhost();
    checkCollision();
    eatDots(currentMap);
    checkLevelCompletion(currentMap);

    setTimeout(gameLoop, 1000 / gameSpeed);  // 프레임 속도 조정
}

function drawMap(map) {
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            if (map[row][col] === 1) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            } else if (map[row][col] === 0) {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(col * BLOCK_SIZE + BLOCK_SIZE / 2, row * BLOCK_SIZE + BLOCK_SIZE / 2, BLOCK_SIZE / 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

gameLoop();
