// Coordenadas proporcionadas por el equipo de Centinela Digital [latitud, longitud].
const coords = {
    "cjm-toluca": [19.30035192857146, -99.6694425474893],
    "cacem": [19.291764383587783, -99.65990147649161],
    "sipinna-edomex": [19.334928689200236, -99.6541882241197],
    "imedis": [19.283314351183435, -99.65836274950404],
    "difem-adultos-mayores": [19.295686173073648, -99.65716480547424],
    "profedet-toluca": [19.318124686131984, -99.6479049459831],
    "uaemex-igualdad": [19.28620248140128, -99.67814034906841],
    "codhem": [19.319911468512153, -99.63481922891505],
    "cclem-toluca": [19.2928090716297, -99.65156982070317],
    "cclem-tlalnepantla": [19.521909190483242, -99.18821524953111],
    "cclem-ecatepec": [19.597960513361617, -99.05139800535402],
    "cclem-texcoco": [19.51015409711009, -98.88264394953138],
    "cjm-ecatepec": [19.59518722662301, -99.05147237651929],
    "cjm-cuautitlan": [19.654476941806692, -99.2086068918571],
    "cjm-amecameca": [19.14229315873239, -98.77321013235894],
    "profedet-naucalpan": [19.419902493597313, -99.1485003313233],
    "ceavem-oriente": [19.389561211283404, -99.02415762385787],
    "direccion-mujeres": [19.421566182252764, -98.94297142011912],
    "unidas": [19.41754786656534, -98.98357222652496],
    "ceavem": [19.28369122483435, -99.57369167746495],
    "procuraduria-nna": [19.38915836489335, -99.00941917869311],
    "dif-edomex": [19.452292186444552, -98.95033240295429],
    "fgjem": [19.289769792235816, -99.63839223162776],
    "dif-nacional": [19.369721484175237, -99.15853576515256]
};

const codhemDir = "Av. Nicolás San Juan núm. 113, col. Ex Rancho Cuauhtémoc, C.P. 50010";

