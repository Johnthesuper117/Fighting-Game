let player1 = {
    element: document.getElementById("player1"),
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    width: 50,
    height: 100,
    health: 100,
    meter: 0, // Special attack meter
    punchCooldown: false,
};

let player2 = {
    element: document.getElementById("player2"),
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    width: 50,
    height: 100,
    health: 100,
    meter: 0, // Special attack meter
    punchCooldown: false,
};

let projectiles = []; // Array to hold active projectiles
let laserBeams = []; // Array to hold active laser attacks

// Initialize game with empty super meter
function initializeGame() {
    resetMeters(); // Ensure meters start empty
    setInitialPositions();
    enableControls();
    setInterval(gameLoop, 16); // ~60 FPS game loop
}

// Reset player meters to 0
function resetMeters() {
    player1.meter = 0;
    player2.meter = 0;
    updateMeters();
}

function setInitialPositions() {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    // Player 1 spawns to the left of center
    player1.x = canvasWidth / 2 - 150;
    player1.y = canvasHeight / 2 - player1.height / 2;

    // Player 2 spawns to the right of center
    player2.x = canvasWidth / 2 + 100;
    player2.y = canvasHeight / 2 - player2.height / 2;

    updatePositions();
}

function enableControls() {
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            // Player 1 Controls (WASD for movement, JKL for actions)
            case "w": player1.dy = -5; break; // Move Player 1 up
            case "a": player1.dx = -5; break; // Move Player 1 left
            case "s": player1.dy = 5; break;  // Move Player 1 down
            case "d": player1.dx = 5; break;  // Move Player 1 right
            case "j": punch(player1, player2); break; // Punch
            case "k": shootProjectile(player1, "right"); break; // Shoot projectile
            case "l": useSuperAttack(player1); break; // Super attack

            // Player 2 Controls (Arrow keys for movement, BNM for actions)
            case "ArrowUp": player2.dy = -5; break; // Move Player 2 up
            case "ArrowLeft": player2.dx = -5; break; // Move Player 2 left
            case "ArrowDown": player2.dy = 5; break; // Move Player 2 down
            case "ArrowRight": player2.dx = 5; break; // Move Player 2 right
            case "b": punch(player2, player1); break; // Punch
            case "n": shootProjectile(player2, "left"); break; // Shoot projectile
            case "m": useSuperAttack(player2); break; // Super attack
        }
    });

    document.addEventListener("keyup", (event) => {
        switch (event.key) {
            // Stop Player 1 movement
            case "w":
            case "s": player1.dy = 0; break;
            case "a":
            case "d": player1.dx = 0; break;

            // Stop Player 2 movement
            case "ArrowUp":
            case "ArrowDown": player2.dy = 0; break;
            case "ArrowLeft":
            case "ArrowRight": player2.dx = 0; break;
        }
    });
}

function createVisual(elementClass, x, y, width, height) {
    const visualElement = document.createElement("div");
    visualElement.className = elementClass;
    visualElement.style.left = `${x}px`;
    visualElement.style.top = `${y}px`;
    visualElement.style.width = `${width}px`;
    visualElement.style.height = `${height}px`;
    document.querySelector(".game-container").appendChild(visualElement);

    // Automatically remove the element after the animation ends
    setTimeout(() => visualElement.remove(), 500);
}

// Update UI for health and meter
function updateMeters() {
    document.getElementById("player1-meter").style.width = `${player1.meter}%`;
    document.getElementById("player2-meter").style.width = `${player2.meter}%`;
}

function handleProjectileCollisions() {
    projectiles = projectiles.filter((projectile) => {
        const hitPlayer = projectile.owner === player1 ? player2 : player1;

        // Check for collision with the opposing player
        if (
            projectile.x + projectile.width >= hitPlayer.x &&
            projectile.x <= hitPlayer.x + hitPlayer.width &&
            projectile.y + projectile.height >= hitPlayer.y &&
            projectile.y <= hitPlayer.y + hitPlayer.height
        ) {
            hitPlayer.health -= 5; // Deal damage to the hit player
            hitPlayer.meter = Math.min(100, hitPlayer.meter + 3); // Increase defender's meter
            updateMeters();

            // Remove visual from the DOM
            projectile.element.remove();
            return false; // Remove the projectile after collision
        }

        // Update projectile position
        projectile.x += projectile.speedX;
        projectile.y += projectile.speedY;
        if (projectile.element) {
            projectile.element.style.left = `${projectile.x}px`;
            projectile.element.style.top = `${projectile.y}px`;
        }

        // Remove projectile if it goes out of bounds
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        if (
            projectile.x < 0 || projectile.x > canvasWidth ||
            projectile.y < 0 || projectile.y > canvasHeight
        ) {
            // Remove visual from the DOM
            projectile.element.remove();
            return false;
        }

        return true; // Keep the projectile if it hasn't collided or gone out of bounds
    });
}


