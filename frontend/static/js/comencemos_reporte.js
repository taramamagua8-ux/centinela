function abrirTerminos() {

    window.location.href = "terminos.html";

}

function volverPagina() {

    history.back();

}

function continuarReporte() {

    let casilla = document.getElementById("aceptar");

    if (casilla.checked == false) {

        alert(
            "Debes aceptar el aviso antes de continuar."
        );

        return;
    }

    window.location.href = "ReporteTesAno.html";

}
