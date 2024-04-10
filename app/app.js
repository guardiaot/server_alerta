// initialize express server
var express = require("express");
let bodyparser = require('body-parser');
var cors = require('cors')


var app = express();
const { Interface } = require("readline");
const { connect } = require("http2");
var http = require('http');

const { type } = require("os");

const socketio = require('socket.io');


const secretKey = 'a3Npc2VndXJvMjAyNA==';


async function database() {
        if (global.connection && global.connection !== 'disconnected')
                return global.connection;

        const mysql = require('mysql2/promise');
        var connection = await mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "",
                database: "dataseguros"
        });

        global.connection = connection;
        return connection;
}



app.use(cors())
app.use(bodyparser.json())

// create http server from express instance
var server = http.createServer(app);
const io = socketio(server, {
        cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["my-custom-header"],
                credentials: true
        }
});


var usernames = [];
const myDate = new Date(Date.now()).toLocaleString().split(',')[0];


io.use((socket, next) => {
        const key = socket.handshake.auth.key;
        if (key !== secretKey) {
                return next(new Error('Authentication error'));
        }
        next();
});

io.on('connection', socket => {
        console.log('new user connectado');

        // notificação orvamento
        socket.on('snd_updade', async function (data) {
                io.emit('updatechat', data);
        });

        socket.on('snd_record_update', async function (data) {

                //  [produto, text, channel]
                retorno = JSON.stringify({
                        'produto': data.produto,
                        'text': data.text
                });

                io.emit(data.channel, retorno);

        });

        // canal status
        socket.on('snd_status', async function (data) {

                var dados = JSON.parse(data);

                var retorno = {
                        id: dados.id,
                        status: dados.status
                };
                v = JSON.stringify(retorno)
                io.emit('result_status', v);

        });

        // canal chat
        socket.on('snd_chat', async function (data) {
                io.emit('result_chat', data);
        });


});

server.listen(6000, () => {
        console.log('Server listening on :6000');
});
