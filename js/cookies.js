// Sets a cookie that expires after expireDays days.
function setCookie(cookieName, cookieValue, expireDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expireDays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();
    document.cookie = cookieName + "=" + encodeURIComponent(cookieValue) + ";" + expires + ";path=/";
}

// Returns the value of the cookie with the given name, or "" if it does not exist.
function getCookie(cookieName) {
    let name = cookieName + "=";
    let parts = document.cookie.split(";");
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i].trim();
        if (part.indexOf(name) === 0) {
            return decodeURIComponent(part.substring(name.length));
        }
    }
    return "";
}

// Deletes a cookie by setting its expiry date in the past.
function deleteCookie(cookieName) {
    document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
}

// The treasure hunt session ID is stored in a cookie so a player can
// resume their game after closing or crashing the browser.
function saveSessionId(sessionId) {
    setCookie("sessionId", sessionId, 1);
}

function getSessionId() {
    return getCookie("sessionId");
}

function clearSessionId() {
    deleteCookie("sessionId");
}
