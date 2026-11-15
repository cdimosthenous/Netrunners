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
