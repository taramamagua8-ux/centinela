const catalogoInstituciones = (() => {
    const prefix = 'catalogo-';

    async function consultar(path) {
        const response = await fetch('/api/instituciones' + path);
        if (!response.ok) throw new Error('No se pudo cargar el catálogo de instituciones.');
        return response.json();
    }

    function adaptar(item) {
        return {
            id: prefix + item.id_institucion,
            nombre: item.nombre,
            descripcion: item.descripcion || 'Institución de apoyo registrada en Centinela Digital.',
            resumen: item.descripcion || 'Consulta sus datos de contacto.',
            ubicacion: [item.direccion, item.municipio].filter(Boolean).join(' · ') || 'Ubicación no registrada',
            telefono: item.telefono || 'No registrado',
            correo: item.correo,
            horario: item.horario || 'No registrado',
            sitio: item.sitio_web || 'No registrado',
            servicios: [],
            palabras: '',
        };
    }

    return {
        listar: async () => (await consultar('')).instituciones.map(adaptar),
        esRegistro: id => /^catalogo-[0-9]+$/.test(id || ''),
        obtener: async id => adaptar((await consultar('/' + id.slice(prefix.length))).institucion),
    };
})();
