// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");
// const fs = require("fs");
// const path = require("path");
// const webpush = require("web-push");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");

// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(express.static("public"));
// app.use(express.json());
// app.use(cors());




// app.use(express.static(path.join(__dirname, "public"))); // ✅ Ensure static files are served

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// // JWT Secret Key
// const JWT_SECRET = "your_secret_key";

// // Push Notification Keys (Generate using web-push CLI)
// const publicKey = "BMWx62OZ1wNQJoIhDIhjMV83QkQKsp-mWl4M42YdhGNCQoe9oa57M2tIV1us5xIwoiKwTODkq_vHQ7cvleRhpcU";
// const privateKey = "RMxCzmYqNhSRc8qXHwJOzzTamtDD_C8aqkOikV5U8jQ";
// webpush.setVapidDetails(
//   "mailto:your-email@example.com",
//   publicKey,
//   privateKey
// );

// let users = {};
// let chatData = require("./database.json");

// // User Authentication (JWT Token)
// app.post("/login", (req, res) => {
//   const { username } = req.body;
//   const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
//   users[username] = { username, socketId: null };
//   res.json({ token, username });
// });

// // Get Messages
// app.get("/messages", (req, res) => {
//   res.json(chatData);
// });

// // Save Messages to JSON
// const saveMessages = () => {
//   fs.writeFileSync("./database.json", JSON.stringify(chatData, null, 2));
// };

// // Real-time Chat with Socket.io
// // io.on("connection", (socket) => {
// //   console.log("New user connected");

// //   socket.on("join", (username) => {
// //     users[username].socketId = socket.id;
// //     io.emit("userList", Object.keys(users));
// //   });

// //   socket.on("message", (data) => {
// //     chatData.messages.push(data);
// //     saveMessages();
// //     io.emit("message", data);
// //   });

// //   socket.on("typing", (username) => {
// //     socket.broadcast.emit("typing", username);
// //   });

// //   socket.on("disconnect", () => {
// //     console.log("User disconnected");
// //   });
// // });

// io.on("connection", (socket) => {
//     console.log("New user connected");

//     socket.on("join", (username) => {
//         if (!users[username]) {
//             users[username] = { username, socketId: socket.id };
//         } else {
//             users[username].socketId = socket.id;  // Update socketId if user already exists
//         }
//         io.emit("userList", Object.keys(users));
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected");
//     });
// });

// server.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });



const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");
const webpush = require("web-push");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// ✅ Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());

// ✅ Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ JWT Secret Key
const JWT_SECRET = "your_secret_key";

// ✅ Web Push Notification Keys (Replace with your own keys)
const publicKey = "BMWx62OZ1wNQJoIhDIhjMV83QkQKsp-mWl4M42YdhGNCQoe9oa57M2tIV1us5xIwoiKwTODkq_vHQ7cvleRhpcU";
const privateKey = "RMxCzmYqNhSRc8qXHwJOzzTamtDD_C8aqkOikV5U8jQ";

webpush.setVapidDetails("mailto:your-email@example.com", publicKey, privateKey);

// ✅ Load chat data
let chatData = [];
const databasePath = "./database.json";

// Check if database.json exists
if (fs.existsSync(databasePath)) {
    chatData = require(databasePath);
} else {
    fs.writeFileSync(databasePath, JSON.stringify({ messages: [] }, null, 2));
}

// ✅ Users Object
let users = {};

// ✅ User Authentication (JWT)
app.post("/login", (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    users[username] = { username, socketId: null };
    
    res.json({ token, username });
});

// ✅ Get Messages
app.get("/messages", (req, res) => {
    res.json(chatData);
});

// ✅ Save Messages to JSON
const saveMessages = () => {
    fs.writeFileSync(databasePath, JSON.stringify(chatData, null, 2));
};

// ✅ Real-time Chat with Socket.io
io.on("connection", (socket) => {
    console.log("New user connected");

    // Join chat
    socket.on("join", (username) => {
        if (!users[username]) {
            users[username] = { username, socketId: socket.id };
        } else {
            users[username].socketId = socket.id;
        }
        io.emit("userList", Object.keys(users));
    });

    // Send message
    socket.on("message", (data) => {
        chatData.messages.push(data);
        saveMessages();
        io.emit("message", data);
    });

    // Typing indicator
    socket.on("typing", (username) => {
        socket.broadcast.emit("typing", username);
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
