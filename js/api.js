const API_BASE = "https://codecyprus.org/th/api";
const APP_NAME = "Netrunners-TreasureHuntApp";

let questionType = "";

// Player name comes from the cookie saved by player.js (falls back to "Netrunners").
function getPlayerName() {
    let name = (typeof getCookie === "function") ? getCookie("playerName") : "";
    return name || "Netrunners";
}

// Shows a short message to the player on the page.
function showMessage(text) {
    let message = document.getElementById("message");
    if (message) {
        message.textContent = text;
    }
}

function getChallenges() {
    let challengesList = document.getElementById("challengesList");
    if (!challengesList) {
        return;
    }

    fetch(`${API_BASE}/list`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            let treasureHuntsArray = data.treasureHunts;
            challengesList.innerHTML = "";

            for (let i = 0; i < treasureHuntsArray.length; i++) {
                let currentHunt = treasureHuntsArray[i];

                let listItem = document.createElement("li");
                let link = document.createElement("a");
                link.href = "#";
                link.textContent = currentHunt.name;
                link.addEventListener("click", function (event) {
                    event.preventDefault();
                    startChallenge(currentHunt.uuid);
                });

                listItem.appendChild(link);
                challengesList.appendChild(listItem);
            }
        })
        .catch(error => console.log("Error getting challenges: " + error));
}

getChallenges();

function startChallenge(currentHuntUuid) {
    if (!currentHuntUuid) {
        console.log("No treasure hunt selected");
        return;
    }

    fetch(`${API_BASE}/start?player=${encodeURIComponent(getPlayerName())}&app=${encodeURIComponent(APP_NAME)}&treasure-hunt-id=${encodeURIComponent(currentHuntUuid)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            if (data.status === "OK") {
                const sessionID = data.session;
                console.log("Session ID: " + sessionID);

                if (typeof saveSessionId === "function") {
                    saveSessionId(sessionID);
                }

                document.getElementById("huntsSection").style.display = "none";
                document.getElementById("gameSection").style.display = "block";
                getQuestion(sessionID);
            } else {
                showMessage("Could not start: " + data.errorMessages);
            }
        })
        .catch(error => console.log("Error starting challenge: " + error));
}

// Fetches the current question, builds the answer inputs and the skip button.
function getQuestion(sessionID) {
    fetch(`${API_BASE}/question?session=${encodeURIComponent(sessionID)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            if (data.status !== "OK") {
                console.log("Error getting question: " + data.errorMessages);
                return;
            }

            getScore(sessionID);

            if (data.completed) {
                showMessage("Treasure Hunt completed!");
                document.getElementById("questionText").textContent = "";
                document.getElementById("answerArea").innerHTML = "";
                document.getElementById("submitButton").style.display = "none";
                return;
            }

            document.getElementById("questionText").innerHTML = data.questionText;
            document.getElementById("submitButton").style.display = "inline-block";
            console.log("Question: " + data.questionText);
            console.log("Type: " + data.questionType);
            console.log("Can be skipped?: " + data.canBeSkipped);

            questionType = data.questionType;

            let answerArea = document.getElementById("answerArea");
            if (!answerArea) {
                return;
            }

            if (questionType === "BOOLEAN") {
                answerArea.innerHTML =
                    `
                    <input type="radio" name="answer" value="true"> True <br>
                    <input type="radio" name="answer" value="false"> False
                    `;
            } else if (questionType === "INTEGER") {
                answerArea.innerHTML = '<input type="number" id="answer">';
            } else if (questionType === "NUMERIC") {
                answerArea.innerHTML = '<input type="number" step="any" id="answer">';
            } else if (questionType === "MCQ") {
                answerArea.innerHTML =
                    `
                    <input type="radio" name="answer" value="A"> A <br>
                    <input type="radio" name="answer" value="B"> B <br>
                    <input type="radio" name="answer" value="C"> C <br>
                    <input type="radio" name="answer" value="D"> D
                    `;
            } else {
                answerArea.innerHTML = '<input type="text" id="answer">';
            }

            // Skip is only offered when the question allows it, and only runs on click.
            if (data.canBeSkipped === true) {
                let skipButton = document.createElement("button");
                skipButton.type = "button";
                skipButton.textContent = "Skip";
                skipButton.addEventListener("click", function () {
                    questionSkip(sessionID);
                });
                answerArea.appendChild(document.createElement("br"));
                answerArea.appendChild(skipButton);
            }
        })
        .catch(error => console.log("Error getting question: " + error));
}

// Kept as an alias so existing callers of challengeQuestions still work.
function challengeQuestions(sessionID) {
    getQuestion(sessionID);
}

function questionSkip(sessionID) {
    fetch(`${API_BASE}/skip?session=${encodeURIComponent(sessionID)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            if (data.status === "OK") {
                showMessage("Skipped. " + data.message);
                getQuestion(sessionID);
            } else {
                showMessage("Could not skip: " + data.errorMessages);
            }
        })
        .catch(error => console.log("Error skipping question: " + error));
}

function submitAnswer(sessionID) {
    let answer = "";

    if (questionType === "MCQ" || questionType === "BOOLEAN") {
        let answers = document.getElementsByName("answer");
        for (let i = 0; i < answers.length; i++) {
            if (answers[i].checked) {
                answer = answers[i].value;
            }
        }
    } else {
        let input = document.getElementById("answer");
        answer = input ? input.value.trim() : "";
    }

    if (answer === "") {
        showMessage("Please enter an answer");
        return;
    }

    fetch(`${API_BASE}/answer?session=${encodeURIComponent(sessionID)}&answer=${encodeURIComponent(answer)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            if (data.status !== "OK") {
                showMessage("Error: " + data.errorMessages);
                return;
            }

            showMessage(data.message);

            if (data.correct) {
                getQuestion(sessionID);
            } else {
                getScore(sessionID);
            }
        })
        .catch(error => console.log("Error submitting answer: " + error));
}

function updateLocation(sessionID) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            fetch(`${API_BASE}/location?session=${encodeURIComponent(sessionID)}&latitude=${latitude}&longitude=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.status === "OK") {
                        console.log("Location updated");
                        console.log("Message: " + data.message);
                    } else {
                        console.log("Location was not updated");
                    }
                })
                .catch(error => console.log("Error updating location: " + error));
        },
        function (error) {
            console.log("Could not get location");
        }
    );
}

function getScore(sessionID) {
    fetch(`${API_BASE}/score?session=${encodeURIComponent(sessionID)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === "OK") {
                let score = document.getElementById("score");
                if (score) {
                    score.textContent = "Score: " + data.score;
                }
            }
        })
        .catch(error => console.log("Error getting score: " + error));
}

function getLeaderboard(sessionID) {
    fetch(`${API_BASE}/leaderboard?session=${encodeURIComponent(sessionID)}&sorted&limit=10`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === "OK") {
                for (let i = 0; i < data.leaderboard.length; i++) {
                    console.log(data.leaderboard[i].player + " : " + data.leaderboard[i].score);
                }
            }
        })
        .catch(error => console.log("Error getting leaderboard: " + error));
}
