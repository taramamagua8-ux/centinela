const instituciones = {

    "linea-sin-violencia": {
        nombre: "Línea Sin Violencia - Estado de México",
        resumen: "Servicio estatal de orientación para mujeres.",
        ubicacion: "Estado de México",
        descripcion: "Servicio de orientación para mujeres en situación de violencia. Para conocer sus condiciones de atención y servicios vigentes, consulta los medios oficiales del Gobierno del Estado de México.",
        servicios: ["Orientación psicológica", "Asesoría jurídica", "Orientación y canalización"],
        telefono: "800 108 40 53",
        horario: "24 horas, los 365 días del año.",
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
        nombre: "CEAVEM - Subdirección Regional Oriente y Coordinación Regional Oriente I",
        resumen: "Unidad regional de atención a víctimas.",
        ubicacion: "Nezahualcóyotl, Estado de México",
        descripcion: "Unidad regional de la Comisión Ejecutiva de Atención a Víctimas del Estado de México. Se recomienda confirmar su dirección y disponibilidad antes de acudir.",
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
        telefono: "800 911 2000",
        horario: "24 horas, los 365 días del año.",
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
        ubicacion: "Av. Nicolás San Juan núm. 113, col. Ex Rancho Cuauhtémoc, C.P. 50010, Toluca, Estado de México",
        descripcion: "Organismo público autónomo que promueve, protege y estudia los derechos humanos en el Estado de México. Recibe quejas por presuntas violaciones a derechos humanos cometidas por autoridades o servidores públicos estatales o municipales. No investiga delitos penales ni sustituye a la Fiscalía.",
        servicios: ["Orientación", "Recepción de quejas", "Información sobre derechos humanos"],
        telefono: "722 236 0560 · Líneas 24/7: 800 999 4000 y 800 999 4002",
        correo: "quejas@codhem.org.mx",
        horario: "Líneas telefónicas 24 horas, todos los días.",
        sitio: "codhem.org.mx"
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

    "red-refugios": {
        nombre: "Red Nacional de Refugios A.C.",
        resumen: "Organización de apoyo y protección para mujeres en situación de violencia.",
        ubicacion: "México",
        descripcion: "Organización que trabaja para brindar apoyo, orientación y protección a mujeres en situación de violencia. La disponibilidad y ubicación de los refugios debe consultarse mediante sus canales oficiales.",
        servicios: ["Orientación", "Protección", "Información sobre refugios"],
        telefono: "Consultar medios oficiales.",
        horario: "Consultar disponibilidad.",
        sitio: "Red Nacional de Refugios."
    }

    ,"cacem": {
        nombre: "Centro de Atención para la Convivencia Escolar Mexiquense (CACEM)",
        resumen: "Recepción de reportes, orientación y canalización por violencia escolar.",
        ubicacion: "Pedro Ascencio núm. 207, col. La Merced, Toluca, Estado de México",
        descripcion: "Depende del Consejo Escolar para el Bienestar (CONEBI) de la SECTI Estado de México. Recibe, registra y canaliza reportes relacionados con violencia escolar y promueve la convivencia pacífica en escuelas. Atiende a estudiantes, madres, padres, tutores y personal educativo.",
        servicios: ["Recepción de reportes", "Orientación", "Canalización"],
        telefono: "722 167 2202 · 800 016 4667 · Conmutador CONEBI: 722 226 4360",
        horario: "Consultar el horario en el portal oficial.",
        sitio: "CONEBI / CACEM (conebi.edomex.gob.mx)"
    }

    ,"sipinna-edomex": {
        nombre: "Secretaría Ejecutiva del SIPINNA Estado de México",
        resumen: "Coordinación institucional y orientación sobre derechos de la infancia y la adolescencia.",
        ubicacion: "Av. Miguel Hidalgo Pte. núm. 1031, barrio de San Bernardino, C.P. 50080, Toluca, Estado de México",
        descripcion: "Depende de la Secretaría de las Mujeres del Estado de México. Coordina políticas públicas y vincula dependencias para proteger los derechos de la infancia y la adolescencia. No recibe ni investiga denuncias individuales. Atiende a niñas, niños, adolescentes, familias e instituciones.",
        servicios: ["Coordinación institucional", "Orientación", "Derechos de la infancia"],
        telefono: "722 934 2700, ext. 82901",
        horario: "Lunes a viernes, de 9:00 a 18:00 h.",
        sitio: "sipinna.edomex.gob.mx"
    }

    ,"imedis": {
        nombre: "Instituto Mexiquense para la Discapacidad (IMEDIS)",
        resumen: "Orientación, vinculación y promoción de derechos para personas con discapacidad.",
        ubicacion: "Calle José Vicente Villada núm. 423, col. Francisco Murguía, C.P. 50130, Toluca, Estado de México",
        descripcion: "Depende de la Secretaría de Salud del Estado de México. Promueve la inclusión social, la accesibilidad y la igualdad de oportunidades para personas con discapacidad. No recibe denuncias de violencia. Atiende a personas con discapacidad, familias y personas cuidadoras.",
        servicios: ["Orientación", "Vinculación", "Promoción de derechos"],
        telefono: "722 215 4317",
        horario: "Consultar el horario en el portal oficial.",
        sitio: "imedis.edomex.gob.mx"
    }

    ,"difem-adultos-mayores": {
        nombre: "Coordinación de Atención a Adultos Mayores del DIFEM",
        resumen: "Asistencia social, orientación y canalización para personas adultas mayores.",
        ubicacion: "Prolongación Benito Juárez núm. 415, col. Santa Bárbara, C.P. 50050, Toluca, Estado de México (confirmar la sede antes de acudir)",
        descripcion: "Depende del Sistema para el Desarrollo Integral de la Familia del Estado de México (DIFEM). Brinda atención integral, trabajo social, credenciales y orientación ante abandono, negligencia o vulneración de derechos. Atiende a personas adultas mayores, familias y personas cuidadoras.",
        servicios: ["Asistencia social", "Trabajo social", "Orientación", "Canalización"],
        telefono: "722 215 4166 · 722 167 3191 · Línea sin costo: 800 003 4336",
        correo: "caam@edomex.gob.mx",
        horario: "Consultar disponibilidad en medios oficiales.",
        sitio: "difem.edomex.gob.mx"
    }

    ,"cclem": {
        nombre: "Centro de Conciliación Laboral del Estado de México (CCLEM)",
        resumen: "Orientación y conciliación prejudicial en conflictos laborales locales.",
        ubicacion: "Sedes: Toluca (Calle Sor Juana Inés de la Cruz núm. 306, col. Santa Clara, C.P. 50090) · Tlalnepantla (Av. San Ignacio núm. 2, col. Los Reyes Iztacala, C.P. 54090) · Ecatepec (Calle Nicolás Bravo s/n, col. La Mora, C.P. 55030) · Texcoco (Av. Juárez Sur núm. 321, col. El Carmen, C.P. 56100)",
        descripcion: "Organismo público descentralizado estatal. Facilita acuerdos entre personas trabajadoras y empleadoras en conflictos laborales locales antes de ir a juicio. No es fiscalía ni sanciona delitos. Atiende a personas trabajadoras, empleadores y representantes laborales.",
        servicios: ["Orientación", "Conciliación prejudicial", "Asuntos laborales"],
        telefono: "Toluca: 722 926 8210 · Tlalnepantla: 55 8976 2810 · Ecatepec: 55 8976 2800 · Texcoco: 595 913 2440",
        horario: "Lunes a viernes, de 9:00 a 18:00 h.",
        sitio: "cclaboral.edomex.gob.mx"
    }

    ,"profedet-toluca": {
        nombre: "PROFEDET - Procuraduría Federal de la Defensa del Trabajo, sede Toluca",
        resumen: "Asesoría jurídica y representación legal gratuita para personas trabajadoras.",
        ubicacion: "Vía Alfredo del Mazo núm. 1028, col. Santa Cruz Atzcapotzaltongo, C.P. 50030, Toluca, Estado de México",
        descripcion: "Depende de la Secretaría del Trabajo y Previsión Social (Gobierno Federal). Orienta y defiende gratuitamente los derechos de personas trabajadoras en conflictos laborales de competencia federal.",
        servicios: ["Asesoría jurídica", "Representación legal", "Orientación laboral"],
        telefono: "Líneas nacionales: 800 717 2942 y 800 911 7877 · Local: 722 689 4711 (confirmar ext. 20185)",
        correo: "orientacionprofedet@stps.gob.mx",
        horario: "Lunes a viernes, de 9:00 a 18:00 h (confirmar el horario local).",
        sitio: "gob.mx/profedet"
    }

    ,"profedet-naucalpan": {
        nombre: "PROFEDET - Procuraduría Federal de la Defensa del Trabajo, sede Naucalpan",
        resumen: "Asesoría jurídica y representación legal gratuita para personas trabajadoras.",
        ubicacion: "San Andrés Atoto núm. 1, col. San Esteban, C.P. 53550, Naucalpan de Juárez, Estado de México",
        descripcion: "Depende de la Secretaría del Trabajo y Previsión Social (Gobierno Federal). Orienta y representa legalmente, sin costo, a personas trabajadoras en asuntos laborales de competencia federal.",
        servicios: ["Asesoría jurídica", "Representación legal", "Orientación laboral"],
        telefono: "55 9156 9970 y 55 9156 9971 (confirmar ext. 20490 / 20491) · Línea nacional: 800 717 2942",
        correo: "orientacionprofedet@stps.gob.mx",
        horario: "Lunes a viernes, de 9:00 a 18:00 h (confirmar el horario local).",
        sitio: "gob.mx/profedet"
    }

    ,"uaemex-igualdad": {
        nombre: "Secretaría de Igualdad Sustantiva y Cuidados (UAEMéx)",
        resumen: "Prevención, acompañamiento y atención interna para la comunidad UAEMéx.",
        ubicacion: "Edificio Ex Planetario, Cerro de Coatepec, C.P. 50110, Ciudad Universitaria, Toluca, Estado de México",
        descripcion: "Depende de la Universidad Autónoma del Estado de México (UAEMéx). Previene, orienta y da seguimiento a casos de violencia de género e inclusión dentro de la universidad. Atención exclusiva para alumnado, personal docente y administrativo de la UAEMéx.",
        servicios: ["Prevención", "Acompañamiento", "Seguimiento de casos"],
        telefono: "722 462 8260 (ext. general 18252 · Igualdad: 18253 · Acompañamiento: 18256)",
        correo: "sisyc@uaemex.mx",
        horario: "Consultar el horario en medios universitarios.",
        sitio: "Portal UAEMéx (uaemex.mx)"
    }

    ,"codhem-nna": {
        nombre: "CODHEM - Visitaduría Adjunta de Atención Integral a Niñas, Niños y Adolescentes",
        resumen: "Atención de quejas en materia de derechos humanos de la infancia y la adolescencia.",
        ubicacion: "Av. Nicolás San Juan núm. 113, col. Ex Rancho Cuauhtémoc, C.P. 50010, Toluca, Estado de México",
        descripcion: "Área especializada de la CODHEM, que recibe quejas por presuntas violaciones a derechos humanos cometidas por autoridades o servidores públicos estatales o municipales. No investiga delitos penales ni sustituye a la Fiscalía. Atiende a infancia, adolescencia y personas cuidadoras. También cuenta con Visitadurías Regionales (Nezahualcóyotl, Ecatepec, Tlalnepantla, Chalco y Texcoco).",
        servicios: ["Quejas", "Niñez y adolescencia", "Derechos humanos"],
        telefono: "722 236 0560, ext. 2063 / 2057 · Líneas 24/7: 800 999 4000 y 800 999 4002 (validar la extensión en el directorio de la CODHEM)",
        correo: "atencion.nna@codhem.org.mx",
        horario: "Líneas telefónicas 24 horas, todos los días.",
        sitio: "codhem.org.mx"
    }

    ,"codhem-discapacidad": {
        nombre: "CODHEM - Visitaduría Adjunta de Atención a Personas con Discapacidad, Adultos Mayores y Atención Empresarial",
        resumen: "Atención de quejas de personas con discapacidad y personas adultas mayores.",
        ubicacion: "Av. Nicolás San Juan núm. 113, col. Ex Rancho Cuauhtémoc, C.P. 50010, Toluca, Estado de México",
        descripcion: "Área especializada de la CODHEM, que recibe quejas por presuntas violaciones a derechos humanos cometidas por autoridades o servidores públicos estatales o municipales. No investiga delitos penales ni sustituye a la Fiscalía. Atiende a personas con discapacidad y personas adultas mayores. También cuenta con Visitadurías Regionales (Nezahualcóyotl, Ecatepec, Tlalnepantla, Chalco y Texcoco).",
        servicios: ["Quejas", "Discapacidad", "Adultos mayores"],
        telefono: "722 236 0560, ext. 2052 · Líneas 24/7: 800 999 4000 y 800 999 4002 (validar la extensión en el directorio de la CODHEM)",
        correo: "atencion.adultosmayores@codhem.org.mx",
        horario: "Líneas telefónicas 24 horas, todos los días.",
        sitio: "codhem.org.mx"
    }

    ,"codhem-trata": {
        nombre: "CODHEM - Visitaduría Adjunta de Atención a la Trata de Personas y Desaparición Forzada",
        resumen: "Acompañamiento en derechos humanos a víctimas y familiares.",
        ubicacion: "Av. Nicolás San Juan núm. 113, col. Ex Rancho Cuauhtémoc, C.P. 50010, Toluca, Estado de México",
        descripcion: "Área especializada de la CODHEM, que recibe quejas por presuntas violaciones a derechos humanos cometidas por autoridades o servidores públicos estatales o municipales. No investiga delitos penales ni sustituye a la Fiscalía. Atiende a víctimas y familiares, con acompañamiento en derechos humanos (no realiza búsqueda penal). También cuenta con Visitadurías Regionales (Nezahualcóyotl, Ecatepec, Tlalnepantla, Chalco y Texcoco).",
        servicios: ["Quejas", "Trata de personas", "Desaparición forzada"],
        telefono: "722 236 0560, ext. 2066 · Líneas 24/7: 800 999 4000 y 800 999 4002 (validar la extensión en el directorio de la CODHEM)",
        correo: "atencion.trata@codhem.org.mx",
        horario: "Líneas telefónicas 24 horas, todos los días.",
        sitio: "codhem.org.mx"
    }

    ,"codhem-migrantes": {
        nombre: "CODHEM - Visitaduría Adjunta de Atención a Personas Migrantes, Periodistas y Defensores",
        resumen: "Atención de quejas de personas migrantes, periodistas y defensoras de derechos humanos.",
        ubicacion: "Av. Nicolás San Juan núm. 113, col. Ex Rancho Cuauhtémoc, C.P. 50010, Toluca, Estado de México · También con sede en Av. Benito Juárez 51, Centro, Huehuetoca, Estado de México",
        descripcion: "Área especializada de la CODHEM, que recibe quejas por presuntas violaciones a derechos humanos cometidas por autoridades o servidores públicos estatales o municipales. No investiga delitos penales ni sustituye a la Fiscalía. Atiende a personas migrantes, periodistas y personas defensoras. También cuenta con Visitadurías Regionales (Nezahualcóyotl, Ecatepec, Tlalnepantla, Chalco y Texcoco).",
        servicios: ["Quejas", "Migrantes", "Periodistas y defensores"],
        telefono: "722 236 0560, ext. 2058 · Líneas 24/7: 800 999 4000 y 800 999 4002 (validar la extensión en el directorio de la CODHEM)",
        correo: "atencion.migrantes@codhem.org.mx",
        horario: "Líneas telefónicas 24 horas, todos los días.",
        sitio: "codhem.org.mx"
    }

    ,"codhem-indigenas": {
        nombre: "CODHEM - Visitaduría Adjunta de Atención a Pueblos Indígenas y Afrodescendientes",
        resumen: "Atención de quejas de pueblos originarios, comunidades indígenas y personas afrodescendientes.",
        ubicacion: "Av. Nicolás San Juan núm. 113, col. Ex Rancho Cuauhtémoc, C.P. 50010, Toluca, Estado de México",
        descripcion: "Área especializada de la CODHEM, que recibe quejas por presuntas violaciones a derechos humanos cometidas por autoridades o servidores públicos estatales o municipales. No investiga delitos penales ni sustituye a la Fiscalía. Atiende a pueblos originarios, comunidades indígenas y personas afrodescendientes. También cuenta con Visitadurías Regionales (Nezahualcóyotl, Ecatepec, Tlalnepantla, Chalco y Texcoco).",
        servicios: ["Quejas", "Pueblos indígenas", "Afrodescendientes"],
        telefono: "722 236 0560, ext. 2064 · Líneas 24/7: 800 999 4000 y 800 999 4002 (validar la extensión en el directorio de la CODHEM)",
        correo: "pueblos.originarios@codhem.org.mx",
        horario: "Líneas telefónicas 24 horas, todos los días.",
        sitio: "codhem.org.mx"
    }

    ,"codhem-igualdad": {
        nombre: "CODHEM - Visitaduría Adjunta de Igualdad de Género y No Discriminación",
        resumen: "Atención de quejas de mujeres, diversidad sexogenérica y casos de discriminación.",
        ubicacion: "Av. Nicolás San Juan núm. 113, col. Ex Rancho Cuauhtémoc, C.P. 50010, Toluca, Estado de México",
        descripcion: "Área especializada de la CODHEM, que recibe quejas por presuntas violaciones a derechos humanos cometidas por autoridades o servidores públicos estatales o municipales. No investiga delitos penales ni sustituye a la Fiscalía. Atiende a mujeres, diversidad sexogenérica y casos de discriminación. También cuenta con Visitadurías Regionales (Nezahualcóyotl, Ecatepec, Tlalnepantla, Chalco y Texcoco).",
        servicios: ["Quejas", "Igualdad de género", "No discriminación"],
        telefono: "722 236 0560, ext. 2062 · Líneas 24/7: 800 999 4000 y 800 999 4002 (validar la extensión en el directorio de la CODHEM)",
        correo: "igualdad.genero@codhem.org.mx",
        horario: "Líneas telefónicas 24 horas, todos los días.",
        sitio: "codhem.org.mx"
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

    if (institucion.correo) {
        document.getElementById("correoInstitucion").textContent = institucion.correo;
        document.getElementById("filaCorreo").hidden = false;
    }

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