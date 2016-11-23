//Express server
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var net = require('net');
var mensajesMonitor = [];
app.use(express.static('public'));

var currentData = {
        conectado: false,
        temperatura: 0,
        humedad: 0,
        eje_x: 0.0,
        eje_y: 0.0,
        eje_z: 0.0,
        altitud: 0
    }
    //VARIABLES PARA TCP.
var TCP_PORT = process.env.TCP_PORT || 3150;
var HTTP_PORT = process.env.PORT || 8080;
var connections_number = 0;

//LIBRERIAS PARA TCP
var querystring = require('querystring');
var deviceConnections = {};

//home
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/dashboard.html');
});
//dev-monitor
app.get('/monitor', function (req, res) {
    res.sendFile(__dirname + '/views/monitor.html');
});

//404
app.get('*', function (req, res) {
    res.send("404");
});

//Socket.io Service
io.on("connection", function (socket) {
    console.log("new socket.io client")
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

    socket.on("getCurrentDashboard", function (data) {
        socket.emit("currentDashboard", currentData);
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


        if (telemetry_data.id == undefined || telemetry_data.t == undefined || telemetry_data.h == undefined || telemetry_data.x == undefined || telemetry_data.y == undefined ||  telemetry_data.z == undefined ||   telemetry_data.a == undefined) {
            //If the keys have undefined data, do nothing.
            console.log("undefined data");
            connection.destroy();
            return;
        } else {
            console.log("New Good DATA");
            //Verify if it's a new connection or if it exists
            if (typeof deviceConnections[telemetry_data.id] === "undefined") {
                //if the connection is not on in the object, Add it to the deviceConnections object.
                deviceConnections[telemetry_data.id] = connection;
                connection.IDENTIFICADOR = telemetry_data.id;
                currentData.conectado = true;
            } else {
                //If there is a connection with the same ID in the object, check if it is the same as this one.
                //If it is different close and destroy the previous one, and replace it with the new one.
                //Else do nothing.
                connection.IDENTIFICADOR = telemetry_data.id;
                if (deviceConnections[telemetry_data.id] !== connection) {
                    try {
                        deviceConnections[telemetry_data.id].destroy();
                    } catch (e) {
                        console.log("error al destruir");
                    }
                    connection.IDENTIFICADOR = telemetry_data.id;
                    deviceConnections[telemetry_data.id] = connection;
                    currentData.conectado = true;
                } else {
                    console.log("same connection value");
                }
            }
            io.emit("currentDashboard", currentData);
        }

        if (telemetry_data.id == "0001") {
            currentData.temperatura = telemetry_data.t;
            currentData.humedad = telemetry_data.h;
            currentData.eje_x = telemetry_data.x;
            currentData.eje_y = telemetry_data.y;
            currentData.eje_z = telemetry_data.z;
            currentData.altitud = telemetry_data.a;
            io.emit("currentDashboard", currentData);
        }

    });

    connection.on('close', function () {
        connections_number--;
        newMonitorInfo("DEVICE " + connection.IDENTIFICADOR + " DISCONNECTED");

        if (connection.IDENTIFICADOR === "0001") {
            currentData.conectado = false;
            io.emit("currentDashboard", currentData);
        }

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
