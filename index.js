const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const bodyParser = require('body-parser');
const helmet = require('helmet');

const youtubeDl = require('youtube-dl');

app.use(helmet.frameguard());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/send', (req, res) => {
    res.sendFile(__dirname + '/send.html');
});

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('streamReceive', (url) => {
        console.log('Received url: ' + url);

        youtubeDl.getInfo(url, (err, info) => {
            io.emit('streamUpdate', {id: info.id});
        });
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
