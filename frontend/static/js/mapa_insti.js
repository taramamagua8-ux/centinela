// Puntos APROXIMADOS por municipio [latitud, longitud]. No son domicilios exactos.
const municipios = {
    "Amecameca": [19.12, -98.77],
    "Chimalhuacán": [19.42, -98.95],
    "Cuautitlán Izcalli": [19.65, -99.21],
    "Ecatepec": [19.60, -99.05],
    "Huehuetoca": [19.83, -99.20],
    "Naucalpan": [19.48, -99.24],
    "Nezahualcóyotl": [19.40, -99.01],
    "Texcoco": [19.51, -98.88],
    "Tlalnepantla": [19.54, -99.19],
    "Toluca": [19.29, -99.66]
};

const codhemDir = "Av. Nicolás San Juan núm. 113, col. Ex Rancho Cuauhtémoc, C.P. 50010";

// [id (el mismo de detalle_institucion.js), nombre, municipio, dirección ("" si no se tiene)]
const sedes = [
    ["direccion-mujeres", "Dirección de las Mujeres de Chimalhuacán", "Chimalhuacán", ""],
    ["ceavem-oriente", "CEAVEM - Subdirección Regional Oriente y Coordinación Regional Oriente I", "Nezahualcóyotl", ""],
    ["cjm-ecatepec", "Centro de Justicia para las Mujeres de Ecatepec", "Ecatepec", ""],
    ["cjm-toluca", "Centro de Justicia para las Mujeres de Toluca", "Toluca", ""],
    ["cjm-cuautitlan", "Centro de Justicia para las Mujeres de Cuautitlán Izcalli", "Cuautitlán Izcalli", ""],
    ["cjm-amecameca", "Centro de Justicia para las Mujeres de Amecameca", "Amecameca", ""],
    ["codhem", "Comisión de Derechos Humanos del Estado de México", "Toluca", codhemDir],
    ["cacem", "Centro de Atención para la Convivencia Escolar Mexiquense (CACEM)", "Toluca", "Pedro Ascencio núm. 207, col. La Merced"],
    ["sipinna-edomex", "Secretaría Ejecutiva del SIPINNA Estado de México", "Toluca", "Av. Miguel Hidalgo Pte. núm. 1031, barrio de San Bernardino, C.P. 50080"],
    ["imedis", "Instituto Mexiquense para la Discapacidad (IMEDIS)", "Toluca", "José Vicente Villada núm. 423, col. Francisco Murguía, C.P. 50130"],
    ["difem-adultos-mayores", "Coordinación de Atención a Adultos Mayores del DIFEM", "Toluca", "Prolongación Benito Juárez núm. 415, col. Santa Bárbara, C.P. 50050 (confirmar sede)"],
    ["cclem", "Centro de Conciliación Laboral del Estado de México (CCLEM)", "Toluca", "Sor Juana Inés de la Cruz núm. 306, col. Santa Clara, C.P. 50090"],
    ["cclem", "Centro de Conciliación Laboral del Estado de México (CCLEM)", "Tlalnepantla", "Av. San Ignacio núm. 2, col. Los Reyes Iztacala, C.P. 54090"],
    ["cclem", "Centro de Conciliación Laboral del Estado de México (CCLEM)", "Ecatepec", "Nicolás Bravo s/n, col. La Mora, C.P. 55030"],
    ["cclem", "Centro de Conciliación Laboral del Estado de México (CCLEM)", "Texcoco", "Av. Juárez Sur núm. 321, col. El Carmen, C.P. 56100"],
    ["profedet-toluca", "PROFEDET, sede Toluca", "Toluca", "Vía Alfredo del Mazo núm. 1028, col. Santa Cruz Atzcapotzaltongo, C.P. 50030"],
    ["profedet-naucalpan", "PROFEDET, sede Naucalpan", "Naucalpan", "San Andrés Atoto núm. 1, col. San Esteban, C.P. 53550"],
    ["uaemex-igualdad", "Secretaría de Igualdad Sustantiva y Cuidados (UAEMéx)", "Toluca", "Edificio Ex Planetario, Cerro de Coatepec, Ciudad Universitaria, C.P. 50110"],
    ["codhem-nna", "CODHEM - Atención a Niñas, Niños y Adolescentes", "Toluca", codhemDir],
    ["codhem-discapacidad", "CODHEM - Discapacidad, Adultos Mayores y Atención Empresarial", "Toluca", codhemDir],
    ["codhem-trata", "CODHEM - Trata de Personas y Desaparición Forzada", "Toluca", codhemDir],
    ["codhem-migrantes", "CODHEM - Migrantes, Periodistas y Defensores", "Toluca", codhemDir],
    ["codhem-migrantes", "CODHEM - Migrantes, Periodistas y Defensores", "Huehuetoca", "Av. Benito Juárez 51, Centro"],
    ["codhem-indigenas", "CODHEM - Pueblos Indígenas y Afrodescendientes", "Toluca", codhemDir],
    ["codhem-igualdad", "CODHEM - Igualdad de Género y No Discriminación", "Toluca", codhemDir]
];

