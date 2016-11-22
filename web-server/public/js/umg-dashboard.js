var socket = io();
var currentSede = "UMG"

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
    socket.emit("subToSede", {
        sede: currentSede
    });
});

socket.on("newDatafromTCP", function (datos) {

});

function cleanMonitor() {
    socket.emit("clearMonitor");
}