// [id (el mismo de detalle_institucion.js), nombre, zona, dirección ("" si no se tiene), coordenada o null]
const sedes = [
    ["cjm-toluca", "Centro de Justicia para las Mujeres de Toluca", "Toluca", "Paseo Matlatzincas núm. 1100, col. La Teresona, C.P. 50040", coords["cjm-toluca"]],
    ["cacem", "CONVIVE. Consejo para la Convivencia Escolar", "Toluca", "Pedro Ascencio núm. 207, col. La Merced", coords["cacem"]],
    ["sipinna-edomex", "Secretaría Ejecutiva del SIPINNA Estado de México", "Toluca", "Av. Miguel Hidalgo Pte. núm. 1031, barrio de San Bernardino, C.P. 50080", coords["sipinna-edomex"]],
    ["imedis", "Instituto Mexiquense para la Discapacidad (IMEDIS)", "Toluca", "José Vicente Villada núm. 423, col. Francisco Murguía, C.P. 50130", coords["imedis"]],
    ["difem-adultos-mayores", "Coordinación de Atención a Adultos Mayores del DIFEM", "Toluca", "Prolongación Benito Juárez núm. 415, col. Santa Bárbara, C.P. 50050", coords["difem-adultos-mayores"]],
    ["profedet-toluca", "PROFEDET, sede Toluca", "Toluca", "Vía Alfredo del Mazo núm. 1028, col. Santa Cruz Atzcapotzaltongo, C.P. 50030", coords["profedet-toluca"]],
    ["uaemex-igualdad", "Secretaría de Igualdad Sustantiva y Cuidados (UAEMéx)", "Toluca", "Edificio Ex Planetario, Cerro de Coatepec, Ciudad Universitaria, C.P. 50110", coords["uaemex-igualdad"]],
    ["codhem", "Comisión de Derechos Humanos del Estado de México (CODHEM)", "Toluca", codhemDir, coords["codhem"]],
    ["codhem-nna", "CODHEM - Visitaduría Adjunta de Atención Integral a Niñas, Niños y Adolescentes", "Toluca", codhemDir, coords["codhem"]],
    ["codhem-discapacidad", "CODHEM - Visitaduría Adjunta de Atención a Personas con Discapacidad, Adultos Mayores y Atención Empresarial", "Toluca", codhemDir, coords["codhem"]],
    ["codhem-trata", "CODHEM - Visitaduría Adjunta de Atención a la Trata de Personas y Desaparición Forzada", "Toluca", codhemDir, coords["codhem"]],
    ["codhem-migrantes", "CODHEM - Visitaduría Adjunta de Atención a Personas Migrantes, Periodistas y Defensores", "Toluca", codhemDir, coords["codhem"]],
    ["codhem-indigenas", "CODHEM - Visitaduría Adjunta de Atención a Pueblos Indígenas y Afrodescendientes", "Toluca", codhemDir, coords["codhem"]],
    ["codhem-igualdad", "CODHEM - Visitaduría Adjunta de Igualdad de Género y No Discriminación", "Toluca", codhemDir, coords["codhem"]],
    ["codhem-migrantes", "CODHEM - Visitaduría Adjunta de Atención a Personas Migrantes, Periodistas y Defensores", "Huehuetoca", "Av. Benito Juárez 51, Centro", null],
    ["fgjem", "Fiscalía General de Justicia", "Toluca", "", coords["fgjem"]],
    ["cclem", "Centro de Conciliación Laboral del Estado de México (CCLEM) - sede Toluca", "Toluca", "Sor Juana Inés de la Cruz núm. 306, col. Santa Clara, C.P. 50090", coords["cclem-toluca"]],
    ["cclem", "Centro de Conciliación Laboral del Estado de México (CCLEM) - sede Tlalnepantla", "Tlalnepantla", "Av. San Ignacio núm. 2, col. Los Reyes Iztacala, C.P. 54090", coords["cclem-tlalnepantla"]],
    ["cclem", "Centro de Conciliación Laboral del Estado de México (CCLEM) - sede Ecatepec", "Ecatepec", "Nicolás Bravo s/n, col. La Mora, C.P. 55030", coords["cclem-ecatepec"]],
    ["cclem", "Centro de Conciliación Laboral del Estado de México (CCLEM) - Subdirección Regional Texcoco", "Texcoco", "Av. Juárez Sur núm. 321, col. El Carmen, C.P. 56100", coords["cclem-texcoco"]],
    ["cjm-ecatepec", "Centro de Justicia para las Mujeres de Ecatepec", "Ecatepec", "Calle Noche Buena, col. Chula Vista, C.P. 55030", coords["cjm-ecatepec"]],
    ["cjm-cuautitlan", "Centro de Justicia para las Mujeres de Cuautitlán Izcalli", "Cuautitlán Izcalli", "Andador Rotterdam núm. 9, col. Centro Urbano, C.P. 54700", coords["cjm-cuautitlan"]],
    ["cjm-amecameca", "Centro de Justicia para las Mujeres de Amecameca", "Amecameca", "Carretera federal México–Cuautla, km 58.5, San Miguel Panoaya, C.P. 56000", coords["cjm-amecameca"]],
    ["ceavem-oriente", "CEAVEM - Subdirección Regional Oriente y Coordinación Regional Oriente I - CROSA", "Nezahualcóyotl", "Av. Sor Juana Inés de la Cruz núm. 100, col. Metropolitana, C.P. 57740", coords["ceavem-oriente"]],
    ["procuraduria-nna", "Procuraduría Municipal de Protección de Niñas, Niños y Adolescentes (Nezahualcóyotl)", "Nezahualcóyotl", "Calle Aviación Civil s/n, col. Vicente Villada, C.P. 57710", coords["procuraduria-nna"]],
    ["direccion-mujeres", "Dirección de las Mujeres de Chimalhuacán", "Chimalhuacán", "", coords["direccion-mujeres"]],
    ["unidas", "UNIDAS Chimalhuacán (UEPAVIG)", "Chimalhuacán", "", coords["unidas"]],
    ["dif-edomex", "Sistema Municipal DIF Chimalhuacán", "Chimalhuacán", "", coords["dif-edomex"]],
    ["ceavem", "Comisión Ejecutiva de Atención a Víctimas", "Metepec", "Paseo de los Cisnes núm. 49, col. La Asunción, C.P. 52172", coords["ceavem"]],
    ["profedet-naucalpan", "Centro Federal de Conciliación y Registro Laboral (CFCRL) - PROFEDET", "Ciudad de México", "Dr. José María Vértiz núm. 211, col. Doctores, C.P. 06720", coords["profedet-naucalpan"]],
    ["dif-nacional", "Sistema Nacional DIF", "Ciudad de México", "", coords["dif-nacional"]]
];

