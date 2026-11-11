const instituciones = [
    {
        id: "linea-sin-violencia",
        nombre: "Línea Sin Violencia - Estado de México",
        descripcion: "Servicio estatal de orientación para mujeres en situación de violencia.",
        ubicacion: "Estado de México",
        servicios: ["Psicológico", "Jurídico", "Orientación"],
        palabras: "mujeres violencia apoyo asesoría emergencia"
    },
    {
        id: "unidas",
        nombre: "UNIDAS - Secretaría de las Mujeres del Estado de México",
        descripcion: "Referencia de servicios de atención y orientación para mujeres.",
        ubicacion: "Estado de México",
        servicios: ["Mujeres", "Orientación", "Atención"],
        palabras: "violencia apoyo psicológico jurídico"
    },
    {
        id: "centro-naranja",
        nombre: "Centro Naranja - Chimalhuacán",
        descripcion: "Centro de atención y orientación para mujeres.",
        ubicacion: "Chimalhuacán, Estado de México",
        servicios: ["Psicológico", "Jurídico", "Social"],
        palabras: "mujeres violencia canteros apoyo"
    },
    {
        id: "direccion-mujeres",
        nombre: "Dirección de las Mujeres de Chimalhuacán",
        descripcion: "Área municipal de atención y orientación para mujeres.",
        ubicacion: "Chimalhuacán, Estado de México",
        servicios: ["Mujeres", "Orientación", "Apoyo"],
        palabras: "violencia psicología jurídica social"
    },
    {
        id: "ceavem",
        nombre: "CEAVEM - Comisión Ejecutiva de Atención a Víctimas",
        descripcion: "Institución estatal de atención a víctimas.",
        ubicacion: "Estado de México",
        servicios: ["Víctimas", "Jurídico", "Psicológico"],
        palabras: "delitos violencia asesoría apoyo"
    },
    {
        id: "ceavem-oriente",
        nombre: "CEAVEM Regional Oriente - Nezahualcóyotl",
        descripcion: "Unidad regional de atención a víctimas de delitos.",
        ubicacion: "Nezahualcóyotl, Estado de México",
        servicios: ["Víctimas", "Jurídico", "Psicológico"],
        palabras: "delitos violencia atención orientación"
    },
    {
        id: "cjm-ecatepec",
        nombre: "Centro de Justicia para las Mujeres de Ecatepec",
        descripcion: "Centro especializado en atención y orientación para mujeres.",
        ubicacion: "Ecatepec, Estado de México",
        servicios: ["Jurídico", "Psicológico", "Justicia"],
        palabras: "violencia mujeres protección denuncia"
    },
    {
        id: "cjm-toluca",
        nombre: "Centro de Justicia para las Mujeres de Toluca",
        descripcion: "Centro especializado en atención a mujeres.",
        ubicacion: "Toluca, Estado de México",
        servicios: ["Jurídico", "Psicológico", "Justicia"],
        palabras: "violencia mujeres protección denuncia"
    },
    {
        id: "cjm-cuautitlan",
        nombre: "Centro de Justicia para las Mujeres de Cuautitlán Izcalli",
        descripcion: "Centro de atención y orientación para mujeres.",
        ubicacion: "Cuautitlán Izcalli, Estado de México",
        servicios: ["Jurídico", "Psicológico", "Justicia"],
        palabras: "violencia mujeres protección denuncia"
    },
    {
        id: "cjm-amecameca",
        nombre: "Centro de Justicia para las Mujeres de Amecameca",
        descripcion: "Centro de atención especializada para mujeres.",
        ubicacion: "Amecameca, Estado de México",
        servicios: ["Jurídico", "Psicológico", "Justicia"],
        palabras: "violencia mujeres protección denuncia"
    },
    {
        id: "linea-vida",
        nombre: "Línea de la Vida",
        descripcion: "Servicio de orientación en temas de salud mental y bienestar emocional.",
        ubicacion: "Servicio nacional",
        servicios: ["Salud mental", "Orientación", "Apoyo emocional"],
        palabras: "psicología emocional crisis bienestar"
    },
    {
        id: "procuraduria-nna",
        nombre: "Procuraduría de Protección de Niñas, Niños y Adolescentes",
        descripcion: "Institución relacionada con la protección de los derechos de niñas, niños y adolescentes.",
        ubicacion: "Estado de México",
        servicios: ["Protección", "Infancia", "Adolescencia"],
        palabras: "menores familia derechos violencia protección"
    },
    {
        id: "dif-edomex",
        nombre: "DIF Estado de México",
        descripcion: "Sistema estatal para el desarrollo integral de las familias.",
        ubicacion: "Estado de México",
        servicios: ["Asistencia social", "Familias", "Protección"],
        palabras: "niños adolescentes familia apoyo social"
    },
    {
        id: "secretaria-mujeres",
        nombre: "Secretaría de las Mujeres del Estado de México",
        descripcion: "Dependencia estatal relacionada con la atención y los derechos de las mujeres.",
        ubicacion: "Estado de México",
        servicios: ["Mujeres", "Orientación", "Igualdad"],
        palabras: "violencia género apoyo psicológico jurídico"
    },
    {
        id: "codhem",
        nombre: "Comisión de Derechos Humanos del Estado de México",
        descripcion: "Organismo público relacionado con la protección de los derechos humanos.",
        ubicacion: "Estado de México",
        servicios: ["Derechos humanos", "Orientación", "Quejas"],
        palabras: "discriminación abuso derechos denuncia"
    },
    {
        id: "fgjem",
        nombre: "Fiscalía General de Justicia del Estado de México",
        descripcion: "Institución encargada de la procuración de justicia en el Estado de México.",
        ubicacion: "Estado de México",
        servicios: ["Justicia", "Denuncias", "Delitos"],
        palabras: "violencia denuncia delitos investigación"
    },
    {
        id: "dif-nacional",
        nombre: "Sistema Nacional para el Desarrollo Integral de la Familia",
        descripcion: "Sistema nacional relacionado con la asistencia y protección familiar.",
        ubicacion: "México",
        servicios: ["Asistencia social", "Familias", "Protección"],
        palabras: "niños adolescentes familia apoyo"
    },
    {
        id: "consejo-mujer",
        nombre: "Consejo Estatal de la Mujer y Bienestar Social",
        descripcion: "Referencia institucional histórica. Es necesario verificar la vigencia de esta denominación.",
        ubicacion: "Estado de México",
        servicios: ["Mujeres", "Bienestar social"],
        palabras: "violencia igualdad apoyo atención"
    },
    {
        id: "red-refugios",
        nombre: "Red de Refugios para Mujeres en Situación de Violencia",
        descripcion: "Red de organizaciones y espacios de apoyo para mujeres en situación de violencia.",
        ubicacion: "México",
        servicios: ["Protección", "Refugio", "Orientación"],
        palabras: "mujeres seguridad violencia protección refugios"
    }
];

