const formulario = document.getElementById("formularioBusqueda");
const busqueda = document.getElementById("busqueda");
const sugerencias = document.getElementById("sugerenciasBusqueda");

const instituciones = [
    "Línea Sin Violencia - Estado de México",
    "UNIDAS - Secretaría de las Mujeres del Estado de México",
    "Centro Naranja - Chimalhuacán",
    "Dirección de las Mujeres de Chimalhuacán",
    "CEAVEM - Comisión Ejecutiva de Atención a Víctimas del Estado de México",
    "CEAVEM Regional Oriente - Nezahualcóyotl",
    "Centro de Justicia para las Mujeres de Ecatepec",
    "Centro de Justicia para las Mujeres de Toluca",
    "Centro de Justicia para las Mujeres de Cuautitlán Izcalli",
    "Centro de Justicia para las Mujeres de Amecameca",
    "Línea de la Vida",
    "Procuraduría de Protección de Niñas, Niños y Adolescentes del Estado de México",
    "DIF Estado de México",
    "Secretaría de las Mujeres del Estado de México",
    "Comisión de Derechos Humanos del Estado de México",
    "Fiscalía General de Justicia del Estado de México",
    "Sistema Nacional para el Desarrollo Integral de la Familia",
    "Consejo Estatal de la Mujer y Bienestar Social",
    "Red de Refugios para Mujeres en Situación de Violencia"
];

function normalizar(texto) {
    return texto.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

busqueda.addEventListener("input", function() {

    const texto = normalizar(busqueda.value.trim());

    sugerencias.innerHTML = "";

    if (texto === "") {
        sugerencias.hidden = true;
        return;
    }

    const coincidencias = instituciones.filter(function(institucion) {
        return normalizar(institucion).includes(texto);
    });

    coincidencias.slice(0, 8).forEach(function(institucion) {

        const elemento = document.createElement("li");
        const boton = document.createElement("button");

        boton.type = "button";
        boton.textContent = institucion;

        boton.addEventListener("click", function() {
            busqueda.value = institucion;
            formulario.submit();
        });

        elemento.appendChild(boton);
        sugerencias.appendChild(elemento);
    });

    sugerencias.hidden = coincidencias.length === 0;
});

document.querySelectorAll(".tarjeta-categoria").forEach(function(categoria) {

    categoria.addEventListener("click", function() {
        busqueda.value = categoria.dataset.busqueda;
        formulario.submit();
    });

});

document.addEventListener("click", function(evento) {

    if (!formulario.contains(evento.target)) {
        sugerencias.hidden = true;
    }

});