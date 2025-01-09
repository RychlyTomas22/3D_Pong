
window.onload = function () {
	let scene, camera, renderer, paddle1, paddle2, ball, background;
	const paddleSpeed = 0.2;
	const ballSpeedInitial = 0.025;
	let ballSpeed = ballSpeedInitial;
	const ballSpeedIncrement = 0.015;
	const winningScore = 3;
	const keysPressed = {};
	let ballDirection = { x: 1, y: 1 };
	let visHeight, visWidth;
	let p1Score = 0;
	let p2Score = 0;
	let scoreElement, gameOverElement;
	let gameOver = false;
  
	// Game dimensions
	const IDEAL_WIDTH = 20;
	const IDEAL_HEIGHT = 12;
	const PADDLE_OFFSET = 1;
  
	// Sound Effects
	const paddleSound = new Audio('res/sounds/deflect.mp3');
	const scoreSound = new Audio('res/sounds/score.mp3');
  
	init();
	animate();
  
	function init() {
	  
	  document.body.style.margin = "0";
	  document.body.style.overflow = "hidden";
  
	  scene = new THREE.Scene();
  
	  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	  camera.position.z = 10;

	  updateVisibleArea();
  
	  // renderer
	  renderer = new THREE.WebGLRenderer();
	  renderer.setSize(window.innerWidth, window.innerHeight);
	  document.body.appendChild(renderer.domElement);
  
	  // background
	  const textureLoader = new THREE.TextureLoader();
	  textureLoader.load('res/textures/space-background.jpg', (texture) => {
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		
		const bgWidth = IDEAL_WIDTH * 2;
		const bgHeight = IDEAL_HEIGHT * 2;
		
		const bgGeom = new THREE.PlaneGeometry(bgWidth, bgHeight);
		const bgMat = new THREE.MeshBasicMaterial({ 
		  map: texture,
		  side: THREE.DoubleSide
		});
		
		background = new THREE.Mesh(bgGeom, bgMat);
		background.position.set(0, 0, -5);
		scene.add(background);
	  });
  
	  // Score 
	  scoreElement = document.createElement('div');
	  scoreElement.style.position = 'absolute';
	  scoreElement.style.top = '10px';
	  scoreElement.style.width = '100%';
	  scoreElement.style.textAlign = 'center';
	  scoreElement.style.color = 'white';
	  scoreElement.style.fontSize = '20px';
	  scoreElement.innerHTML = `Player 1: ${p1Score} | Player 2: ${p2Score}`;
	  document.body.appendChild(scoreElement);
  
	  // game over
	  gameOverElement = document.createElement('div');
	  gameOverElement.style.position = 'absolute';
	  gameOverElement.style.top = '50%';
	  gameOverElement.style.width = '100%';
	  gameOverElement.style.textAlign = 'center';
	  gameOverElement.style.color = 'yellow';
	  gameOverElement.style.fontSize = '30px';
	  gameOverElement.style.display = 'none';
	  document.body.appendChild(gameOverElement);
  
	  // paddles
	  textureLoader.load('res/textures/ship1.jpg', (paddle1Texture) => {
		const paddleGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
		const paddle1Material = new THREE.MeshBasicMaterial({ map: paddle1Texture });
		paddle1 = new THREE.Mesh(paddleGeometry, paddle1Material);
		paddle1.position.set(-IDEAL_WIDTH/2 + PADDLE_OFFSET, 0, 0);
		scene.add(paddle1);
	  });
  
	  textureLoader.load('res/textures/ship2.jpg', (paddle2Texture) => {
		const paddleGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
		const paddle2Material = new THREE.MeshBasicMaterial({ map: paddle2Texture });
		paddle2 = new THREE.Mesh(paddleGeometry, paddle2Material);
		paddle2.position.set(IDEAL_WIDTH/2 - PADDLE_OFFSET, 0, 0);
		scene.add(paddle2);
	  });
  
	  // Ball
	  textureLoader.load('res/textures/ball.jpg', (ballTexture) => {
		const ballGeometry = new THREE.SphereGeometry(0.3, 16, 16);
		const ballMaterial = new THREE.MeshBasicMaterial({ map: ballTexture });
		ball = new THREE.Mesh(ballGeometry, ballMaterial);
		ball.position.set(0, 0, 0);
		scene.add(ball);
	  });
  
	  // Events
	  window.addEventListener('resize', onWindowResize);
	  document.addEventListener('keydown', (event) => (keysPressed[event.key] = true));
	  document.addEventListener('keyup', (event) => (keysPressed[event.key] = false));
	}
  
	function updateVisibleArea() {
	  const cameraZ = camera.position.z;
	  visHeight = Math.min(IDEAL_HEIGHT, 2 * Math.tan((camera.fov * Math.PI) / 360) * cameraZ);
	  visWidth = Math.min(IDEAL_WIDTH, visHeight * camera.aspect);
	  
	  if (camera.aspect < IDEAL_WIDTH / IDEAL_HEIGHT) {
		camera.position.z = (IDEAL_WIDTH / 2) / Math.tan((camera.fov / 2) * Math.PI / 180) / camera.aspect;
	  } else {
		camera.position.z = (IDEAL_HEIGHT / 2) / Math.tan((camera.fov / 2) * Math.PI / 180);
	  }
	}
  
	function onWindowResize() {
	  camera.aspect = window.innerWidth / window.innerHeight;
	  camera.updateProjectionMatrix();
	  renderer.setSize(window.innerWidth, window.innerHeight);
	  updateVisibleArea();
	}
  
	function keepInRange(value, min, max) {
	  return Math.min(Math.max(value, min), max);
	}
  
	function handlePaddleMovement() {
	  if (gameOver || !paddle1 || !paddle2) return;
  
	  if (keysPressed['w']) paddle1.position.y += paddleSpeed;
	  if (keysPressed['s']) paddle1.position.y -= paddleSpeed;
  
	  if (keysPressed['ArrowUp']) paddle2.position.y += paddleSpeed;
	  if (keysPressed['ArrowDown']) paddle2.position.y -= paddleSpeed;
  
	  const boundary = IDEAL_HEIGHT/2 - 1;
	  paddle1.position.y = keepInRange(paddle1.position.y, -boundary, boundary);
	  paddle2.position.y = keepInRange(paddle2.position.y, -boundary, boundary);
	}
  
	function handleBallMovement() {
	  if (gameOver || !ball) return;
  
	  ball.position.x += ballSpeed * ballDirection.x;
	  ball.position.y += ballSpeed * ballDirection.y;
  
	  const verticalBoundary = IDEAL_HEIGHT/2 - 0.3;
	  if (ball.position.y >= verticalBoundary || ball.position.y <= -verticalBoundary) {
		ballDirection.y *= -1;
	  }
  
	  // Paddle "hitbox"
	  const paddleWidth = 0.25;
	  const paddleHeight = 1;
  
	  if (
		ball.position.x <= paddle1.position.x + paddleWidth &&
		ball.position.x >= paddle1.position.x - paddleWidth &&
		ball.position.y <= paddle1.position.y + paddleHeight &&
		ball.position.y >= paddle1.position.y - paddleHeight
	  ) {
		ballDirection.x *= -1;
		ball.position.x = paddle1.position.x + paddleWidth + 0.1;
		ballSpeed += ballSpeedIncrement;
		paddleSound.play();
	  }
  
	  if (
		ball.position.x >= paddle2.position.x - paddleWidth &&
		ball.position.x <= paddle2.position.x + paddleWidth &&
		ball.position.y <= paddle2.position.y + paddleHeight &&
		ball.position.y >= paddle2.position.y - paddleHeight
	  ) {
		ballDirection.x *= -1;
		ball.position.x = paddle2.position.x - paddleWidth - 0.1;
		ballSpeed += ballSpeedIncrement;
		paddleSound.play();
	  }
  
	  const horizontalBoundary = IDEAL_WIDTH/2 + 0.5;
	  if (ball.position.x <= -horizontalBoundary) {
		p2Score++;
		updateScore();
		scoreSound.play();
		resetBall();
	  } else if (ball.position.x >= horizontalBoundary) {
		p1Score++;
		updateScore();
		scoreSound.play();
		resetBall();
	  }
	}
  
	function resetBall() {
	  if (!ball) return;
	  ball.position.set(0, 0, 0);
	  ballDirection.x = Math.random() > 0.5 ? 1 : -1;
	  ballDirection.y = Math.random() > 0.5 ? 1 : -1;
	  ballSpeed = ballSpeedInitial;
	}
  
	function updateScore() {
	  scoreElement.innerHTML = `Player 1: ${p1Score} | Player 2: ${p2Score}`;
	  if (p1Score >= winningScore) {
		endGame('Player 1 Wins!');
	  } else if (p2Score >= winningScore) {
		endGame('Player 2 Wins!');
	  }
	}
  
	function endGame(message) {
	  gameOver = true;
	  gameOverElement.innerHTML = `${message}<br><br><button onclick="location.reload()">Restart Game</button>`;
	  gameOverElement.style.display = 'block';
	}
  
	function animate() {
	  requestAnimationFrame(animate);
	  handlePaddleMovement();
	  handleBallMovement();
	  renderer.render(scene, camera);
	}
  };