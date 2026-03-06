// Global variables to store flip results
let firstFlipResult = null;
let secondFlipResult = null;
let forcedAnswer = null;

// Flip the first coin
function flipCoin() {
    const coin = document.getElementById("coin");
    const resultDiv = document.getElementById("flip-result");
    const flipBtn = document.getElementById("flip-btn");

    // Disable button during animation
    flipBtn.disabled = true;

    // Add flipping animation
    coin.classList.add("flipping");

    // Generate random result after animation
    setTimeout(() => {
        firstFlipResult = Math.random() < 0.5 ? "heads" : "tails";

        // Remove animation class
        coin.classList.remove("flipping");

        // Show result
        resultDiv.innerHTML = `<strong style="color: ${firstFlipResult === "heads" ? "#FFD700" : "#C0C0C0"}">
            You got: ${firstFlipResult.toUpperCase()}!
        </strong>`;

        // Show instructions based on result
        const instructionsDiv = document.getElementById("instructions");
        const instructionText = document.getElementById("instruction-text");

        if (firstFlipResult === "heads") {
            instructionText.innerHTML = `
                <strong>🎯 HEADS: Tell the TRUTH!</strong><br>
                Answer the question honestly. Your real answer will be recorded but nobody will know it's yours!
            `;
            instructionsDiv.style.display = "block";

            // Show answer buttons
            setTimeout(() => {
                document.getElementById("answer-section").style.display =
                    "block";
            }, 1000);
        } else {
            instructionText.innerHTML = `
                <strong>🎲 TAILS: Flip the coin AGAIN!</strong><br>
                The second flip will decide your answer randomly. Heads = YES, Tails = NO.
            `;
            instructionsDiv.style.display = "block";

            // Show second flip section
            setTimeout(() => {
                document.getElementById("second-flip").style.display = "block";
            }, 1000);
        }
    }, 1000); // 1 second animation
}

// Flip the second coin
function flipCoinSecond() {
    const coin = document.getElementById("coin2");
    const resultDiv = document.getElementById("flip-result2");

    // Add flipping animation
    coin.classList.add("flipping");

    // Generate random result
    setTimeout(() => {
        secondFlipResult = Math.random() < 0.5 ? "heads" : "tails";
        forcedAnswer = secondFlipResult === "heads" ? "yes" : "no";

        coin.classList.remove("flipping");

        resultDiv.innerHTML = `
            <strong style="color: ${secondFlipResult === "heads" ? "#FFD700" : "#C0C0C0"}">
                ${secondFlipResult.toUpperCase()}!
            </strong><br>
            You must answer: <strong>${forcedAnswer.toUpperCase()}</strong>
        `;

        // Show answer buttons
        setTimeout(() => {
            document.getElementById("answer-section").style.display = "block";
        }, 1000);
    }, 1000);
}

// Submit answer
function submitAnswer(answer) {
    // Prepare data
    const data = {
        first_flip: firstFlipResult,
        second_flip: secondFlipResult,
        submitted_answer: answer,
        true_answer: firstFlipResult === "heads" ? answer : null,
    };

    // Send to backend
    fetch("/api/response", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log("Response saved:", result);

            // Hide everything and show thank you
            document.getElementById("coin-section").style.display = "none";
            document.getElementById("instructions").style.display = "none";
            document.getElementById("second-flip").style.display = "none";
            document.getElementById("answer-section").style.display = "none";
            document.getElementById("thank-you").style.display = "block";
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Error saving response. Please try again.");
        });
}
