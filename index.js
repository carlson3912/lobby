const express = require('express')
const app = express();
const http = require("http");
const { Server } = require('socket.io')
const server = http.createServer(app)
const cors = require("cors")
var blocked = new Set();
var dict = {};
app.use(cors());
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})
console.log("done");

io.on("connection", (socket) => {
    socket.broadcast.emit("init_message", [socket.id]);
    console.log("User connected: ", socket.id);
    socket.emit("welcome", dict);
    dict[socket.id] = [0,0];
    var facing = 0;
    socket.on("send_message", (data)=>{ //when it receives a message from the front end
        if(!blocked.has(socket.id)){
            blocked.add(socket.id);
        // if (data.message[0]-dict[socket.id][0] < 0){
        //     facing = Math.PI + Math.atan((data.message[1]-dict[socket.id][1])/(data.message[0]-dict[socket.id][0]));
        //   } else {
        //     facing = Math.atan((data.message[1]-dict[socket.id][1]/(data.message[0]-dict[socket.id][0])));
        //   }
        // console.log(socket.id," is moving from ", dict[socket.id], " to ", data.message, " he should face ", facing);
        const diffX = data[0] -dict[socket.id][0];
        const diffY = data[1] -dict[socket.id][1];
        var length = Math.sqrt(diffX*diffX+diffY*diffY);
        dict[socket.id] = data;
        // console.log(dict);
        console.log('moving_message', [socket.id, data[0], data[1]]);
        socket.broadcast.emit('moving_message', [socket.id, data[0], data[1]]);
        // const temp = [socket.id, data.message[0], data.message[1]];
        setTimeout(() => {
            blocked.delete(socket.id);
            console.log("done: ", length);

            // socket.broadcast.emit('rec_message', temp);
          }, length/3 * 1000);
        }
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