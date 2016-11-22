var socket = io();

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
    socket.emit("getCurrentDashboard");
});

var bar = new ProgressBar.Circle("#temp-level", {
    strokeWidth: 8,
    easing: 'easeInOut',
    duration: 1400,
    color: '#2EC0F9',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: null
});

var hum = new ProgressBar.Circle("#hum-level", {
    strokeWidth: 8,
    easing: 'easeInOut',
    duration: 1400,
    color: '#2EC0F9',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: null
});

bar.animate(0.54); // Number from 0.0 to 1.0
bar.setText("54 ºC"); // Number from 0.0 to 1.0
hum.animate(0.34); // Number from 0.0 to 1.0
hum.setText("34 %"); // Number from 0.0 to 1.0


setTimeout(function () {
    bar.animate(0.24); // Number from 0.0 to 1.0
    bar.setText("24 ºC"); // Number from 0.0 to 1.0
    hum.animate(0.84); // Number from 0.0 to 1.0
    hum.setText("84 %"); // Number from 0.0 to 1.0

}, 2000);
