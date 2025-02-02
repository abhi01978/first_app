let socket = io();
let username;

function login() {
    username = document.getElementById("username").value;
    localStorage.setItem("username", username);
    socket.emit("join", username);
}

document.getElementById("message").addEventListener("keypress", () => {
    socket.emit("typing", username);
});

socket.on("typing", (user) => {
    document.getElementById("typing").innerText = `${user} is typing...`;
    setTimeout(() => {
        document.getElementById("typing").innerText = "";
    }, 1000);
});

function sendMessage() {
    let msg = document.getElementById("message").value;
    let messageData = { user: username, text: msg };
    socket.emit("message", messageData);
    document.getElementById("message").value = "";
}

socket.on("message", (data) => {
    let messages = document.getElementById("messages");
    messages.innerHTML += `<p><strong>${data.user}:</strong> ${data.text}</p>`;
});
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("Service Worker Registered"))
    .catch((err) => console.error("Service Worker Registration Failed", err));
}
