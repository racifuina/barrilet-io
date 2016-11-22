//Express server
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var net = require('net');
var mensajesMonitor = [];
app.use(express.static('public'));

//VARIABLES PARA TCP.
var TCP_PORT = process.env.TCP_PORT || 3150;
var HTTP_PORT = process.env.PORT || 8080;
var connections_number = 0;

//LIBRERIAS PARA TCP
var querystring = require('querystring');
var deviceConnections = {};

//home
app.get('/', function (req, res) {
    res.send("home");
});
//dev-monitor
app.get('/monitor', function (req, res) {
    res.send("monitor");
});

//404
app.get('*', function (req, res) {
    res.send("404");
});

//Socket.io Service
io.on("connection", function (socket) {

    socket.emit("connectionsUpdated", {
        "cantidad": connections_number
    });

    io.emit("newDatafromTCP", {
        "data": mensajesMonitor
    });

    socket.on("clearMonitor", function (data) {
        console.log("clearMonitor");
        mensajesMonitor = [];
        io.emit("newDatafromTCP", {
            "data": mensajesMonitor
        });
    });

});

function newMonitorInfo(newString) {

    if (mensajesMonitor.length === 20) {
        mensajesMonitor.shift();
    }

    var fecha = new Date().getTime();

    var contenido = {
        fechaObjeto: fecha,
        contenido: newString
    }

    mensajesMonitor.push(contenido);

    io.emit("newDatafromTCP", {
        "data": mensajesMonitor
    });

}

//TCP server
net.createServer(function (connection) {

    connections_number++

    io.emit("connectionsUpdated", {
        "cantidad": connections_number
    });

    newMonitorInfo("NEW CONNECTION");

    connection.on('data', function (data) {
        //Converting buffer data to String
        var data_str = data.toString();
        //dump all carrier return
        data_str = data_str.replace('\r\n', '');
        newMonitorInfo(data_str);
        //CONVIRTIENDO DATA DE STRING A JSON.
        var telemetry_data = querystring.parse(data_str);

        if (telemetry_data.id == undefined) {
            //If the keys have undefined data, do nothing.
            console.log("undefined data");
            return;
        } else {
            console.log("New Good DATA");
            //Verify if it's a new connection or if it exists
            if (typeof deviceConnections[telemetry_data.id] === "undefined") {
                //if the connection is not on in the object, Add it to the deviceConnections object.
                deviceConnections[telemetry_data.id] = connection;
            } else {
                //If there is a connection with the same ID in the object, check if it is the same as this one.
                //If it is different close and destroy the previous one, and replace it with the new one.
                //Else do nothing.
                console.log("existing key")
                if (deviceConnections[telemetry_data.id] !== connection) {
                    console.log("different connection value")
                    deviceConnections[telemetry_data.id].destroy();
                    deviceConnections[telemetry_data.id] = connection;
                } else {
                    console.log("same connection value");
                }
            }
        }
    });

    connection.on('close', function () {
        connections_number--;
        newMonitorInfo("DEVICE DISCONNECTED");
        io.emit("connectionsUpdated", {
            "cantidad": connections_number
        });
    });

}).listen(TCP_PORT, function () {
    console.log('TCP Server listening');
});

http.listen(HTTP_PORT, function () {
    console.log("Web Server Started");
});

process.on("uncaughtException", function (err) {
    console.log("---------------> Uncaught Exception <---------------", err);
});