const sinPuntoFijo = [
    ["linea-sin-violencia", "Línea Sin Violencia"],
    ["linea-vida", "Línea de la Vida"],
    ["unidas", "UNIDAS"],
    ["ceavem", "CEAVEM"],
    ["procuraduria-nna", "Procuraduría de Protección de Niñas, Niños y Adolescentes"],
    ["dif-edomex", "DIF Estado de México"],
    ["secretaria-mujeres", "Secretaría de las Mujeres"],
    ["fgjem", "Fiscalía General de Justicia del Estado de México"],
    ["dif-nacional", "DIF Nacional"],
    ["red-refugios", "Red Nacional de Refugios A.C."]
];

const campo = document.getElementById("buscarMapa");
const selector = document.getElementById("municipioMapa");
const lista = document.getElementById("listaMapa");
const conteo = document.getElementById("conteoMapa");
const contenedorMapa = document.getElementById("mapa");

function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function crear(etiqueta, texto, clase) {
    const elemento = document.createElement(etiqueta);
    if (texto) elemento.textContent = texto;
    if (clase) elemento.className = clase;
    return elemento;
}

function crearEnlace(texto, direccion, externo) {
    const enlace = crear("a", texto);
    enlace.href = direccion;
    if (externo) {
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
    }
    return enlace;
}

Object.keys(municipios).forEach(function (nombre) {
    selector.add(new Option(nombre, nombre));
});

sinPuntoFijo.forEach(function ([id, nombre]) {
    const elemento = crear("li");
    elemento.appendChild(crearEnlace(nombre, "detalle_institucion.html?id=" + id));
    document.getElementById("sinPunto").appendChild(elemento);
});

// Si Leaflet no carga (por ejemplo, sin internet), la lista sigue funcionando.
let mapa = null;
let capaPines = null;

if (window.L) {
    mapa = L.map(contenedorMapa, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
    capaPines = L.layerGroup().addTo(mapa);
} else {
    contenedorMapa.classList.add("sin-mapa");
    contenedorMapa.textContent = "No se pudo cargar el mapa. Revisa tu conexión; la lista de instituciones sigue disponible.";
}

function filtrarPorTexto() {
    const palabras = normalizar(campo.value).split(/\s+/).filter(Boolean);
    return sedes.filter(function (sede) {
        const contenido = normalizar(sede.join(" "));
        return palabras.every(palabra => contenido.includes(palabra));
    });
}

function dibujarLista(visibles) {
    lista.replaceChildren();

    visibles.forEach(function ([id, nombre, municipio, direccion]) {
        const ficha = crear("li", "", "ficha-mapa");
        ficha.appendChild(crear("h3", nombre));
        ficha.appendChild(crear("p", (direccion ? direccion + ", " : "") + municipio + ", Estado de México"));

        const consulta = [nombre, direccion.replace(" (confirmar sede)", ""), municipio, "Estado de México"]
            .filter(Boolean).join(", ");
        const acciones = crear("div", "", "acciones-ficha");
        acciones.appendChild(crearEnlace("Buscar en Google Maps ↗",
            "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consulta), true));
        acciones.appendChild(crearEnlace("Ver detalles", "detalle_institucion.html?id=" + id));

        ficha.appendChild(acciones);
        lista.appendChild(ficha);
    });

    const total = new Set(visibles.map(sede => sede[0])).size;
    conteo.textContent = visibles.length === 0
        ? "No se encontraron instituciones con esos filtros."
        : total + (total === 1 ? " institución · " : " instituciones · ")
          + visibles.length + (visibles.length === 1 ? " sede" : " sedes");
    lista.scrollTop = 0;
}

function dibujarPines(porTexto, visibles) {
    if (!mapa) return;
    capaPines.clearLayers();

    Object.entries(municipios).forEach(function ([nombre, punto]) {
        const cantidad = porTexto.filter(sede => sede[2] === nombre).length;
        if (cantidad === 0) return;

        const descripcion = nombre + ": " + cantidad + (cantidad === 1 ? " sede" : " sedes");
        L.marker(punto, {
            title: descripcion,
            alt: descripcion,
            icon: L.divIcon({ className: "pin-mapa", html: "<span>" + cantidad + "</span>", iconSize: [38, 38] })
        })
            .bindTooltip(descripcion)
            .on("click", function () {
                selector.value = nombre;
                actualizar();
            })
            .addTo(capaPines);
    });

    const puntos = [...new Set(visibles.map(sede => sede[2]))].map(nombre => municipios[nombre]);
    if (puntos.length > 0) {
        mapa.fitBounds(puntos, { padding: [40, 40], maxZoom: 12 });
    } else {
        mapa.setView([19.45, -99.2], 9);
    }
}

function actualizar() {
    const porTexto = filtrarPorTexto();
    const visibles = porTexto.filter(sede => !selector.value || sede[2] === selector.value);
    dibujarLista(visibles);
    dibujarPines(porTexto, visibles);
}

campo.addEventListener("input", actualizar);
selector.addEventListener("change", actualizar);
document.getElementById("filtrosMapa").addEventListener("submit", evento => evento.preventDefault());
document.getElementById("filtrosMapa").addEventListener("reset", () => setTimeout(actualizar, 0));

actualizar();
