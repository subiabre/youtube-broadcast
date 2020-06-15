const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const bodyParser = require('body-parser');
const helmet = require('helmet');

const youtubeDl = require('youtube-dl');
const stratter = require('stratter');

app.use(helmet.frameguard());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/send', (req, res) => {
    res.sendFile(__dirname + '/send.html');
});

io.on('connection', (socket) => {
    let address = socket.handshake.address, 
        referer = socket.handshake.headers.referer
        ;

    console.log(stratter(`Client ${address} connected @ ${referer}.`, {
        foreground: 'green'
    }));

    socket.on('disconnect', () => {
        console.log(stratter(`Client ${address} disconnected @ ${referer}.`, {
            foreground: 'red'
        }));
    });

    socket.on('streamReceive', (url) => {
        console.log(stratter(`Client ${address} sent: '${url}'`, {
            foreground: 'yellow'
        }));

        youtubeDl.getInfo(url, (err, info) => {
            io.emit('streamUpdate', {id: info.id});
        });
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
