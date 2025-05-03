document.addEventListener('DOMContentLoaded', () => {
    // Ensure the start modal is visible when the page loads
    document.getElementById('start-modal').style.display = 'flex';
});

let move_speed = 3, grativy = 0.5;
let isda_dy = 0;
let isda = document.querySelector('.isda');
let img = document.getElementById('isda-1');
let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

let isda_props = isda.getBoundingClientRect();
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let score_title = document.querySelector('.score_title');

let game_state = 'Start';
img.style.display = 'none';

let high_score = localStorage.getItem('highScore') || 0;
document.getElementById('high-score-display').innerText = high_score;

const bgMusic = document.getElementById('bg-music');
const muteButton = document.getElementById('mute-button');
const muteButtonGameOver = document.getElementById('mute-button-gameover');

document.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play(); 
    }
});

muteButton.disabled = false;

document.querySelector('.start-button').addEventListener('click', () => {
    if (game_state === 'Start') {
        document.getElementById('start-modal').style.display = 'none'; // Hide the start modal
        document.querySelector('.background').style.display = 'block'; // Ensure the background is visible
        img.style.display = 'block'; // Ensure the fish image is visible
        isda.style.top = '40vh'; // Position the fish correctly
        game_state = 'Play'; // Transition to "Play" state
        score_title.innerHTML = 'Score : ';
        score_val.innerHTML = '0'; // Reset score
        play(); // Start the game
        bgMusic.play();
        muteButton.disabled = false;
    }
});

function toggleMute(button) {
    if (bgMusic.muted) {
        bgMusic.muted = false;
        button.textContent = 'Mute';
    } else {
        bgMusic.muted = true;
        button.textContent = 'Unmute';
    }
}

muteButton.addEventListener('click', () => toggleMute(muteButton));
muteButtonGameOver.addEventListener('click', () => toggleMute(muteButtonGameOver));

function handleJump() {
    if (game_state === 'Play') {
        isda_dy = -7.6;
    }
}

document.addEventListener('click', handleJump);
document.addEventListener('touchstart', handleJump);
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') handleJump();
});

function endGame() {
    game_state = 'End';
    document.getElementById('final-score').innerText = score_val.innerHTML; // Display final score
    if (parseInt(score_val.innerHTML) > high_score) {
        high_score = parseInt(score_val.innerHTML);
        localStorage.setItem('highScore', high_score); // Save high score
    }
    document.getElementById('high-score').innerText = high_score; // Update high score display
    document.getElementById('game-over-modal').style.display = 'flex'; // Show game-over modal
}

document.querySelector('.play-again-button').addEventListener('click', () => {
    document.getElementById('game-over-modal').style.display = 'none';
    window.location.reload();
});

function play() {
    // Ensure the game elements are visible when the game starts
    document.querySelector('.background').style.display = 'block';
    img.style.display = 'block';

    function move() {
        if (game_state != 'Play') return;

        let pipe_sprite = document.querySelectorAll('.pipe_sprite');
        pipe_sprite.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            isda_props = isda.getBoundingClientRect();

            if (pipe_sprite_props.right <= 0) {
                element.remove(); // Remove pipes that move out of view
            } else {
                // Check for collision
                if (
                    isda_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
                    isda_props.left + isda_props.width > pipe_sprite_props.left &&
                    isda_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
                    isda_props.top + isda_props.height > pipe_sprite_props.top
                ) {
                    img.style.display = 'none';
                    sound_die.play();
                    endGame(); // Trigger game over
                    return;
                } else {
                    // Update score when passing pipes
                    if (
                        pipe_sprite_props.right < isda_props.left &&
                        pipe_sprite_props.right + move_speed >= isda_props.left &&
                        element.increase_score == '1'
                    ) {
                        score_val.innerHTML = +score_val.innerHTML + 1;
                        sound_point.play();
                        element.increase_score = '0'; // Prevent multiple score increments
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    function apply_gravity() {
        if (game_state != 'Play') return;
        isda_dy += grativy;

        if (isda_props.top <= 0 || isda_props.bottom >= background.bottom) {
            endGame(); // Trigger game over if fish hits boundaries
            return;
        }
        isda.style.top = isda_props.top + isda_dy + 'px';
        isda_props = isda.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    let pipe_seperation = 0;
    let pipe_gap = 25; // Reduced gap from 35 to 25

    function create_pipe() {
        if (game_state != 'Play') return;

        if (pipe_seperation > 115) {
            pipe_seperation = 0;

            let pipe_posi = Math.floor(Math.random() * 43) + 8;

            // Create top pipe
            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';
            pipe_sprite_inv.style.backgroundImage = "url('assets/toppipe.png')"; // Use toppipe.png
            pipe_sprite_inv.style.backgroundSize = 'cover';

            document.body.appendChild(pipe_sprite_inv);

            // Create bottom pipe
            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.style.backgroundImage = "url('assets/bottompipe.png')"; // Use bottompipe.png
            pipe_sprite.style.backgroundSize = 'cover';
            pipe_sprite.increase_score = '1'; // Mark pipe for scoring

            document.body.appendChild(pipe_sprite);
        }
        pipe_seperation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);
}

window.addEventListener('offline', () => {
    document.getElementById('offline-error').style.display = 'block';
});

window.addEventListener('online', () => {
    document.getElementById('offline-error').style.display = 'none';
});
