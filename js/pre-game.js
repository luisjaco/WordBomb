//input test logic
document.addEventListener("DOMContentLoaded", () => {
    const inputTestText = document.getElementById("input-test-text"); 
    const inputTestBox = inputTestText.parentNode;

    // retrieve from predefined.
    const nextInput = sessionStorage.getItem('nextInput');
    const goAgainInput = sessionStorage.getItem('goAgainInput');

    console.log(`Testing the following inputs: \nnext: ${nextInput}\ngoAgain ${goAgainInput}`)
    // Constantly checking for controller inputs. Will alter the input fields to reflect the input.
    function pollController() {
        const gamepads = navigator.getGamepads();

        for (const gamepad of gamepads) {
            if (!gamepad) continue;
            
            //index will return a number. 
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    const input = `Button ${index}`; // Will make matching easier. The index is simply a number.
                    // Assign button index to the correct input field
                    console.log(`button pressed: ${index}`)
                    if (input === nextInput) {
                        inputTestText.innerText = "NEXT";
                        inputTestBox.style.backgroundColor = "lightgreen";
                    } else if (input === goAgainInput) {
                        inputTestText.innerText = "GO AGAIN";
                        inputTestBox.style.backgroundColor = "lightcoral";
                    } else {
                        inputTestText.innerText = "INVALID";
                        inputTestBox.style.backgroundColor = "lightgray";
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

// category logic
document.addEventListener("DOMContentLoaded", () => {
    const spinButton = document.getElementById("spinButton");
    const categoryText = document.getElementById("categoryText");
    const categoryContainer = categoryText.parentNode;

    // category options
    const options = [
        "Words that start with 'A'", "Words that start with 'B'", "Words that start with 'C'",
        "Words that start with 'D'", "Words that start with 'E'", "Words that start with 'F'",
        "Words that start with 'G'", "Words that start with 'H'", "Words that start with 'I'",
        "Words that start with 'J'", "Words that start with 'K'", "Words that start with 'L'",
        "Words that start with 'M'", "Words that start with 'N'", "Words that start with 'O'",
        "Words that start with 'P'", "Words that start with 'Q'", "Words that start with 'R'",
        "Words that start with 'S'", "Words that start with 'T'", "Words that start with 'U'",
        "Words that start with 'V'", "Words that start with 'W'", "Words that start with 'X'",
        "Words that start with 'Y'", "Words that start with 'Z'", "Red things",
        "Blue things", "Green things", "Yellow things",
        "Purple things", "Orange things", "Black things",
        "White things", "Pink things", "Brown things",
        "Gray things", "Cyan things", "Magenta things",
        "Countries", "Dances", "Dogs",
        "Fish", "Flying Things", "Fried Foods",
        "Fruit", "Footwear", "Hairstyles",
        "Hats", "Hot Things", "Insects",
        "Instruments", "Pets", "Round Things",
        "Sports", "Sweets", "Toys",
        "Vegetables", "Vehicles"
    ];

    // background colors, we will make the categoryContainer go rainbow as the options spin.
    const backgroundColors = [
        "lightblue", "lightcoral", "lightcyan",
        "lightgoldenrodyellow", "lightgreen","lightindigo",
        "lightkhaki", "lightpink", "lightsalmon",
        "lightskyblue", "lightslategray", "lightslategrey",
        "lightsteelblue", "lightyellow"
    ];

    function changeCategory () {
        const randomIndex = Math.floor(Math.random() * options.length);
        const randomColorIndex = Math.floor(Math.random() * backgroundColors.length);

        categoryText.textContent = options[randomIndex];
        categoryContainer.style.backgroundColor = backgroundColors[randomColorIndex];
    }

    function startSpinning() {
        const spinInterval = setInterval(changeCategory, 80); // spins every .08s

        // stop the spinning after 3 seconds
        setTimeout(() => {
            clearInterval(spinInterval);
        }, 3000);
    }

    spinButton.addEventListener("click", () => {
        startSpinning();
    });
});

// Players order text
document.addEventListener("DOMContentLoaded", () => {
    const playerOrderText = document.getElementById("playerOrder");
    
    const players = parseInt(sessionStorage.getItem("players"));
    let text = ""; // we will simply construct a string on the current players.

    for (let i = 1; i <= players; i++) {
        if (i === players) { // last player wont have the arrow symbol
            text += sessionStorage.getItem(`player${i}`);
        } else {
            text += `${sessionStorage.getItem(`player${i}`)} \u2192 `;
        }
    }

    playerOrderText.innerText = text;
});

// Start game logic 
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startButton");
    const categoryText = document.getElementById("categoryText");

    startButton.addEventListener("click", () => {
        console.log(`added [category : '${categoryText.innerText}'] to sessionStorage.`);
        sessionStorage.setItem("category", categoryText.innerText);
    });
})