const API_AUTH = '/api';

function irDespuesDeAutenticar() {
    const regreso = sessionStorage.getItem('centinela_regreso');
    sessionStorage.removeItem('centinela_regreso');
    window.location.href = ['terminos.html', 'ReporteVicAno.html', 'ReporteTesAno.html'].includes(regreso) ? regreso : 'cuenta.html';
}

function guardarSesion(usuario, token) {
    sessionStorage.setItem('centinela_usuario', JSON.stringify(usuario));
    if (token) sessionStorage.setItem('centinela_token', token);
}

function limpiarSesion() {
    sessionStorage.removeItem('centinela_usuario');
    sessionStorage.removeItem('centinela_token');
}

async function apiAuth(path, options = {}) {
    const token = sessionStorage.getItem('centinela_token');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = 'Bearer ' + token;
    const respuesta = await fetch(API_AUTH + path, { ...options, headers });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.error || 'No se pudo completar la operación.');
    return datos;
}

function mostrarAviso(elemento, mensaje, error = false) {
    if (!elemento) return;
    elemento.textContent = mensaje;
    elemento.classList.toggle('aviso-error', error);
    elemento.classList.add('visible');
}

const formularioLogin = document.getElementById('form-login');
if (formularioLogin) {
    formularioLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const aviso = document.getElementById('aviso-auth');
        const boton = formularioLogin.querySelector('button[type="submit"]');
        const datos = Object.fromEntries(new FormData(formularioLogin));
        try {
            boton.disabled = true;
            const respuesta = await apiAuth('/auth/login', {
                method: 'POST',
                body: JSON.stringify(datos)
            });
            guardarSesion(respuesta.usuario, respuesta.token);
            irDespuesDeAutenticar();
        } catch (error) {
            mostrarAviso(aviso, error.message, true);
        } finally {
            boton.disabled = false;
        }
    });
}

const formularioRegistro = document.getElementById('form-registro');
if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const aviso = document.getElementById('aviso-auth');
        const boton = formularioRegistro.querySelector('button[type="submit"]');
        const datos = Object.fromEntries(new FormData(formularioRegistro));
        if (datos.contrasena !== datos.confirmar_contrasena) {
            mostrarAviso(aviso, 'Las contraseñas no coinciden.', true);
            return;
        }
        delete datos.confirmar_contrasena;
        try {
            boton.disabled = true;
            await apiAuth('/auth/registro', { method: 'POST', body: JSON.stringify(datos) });
            const login = await apiAuth('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ correo: datos.correo, contrasena: datos.contrasena })
            });
            guardarSesion(login.usuario, login.token);
            irDespuesDeAutenticar();
        } catch (error) {
            mostrarAviso(aviso, error.message, true);
        } finally {
            boton.disabled = false;
        }
    });
}

const panelCuenta = document.getElementById('panel-cuenta-usuario');
if (panelCuenta) {
    if (sessionStorage.getItem('centinela_regreso')) {
        document.getElementById('acceso-anonimo-cuenta').hidden = true;
        document.querySelector('#cuenta-acceso > p').textContent = 'Inicia sesión o crea una cuenta para continuar con tu reporte registrado.';
    }
    if (sessionStorage.getItem('centinela_token')) {
        apiAuth('/auth/sesion').then(async ({usuario}) => {
            document.getElementById('cuenta-acceso').hidden = true;
            panelCuenta.hidden = false;
            document.getElementById('nombre-cuenta').textContent = usuario.nombre;
            document.getElementById('correo-cuenta').textContent = usuario.correo;
            const aviso = document.getElementById('aviso-mis-reportes');
            try {
                const {reportes} = await apiAuth('/usuarios/me/reportes');
                aviso.textContent = reportes.length ? '' : 'Todavía no has enviado reportes registrados.';
                const lista = document.getElementById('mis-reportes');
                for (const reporte of reportes) {
                    const item = document.createElement('li');
                    const enlace = document.createElement('a');
                    enlace.href = 'seguimiento.html#' + encodeURIComponent(reporte.folio);
                    enlace.textContent = [reporte.folio, reporte.estado].filter(Boolean).join(' · ');
                    item.append(enlace);
                    lista.append(item);
                }
            } catch (error) {
                aviso.textContent = error.message;
            }
        }).catch(limpiarSesion);
    }

    document.getElementById('form-editar-cuenta')?.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const aviso = document.getElementById('aviso-cuenta');
        const formulario = evento.currentTarget;
        const datos = Object.fromEntries(new FormData(formulario));
        if (!datos.nombre && !datos.correo && !datos.contrasena) {
            mostrarAviso(aviso, 'Escribe al menos un cambio.', true);
            return;
        }
        Object.keys(datos).forEach((key) => { if (!datos[key]) delete datos[key]; });
        try {
            await apiAuth('/usuarios/me', { method: 'PATCH', body: JSON.stringify(datos) });
            const sesion = await apiAuth('/auth/sesion');
            guardarSesion(sesion.usuario, sessionStorage.getItem('centinela_token'));
            document.getElementById('nombre-cuenta').textContent = sesion.usuario.nombre;
            document.getElementById('correo-cuenta').textContent = sesion.usuario.correo;
            formulario.reset();
            mostrarAviso(aviso, 'Datos actualizados correctamente.');
        } catch (error) {
            mostrarAviso(aviso, error.message, true);
        }
    });

    document.getElementById('btn-cerrar-sesion')?.addEventListener('click', async () => {
        try { await apiAuth('/auth/logout', { method: 'POST' }); } catch (_) {}
        limpiarSesion();
        window.location.href = 'cuenta.html';
    });

    document.getElementById('btn-desactivar-cuenta')?.addEventListener('click', async () => {
        if (!window.confirm('¿Seguro que deseas desactivar tu cuenta?')) return;
        try {
            await apiAuth('/usuarios/me', { method: 'DELETE' });
            limpiarSesion();
            window.location.href = 'principal.html';
        } catch (error) {
            mostrarAviso(document.getElementById('aviso-cuenta'), error.message, true);
        }
    });
}
