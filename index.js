const express = require('express')
const app = express();
const http = require("http");
const { Server } = require('socket.io')
const server = http.createServer(app)
const cors = require("cors")

let dict = {}
app.use(cors());
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
    },
})
console.log("done");

io.on("connection", (socket) => {
    socket.broadcast.emit("rec_message", [socket.id,0,0]);
    console.log("User connected: ", socket.id);
    socket.emit("welcome", dict);
    dict[socket.id] = [0,0];
    var facing = 0;
    socket.on("send_message", (data)=>{ //when it receives a message from the front end
        const diffX = data.message[1]-dict[socket.id][1]
        const diffY = data.message[0]-dict[socket.id][0];
        var length = 1000 * Math.sqrt(diffX*diffX+diffY*diffY);
        if (data.message[0]-dict[socket.id][0] < 0){
            facing = Math.PI + Math.atan((data.message[1]-dict[socket.id][1])/(data.message[0]-dict[socket.id][0]));
          } else {
            facing = Math.atan((data.message[1]-dict[socket.id][1]/(data.message[0]-dict[socket.id][0])));
          }
        console.log(socket.id," is moving from ", dict[socket.id], " to ", data.message, " he should face ", facing);
        dict[socket.id] = data.message;
        console.log(dict);
        socket.broadcast.emit('moving_message', [socket.id,facing]);
        const temp = [socket.id, data.message[0], data.message[1]];
        setTimeout(() => {
            console.log("done: ", length);

            socket.broadcast.emit('rec_message', temp);
          }, length/3);
    });
    socket.on("disconnect", (sock) => {
        console.log(socket.id," left");
        delete dict[socket.id];
        socket.broadcast.emit("removePlayer", socket.id);
    });
})

server.listen(3002, () => {
    console.log("Server is running")
})