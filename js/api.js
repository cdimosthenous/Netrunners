function getChallenges(){
    fetch("https://codecyprus.org/th/api/list")
        .then(response => response.json())
        .then(data => {
                console.log(data);

                let treasureHuntsArray= data.treasureHunts;

                let challengesList = document.getElementById("challengesList");

                for(let i = 0; i < treasureHuntsArray.length; i++) {
                    let currentHunt = treasureHuntsArray[i];

                    let currentHuntUuid = currentHunt.uuid;

                    let listItem = document.createElement("li");
                    listItem.innerHTML = "<a href='https://codecyprus.org/th/api/start ?player=Netrunners&app=TreasureHuntApp&treasure-hunt-id=${currentHuntUuid}'>" + currentHunt.name + "</a>";

                    challengesList.appendChild(listItem);
                }
            }
        );
}

getChallenges();

function startChallenge(currentHuntUuid){
    fetch(`https://codecyprus.org/th/api/start?player=Netrunners&app=TreasureHuntApp-app&treasure-hunt-id=${currentHuntUuid}'`)
    .then(response => response.json())
    .then(data => {
        console.log(data);

        if(data.status==="OK") {
            
            const sessionID = data.session;
            console.log("Session ID: " + sessionID);

            challengeQuestions(sessionID);
            questionSkip(sessionID);
        }

    })
        .catch(error => console.log("Error starting challenge:" + error));

}

startChallenge();

function challengeQuestions(sessionID){
    fetch('https://codecyprus.org/th/api/question?session=${sessionID}')
    .then(response => response.json())
    .then(data => {
        console.log(data);

        if(data.status==="OK"){

            if(data.completed){
                console.log("Treasure Hunt completed");
            }
            else{

                console.log("Current Question:" + data.question.questionText);
                console.log("Question Type:" + data.question.questionType);
                console.log("Can be skipped?:" + data.question.canBeSkipped);

                if(data.question.canBeSkipped === true){
                    console.log("Show the skip button");
                }
                else{
                    questionSkip(sessionID);
                    console.log("Hide the skip button");
                }
            }
        }
    })
        .catch(error => console.log("Error fetching question:" + error));
}

function questionSkip(sessionID){
    fetch('https://codecyprus.org/th/api/skip?session=${sessionID}')
    .then(response => response.json())
    .then(data => {
        console.log(data);

        if(data.status==="OK"){
            console.log("Question skipped! Score adjustment" + data.scoreAdjustment)
            console.log("Message:" + data.message);

            if(data.completed){
                console.log("Treasure Hunt completed after skipping!");
            }
            else{
                challengeQuestions(sessionID);
            }
        }
        else{
            console.log("Error skipping question: " + data.message);
        }
    })
        .catch(error => console.log("Error skipping question:" + error));
}
let questionType = "";
function getQuestion(sessionID)
{
    fetch(`https://codecyprus.org/th/api/question?session=${sessionID}`)
        .then(response => response.json())
        .then(data => {

            console.log(data);

            if(data.status === "OK")
            {
                console.log("Question: " + data.question.questionText);
                console.log("Type: " + data.question.questionType);
                questionType = data.question.questionType;
                let answerArea = document.getElementById("answerArea");
                if(questionType === "BOOLEAN")
                {
                    answerArea.innerHTML =
                        `
                    <input type="radio" name="answer" value="True"> True <br>
                    <input type="radio" name="answer" value="False"> False
                    `;
                }
                else if(questionType === "INTEGER")
                {
                    answerArea.innerHTML = '<input type="number" id="answer">';
                }
                else if(questionType === "NUMERIC")
                {
                    answerArea.innerHTML = '<input type="number" step="any" id="answer">';
                }
                else if(questionType === "MCQ")
                {
                    answerArea.innerHTML =
                        `
                    <input type="radio" name="answer" value="A"> A <br>
                    <input type="radio" name="answer" value="B"> B <br>
                    <input type="radio" name="answer" value="C"> C <br>
                    <input type="radio" name="answer" value="D"> D
                    `;
                }
                else
                {
                    answerArea.innerHTML = '<input type="text" id="answer">';
                }
            }

        })
        .catch(error => console.log("Error getting question: " + error));
}
function submitAnswer(sessionID)
{
    let answer = "";

    if(questionType === "MCQ")
    {
        let answers = document.getElementsByName("answer");
        for(let i = 0; i < answers.length; i++)
        {
            if(answers[i].checked)
            {
                answer = answers[i].value;
            }
        }
    }
    else
    {
        answer = document.getElementById("answer").value;
    }

    if(answer === "")
    {
        console.log("Please enter an answer");
        return;
    }

    fetch(`https://codecyprus.org/th/api/answer?session=${sessionID}&answer=${answer}`)
        .then(response => response.json())
        .then(data =>
        {

            console.log(data);

            if(data.status === "OK")
            {
                console.log("Answer submitted");
                console.log("Message: " + data.message);
                if(data.completed)
                {
                    console.log("Treasure Hunt completed");
                }
                else
                {
                    getQuestion(sessionID);
                }
            }
            else
            {
                console.log("Wrong answer");
            }
        })
        .catch(error => console.log("Error submitting answer: " + error));
}
function updateLocation(sessionID)
{
    navigator.geolocation.getCurrentPosition(
        function(position)
        {
            let latitude = position.coords.latitude;

            let longitude = position.coords.longitude;

            fetch(`https://codecyprus.org/th/api/location?session=${sessionID}&latitude=${latitude}&longitude=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if(data.status === "OK")
                    {
                        console.log("Location updated");
                        console.log("Message: " + data.message);
                    }
                    else
                    {
                        console.log("Location was not updated");
                    }

                })
                .catch(error => console.log("Error updating location: " + error));
        },

        function(error)
        {
            console.log("Could not get location");
        }

    );
}
function getScore(sessionID)
{
    fetch(`https://codecyprus.org/th/api/score?session=${sessionID}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.status === "OK")
            {
                console.log("Player: " + data.player);
                console.log("Score: " + data.score);
            }

        })
        .catch(error => console.log("Error getting score: " + error));
}
function getLeaderboard(sessionID)
{
    fetch(`https://codecyprus.org/th/api/leaderboard?session=${sessionID}&sorted&limit=10`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.status === "OK")
            {
                for(let i = 0; i < data.leaderboard.length; i++)
                {
                    console.log(data.leaderboard[i]);
                    console.log(data.leaderboard[i].player + " : " + data.leaderboard[i].score);
                }
            }

        })
        .catch(error => console.log("Error getting leaderboard: " + error));
}
