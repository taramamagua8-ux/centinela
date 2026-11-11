const instituciones = {

    "linea-sin-violencia": {
        nombre: "Línea Sin Violencia - Estado de México",
        resumen: "Servicio estatal de orientación para mujeres.",
        ubicacion: "Estado de México",
        descripcion: "Servicio de orientación para mujeres en situación de violencia. Para conocer sus condiciones de atención y servicios vigentes, consulta los medios oficiales del Gobierno del Estado de México.",
        servicios: ["Orientación psicológica", "Asesoría jurídica", "Orientación y canalización"],
        telefono: "800 108 40 53. Verificar vigencia.",
        horario: "Consultar disponibilidad oficial.",
        sitio: "Gobierno del Estado de México."
    },

    "unidas": {
        nombre: "UNIDAS - Secretaría de las Mujeres del Estado de México",
        resumen: "Servicios de atención y orientación para mujeres.",
        ubicacion: "Estado de México",
        descripcion: "Referencia de servicios relacionados con la atención y orientación para mujeres. Se recomienda consultar la información oficial para identificar las sedes y servicios disponibles.",
        servicios: ["Orientación", "Atención a mujeres", "Canalización"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Secretaría de las Mujeres del Estado de México."
    },

    "centro-naranja": {
        nombre: "Centro Naranja - Chimalhuacán",
        resumen: "Centro de atención y orientación para mujeres.",
        ubicacion: "Chimalhuacán, Estado de México",
        descripcion: "Espacio de atención y orientación para mujeres. Los servicios, requisitos y disponibilidad deben confirmarse directamente con la sede correspondiente.",
        servicios: ["Atención psicológica", "Orientación jurídica", "Trabajo social", "Canalización"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad de la sede.",
        sitio: "Secretaría de las Mujeres del Estado de México."
    },

    "direccion-mujeres": {
        nombre: "Dirección de las Mujeres de Chimalhuacán",
        resumen: "Área municipal de atención y orientación para mujeres.",
        ubicacion: "Chimalhuacán, Estado de México",
        descripcion: "Área municipal relacionada con la atención, orientación y acompañamiento de mujeres. Se recomienda verificar los servicios vigentes con el Ayuntamiento.",
        servicios: ["Orientación", "Atención a mujeres", "Canalización"],
        telefono: "Consultar con el Ayuntamiento.",
        horario: "Consultar disponibilidad municipal.",
        sitio: "Ayuntamiento de Chimalhuacán."
    },

    "ceavem": {
        nombre: "CEAVEM - Comisión Ejecutiva de Atención a Víctimas",
        resumen: "Institución estatal de atención a víctimas.",
        ubicacion: "Estado de México",
        descripcion: "Organismo estatal encargado de brindar atención a víctimas de delitos y de violaciones a derechos humanos, conforme a sus atribuciones.",
        servicios: ["Atención a víctimas", "Orientación jurídica", "Atención psicológica", "Canalización"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Comisión Ejecutiva de Atención a Víctimas del Estado de México."
    },

    "ceavem-oriente": {
        nombre: "CEAVEM Regional Oriente - Nezahualcóyotl",
        resumen: "Unidad regional de atención a víctimas.",
        ubicacion: "Nezahualcóyotl, Estado de México",
        descripcion: "Unidad regional relacionada con los servicios de atención a víctimas de delitos. Es recomendable confirmar la dirección y disponibilidad antes de acudir.",
        servicios: ["Orientación jurídica", "Atención psicológica", "Atención a víctimas", "Canalización"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Comisión Ejecutiva de Atención a Víctimas del Estado de México."
    },

    "cjm-ecatepec": {
        nombre: "Centro de Justicia para las Mujeres de Ecatepec",
        resumen: "Centro especializado en atención para mujeres.",
        ubicacion: "Ecatepec, Estado de México",
        descripcion: "Centro relacionado con la atención y orientación especializada para mujeres. Consulta sus canales oficiales para conocer los servicios disponibles.",
        servicios: ["Orientación jurídica", "Atención psicológica", "Orientación institucional"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Fiscalía General de Justicia del Estado de México."
    },

    "cjm-toluca": {
        nombre: "Centro de Justicia para las Mujeres de Toluca",
        resumen: "Centro especializado en atención para mujeres.",
        ubicacion: "Toluca, Estado de México",
        descripcion: "Centro de atención especializada para mujeres. Se recomienda verificar los servicios y horarios vigentes antes de acudir.",
        servicios: ["Orientación jurídica", "Atención psicológica", "Orientación institucional"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Fiscalía General de Justicia del Estado de México."
    },

    "cjm-cuautitlan": {
        nombre: "Centro de Justicia para las Mujeres de Cuautitlán Izcalli",
        resumen: "Centro de atención y orientación para mujeres.",
        ubicacion: "Cuautitlán Izcalli, Estado de México",
        descripcion: "Centro relacionado con la atención especializada para mujeres. Los datos de atención deben confirmarse mediante sus canales oficiales.",
        servicios: ["Orientación jurídica", "Atención psicológica", "Orientación institucional"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Fiscalía General de Justicia del Estado de México."
    },

    "cjm-amecameca": {
        nombre: "Centro de Justicia para las Mujeres de Amecameca",
        resumen: "Centro de atención especializada para mujeres.",
        ubicacion: "Amecameca, Estado de México",
        descripcion: "Referencia de un centro de atención para mujeres. Se recomienda verificar su ubicación y disponibilidad actual.",
        servicios: ["Orientación jurídica", "Atención psicológica", "Orientación institucional"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Fiscalía General de Justicia del Estado de México."
    },

    "linea-vida": {
        nombre: "Línea de la Vida",
        resumen: "Servicio de orientación en salud mental y bienestar emocional.",
        ubicacion: "Servicio nacional",
        descripcion: "Servicio de orientación relacionado con la salud mental y el bienestar emocional. No sustituye la atención especializada de las instituciones de justicia o atención a víctimas.",
        servicios: ["Orientación emocional", "Salud mental", "Información y apoyo"],
        telefono: "Consultar el número vigente en el portal oficial.",
        horario: "Consultar condiciones del servicio.",
        sitio: "Gobierno de México."
    },

    "procuraduria-nna": {
        nombre: "Procuraduría de Protección de Niñas, Niños y Adolescentes",
        resumen: "Protección de los derechos de niñas, niños y adolescentes.",
        ubicacion: "Estado de México",
        descripcion: "Institución relacionada con la protección y restitución de los derechos de niñas, niños y adolescentes.",
        servicios: ["Protección de derechos", "Orientación", "Atención a menores", "Canalización"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "DIF Estado de México."
    },

    "dif-edomex": {
        nombre: "DIF Estado de México",
        resumen: "Sistema estatal para el desarrollo integral de las familias.",
        ubicacion: "Estado de México",
        descripcion: "Organismo relacionado con programas de asistencia social y atención a familias y grupos que requieren apoyo.",
        servicios: ["Asistencia social", "Atención familiar", "Protección de menores"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "DIF Estado de México."
    },

    "secretaria-mujeres": {
        nombre: "Secretaría de las Mujeres del Estado de México",
        resumen: "Dependencia estatal relacionada con los derechos y la atención de las mujeres.",
        ubicacion: "Estado de México",
        descripcion: "Dependencia encargada de impulsar acciones y programas relacionados con la igualdad, los derechos y la atención de las mujeres.",
        servicios: ["Orientación", "Atención a mujeres", "Programas de igualdad"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Gobierno del Estado de México."
    },

    "codhem": {
        nombre: "Comisión de Derechos Humanos del Estado de México",
        resumen: "Organismo público de protección de los derechos humanos.",
        ubicacion: "Estado de México",
        descripcion: "Organismo público autónomo que promueve, protege y estudia los derechos humanos en el Estado de México.",
        servicios: ["Orientación", "Recepción de quejas", "Información sobre derechos humanos"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Comisión de Derechos Humanos del Estado de México."
    },

    "fgjem": {
        nombre: "Fiscalía General de Justicia del Estado de México",
        resumen: "Institución encargada de la procuración de justicia.",
        ubicacion: "Estado de México",
        descripcion: "Institución encargada de investigar y perseguir delitos dentro de sus atribuciones legales.",
        servicios: ["Orientación sobre denuncias", "Procuración de justicia", "Atención institucional"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Fiscalía General de Justicia del Estado de México."
    },

    "dif-nacional": {
        nombre: "Sistema Nacional para el Desarrollo Integral de la Familia",
        resumen: "Sistema nacional de asistencia social y atención familiar.",
        ubicacion: "México",
        descripcion: "Organismo relacionado con la asistencia social y la atención de familias, niñas, niños y adolescentes.",
        servicios: ["Asistencia social", "Atención familiar", "Protección de menores"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Sistema Nacional DIF."
    },

    "consejo-mujer": {
        nombre: "Consejo Estatal de la Mujer y Bienestar Social",
        resumen: "Referencia institucional histórica del Estado de México.",
        ubicacion: "Estado de México",
        descripcion: "Esta denominación corresponde a una referencia institucional anterior. Es necesario verificar su vigencia y la dependencia que actualmente realiza sus funciones.",
        servicios: ["Consultar información institucional vigente"],
        telefono: "No disponible sin confirmar.",
        horario: "No disponible sin confirmar.",
        sitio: "Gobierno del Estado de México."
    },

    "red-refugios": {
        nombre: "Red de Refugios para Mujeres en Situación de Violencia",
        resumen: "Red de organizaciones y espacios de apoyo.",
        ubicacion: "México",
        descripcion: "Red relacionada con espacios de protección y apoyo para mujeres en situación de violencia. La disponibilidad y ubicación de los refugios debe consultarse mediante sus canales oficiales.",
        servicios: ["Orientación", "Protección", "Información sobre refugios"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Red Nacional de Refugios."
    }

};

const parametros = new URLSearchParams(window.location.search);
const id = parametros.get("id");

const institucion = instituciones[id];

if (institucion) {

    document.getElementById("nombreInstitucion").textContent = institucion.nombre;
    document.getElementById("resumenInstitucion").textContent = institucion.resumen;
    document.getElementById("ubicacionInstitucion").textContent = institucion.ubicacion;
    document.getElementById("descripcionInstitucion").textContent = institucion.descripcion;
    document.getElementById("telefonoInstitucion").textContent = institucion.telefono;
    document.getElementById("horarioInstitucion").textContent = institucion.horario;
    document.getElementById("sitioInstitucion").textContent = institucion.sitio;

    const lista = document.getElementById("serviciosInstitucion");

    institucion.servicios.forEach(function(servicio) {

        const elemento = document.createElement("li");
        elemento.textContent = servicio;

        lista.appendChild(elemento);

    });

} else {

    document.getElementById("nombreInstitucion").textContent = "Institución no encontrada";
    document.getElementById("resumenInstitucion").textContent = "No se encontró información para esta institución.";
    document.getElementById("descripcionInstitucion").textContent = "Regresa al directorio e intenta realizar otra búsqueda.";

}