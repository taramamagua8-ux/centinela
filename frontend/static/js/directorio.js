const formulario = document.getElementById("formularioBusqueda");
const busqueda = document.getElementById("busqueda");
const sugerencias = document.getElementById("sugerenciasBusqueda");

const instituciones = [
    "Línea Sin Violencia - Estado de México",
    "UNIDAS - Secretaría de las Mujeres del Estado de México",
    "Dirección de las Mujeres de Chimalhuacán",
    "CEAVEM - Comisión Ejecutiva de Atención a Víctimas del Estado de México",
    "CEAVEM - Subdirección Regional Oriente y Coordinación Regional Oriente I",
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
    "Red Nacional de Refugios A.C.",
    "Centro de Atención para la Convivencia Escolar Mexiquense (CACEM)",
    "Secretaría Ejecutiva del SIPINNA Estado de México",
    "Instituto Mexiquense para la Discapacidad (IMEDIS)",
    "Coordinación de Atención a Adultos Mayores del DIFEM",
    "Centro de Conciliación Laboral del Estado de México (CCLEM)",
    "PROFEDET - Procuraduría Federal de la Defensa del Trabajo, sede Toluca",
    "PROFEDET - Procuraduría Federal de la Defensa del Trabajo, sede Naucalpan",
    "Secretaría de Igualdad Sustantiva y Cuidados (UAEMéx)",
    "CODHEM - Visitaduría Adjunta de Atención Integral a Niñas, Niños y Adolescentes",
    "CODHEM - Visitaduría Adjunta de Atención a Personas con Discapacidad, Adultos Mayores y Atención Empresarial",
    "CODHEM - Visitaduría Adjunta de Atención a la Trata de Personas y Desaparición Forzada",
    "CODHEM - Visitaduría Adjunta de Atención a Personas Migrantes, Periodistas y Defensores",
    "CODHEM - Visitaduría Adjunta de Atención a Pueblos Indígenas y Afrodescendientes",
    "CODHEM - Visitaduría Adjunta de Igualdad de Género y No Discriminación"
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
            formulario.requestSubmit();
        });

        elemento.appendChild(boton);
        sugerencias.appendChild(elemento);
    });

    sugerencias.hidden = coincidencias.length === 0;
});

document.querySelectorAll(".tarjeta-categoria").forEach(function(categoria) {

    categoria.addEventListener("click", function() {
        busqueda.value = categoria.dataset.busqueda;
        formulario.requestSubmit();
    });

});

document.addEventListener("click", function(evento) {

    if (!formulario.contains(evento.target)) {
        sugerencias.hidden = true;
    }

});
formulario.addEventListener("keydown", function(evento) {
    if (evento.key !== "Escape" || sugerencias.hidden) return;
    sugerencias.hidden = true;
    busqueda.focus();
});