const sinPuntoFijo = [
    ["linea-sin-violencia", "Línea Sin Violencia - Estado de México"],
    ["linea-vida", "Línea de la Vida"],
    ["secretaria-mujeres", "Secretaría de las Mujeres del Estado de México"],
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

const zonas = [...new Set(sedes.map(sede => sede[2]))].sort((a, b) => a.localeCompare(b, "es"));
const pines = new Map();

zonas.forEach(function (nombre) {
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
        const contenido = normalizar(sede.slice(0, 4).join(" "));
        return palabras.every(palabra => contenido.includes(palabra));
    });
}

function dibujarLista(visibles) {
    lista.replaceChildren();

    visibles.forEach(function ([id, nombre, zona, direccion, punto]) {
        const ficha = crear("li", "", "ficha-mapa");
        ficha.appendChild(crear("h3", nombre));
        const estado = zona === "Ciudad de México" ? zona : zona + ", Estado de México";
        ficha.appendChild(crear("p", (direccion ? direccion + ", " : "") + estado
            + (punto ? "" : " · Sin coordenada, no tiene pin")));

        const consulta = punto
            ? punto.join(",")
            : [nombre, direccion, estado].filter(Boolean).join(", ");
        const acciones = crear("div", "", "acciones-ficha");
        if (punto && mapa) {
            const boton = crear("button", "Ver en el mapa");
            boton.type = "button";
            boton.addEventListener("click", () => enfocar(punto));
            acciones.appendChild(boton);
        }
        acciones.appendChild(crearEnlace("Abrir en Google Maps ↗",
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

// Un pin por coordenada: las áreas que comparten edificio se agrupan.
function dibujarPines(visibles) {
    if (!mapa) return;
    capaPines.clearLayers();
    pines.clear();

    const grupos = new Map();
    visibles.filter(sede => sede[4]).forEach(function (sede) {
        const clave = sede[4].join(",");
        if (!grupos.has(clave)) grupos.set(clave, []);
        grupos.get(clave).push(sede);
    });

    grupos.forEach(function (grupo, clave) {
        const titulo = grupo.length === 1 ? grupo[0][1] : grupo.length + " áreas en este punto";
        const contenido = crear("ul", "", "popup-mapa");
        grupo.forEach(function ([id, nombre]) {
            const elemento = crear("li");
            elemento.appendChild(crearEnlace(nombre, "detalle_institucion.html?id=" + id));
            contenido.appendChild(elemento);
        });
        const pin = L.marker(grupo[0][4], {
            title: titulo,
            alt: titulo,
            icon: L.divIcon({ className: "pin-mapa", html: "<span>" + grupo.length + "</span>", iconSize: [34, 34] })
        })
            .bindPopup(contenido, { maxHeight: 220 })
            .addTo(capaPines);
        pines.set(clave, pin);
    });

    const puntos = [...grupos.values()].map(grupo => grupo[0][4]);
    if (puntos.length > 0) {
        mapa.fitBounds(puntos, { padding: [40, 40], maxZoom: 16 });
    } else {
        mapa.setView([19.4, -99.3], 9);
    }
}

function enfocar(punto) {
    contenedorMapa.scrollIntoView({ block: "nearest" });
    mapa.setView(punto, 17, { animate: false });
    const pin = pines.get(punto.join(","));
    if (pin) pin.openPopup();
}

function actualizar() {
    const porTexto = filtrarPorTexto();
    const visibles = porTexto.filter(sede => !selector.value || sede[2] === selector.value);
    dibujarLista(visibles);
    dibujarPines(visibles);
}

campo.addEventListener("input", actualizar);
selector.addEventListener("change", actualizar);
document.getElementById("filtrosMapa").addEventListener("submit", evento => evento.preventDefault());
document.getElementById("filtrosMapa").addEventListener("reset", () => setTimeout(actualizar, 0));

actualizar();
