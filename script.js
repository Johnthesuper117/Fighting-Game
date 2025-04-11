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

function initializeGame() {
    setInitialPositions();
    enableControls();
    setInterval(gameLoop, 16); // ~60 FPS game loop
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

function punch(attacker, defender) {
    if (attacker.punchCooldown) return; // Prevent spamming punches
    attacker.punchCooldown = true;

    // Check for collision
    if (
        attacker.x + attacker.width >= defender.x &&
        attacker.x <= defender.x + defender.width &&
        attacker.y + attacker.height >= defender.y &&
        attacker.y <= defender.y + defender.height
    ) {
        defender.health -= 10; // Deal damage
        attacker.meter += 5; // Gain meter for attacking
        defender.meter += 3; // Gain meter for being hit
    }

    setTimeout(() => (attacker.punchCooldown = false), 500); // 0.5s cooldown
}

function shootProjectile(attacker, direction) {
    projectiles.push({
        x: attacker.x + (direction === "right" ? attacker.width : -10),
        y: attacker.y + attacker.height / 2 - 5,
        width: 10,
        height: 10,
        speed: direction === "right" ? 7 : -7,
        owner: attacker,
    });
}

function useSuperAttack(player) {
    if (player.meter < 100) return; // Super attack requires a full meter
    player.meter = 0; // Reset meter

    laserBeams.push({
        x: player.x + (player === player1 ? player.width : -100),
        y: player.y + player.height / 2 - 10,
        width: 100,
        height: 20,
        speed: player === player1 ? 10 : -10,
        owner: player,
    });
}

// Update positions and handle collisions
function gameLoop() {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    // Update Player 1 position
    player1.x += player1.dx;
    player1.y += player1.dy;

    // Constrain Player 1 to the screen bounds
    player1.x = Math.max(0, Math.min(canvasWidth - player1.width, player1.x));
    player1.y = Math.max(0, Math.min(canvasHeight - player1.height, player1.y));

    // Update Player 2 position
    player2.x += player2.dx;
    player2.y += player2.dy;

    // Constrain Player 2 to the screen bounds
    player2.x = Math.max(0, Math.min(canvasWidth - player2.width, player2.x));
    player2.y = Math.max(0, Math.min(canvasHeight - player2.height, player2.y));

    updatePositions();
}

function updatePositions() {
    player1.element.style.transform = `translate(${player1.x}px, ${player1.y}px)`;
    player2.element.style.transform = `translate(${player2.x}px, ${player2.y}px)`;
}

// Initialize game on page load
window.onload = initializeGame;