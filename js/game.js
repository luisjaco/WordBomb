for (let key in sessionStorage){
    console.log("Using the following values in sessionStorage:")
    console.log(`key : ${sessionStorage.getItem(key)}`);
};

const playerList = [];

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* Initial Screen Setup */
document.addEventListener("DOMContentLoaded", ()=> {
    // gather player count and then make a new player element for each, with corresponding name.
    const playerCount = parseInt(sessionStorage.getItem("players"));
    
    const container = document.querySelector('.circle-container');
    const radius = container.offsetWidth / 2; // radius of the circle
    const angleStep = (2 * Math.PI) / playerCount; // angle between player elements

    // we will now make all of the player elements and spread them around the circle, starting at the top.
    for (let i=1; i <= playerCount; i++) {
        // Construct element with tag and corresponding player.
        const playerElement = document.createElement("div");
        playerElement.className = "player";
        playerElement.innerText = sessionStorage.getItem(`player${i}`);
        container.appendChild(playerElement);

        playerList.push(playerElement);

        // Set the elements position.
        const angle = (i-1) * angleStep;
        const x = radius + radius * Math.cos(angle - (Math.PI/2)); // X position
        const y = radius + radius * Math.sin(angle - (Math.PI/2)); // Y position
        playerElement.style.left = `${x}px`;
        playerElement.style.top = `${y}px`;
    };

    // make category show at the bottom
    const categoryText = document.getElementById("category");
    categoryText.innerText = sessionStorage.getItem("category");
});

/* Controller Setup */
let currentInput = 0; // Will be 2 for goAgain and 1 for next

document.addEventListener("DOMContentLoaded", () => {
    const nextInput = sessionStorage.getItem('nextInput');
    const goAgainInput = sessionStorage.getItem('goAgainInput');

    let lastPressTime;
    const debounceTime = 300;
    function pollController() {
        const gamepads = navigator.getGamepads();

        for (const gamepad of gamepads) {
            if (!gamepad) continue;
            const now = Date.now(); // for ensuring a button delay

            //index will return a number. 
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed && (!lastPressTime || now - lastPressTime > debounceTime)) {
                    const input = `Button ${index}`; // matches to registered inputs
                    console.log(`button pressed: ${index}`)
                    if (input === nextInput) {
                        currentInput = 1;
                    } else if (input === goAgainInput) {
                        currentInput = 2;
                    }
                    lastPressTime = now;
                }
            });
        }
        // Keep polling (grabbing input)
        requestAnimationFrame(pollController);
    }

    // Start polling when the gamepad is connected
    window.addEventListener("gamepadconnected", () => {
        console.log("Gamepad connected. Start polling for inputs.");
        pollController();
    });
    
    // Log when the gamepad is disconnected
    window.addEventListener("gamepaddisconnected", () => {
        console.log("Gamepad disconnected.");
    });
});

