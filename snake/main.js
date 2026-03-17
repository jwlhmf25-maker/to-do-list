/* ── 상수 ── */
var COLS = 20;       // 가로 격자 수
var ROWS = 20;       // 세로 격자 수
var CELL = 20;       // 셀 크기(px) — 400 / 20 = 20

/* 난이도별 기본 속도(ms) */
var DIFFICULTY_INTERVALS = { easy: 200, normal: 150, hard: 100, vhard: 50 };

var LEVEL_UP_SCORE  = 50;   // 레벨업 기준 점수
var LEVEL_SPEED_INC = 10;   // 레벨업 시 속도 증가(ms)

/* ── 색상 ── */
var COLOR_BG      = '#1a1a2e';  // 배경
var COLOR_GRID    = '#16213e';  // 격자선
var COLOR_HEAD    = '#a855f7';  // 뱀 머리
var COLOR_BODY    = '#7c3aed';  // 뱀 몸통
var COLOR_FOOD    = '#f59e0b';  // 먹이

/* ── 전역 상태 ── */
var snake;           // 뱀 좌표 배열 (앞쪽이 머리)
var direction;       // 현재 이동 방향 {x, y}
var nextDir;         // 다음 틱에 적용할 방향
var food;            // 먹이 좌표 {x, y}
var score;           // 현재 점수
var highScore;       // 최고 점수
var level;           // 현재 레벨
var baseInterval;    // 선택한 난이도의 기본 속도(ms)
var curInterval;     // 레벨 반영 실제 속도(ms)
var gameLoop;        // setInterval 핸들
var running;         // 게임 진행 중 여부
var paused;          // 일시정지 여부

/* ── DOM 요소 ── */
var canvas, ctx;
var elScore, elHighScore, elLevel;
var overlay, overlayTitle, overlayMsg, overlayScore, actionBtn;
var pauseBtn, diffBtns;

/* ── 초기화 ── */
function initApp() {
  canvas       = document.getElementById('gameCanvas');
  ctx          = canvas.getContext('2d');
  elScore      = document.getElementById('score');
  elHighScore  = document.getElementById('highScore');
  elLevel      = document.getElementById('level');
  overlay      = document.getElementById('overlay');
  overlayTitle = document.getElementById('overlayTitle');
  overlayMsg   = document.getElementById('overlayMsg');
  overlayScore = document.getElementById('overlayScore');
  actionBtn    = document.getElementById('actionBtn');
  pauseBtn     = document.getElementById('pauseBtn');
  diffBtns     = document.querySelectorAll('.diff-btn');

  // 저장된 최고 점수 불러오기
  highScore = parseInt(localStorage.getItem('snakeHighScore'), 10) || 0;
  elHighScore.textContent = highScore;

  // 기본 난이도: 보통 (150ms)
  baseInterval = 150;

  // 게임 시작/재시작 버튼
  actionBtn.addEventListener('click', startGame);

  // 일시정지 버튼
  pauseBtn.addEventListener('click', togglePause);

  // 난이도 버튼
  for (var i = 0; i < diffBtns.length; i++) {
    diffBtns[i].addEventListener('click', onDiffClick);
  }

  // 방향키 + P키 이벤트
  document.addEventListener('keydown', handleKey);

  // 초기 캔버스 그리기 (빈 배경)
  drawBackground();
}

/* ── 난이도 선택 ── */
function onDiffClick(e) {
  // 게임 중에는 난이도 변경 불가
  if (running && !paused) return;

  var btn = e.currentTarget;
  baseInterval = parseInt(btn.getAttribute('data-interval'), 10);

  // 활성 버튼 표시 갱신
  for (var i = 0; i < diffBtns.length; i++) {
    diffBtns[i].classList.remove('active');
  }
  btn.classList.add('active');
}

/* ── 일시정지 토글 ── */
function togglePause() {
  if (!running) return;

  if (paused) {
    // 재개
    paused = false;
    pauseBtn.textContent = '일시정지';
    gameLoop = setInterval(gameStep, curInterval);
  } else {
    // 일시정지
    paused = true;
    pauseBtn.textContent = '계속하기';
    clearInterval(gameLoop);
    drawPauseOverlay();
  }
}

/* ── 일시정지 화면 오버레이 ── */
function drawPauseOverlay() {
  ctx.fillStyle = 'rgba(10, 10, 30, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('일시정지', canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = '14px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('P 키 또는 버튼으로 재개', canvas.width / 2, canvas.height / 2 + 22);
  ctx.textAlign = 'left';
}

/* ── 게임 시작 ── */
function startGame() {
  // 뱀 초기 위치: 중앙 3칸
  snake = [
    { x: 12, y: 10 },
    { x: 11, y: 10 },
    { x: 10, y: 10 }
  ];
  direction   = { x: 1, y: 0 };  // 오른쪽
  nextDir     = { x: 1, y: 0 };
  score       = 0;
  level       = 1;
  paused      = false;
  running     = true;
  curInterval = baseInterval;

  elScore.textContent = 0;
  elLevel.textContent = 1;
  pauseBtn.disabled   = false;
  pauseBtn.textContent = '일시정지';

  spawnFood();
  overlay.classList.add('hidden');

  // 기존 루프 초기화 후 시작
  clearInterval(gameLoop);
  gameLoop = setInterval(gameStep, curInterval);
}

/* ── 매 틱 처리 ── */
function gameStep() {
  moveSnake();

  if (checkCollision()) {
    endGame();
    return;
  }

  // 먹이 충돌 검사
  var head = snake[0];
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    elScore.textContent = score;
    // 꼬리를 제거하지 않아 뱀이 길어짐 — 대신 이번 틱은 꼬리를 유지
    spawnFood();
    checkLevelUp();
  } else {
    // 꼬리 제거
    snake.pop();
  }

  render();
}

