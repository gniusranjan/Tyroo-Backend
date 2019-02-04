const express = require('express');
const app = express();
const Cors = require('Cors')
const { connectToServer } = require('./Utility/mongoClient');
const bodyParser = require('body-parser');
const AuthService = require('./services/AuthService');
const ExecutorService = require('./services/ExecutorService');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Cors());


//================================================ Services =============================================================

app.post('/auth', AuthService.login);
app.post('/createRule', ExecutorService.createRules);
app.post('/sendRules', ExecutorService.sendRules);
app.get('/sendCampaign', AuthService.sendCampaign);


const server = app.listen(2000, () => {
    connectToServer((db) => {
        console.log('App is listening on 2000');
    });
})

const io = require('socket.io').listen(server);

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('message', (m) => {
        console.log('[server](message): %s', JSON.stringify(m));
        // this.io.emit('message', m);
    });
    var hour = 0;
    var quarter = 0;
    setInterval(function () {
        console.log('second passed');

        quarter++;
        if (quarter == 4) {
            ExecutorService.notify(socket, 1);
            hour++;
            quarter = 0;
        }
        else if (hour == 24) {
            ExecutorService.notify(socket, 24);
            hour = 0;
        } else {
            ExecutorService.notify(socket, 0.25);
        }


    }, 10000);
});
// var express = require('express');
// var app     = express();
// var server  = require('http').createServer(app);
// var io      = require('socket.io').listen(server);
// ...
// server.listen(1234);