const API_AUTH = '/api';

function usuarioGuardado() {
    try {
        return JSON.parse(sessionStorage.getItem('centinela_usuario') || 'null');
    } catch (_) {
        return null;
    }
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
    const usuario = usuarioGuardado();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (usuario?.id) headers['X-Usuario-ID'] = usuario.id;
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
            window.location.href = 'cuenta.html';
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
            window.location.href = 'cuenta.html';
        } catch (error) {
            mostrarAviso(aviso, error.message, true);
        } finally {
            boton.disabled = false;
        }
    });
}

const panelCuenta = document.getElementById('panel-cuenta-usuario');
if (panelCuenta) {
    const usuario = usuarioGuardado();
    const acceso = document.getElementById('cuenta-acceso');
    const bienvenida = document.getElementById('cuenta-bienvenida');
    if (usuario) {
        acceso.hidden = true;
        panelCuenta.hidden = false;
        document.getElementById('nombre-cuenta').textContent = usuario.nombre;
        document.getElementById('correo-cuenta').textContent = usuario.correo;
    }

    document.getElementById('form-editar-cuenta')?.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const aviso = document.getElementById('aviso-cuenta');
        const datos = Object.fromEntries(new FormData(evento.currentTarget));
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
            evento.currentTarget.reset();
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
