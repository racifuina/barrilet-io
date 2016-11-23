var socket = io();

$(document).ready(function () {
    socket.emit("getCurrentDashboard");
});

var tempLevel = new ProgressBar.Circle("#temp-level", {
    strokeWidth: 8,
    easing: 'easeInOut',
    duration: 1400,
    color: '#2EC0F9',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: null
});

var humLevel = new ProgressBar.Circle("#hum-level", {
    strokeWidth: 8,
    easing: 'easeInOut',
    duration: 1400,
    color: '#2EC0F9',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: null
});

socket.on("currentDashboard", function(newData) {
    if (newData.conectado) {
        $("#conectado").html("<i class='fa fa-thumbs-o-up' style='color:green'></i> <small style='color:green'>CONECTADO</small>");
    } else {
        $("#conectado").html("<i class='fa fa-thumbs-o-down' style='color:red'></i> <small style='color:red'>DESCONECTADO</small>");
    }

    tempLevel.animate(newData.temperatura); // Number from 0.0 to 1.0
    tempLevel.setText(newData.temperatura + " ºC"); // Number from 0.0 to 1.0
    humLevel.animate(newData.humedad); // Number from 0.0 to 1.0
    humLevel.setText(newData.humedad + " %");

    $("#eje-x").text(newData.eje_x);
    $("#eje-y").text(newData.eje_y);
    $("#eje-z").text(newData.eje_z);
    $("#altitud").text(newData.altitud + " cm");
});