/* ── 뱀 이동 ── */
function moveSnake() {
  // 다음 방향 적용
  direction = nextDir;

  var head = snake[0];
  var newHead = { x: head.x + direction.x, y: head.y + direction.y };

  // 새 머리를 앞에 추가
  snake.unshift(newHead);
  // 꼬리 제거는 gameStep에서 먹이 여부에 따라 처리
}

/* ── 충돌 검사 ── */
function checkCollision() {
  var head = snake[0];

  // 벽 충돌
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    return true;
  }

  // 자기 몸 충돌 (머리 제외, 인덱스 1부터)
  for (var i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }

  return false;
}

/* ── 레벨업 확인 ── */
function checkLevelUp() {
  var newLevel = Math.floor(score / LEVEL_UP_SCORE) + 1;
  if (newLevel <= level) return;

  level = newLevel;
  elLevel.textContent = level;

  // 레벨업마다 속도 10ms 증가 (최소 30ms 유지)
  curInterval = Math.max(30, baseInterval - (level - 1) * LEVEL_SPEED_INC);

  // 루프 속도 재설정
  clearInterval(gameLoop);
  gameLoop = setInterval(gameStep, curInterval);
}

/* ── 먹이 생성 ── */
function spawnFood() {
  var pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  } while (isOnSnake(pos));  // 뱀 위치와 겹치지 않을 때까지

  food = pos;
}

/* ── 주어진 좌표가 뱀 위에 있는지 확인 ── */
function isOnSnake(pos) {
  for (var i = 0; i < snake.length; i++) {
    if (snake[i].x === pos.x && snake[i].y === pos.y) {
      return true;
    }
  }
  return false;
}

/* ── 렌더링 ── */
function render() {
  drawBackground();

  // 먹이 그리기
  ctx.fillStyle = COLOR_FOOD;
  ctx.beginPath();
  ctx.arc(
    food.x * CELL + CELL / 2,
    food.y * CELL + CELL / 2,
    CELL / 2 - 2,
    0, Math.PI * 2
  );
  ctx.fill();

  // 뱀 그리기 (꼬리부터 머리 순서로 — 머리가 위에 표시됨)
  for (var i = snake.length - 1; i >= 0; i--) {
    ctx.fillStyle = (i === 0) ? COLOR_HEAD : COLOR_BODY;
    ctx.fillRect(
      snake[i].x * CELL + 1,
      snake[i].y * CELL + 1,
      CELL - 2,
      CELL - 2
    );

    // 뱀 머리 눈 표시
    if (i === 0) {
      drawEyes(snake[0]);
    }
  }
}

/* ── 배경 및 격자 그리기 ── */
function drawBackground() {
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 0.5;

  for (var x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, canvas.height);
    ctx.stroke();
  }
  for (var y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(canvas.width, y * CELL);
    ctx.stroke();
  }
}

/* ── 뱀 머리 눈 그리기 ── */
function drawEyes(head) {
  var cx = head.x * CELL;
  var cy = head.y * CELL;

  // 이동 방향에 따라 눈 위치 결정
  var eye1, eye2;
  if (direction.x === 1) {        // 오른쪽
    eye1 = { x: cx + 14, y: cy + 5 };
    eye2 = { x: cx + 14, y: cy + 13 };
  } else if (direction.x === -1) { // 왼쪽
    eye1 = { x: cx + 5,  y: cy + 5 };
    eye2 = { x: cx + 5,  y: cy + 13 };
  } else if (direction.y === -1) { // 위
    eye1 = { x: cx + 5,  y: cy + 5 };
    eye2 = { x: cx + 13, y: cy + 5 };
  } else {                         // 아래
    eye1 = { x: cx + 5,  y: cy + 14 };
    eye2 = { x: cx + 13, y: cy + 14 };
  }

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(eye1.x, eye1.y, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eye2.x, eye2.y, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/* ── 게임 오버 ── */
function endGame() {
  clearInterval(gameLoop);
  running = false;
  paused  = false;
  pauseBtn.disabled    = true;
  pauseBtn.textContent = '일시정지';

  // 최고 점수 갱신
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    elHighScore.textContent = highScore;
  }

  // 오버레이 표시
  overlayTitle.textContent = '게임 오버';
  overlayMsg.textContent   = '레벨 ' + level + '까지 도달했습니다!';
  overlayScore.textContent = '획득 점수: ' + score + '점';
  actionBtn.textContent    = '다시 시작';
  overlay.classList.remove('hidden');
}

/* ── 방향키 처리 ── */
function handleKey(e) {
  // 방향키 스크롤 방지
  if ([37, 38, 39, 40].indexOf(e.keyCode) !== -1) {
    e.preventDefault();
  }

  // P 키로 일시정지 토글
  if (e.keyCode === 80) {
    togglePause();
    return;
  }

  if (!running || paused) return;

  // 역방향 이동 방지: 현재 방향과 반대 방향은 무시
  switch (e.keyCode) {
    case 38: // 위
      if (direction.y !== 1)  nextDir = { x: 0, y: -1 };
      break;
    case 40: // 아래
      if (direction.y !== -1) nextDir = { x: 0, y: 1 };
      break;
    case 37: // 왼쪽
      if (direction.x !== 1)  nextDir = { x: -1, y: 0 };
      break;
    case 39: // 오른쪽
      if (direction.x !== -1) nextDir = { x: 1, y: 0 };
      break;
  }
}

/* ── 앱 시작 ── */
initApp();
