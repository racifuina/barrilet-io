var net = require('net');
var socket = net.connect(3150, "localhost");
var id = process.env.DEVICE_ID || "0001"

socket.on("data", function (data) {
    var dataString = data.toString();
    console.log("Server: -> " + dataString);
    if (dataString === "{Id?}") {
        console.log("Client: -> " + "i=" + id + "&w=00000000&d=0&");
        socket.write("id=" + id + "&w=00000000&d=0&");
    } else if (dataString === "{PING}") {
        var nuevoPeso = (Math.random() * (32 - 27) + 27).toFixed(2)
        console.log("Client: -> " + "i=" + id + "&w=" + nuevoPeso + "&d=3&");
        socket.write("id=" + id + "&w=" + nuevoPeso + "&d=3&");
    } else if (dataString === "{RESET}") {
        enviarPesoCore = true;
    }
});

socket.on("connect", function (data) {
    var nuevoPeso = (Math.random() * (32 - 27) + 27).toFixed(2)
    console.log("Client: -> " + "id=" + id + "&w=" + nuevoPeso + "&d=3&   sending random");
    socket.write("id=" + id + "&w=" + nuevoPeso + "&d=3&");
});

setInterval(function () {
    var nuevoPeso = (Math.random() * (32 - 27) + 27).toFixed(2)
    console.log("Client: -> " + "id=" + id + "&w=" + nuevoPeso + "&d=3&   sending random");
    socket.write("id=" + id + "&w=" + nuevoPeso + "&d=3&");
}, 5000);
