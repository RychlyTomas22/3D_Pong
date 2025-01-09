window.onload = function () {
    let scene, camera, renderer, paddle1, paddle2, ball, background; // Hlavní proměnné pro 3D scénu, kameru, renderer a herní objekty
    const paddleSpeed = 0.2; // Rychlost pohybu pálek
    const ballSpeedInitial = 0.025; // Počáteční rychlost míčku
    let ballSpeed = ballSpeedInitial; // Aktuální rychlost míčku
    const ballSpeedIncrement = 0.015; // Zrychlení míčku při kolizi s pálkou
    const winningScore = 3; // Počet bodů potřebných k vítězství
    const keysPressed = {}; // Sledování stisknutých kláves
    let ballDirection = { x: 1, y: 1 }; // Směr pohybu míčku (x: horizontální, y: vertikální)
    let visHeight, visWidth; // Viditelná výška a šířka herní oblasti
    let p1Score = 0; // Skóre hráče 1
    let p2Score = 0; // Skóre hráče 2
    let scoreElement, gameOverElement; // HTML prvky pro zobrazení skóre a obrazovky "Game Over"
    let gameOver = false; // Stav hry - zda je konec hry
    
    // Rozměry hry
    const IDEAL_WIDTH = 20; // Šířka herního prostoru
    const IDEAL_HEIGHT = 12; // Výška herního prostoru
    const PADDLE_OFFSET = 1; // Vzdálenost pálek od okrajů
  
    // Zvukové efekty
    const paddleSound = new Audio('res/sounds/deflect.mp3'); // Zvuk při odrazu od pálky
    const scoreSound = new Audio('res/sounds/score.mp3'); // Zvuk při dosažení bodu
  
    // Inicializace hry
    init();
    // Spuštění animace
    animate();
  
    // Funkce pro inicializaci všech prvků hry
    function init() {
      // Nastavení základních stylů pro celé tělo stránky
      document.body.style.margin = "0";
      document.body.style.overflow = "hidden";
  
      // Vytvoření scény
      scene = new THREE.Scene();
  
      // Nastavení kamery s perspektivou
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 10; // Posunutí kamery do prostoru
  
      // Výpočet viditelné oblasti na základě rozměrů okna
      updateVisibleArea();
  
      // Vytvoření rendereru a připojení do DOM
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight); // Velikost rendereru podle okna
      document.body.appendChild(renderer.domElement); // Přidání rendereru na stránku
  
      // Načtení pozadí
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load('res/textures/space-background.jpg', (texture) => {
        texture.wrapS = THREE.RepeatWrapping; // Opakování textury horizontálně
        texture.wrapT = THREE.RepeatWrapping; // Opakování textury vertikálně
  
        const bgWidth = IDEAL_WIDTH * 2; // Šířka pozadí
        const bgHeight = IDEAL_HEIGHT * 2; // Výška pozadí
  
        // Vytvoření roviny pro pozadí
        const bgGeom = new THREE.PlaneGeometry(bgWidth, bgHeight);
        const bgMat = new THREE.MeshBasicMaterial({ 
          map: texture, // Aplikace textury
          side: THREE.DoubleSide // Viditelné z obou stran
        });
  
        background = new THREE.Mesh(bgGeom, bgMat); // Spojení geometrie a materiálu
        background.position.set(0, 0, -5); // Pozadí je posunuto dále za herní plochu
        scene.add(background); // Přidání pozadí do scény
      });
  
      // Vytvoření HTML prvku pro skóre
      scoreElement = document.createElement('div');
      scoreElement.style.position = 'absolute';
      scoreElement.style.top = '10px'; // Umístění nahoře
      scoreElement.style.width = '100%';
      scoreElement.style.textAlign = 'center'; // Zarovnání textu na střed
      scoreElement.style.color = 'white'; // Barva textu
      scoreElement.style.fontSize = '20px'; // Velikost textu
      scoreElement.innerHTML = `Player 1: ${p1Score} | Player 2: ${p2Score}`; // Počáteční skóre
      document.body.appendChild(scoreElement); // Přidání do stránky
  
      // Vytvoření HTML prvku pro obrazovku "Game Over"
      gameOverElement = document.createElement('div');
      gameOverElement.style.position = 'absolute';
      gameOverElement.style.top = '50%'; // Umístění uprostřed vertikálně
      gameOverElement.style.width = '100%';
      gameOverElement.style.textAlign = 'center'; // Zarovnání textu na střed
      gameOverElement.style.color = 'yellow'; // Barva textu
      gameOverElement.style.fontSize = '30px'; // Velikost textu
      gameOverElement.style.display = 'none'; // Skryté na začátku
      document.body.appendChild(gameOverElement); // Přidání do stránky
  
      // Vytvoření pálky hráče 1
      textureLoader.load('res/textures/ship1.jpg', (paddle1Texture) => {
        const paddleGeometry = new THREE.BoxGeometry(0.5, 2, 0.5); // Geometrie pálky
        const paddle1Material = new THREE.MeshBasicMaterial({ map: paddle1Texture }); // Textura pálky
        paddle1 = new THREE.Mesh(paddleGeometry, paddle1Material); // Spojení geometrie a textury
        paddle1.position.set(-IDEAL_WIDTH/2 + PADDLE_OFFSET, 0, 0); // Umístění pálky vlevo
        scene.add(paddle1); // Přidání pálky do scény
      });
  
      // Vytvoření pálky hráče 2
      textureLoader.load('res/textures/ship2.jpg', (paddle2Texture) => {
        const paddleGeometry = new THREE.BoxGeometry(0.5, 2, 0.5); // Geometrie pálky
        const paddle2Material = new THREE.MeshBasicMaterial({ map: paddle2Texture }); // Textura pálky
        paddle2 = new THREE.Mesh(paddleGeometry, paddle2Material); // Spojení geometrie a textury
        paddle2.position.set(IDEAL_WIDTH/2 - PADDLE_OFFSET, 0, 0); // Umístění pálky vpravo
        scene.add(paddle2); // Přidání pálky do scény
      });
  
      // Vytvoření míčku
      textureLoader.load('res/textures/ball.jpg', (ballTexture) => {
        const ballGeometry = new THREE.SphereGeometry(0.3, 16, 16); // Geometrie míčku
        const ballMaterial = new THREE.MeshBasicMaterial({ map: ballTexture }); // Textura míčku
        ball = new THREE.Mesh(ballGeometry, ballMaterial); // Spojení geometrie a textury
        ball.position.set(0, 0, 0); // Počáteční pozice míčku
        scene.add(ball); // Přidání míčku do scény
      });
  
      // Nastavení událostí
      window.addEventListener('resize', onWindowResize); // Přizpůsobení okna při změně velikosti
      document.addEventListener('keydown', (event) => (keysPressed[event.key] = true)); // Detekce stisku klávesy
      document.addEventListener('keyup', (event) => (keysPressed[event.key] = false)); // Detekce uvolnění klávesy
    }
  
    // Výpočet viditelné oblasti
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
  
    // Událost při změně velikosti okna
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix(); // Aktualizace kamery
      renderer.setSize(window.innerWidth, window.innerHeight); // Změna velikosti rendereru
      updateVisibleArea(); // Aktualizace viditelné oblasti
    }
  
    // Udržení hodnoty v rozsahu
    function keepInRange(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  
    // Pohyb pálek
    function handlePaddleMovement() {
      if (gameOver || !paddle1 || !paddle2) return;
  
      if (keysPressed['w']) paddle1.position.y += paddleSpeed; // Pohyb pálky 1 nahoru
      if (keysPressed['s']) paddle1.position.y -= paddleSpeed; // Pohyb pálky 1 dolů
  
      if (keysPressed['ArrowUp']) paddle2.position.y += paddleSpeed; // Pohyb pálky 2 nahoru
      if (keysPressed['ArrowDown']) paddle2.position.y -= paddleSpeed; // Pohyb pálky 2 dolů
  
      const boundary = IDEAL_HEIGHT / 2 - 1;
      paddle1.position.y = keepInRange(paddle1.position.y, -boundary, boundary); // Omezení pohybu pálky 1
      paddle2.position.y = keepInRange(paddle2.position.y, -boundary, boundary); // Omezení pohybu pálky 2
    }
  
    // Pohyb míčku
    function handleBallMovement() {
      if (gameOver || !ball) return;
  
      ball.position.x += ballSpeed * ballDirection.x; // Pohyb míčku horizontálně
      ball.position.y += ballSpeed * ballDirection.y; // Pohyb míčku vertikálně
  
      const verticalBoundary = IDEAL_HEIGHT / 2 - 0.3; // Vertikální hranice
      if (ball.position.y >= verticalBoundary || ball.position.y <= -verticalBoundary) {
        ballDirection.y *= -1; // Změna směru při nárazu na horní nebo dolní hranu
      }
  
      // Kolize s pálkou 1
      const paddleWidth = 0.25;
      const paddleHeight = 1;
  
      if (
        ball.position.x <= paddle1.position.x + paddleWidth &&
        ball.position.x >= paddle1.position.x - paddleWidth &&
        ball.position.y <= paddle1.position.y + paddleHeight &&
        ball.position.y >= paddle1.position.y - paddleHeight
      ) {
        ballDirection.x *= -1; // Změna směru horizontálně
        ball.position.x = paddle1.position.x + paddleWidth + 0.1; // Mírné odskočení
        ballSpeed += ballSpeedIncrement; // Zvýšení rychlosti míčku
        paddleSound.play(); // Přehrání zvuku
      }
  
      // Kolize s pálkou 2
      if (
        ball.position.x >= paddle2.position.x - paddleWidth &&
        ball.position.x <= paddle2.position.x + paddleWidth &&
        ball.position.y <= paddle2.position.y + paddleHeight &&
        ball.position.y >= paddle2.position.y - paddleHeight
      ) {
        ballDirection.x *= -1; // Změna směru horizontálně
        ball.position.x = paddle2.position.x - paddleWidth - 0.1; // Mírné odskočení
        ballSpeed += ballSpeedIncrement; // Zvýšení rychlosti míčku
        paddleSound.play(); // Přehrání zvuku
      }
  
      const horizontalBoundary = IDEAL_WIDTH / 2 + 0.5; // Horizontální hranice
      if (ball.position.x <= -horizontalBoundary) {
        p2Score++; // Přidání bodu hráči 2
        updateScore(); // Aktualizace skóre
        scoreSound.play(); // Přehrání zvuku
        resetBall(); // Resetování míčku
      } else if (ball.position.x >= horizontalBoundary) {
        p1Score++; // Přidání bodu hráči 1
        updateScore(); // Aktualizace skóre
        scoreSound.play(); // Přehrání zvuku
        resetBall(); // Resetování míčku
      }
    }
  
    // Resetování míčku po dosažení bodu
    function resetBall() {
      if (!ball) return;
      ball.position.set(0, 0, 0); // Umístění míčku na střed
      ballDirection.x = Math.random() > 0.5 ? 1 : -1; // Náhodný horizontální směr
      ballDirection.y = Math.random() > 0.5 ? 1 : -1; // Náhodný vertikální směr
      ballSpeed = ballSpeedInitial; // Obnovení rychlosti
    }
  
    // Aktualizace skóre
    function updateScore() {
      scoreElement.innerHTML = `Player 1: ${p1Score} | Player 2: ${p2Score}`; // Zobrazení skóre
      if (p1Score >= winningScore) {
        endGame('Player 1 Wins!'); // Konec hry, hráč 1 vyhrál
      } else if (p2Score >= winningScore) {
        endGame('Player 2 Wins!'); // Konec hry, hráč 2 vyhrál
      }
    }
  
    // Ukončení hry
    function endGame(message) {
      gameOver = true; // Nastavení stavu hry na "konec"
      gameOverElement.innerHTML = `${message}<br><br><button onclick="location.reload()">Restart Game</button>`; // Zpráva o výsledku
      gameOverElement.style.display = 'block'; // Zobrazení obrazovky "Game Over"
    }
  
    // Animace hry
    function animate() {
      requestAnimationFrame(animate); // Rekurzivní volání animace
      handlePaddleMovement(); // Zpracování pohybu pálek
      handleBallMovement(); // Zpracování pohybu míčku
      renderer.render(scene, camera); // Vykreslení scény
    }
  };
  