function normalizar(texto) {
    return texto.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

const parametros = new URLSearchParams(window.location.search);
const busqueda = parametros.get("q") || "";

const textoBusqueda = document.getElementById("textoBusqueda");
const campoBusqueda = document.getElementById("nuevaBusqueda");
const listaResultados = document.getElementById("listaResultados");
const mensaje = document.getElementById("mensajeSinResultados");
const cantidad = document.getElementById("cantidadResultados");

textoBusqueda.textContent = busqueda
    ? 'Resultados para: "' + busqueda + '"'
    : "Todas las instituciones disponibles";

campoBusqueda.value = busqueda;

const palabrasBusqueda = normalizar(busqueda)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const encontrados = instituciones.filter(function(institucion) {

    const contenido = normalizar(
        institucion.nombre + " " +
        institucion.descripcion + " " +
        institucion.ubicacion + " " +
        institucion.servicios.join(" ") + " " +
        institucion.palabras
    );

    return palabrasBusqueda.every(function(palabra) {
        return contenido.includes(palabra);
    });

});

cantidad.textContent = encontrados.length + " instituciones encontradas";

if (encontrados.length === 0) {

    mensaje.hidden = false;

} else {

    mensaje.hidden = true;

    encontrados.forEach(function(institucion) {

        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-resultado";

        const informacion = document.createElement("div");
        informacion.className = "informacion";

        const nombre = document.createElement("h2");
        nombre.textContent = institucion.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = institucion.descripcion;

        const ubicacion = document.createElement("p");
        ubicacion.textContent = "Ubicación: " + institucion.ubicacion;

        const etiquetas = document.createElement("div");

        institucion.servicios.forEach(function(servicio) {

            const etiqueta = document.createElement("span");
            etiqueta.className = "etiqueta";
            etiqueta.textContent = servicio;

            etiquetas.appendChild(etiqueta);

        });

        const boton = document.createElement("a");
        boton.className = "boton-ver";
        boton.href = "detalle_institucion.html?id=" + institucion.id;
        boton.textContent = "Ver más";

        informacion.appendChild(nombre);
        informacion.appendChild(descripcion);
        informacion.appendChild(ubicacion);
        informacion.appendChild(etiquetas);

        tarjeta.appendChild(informacion);
        tarjeta.appendChild(boton);

        listaResultados.appendChild(tarjeta);

    });

}

document.getElementById("formularioResultados").addEventListener("submit", function(evento) {

    evento.preventDefault();

    const nuevaBusqueda = campoBusqueda.value.trim();

    if (nuevaBusqueda !== "") {
        window.location.href = "resultados_busqued.html?q=" + encodeURIComponent(nuevaBusqueda);
    }

});