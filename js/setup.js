// keep players global so we can access it when adding to the sessionStorage
let players = 2; //this is the minimum amount of players allowed.

// For buttons.
document.addEventListener("DOMContentLoaded", () => {
    const nextInput = document.getElementById("nextInput");
    const goAgainInput = document.getElementById("goAgainInput");

    let waitingForNextInput = false;
    let waitingForGoAgainInput = false;

    // states for grabbing input.
    nextInput.addEventListener("focus", () => {
        waitingForNextInput = true;
        waitingForGoAgainInput = false;
    });
    
    goAgainInput.addEventListener("focus", () => {
        waitingForNextInput = false;
        waitingForGoAgainInput = true;
    });

    // Constantly checking for controller inputs. Will alter the input fields to reflect the input.
    function pollController() {
        const gamepads = navigator.getGamepads();

        for (const gamepad of gamepads) {
            if (!gamepad) continue;
        
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    console.log('button pressed.')
                    // Assign button index to the correct input field
                    if (waitingForNextInput) {
                        nextInput.value = `Button ${index}`;
                        waitingForNextInput = false; // Stop waiting after capturing input
                    } else if (waitingForGoAgainInput) {
                        goAgainInput.value = `Button ${index}`;
                        waitingForGoAgainInput = false;
                    }
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

// For players add-remove buttons
document.addEventListener("DOMContentLoaded", () => {
    // We will only change the visibility of the players 3-5.
    const player3 = document.getElementById("player3Input").parentElement;
    const player4 = document.getElementById("player4Input").parentElement;
    const player5 = document.getElementById("player5Input").parentElement;

    const removeButton = document.getElementById("removePlayerButton");
    const addButton = document.getElementById("addPlayerButton");

    // keep track of players in the display. when we have all 5, add is disabled. when we have 2, remove is disabled.
    addButton.addEventListener("click", () => {
        // will change the display of each element
        switch (players) {
            case 2:
                player3.style.visibility = "visible";
                // enable removeButton, we can remove player3.
                removeButton.disabled = false
                break;
            case 3:
                player4.style.visibility = "visible";
                break;
            case 4:
                player5.style.visibility = "visible";
                // disable addButton, we cannot add more.
                addButton.disabled = true;
                break;
            default:
                console.log("error occured while adding player input.");
                break;
        }
        players++;
    });

    removeButton.addEventListener("click", () => {
        // will remove player, then clear the inputs.
        switch (players) {
            case 3:
                player3.children[1].value = "";
                player3.style.visibility = "hidden";
                // disable removeButton, we can remove no more.
                removeButton.disabled = true;
                break;
            case 4:
                player4.children[1].value = "";
                player4.style.visibility = "hidden";
                break;
            case 5:
                player5.children[1].value = "";
                player5.style.visibility = "hidden";
                // enable addButton, we can add more.
                addButton.disabled = false;
                break;
            default:
                console.log("error occured while removing player inputs.")
        }
        players--;
    });
});

function saveData() {
    
}
// Button logic
document.addEventListener("DOMContentLoaded", () => {
    const nextButton = document.getElementById("nextButton");

    //inputs
    const nextInput = document.getElementById("nextInput");
    const goAgainInput = document.getElementById("goAgainInput");
    const player1 = document.getElementById("player1Input");
    const player2 = document.getElementById("player2Input");
    const player3 = document.getElementById("player3Input");
    const player4 = document.getElementById("player4Input");
    const player5 = document.getElementById("player5Input");

    nextButton.addEventListener("click", () => {
        // clear cache.
        sessionStorage.clear();
        // add inputs to local storage.
        sessionStorage.setItem("nextInput", nextInput.value);
        sessionStorage.setItem("goAgainInput", goAgainInput.value);

        sessionStorage.setItem("player1", player1.value);
        sessionStorage.setItem("player2", player2.value);
        sessionStorage.setItem("player3", player3.value);
        sessionStorage.setItem("player4", player4.value);
        sessionStorage.setItem("player5", player5.value);
        sessionStorage.setItem("players", players)
        console.log('Added values to sessionStorage:');
        for (let key in sessionStorage) {
            console.log(`${key}: ${sessionStorage.getItem(key)}`);
        }
    });
});