// Handle collisions for super attacks
function handleSuperAttackCollisions() {
    laserBeams = laserBeams.filter((beam) => {
        const hitPlayer = beam.owner === player1 ? player2 : player1;

        // Check for collision with the opposing player
        if (
            beam.x + beam.width >= hitPlayer.x &&
            beam.x <= hitPlayer.x + hitPlayer.width &&
            beam.y + beam.height >= hitPlayer.y &&
            beam.y <= hitPlayer.y + hitPlayer.height
        ) {
            hitPlayer.health -= 20; // Deal heavy damage
            hitPlayer.meter = Math.min(100, hitPlayer.meter + 3); // Increase defender's meter
            updateMeters();

            // Remove visual from the DOM
            beam.element.remove();
            return false; // Remove the beam after collision
        }

        // Update beam position
        beam.x += beam.speed;
        if (beam.element) {
            beam.element.style.left = `${beam.x}px`;
        }

        // Remove beam if it goes out of bounds
        const canvasWidth = window.innerWidth;
        if (beam.x < 0 || beam.x > canvasWidth) {
            beam.element.remove();
            return false;
        }

        return true; // Keep the beam if it hasn't collided or gone out of bounds
    });
}

// Add punch visual collisions
function punch(attacker, defender) {
    if (attacker.punchCooldown) return; // Prevent spamming punches
    attacker.punchCooldown = true;

    // Create punch visual
    const punchX = attacker.x + (attacker === player1 ? attacker.width : -20);
    const punchY = attacker.y + attacker.height / 2 - 10;
    createVisual("punch", punchX, punchY, 20, 20);

    // Check for collision
    if (
        attacker.x + attacker.width >= defender.x &&
        attacker.x <= defender.x + defender.width &&
        attacker.y + attacker.height >= defender.y &&
        attacker.y <= defender.y + defender.height
    ) {
        defender.health -= 10; // Deal damage
        attacker.meter = Math.min(100, attacker.meter + 5); // Gain meter for attacking
        defender.meter = Math.min(100, defender.meter + 3); // Gain meter for being hit
        updateMeters();
    }

    setTimeout(() => (attacker.punchCooldown = false), 500); // 0.5s cooldown
}

function shootProjectile(attacker, direction) {
    const target = attacker === player1 ? player2 : player1; // Determine the target player
    const speedX = target.x > attacker.x ? 7 : -7; // Calculate horizontal direction
    const speedY = (target.y - attacker.y) / Math.abs(target.x - attacker.x) * Math.abs(speedX); // Calculate vertical direction

    projectiles.push({
        x: attacker.x + (direction === "right" ? attacker.width : -10),
        y: attacker.y + attacker.height / 2 - 5,
        width: 10,
        height: 10,
        speedX, // Horizontal speed
        speedY, // Vertical speed
        owner: attacker,
    });

    attacker.meter = Math.min(100, attacker.meter + 5); // Increase attacker's meter
    updateMeters();
}

function useSuperAttack(player) {
    if (player.meter < 100) return; // Super attack requires a full meter
    player.meter = 0; // Reset meter

    const laserBeam = {
        x: player.x + (player === player1 ? player.width : -100),
        y: player.y + player.height / 2 - 10,
        width: 100,
        height: 20,
        speed: player === player1 ? 10 : -10,
        owner: player,
    };
    laserBeams.push(laserBeam);

    // Create super-attack visual
    createVisual("super-attack", laserBeam.x, laserBeam.y, laserBeam.width, laserBeam.height);
}

// Add player collision logic
function checkPlayerCollision() {
    if (
        player1.x + player1.width > player2.x &&
        player1.x < player2.x + player2.width &&
        player1.y + player1.height > player2.y &&
        player1.y < player2.y + player2.height
    ) {
        // Resolve collision by pushing players apart
        if (player1.dx > 0) player1.x = player2.x - player1.width; // Player 1 moving right
        if (player1.dx < 0) player1.x = player2.x + player2.width; // Player 1 moving left
        if (player1.dy > 0) player1.y = player2.y - player1.height; // Player 1 moving down
        if (player1.dy < 0) player1.y = player2.y + player2.height; // Player 1 moving up

        if (player2.dx > 0) player2.x = player1.x - player2.width; // Player 2 moving right
        if (player2.dx < 0) player2.x = player1.x + player1.width; // Player 2 moving left
        if (player2.dy > 0) player2.y = player1.y - player2.height; // Player 2 moving down
        if (player2.dy < 0) player2.y = player1.y + player1.height; // Player 2 moving up
    }
}

// Update game loop to include visual collisions
function gameLoop() {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    // Update Player 1 position
    player1.x += player1.dx;
    player1.y += player1.dy;
    player1.x = Math.max(0, Math.min(canvasWidth - player1.width, player1.x));
    player1.y = Math.max(0, Math.min(canvasHeight - player1.height, player1.y));

    // Update Player 2 position
    player2.x += player2.dx;
    player2.y += player2.dy;
    player2.x = Math.max(0, Math.min(canvasWidth - player2.width, player2.x));
    player2.y = Math.max(0, Math.min(canvasHeight - player2.height, player2.y));

    // Check for player collisions
    checkPlayerCollision();

    // Handle projectile and super attack collisions
    handleProjectileCollisions();
    handleSuperAttackCollisions();

    // Update positions
    updatePositions();
}

function updatePositions() {
    player1.element.style.transform = `translate(${player1.x}px, ${player1.y}px)`;
    player2.element.style.transform = `translate(${player2.x}px, ${player2.y}px)`;
}

// Initialize game on page load
window.onload = initializeGame;
