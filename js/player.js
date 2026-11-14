// Remembers the player's name using cookies and shows a welcome message.

function showPlayer() {
    let name = getCookie("playerName");
    let welcome = document.getElementById("welcome");
    let form = document.getElementById("nameForm");

    if (name !== "") {
        welcome.textContent = "Welcome back, " + name + "!";
        form.style.display = "none";
        document.getElementById("changeName").style.display = "inline-block";
    } else {
        welcome.textContent = "Enter your name to get started.";
        form.style.display = "block";
        document.getElementById("changeName").style.display = "none";
    }
}

function saveName() {
    let name = document.getElementById("playerName").value.trim();
    if (name === "") {
        document.getElementById("welcome").textContent = "Please type a name first.";
        return;
    }
    setCookie("playerName", name, 60); // Save for 60 days
    showPlayer();
}

function changeName() {
    deleteCookie("playerName");
    document.getElementById("playerName").value = "";
    showPlayer();
}

showPlayer();