/* Gameplay */
document.addEventListener("DOMContentLoaded", () => {
    /* Constants & activePlayers Setup */
    const sleepingBomb = document.getElementById("sleeping");
    const blankBomb = document.getElementById("blank");
    const blankBombText = document.getElementById("blank-text");
    const redBomb = document.getElementById("blank-red");
    const redBombText = document.getElementById("blank-red-text");
    const explodeBomb = document.getElementById("explode");

    let activePlayers = [];
    for (let i=0; i < playerList.length; i++) {
        const player = {
            element : playerList[i],
            timeLeft : 0
        };
        activePlayers.push(player);
    }

    /* Game Setup */
    async function roundSequence(player) {
        const timeLimit = player.timeLeft;

        // edge case
        if (timeLimit <= 0) return 1;
        let timeRemaining = timeLimit;
        //begin turn
        blankBomb.style.visibility = "visible";
        blankBombText.innerText = (timeLimit / 1000).toFixed(0); // in seconds.
        player.element.classList.add("player-turn"); 

        return new Promise((resolve) => {
            console.log("beginning bomb sequence.")
            const bomb = setInterval(() => {
                const seconds = timeRemaining / 1000;
                if (timeRemaining > 4001) {
                    blankBombText.innerText = `${seconds.toFixed(0)}`
                } else if (timeRemaining > 0) {
                    player.element.classList.remove("player-turn");
                    player.element.classList.add("player-turn-ending"); 
                    blankBomb.style.visibility = "hidden";
                    redBomb.style.visibility = "visible";
                    redBombText.innerHTML = `${seconds.toFixed(2)}`;
                } else { //timeRemaining has run out, end, reset
                    player.element.classList.remove("player-turn");
                    player.element.classList.remove("player-turn-ending");
                    player.timeLeft = 0;
                    redBomb.style.visibility = "hidden";
                    clearInterval(bomb);
                    resolve(0) // loss
                }
                timeRemaining -= 10;
    
                // If the current input has changed, we will exit out of the bomb loop.
                if (currentInput !== 0) {
                    // reset
                    const action = currentInput;
                    currentInput = 0;
                    player.element.classList.remove("player-turn");
                    player.element.classList.remove("player-turn-ending");
                    player.timeLeft = timeRemaining;
                    redBomb.style.visibility = "hidden";
                    clearInterval(bomb);
                    resolve(action);
                }
            }, 10)
        });
    };

    async function playerLose(player) {
        // animation for player losing, eplodes for .5s
        explodeBomb.style.visibility = 'visible';
        player.element.classList.add("player-lost");
        await wait(500);
        explodeBomb.style.visibility = 'hidden';
    };

    function playerWin(player) {
        sleepingBomb.style.visibility = "visible";
        player.element.classList.add('player-won')
    }
    async function gameSequence() {
        // Sleeping bomb will be present for the first 3000ms, gives players some time.
        console.log("Sleeping for 3000ms...");
        await wait(3000);
        console.log("Beginning game");
        sleepingBomb.style.visibility = "hidden";

        //Initial values.
        let round = 1;
        let roundTime = 10_000; //ms
        const roundText = document.getElementById("round");
        let gameOver = false;
        while (activePlayers.length > 1 && !gameOver) {
            roundText.innerText = `Round: ${round}`;
            
            // New round, give each player a fresh time.
            for (let currentPlayer of activePlayers) {
                currentPlayer.timeLeft = roundTime;
            }
            
            // our player index, will keep track of who is currently playing.
            let playerIndex = 0;
            let forwardTurns = 0; //number of forward turns. we know that the round is over once we've had n turns. (n = # of players at beginning of round.)
            let endOfRound = activePlayers.length;
            while (forwardTurns < endOfRound) {
                const currentPlayer = activePlayers[playerIndex]
                const action = await roundSequence(currentPlayer); // 2 for goAgain, 1 for next, 0 for lose.
                
                // handle action
                switch (action) {
                    case 1: //next
                        forwardTurns++;
                        playerIndex++;
                        break;
                    case 2: //goAgain
                        forwardTurns--;
                        playerIndex--;
                        // Underflow case, when we've gone below index 0. Loop around
                        if (playerIndex < 0) {
                            playerIndex = activePlayers.length - 1;
                        }
                        break;
                    case 0: // player lost
                        await playerLose(currentPlayer, activePlayers); // we will remove players at the end of each round. 
                        endOfRound--; // will be shorter
                        activePlayers.splice(playerIndex, 1);
                        break;
                    default:
                        console.log("Error occured, invalid action.");
                        break;
                }
                // Overflow case, when we've gone above the length of activePlayers
                if (playerIndex > activePlayers.length - 1) {
                        playerIndex = 0;
                }

                //game winner check
                if (activePlayers.length === 1) {
                    playerWin(activePlayers[0]);
                    gameOver = true;
                    break;
                }
            }
            // end of round
            console.log("finished round.")
            
            round++;

            // alter round time after these rounds
            if (round === 4) {
                roundTime = 7000;
                roundText.style.color = "goldenrod";
            } else if (round === 7) {
                roundTime = 5000;
                roundText.style.color = "red";
            }

        }
    }

    gameSequence();
});
