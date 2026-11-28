"""API de Centinela Digital conectada a PostgreSQL."""
from datetime import date, datetime
from uuid import UUID
from urllib.request import Request, urlopen
import hashlib, io, json, os, secrets, threading
from functools import wraps
from pathlib import Path
from email.message import EmailMessage
import smtplib
import re
import ssl

from psycopg.types.json import Jsonb
import psycopg
from backend.database import connect, initialize
from flask import Flask, g, jsonify, request, send_from_directory, redirect, send_file
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

FRONTEND = Path(__file__).resolve().parent.parent / "frontend" / "static"
app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="/static")
app.config["JSON_AS_ASCII"] = False

_database_ready = False
_database_lock = threading.Lock()
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024

def db_connection():
    global _database_ready
    if not _database_ready:
        with _database_lock:
            if not _database_ready:
                initialize()
                _database_ready = True
    return connect()

@app.before_request
def open_db():
    if request.path.startswith("/api/") and request.method != "OPTIONS":
        try:
            g.db = db_connection()
        except psycopg.Error:
            app.logger.error("No se pudo conectar con PostgreSQL")
            return jsonify({"error": "Base de datos no disponible."}), 503

@app.teardown_request
def close_db(error=None):
    connection = g.pop("db", None)
    if connection:
        if error:
            connection.rollback()
        connection.close()

@app.after_request
def cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Reporte-Token"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
    if request.path.startswith(("/api/auth/", "/api/autoridad/", "/api/canalizacion", "/api/expedientes", "/api/reportes")):
        response.headers["Cache-Control"] = "no-store"
    return response

@app.route("/api/<path:unused>", methods=["OPTIONS"])
def options(unused):
    return "", 204

def data():
    item = request.get_json(silent=True)
    return item if isinstance(item, dict) else {}

def one(sql, params=()):
    with g.db.cursor() as cursor:
        cursor.execute(sql, params)
        return cursor.fetchone()

def many(sql, params=()):
    with g.db.cursor() as cursor:
        cursor.execute(sql, params)
        return cursor.fetchall()

def run(sql, params=()):
    with g.db.cursor() as cursor:
        if sql.lstrip().upper().startswith("INSERT INTO"):
            table = sql.split()[2]
            keys = {"usuarios": "id_usuario", "reportes": "id_reporte",
                    "seguimiento_reportes": "id_seguimiento", "evidencias": "id_evidencia",
                    "personas_involucradas": "id_persona"}
            if table in keys:
                sql += " RETURNING " + keys[table]
                cursor.execute(sql, params)
                return cursor.fetchone()[keys[table]]
        cursor.execute(sql, params)
        return None

def fail(message, status=400):
    return jsonify({"error": message}), status

def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()

def bearer():
    auth = request.headers.get("Authorization", "")
    return auth[7:] if auth.startswith("Bearer ") else ""

def current_user():
    if not bearer():
        return None
    return one(
        "SELECT u.* FROM usuarios u JOIN sesiones s ON s.id_usuario=u.id_usuario "
        "WHERE s.token_hash=%s AND s.expira>CURRENT_TIMESTAMP AND u.activo=1",
        (token_hash(bearer()),),
    )

def current_admin():
    if not bearer():
        return None
    return one(
        "SELECT a.id_administrador FROM administradores a JOIN sesiones s "
        "ON s.id_administrador=a.id_administrador WHERE s.token_hash=%s "
        "AND s.expira>CURRENT_TIMESTAMP AND a.activo=1 AND a.folio_hash IS NOT NULL", (token_hash(bearer()),),
    )

def admin_required(function):
    @wraps(function)
    def decorated(*args, **kwargs):
        admin = current_admin()
        if not admin:
            return fail("Se requiere un administrador autenticado.", 401)
        g.admin_id = admin["id_administrador"]
        return function(*args, **kwargs)
    return decorated

def user_required(function):
    @wraps(function)
    def decorated(*args, **kwargs):
        user = current_user()
        if not user:
            return fail("Se requiere una sesión válida.", 401)
        g.user_id = user["id_usuario"]
        return function(*args, **kwargs)
    return decorated

def report_access(function):
    @wraps(function)
    def decorated(report_id, *args, **kwargs):
        report = one("SELECT acceso_hash,id_usuario FROM reportes WHERE id_reporte=%s", (report_id,))
        if not report:
            return fail("Reporte no encontrado.", 404)
        supplied = request.headers.get("X-Reporte-Token", "")
        if supplied and secrets.compare_digest(token_hash(supplied), report["acceso_hash"]):
            return function(report_id, *args, **kwargs)
        user = current_user()
        if (user and user["id_usuario"] == report["id_usuario"]) or current_admin():
            return function(report_id, *args, **kwargs)
        return fail("Se requiere la clave de acceso del reporte.", 403)
    return decorated

def report_json(item):
    if not item:
        return None
    result = {k: v for k, v in item.items() if k not in ("acceso_hash", "id_usuario")}
    for key in ("fecha_hecho", "fecha_registro"):
        if result.get(key):
            result[key] = result[key].isoformat().replace("T", " ")
    try:
        result["detalle"] = json.loads(result["descripcion"])
    except (KeyError, TypeError, json.JSONDecodeError):
        pass
    return result

@app.get("/api/health")
def health():
    one("SELECT 1")
    return jsonify({"ok": True, "servicio": "Centinela Digital"})

def account_fields(item):
    name = input_text(item, "nombre", 150)
    email = input_text(item, "correo", 150)
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        email = ""
    password = item.get("contrasena")
    if not isinstance(password, str) or not 8 <= len(password) <= 128:
        password = ""
    return name, email, password


@app.post("/api/auth/registro")
def register():
    item = data()
    name, email, password = account_fields(item)
    if not name or not email or not password:
        return fail("Escribe un nombre, un correo válido y una contraseña de 8 a 128 caracteres.")
    item = {"nombre": name, "correo": email, "contrasena": password}
    if one("SELECT id_usuario FROM usuarios WHERE correo=%s", (item["correo"],)):
        return fail("El correo ya está registrado.", 409)
    user_id = run(
        "INSERT INTO usuarios (nombre,correo,contrasena_hash) VALUES (%s,%s,%s)",
        (item["nombre"], item["correo"], generate_password_hash(item["contrasena"])),
    )
    g.db.commit()
    return jsonify({"id_usuario": user_id, "nombre": item["nombre"], "correo": item["correo"]}), 201

@app.post("/api/auth/login")
def login():
    return authenticate("usuarios", "id_usuario")

@app.post("/api/auth/admin")
def admin_login():
    return authenticate("administradores", "id_administrador")
def authenticate(table, id_column):
    item = data()
    email = item.get("correo")
    if not isinstance(email, str):
        return fail("Escribe un correo válido.")
    email = email.strip().lower()
    user = one(f"SELECT * FROM {table} WHERE correo=%s AND activo=1", (email,))
    
    password = item.get("contrasena")
    if isinstance(password, str):
        password = password.strip()  # Elimina espacios accidentales al pegar

    if not user or not isinstance(password, str) or not password or not check_password_hash(user["contrasena_hash"], password):
        return fail("Correo o contraseña incorrectos.", 401)

    if table == "administradores":
        folio = item.get("folio")
        if isinstance(folio, str):
            folio = folio.strip().upper()  # Limpia espacios y asegura mayúsculas
        if (not isinstance(folio, str) or not folio or not user["folio_hash"]
                or not secrets.compare_digest(user["folio_hash"], token_hash(folio))):
            return fail("Folio de administrador incorrecto.", 401)

    token = secrets.token_urlsafe(32)
    run(f"INSERT INTO sesiones (token_hash,{id_column},expira) VALUES (%s,%s,CURRENT_TIMESTAMP + interval '12 hours')",
        (token_hash(token), user[id_column]))
    g.db.commit()
    return jsonify({
        "token": token,
        "usuario": {"id": user[id_column], "nombre": user["nombre"], "correo": user["correo"]},
    })


@app.post("/api/auth/logout")
def logout():
    if bearer():
        run("DELETE FROM sesiones WHERE token_hash=%s", (token_hash(bearer()),))
        g.db.commit()
    return jsonify({"ok": True, "mensaje": "Sesión cerrada."})

@app.get("/api/auth/sesion")
@user_required
def session_info():
    user = current_user()
    return jsonify({"usuario": {"id": user["id_usuario"], "id_usuario": user["id_usuario"],
                                "nombre": user["nombre"], "correo": user["correo"]}})

@app.patch("/api/usuarios/me")
@user_required
def update_user():
    user_id, item = g.user_id, data()
    name, email, password = account_fields(item)
    validated = {"nombre": name, "correo": email}
    if any(key in item and not validated[key] for key in validated) or ("contrasena" in item and not password):
        return fail("Revisa el nombre, correo o contraseña. La contraseña admite de 8 a 128 caracteres.")
    fields, values = [], []
    for key in ("nombre", "correo"):
        if key in item:
            fields.append(f"{key}=%s")
            values.append(validated[key])
    if password:
        fields.append("contrasena_hash=%s")
        values.append(generate_password_hash(password))
    if not fields:
        return fail("No hay cambios para actualizar.")
    values.append(user_id)
    run(f"UPDATE usuarios SET {', '.join(fields)} WHERE id_usuario=%s", values)
    g.db.commit()
    return jsonify({"ok": True})

@app.delete("/api/usuarios/me")
@user_required
def delete_user():
    user_id = g.user_id
    run("UPDATE usuarios SET activo=0 WHERE id_usuario=%s", (user_id,))
    g.db.commit()
    return jsonify({"ok": True})

DETAIL_FIELDS = ("fecha", "hora", "lugar", "ayudaInmediata", "haOcurrido", "huboTestigos", "descripcion")
RISKS = ("Por evaluar", "Bajo", "Medio", "Alto")

@app.post("/api/reportes")
def create_report():
    if request.mimetype == "multipart/form-data" or "rol" in data():
        return submit_reviewed_report()
    return create_legacy_report()

def submit_reviewed_report():
    try:
        item = json.loads(request.form.get("reporte", "")) if request.mimetype == "multipart/form-data" else data()
    except ValueError:
        return fail("El reporte no tiene un formato válido.")
    if not isinstance(item, dict):
        return fail("El reporte no tiene un formato válido.")
    submission = item.get("clave_envio")
    if submission is not None:
        try:
            submission = UUID(submission)
        except (ValueError, TypeError, AttributeError):
            return fail("La clave de envío no es válida.")
    school = item.get("ocurrio_en_escuela")
    if "ocurrio_en_escuela" in item and type(school) is not bool:
        return fail("Indica si el hecho ocurrió dentro de una escuela.")
    anonymous = item.get("es_anonimo")
    role = item.get("rol")
    if not isinstance(anonymous, bool) or role not in ("victima", "testigo") or item.get("terminos") is not True:
        return fail("Selecciona la modalidad y acepta los términos.")
    user = None if anonymous else current_user()
    if not anonymous and not user:
        return fail("Inicia sesión para enviar un reporte registrado.", 401)
    source = item.get("detalle")
    if not isinstance(source, dict):
        return fail("Completa los datos del reporte.")
    detail = {key: source[key].strip() for key in DETAIL_FIELDS if isinstance(source.get(key), str)}
    if not all(detail.get(key) for key in ("fecha", "lugar", "haOcurrido", "descripcion")):
        return fail("Completa los campos obligatorios.")
    if detail["haOcurrido"] not in ("SI", "NO") or detail.get("ayudaInmediata") not in (
        None, "", "SI", "NO", "No estoy segu@"
    ):
        return fail("Selecciona respuestas válidas para las preguntas de opción.")
    try:
        date = datetime.strptime(detail["fecha"], "%Y-%m-%d")
        if detail.get("hora"):
            time = datetime.strptime(detail["hora"], "%H:%M").time()
            date = datetime.combine(date.date(), time)
    except ValueError:
        return fail("La fecha del incidente no es válida.")
    if date.year < 1000 or len(detail["lugar"]) > 300 or len(detail["descripcion"]) > 10000:
        return fail("Revisa la fecha, el lugar y la extensión de la descripción.")
    type_id = item.get("tipo_violencia")
    if type(type_id) is not int or not one(
        "SELECT id_tipo_violencia FROM tipos_violencia WHERE id_tipo_violencia=%s AND activo=1", (type_id,),
    ):
        return fail("Selecciona un tipo de violencia válido.")
    state = one("SELECT id_estado FROM estados_reporte WHERE nombre=%s LIMIT 1", ("Recibido",))
    folio = f"CD-{datetime.now().year}-{secrets.token_hex(16).upper()}"
    user_id = user["id_usuario"] if user else None
    inserted = one(
        "INSERT INTO reportes (folio,descripcion,fecha_hecho,es_anonimo,id_estado,id_usuario,"
        "rol_reportante,acceso_hash,clave_envio,ocurrio_en_escuela) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
        "ON CONFLICT (clave_envio) DO NOTHING RETURNING id_reporte",
        (folio, json.dumps(detail, ensure_ascii=False), date, int(anonymous), state["id_estado"],
         user_id, role, token_hash(secrets.token_urlsafe(32)), submission, school),
    )
    if not inserted:
        existing = one(
            "SELECT id_reporte,folio FROM reportes WHERE clave_envio=%s AND id_usuario IS NOT DISTINCT FROM %s",
            (submission, user_id),
        )
        if not existing:
            return fail("La clave de envío ya está en uso.", 409)
        return jsonify({"reporte": existing})
    report_id = inserted["id_reporte"]
    run("INSERT INTO reporte_tipo_violencia VALUES (%s,%s)", (report_id, type_id))
    witnesses = source.get("testigos")
    if not anonymous and detail.get("huboTestigos") == "Sí" and isinstance(witnesses, str) and witnesses.strip():
        if len(witnesses.strip()) > 2000:
            return fail("Describe a los testigos en hasta 2000 caracteres.")
        run("INSERT INTO personas_involucradas (id_reporte,tipo_participacion,descripcion) VALUES (%s,%s,%s)",
            (report_id, "testigo", witnesses.strip()))
    move_report(report_id, RECEIVED)
    run("INSERT INTO avisos (id_reporte,personal,mensaje) VALUES (%s,TRUE,%s)",
        (report_id, "Se recibió un reporte nuevo."))

    file = request.files.get("archivo")
    if file and file.filename:
        if len(file.filename) > 255:
            return fail("El nombre del archivo es demasiado largo.")
        content = file.read()
        if len(content) > 10 * 1024 * 1024:
            return fail("La evidencia debe pesar como máximo 10 MB.", 413)
        run(
            "INSERT INTO evidencias (id_reporte,nombre_archivo,contenido,tipo_mime) VALUES (%s,%s,%s,%s)",
            (report_id, file.filename, content, file.mimetype),
        )
    g.db.commit()
    return jsonify({"reporte": {"id_reporte": report_id, "folio": folio}}), 201

@app.get("/api/usuarios/me/reportes")
@user_required
def my_reports():
    return jsonify({"reportes": many(
        "SELECT r.folio,r.fecha_registro,e.nombre AS estado FROM reportes r "
        "LEFT JOIN estados_reporte e USING (id_estado) WHERE r.id_usuario=%s ORDER BY r.id_reporte DESC",
        (g.user_id,),
    ), "avisos": many(
        "SELECT r.folio,a.mensaje,a.fecha FROM avisos a JOIN reportes r USING (id_reporte) "
        "WHERE a.id_usuario=%s AND r.id_usuario=%s AND r.es_anonimo=0 ORDER BY a.id_aviso DESC LIMIT 30",
        (g.user_id, g.user_id),
    )})

def create_legacy_report():
    item = data()
    school = item.get("ocurrio_en_escuela")
    if "ocurrio_en_escuela" in item and type(school) is not bool:
        return fail("Indica si el hecho ocurrió dentro de una escuela.")
    detail = item.get("detalle", item.get("descripcion", ""))
    if isinstance(detail, dict):
        detail = json.dumps(detail, ensure_ascii=False)
    if not detail:
        return fail("La descripción del reporte es obligatoria.")
    state = one("SELECT id_estado FROM estados_reporte WHERE nombre=%s LIMIT 1", ("Recibido",))
    folio = "CD-" + secrets.token_hex(8).upper()
    access_token = secrets.token_urlsafe(32)
    anonymous = bool(item.get("es_anonimo", True))
    user = None if anonymous else current_user()
    if not anonymous and not user:
        return fail("Inicia sesión para enviar un reporte registrado.", 401)
    report_id = run(
        "INSERT INTO reportes (folio,descripcion,fecha_hecho,es_anonimo,id_estado,acceso_hash,id_usuario,ocurrio_en_escuela) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (folio, detail, item.get("fecha_hecho"), int(anonymous), state["id_estado"] if state else None, token_hash(access_token), user["id_usuario"] if user else None, school),
    )
    for type_id in item.get("tipos_violencia", []):
        run("INSERT INTO reporte_tipo_violencia (id_reporte,id_tipo_violencia) VALUES (%s,%s)", (report_id, type_id))
    move_report(report_id, RECEIVED)
    run("INSERT INTO avisos (id_reporte,personal,mensaje) VALUES (%s,TRUE,%s)",
        (report_id, "Se recibió un reporte nuevo."))
    g.db.commit()
    return jsonify({"reporte": {"id_reporte": report_id, "folio": folio, "token_acceso": access_token}}), 201

@app.get("/api/reportes")
@admin_required
def list_reports():
    reports = many("SELECT * FROM reportes ORDER BY fecha_registro DESC")
    return jsonify({"reportes": [report_json(item) for item in reports]})

@app.get("/api/reportes/<int:report_id>")
@report_access
def get_report(report_id):
    item = one("SELECT * FROM reportes WHERE id_reporte=%s", (report_id,))
    if not item:
        return fail("Reporte no encontrado.", 404)
    return jsonify({"reporte": report_json(item)})

@app.patch("/api/reportes/<int:report_id>")
@admin_required
def update_report(report_id):
    item, fields, values = data(), [], []
    response = item.get("respuesta_institucion")
    if response is not None and (not isinstance(response, str) or len(response) > 8000):
        return fail("La respuesta institucional admite hasta 8000 caracteres.")
    if "nivel_riesgo" in item and item["nivel_riesgo"] not in RISKS:
        return fail("Nivel de riesgo inválido.")
    if not one("SELECT id_reporte FROM reportes WHERE id_reporte=%s FOR UPDATE", (report_id,)):
        return fail("Reporte no encontrado.", 404)
    if one("SELECT 1 FROM reportes r LEFT JOIN canalizaciones c USING (id_reporte) "
           "WHERE r.id_reporte=%s AND (r.cierre IS NOT NULL OR c.id_reporte IS NOT NULL)", (report_id,)):
        return fail("Gestiona el estado desde Expedientes o Canalización.", 409)
    for key in ("descripcion", "fecha_hecho", "id_estado", "nivel_riesgo", "respuesta_institucion"):
        if key in item:
            fields.append(f"{key}=%s")
            values.append(item[key])
    if not fields:
        return fail("No hay cambios para actualizar.")
    values.append(report_id)
    run(f"UPDATE reportes SET {', '.join(fields)} WHERE id_reporte=%s", values)
    g.db.commit()
    return jsonify({"ok": True})

@app.delete("/api/reportes/<int:report_id>")
@admin_required
def delete_report(report_id):
    one("SELECT id_reporte FROM reportes WHERE id_reporte=%s FOR UPDATE", (report_id,))
    if one("SELECT 1 FROM reportes r LEFT JOIN canalizaciones c USING (id_reporte) "
           "WHERE r.id_reporte=%s AND (r.cierre IS NOT NULL OR c.id_reporte IS NOT NULL)", (report_id,)):
        return fail("El reporte tiene un historial de cierre o canalización.", 409)
    run("DELETE FROM reportes WHERE id_reporte=%s", (report_id,))
    g.db.commit()
    return jsonify({"ok": True})

@app.get("/api/reportes/<int:report_id>/estado")
def report_status(report_id):
    item = one(
        "SELECT e.* FROM estados_reporte e JOIN reportes r ON r.id_estado=e.id_estado WHERE r.id_reporte=%s",
        (report_id,),
    )
    if not item:
        return fail("Estado no encontrado.", 404)
    return jsonify({"estado": item})

@app.get("/api/reportes/<int:report_id>/seguimiento")
@report_access
def report_tracking(report_id):
    items = many(
        "SELECT s.id_seguimiento,s.id_reporte,s.observaciones,s.fecha_actualizacion,e.id_estado,e.nombre AS estado "
        "FROM seguimiento_reportes s JOIN estados_reporte e ON e.id_estado=s.id_estado "
        "WHERE s.id_reporte=%s AND (s.publica OR %s) ORDER BY s.fecha_actualizacion DESC",
        (report_id, bool(current_admin())),
    )
    return jsonify({"seguimiento": items})

@app.post("/api/reportes/<int:report_id>/seguimiento")
@admin_required
def add_tracking(report_id):
    item = data()
    if not item.get("id_estado"):
        return fail("id_estado es obligatorio.")
    if not one("SELECT id_reporte FROM reportes WHERE id_reporte=%s FOR UPDATE", (report_id,)):
        return fail("Reporte no encontrado.", 404)
    if one("SELECT 1 FROM reportes r LEFT JOIN canalizaciones c USING (id_reporte) "
           "WHERE r.id_reporte=%s AND (r.cierre IS NOT NULL OR c.id_reporte IS NOT NULL)", (report_id,)):
        return fail("Gestiona el estado desde Expedientes o Canalización.", 409)
    tracking_id = run(
        "INSERT INTO seguimiento_reportes (id_reporte,id_estado,id_administrador,observaciones) VALUES (%s,%s,%s,%s)",
        (report_id, item["id_estado"], g.admin_id, item.get("observaciones")),
    )
    run("UPDATE reportes SET id_estado=%s WHERE id_reporte=%s", (item["id_estado"], report_id))
    g.db.commit()
    return jsonify({"id_seguimiento": tracking_id}), 201

@app.post("/api/reportes/consulta")
def consult_report():
    folio = data().get("folio")
    if not isinstance(folio, str) or not folio.strip() or len(folio) > 64:
        return fail("Escribe un folio válido.")
    item = one(
        "SELECT r.*,e.nombre AS estado FROM reportes r LEFT JOIN estados_reporte e USING (id_estado) "
        "WHERE r.folio=%s", (folio.strip().upper(),),
    )
    if not item:
        return fail("Folio no encontrado.", 404)
    report = report_json(item)
    owner = tracking_owner(item)
    fields = ("folio", "fecha_registro", "estado")
    if owner:
        fields += ("nivel_riesgo",)
    response = {key: report[key] for key in fields}
    response["requiere_sesion"] = not bool(owner)
    response["respuesta_institucion"] = report["respuesta_institucion"] if owner else None
    if owner:
        response["ocurrio_en_escuela"] = report["ocurrio_en_escuela"]
    response["historial"] = many(
        "SELECT e.nombre AS estado,s.fecha_actualizacion,CASE WHEN s.publica AND %s THEN s.observaciones END AS observaciones FROM seguimiento_reportes s "
        "JOIN estados_reporte e USING (id_estado) WHERE id_reporte=%s ORDER BY id_seguimiento",
        (bool(owner), item["id_reporte"]),
    )
    if item["cierre"] and owner:
        receipt = one("SELECT codigo FROM comprobantes_cierre WHERE id_reporte=%s AND fecha=%s",
                      (item["id_reporte"], item["cierre"]))
        if receipt:
            response["comprobante"] = {"folio": item["folio"], "estado": report["estado"],
                                       "fecha": item["cierre"], "codigo": receipt["codigo"]}
        response["puede_evaluar"] = not one(
            "SELECT 1 FROM evaluaciones_servicio WHERE id_reporte=%s", (item["id_reporte"],),
        )
    if owner:
        response["puede_ampliar"] = bool(one(
            "SELECT 1 FROM canalizaciones WHERE id_reporte=%s AND evaluacion->>'informacion_suficiente'='false'",
            (item["id_reporte"],),
        ))
    if owner and item["rol_reportante"]:
        response["rol_reportante"] = report["rol_reportante"]
        response["tipos"] = many(
            "SELECT t.nombre,t.descripcion AS orientacion,i.nombre AS institucion,i.sitio_web,i.telefono "
            "FROM reporte_tipo_violencia r JOIN tipos_violencia t USING (id_tipo_violencia) "
            "LEFT JOIN canalizacion_tipos c USING (id_tipo_violencia) "
            "LEFT JOIN instituciones i ON i.id_institucion=c.id_institucion AND i.activa=1 "
            "AND NOT EXISTS (SELECT 1 FROM envios_correo m WHERE m.id_reporte=r.id_reporte "
            "AND m.vigente AND m.estado='enviado') WHERE r.id_reporte=%s",
            (item["id_reporte"],),
        )
        if owner:
            detail = report.get("detalle")
            if isinstance(detail, dict):
                response["detalle"] = {key: detail.get(key) for key in DETAIL_FIELDS}
            elif report.get("descripcion"):
                response["detalle"] = {"descripcion": report["descripcion"]}
    if owner and item["id_estado"] in (REFERRED, REPLY, ATTENDED, CLOSED):
        response["instituciones_canalizadas"] = many(
            "SELECT i.nombre,i.telefono FROM envios_correo m JOIN instituciones i USING (id_institucion) "
            "WHERE m.id_reporte=%s AND m.vigente AND m.estado='enviado' ORDER BY i.nombre",
            (item["id_reporte"],),
        )
    result = jsonify({"reporte": response})
    result.headers["Cache-Control"] = "no-store"
    return result

@app.get("/api/reportes/folio/<string:folio>")
def report_by_folio(folio):
    item = one(
        "SELECT id_reporte,folio,fecha_registro,id_estado FROM reportes WHERE folio=%s",
        (folio,),
    )
    if not item:
        return fail("Folio no encontrado.", 404)
    return jsonify({"reporte": report_json(item)})

@app.post("/api/reportes/<int:report_id>/evidencias")
@report_access
def upload_evidence(report_id):
    case = lock_case(report_id)
    if case["id_estado"] in (CLOSED, ATTENDED):
        return fail("El expediente está cerrado.", 409)
    file = request.files.get("archivo")
    if not file or not file.filename:
        return fail("Debe adjuntarse un archivo.")
    evidence_id = run(
        "INSERT INTO evidencias (id_reporte,nombre_archivo,contenido,tipo_mime) VALUES (%s,%s,%s,%s)",
        (report_id, file.filename[:255], file.read(), file.mimetype),
    )
    g.db.commit()
    return jsonify({"id_evidencia": evidence_id, "nombre_archivo": file.filename}), 201

@app.get("/api/reportes/<int:report_id>/evidencias")
@report_access
def list_evidence(report_id):
    return jsonify({"evidencias": many(
        "SELECT id_evidencia,id_reporte,nombre_archivo,tipo_mime,fecha_subida FROM evidencias "
        "WHERE id_reporte=%s AND (uso='reporte' OR %s) ORDER BY fecha_subida DESC",
        (report_id, bool(current_admin())),
    )})

@app.get("/api/reportes/<int:report_id>/evidencias/<int:evidence_id>")
@report_access
def download_evidence(report_id, evidence_id):
    return serve_evidence(report_id, evidence_id, bool(current_admin()))


def serve_evidence(report_id, evidence_id, staff):
    item = one("SELECT nombre_archivo,contenido FROM evidencias WHERE id_reporte=%s AND id_evidencia=%s "
               "AND (uso='reporte' OR %s)", (report_id, evidence_id, staff))
    if not item:
        return fail("Evidencia no encontrada.", 404)
    return send_file(io.BytesIO(item["contenido"]), mimetype="application/octet-stream",
                     as_attachment=True, download_name=item["nombre_archivo"])

@app.delete("/api/reportes/<int:report_id>/evidencias/<int:evidence_id>")
@admin_required
def delete_evidence(report_id, evidence_id):
    case = lock_case(report_id)
    if not case or case["id_estado"] in (CLOSED, ATTENDED):
        return fail("El expediente debe estar abierto.", 409)
    run("DELETE FROM evidencias WHERE id_evidencia=%s AND id_reporte=%s", (evidence_id, report_id))
    g.db.commit()
    return jsonify({"ok": True})

@app.post("/api/reportes/<int:report_id>/personas")
@report_access
def add_person(report_id):
    if lock_case(report_id)["id_estado"] in (CLOSED, ATTENDED):
        return fail("El expediente está cerrado.", 409)
    item = data()
    if not item.get("tipo_participacion"):
        return fail("tipo_participacion es obligatorio.")
    person_id = run(
        "INSERT INTO personas_involucradas (id_reporte,tipo_participacion,nombre,descripcion) VALUES (%s,%s,%s,%s)",
        (report_id, item["tipo_participacion"], item.get("nombre"), item.get("descripcion")),
    )
    g.db.commit()
    return jsonify({"id_persona": person_id}), 201

@app.get("/api/reportes/<int:report_id>/personas")
@report_access
def list_people(report_id):
    return jsonify({"personas": many(
        "SELECT id_persona,id_reporte,tipo_participacion,nombre,descripcion FROM personas_involucradas "
        "WHERE id_reporte=%s AND (NOT interna OR %s)", (report_id, bool(current_admin()))
    )})

@app.patch("/api/reportes/<int:report_id>/personas/<int:person_id>")
@report_access
def update_person(report_id, person_id):
    if lock_case(report_id)["id_estado"] in (CLOSED, ATTENDED):
        return fail("El expediente está cerrado.", 409)
    item = data()
    run(
        "UPDATE personas_involucradas SET tipo_participacion=%s,nombre=%s,descripcion=%s WHERE id_persona=%s AND id_reporte=%s AND (NOT interna OR %s)",
        (item.get("tipo_participacion"), item.get("nombre"), item.get("descripcion"), person_id, report_id, bool(current_admin())),
    )
    g.db.commit()
    return jsonify({"ok": True})

@app.get("/api/instituciones")
def institutions():
    return jsonify({"instituciones": many("SELECT * FROM instituciones WHERE activa=1 ORDER BY nombre")})

@app.get("/api/instituciones/<int:institution_id>")
def institution(institution_id):
    item = one("SELECT * FROM instituciones WHERE id_institucion=%s AND activa=1", (institution_id,))
    if not item:
        return fail("Institución no encontrada.", 404)
    return jsonify({"institucion": item})

@app.get("/api/instituciones/buscar")
def search_institutions():
    term = f"%{request.args.get('q', '').strip()}%"
    params = (term, term, term)
    items = many(
        "SELECT * FROM instituciones WHERE activa=1 AND (nombre ILIKE %s OR municipio ILIKE %s OR descripcion ILIKE %s) ORDER BY nombre",
        params,
    )
    return jsonify({"instituciones": items})

@app.get("/api/instituciones/<int:institution_id>/servicios")
def institution_services(institution_id):
    item = one(
        "SELECT id_institucion,nombre,descripcion,telefono,horario,sitio_web FROM instituciones WHERE id_institucion=%s AND activa=1",
        (institution_id,),
    )
    if not item:
        return fail("Institución no encontrada.", 404)
    return jsonify({"institucion": item, "servicios": []})

@app.get("/api/videos")
def videos():
    return jsonify({"videos": [
        {"id": "violencia-psicologica", "titulo": "Violencia psicológica y emocional", "url": ""},
        {"id": "tipos-violencia", "titulo": "Tipos de violencia", "url": ""},
    ]})

@app.get("/api/contenido/descubre-mas")
def discover_content():
    return jsonify({"temas": [
        "Violencia psicológica o emocional",
        "Violencia física",
        "Violencia sexual",
        "Violencia económica",
        "Violencia patrimonial",
    ]})

@app.get("/api/tipos-violencia")
def violence_types():
    return jsonify({"tipos": many("SELECT * FROM tipos_violencia WHERE activo=1 ORDER BY id_tipo_violencia")})

@app.get("/api/estados-reporte")
def report_states():
    return jsonify({"estados": many("SELECT * FROM estados_reporte ORDER BY id_estado")})

RECEIVED, REVIEW, REFERRED, CLOSED, REFERRAL_REVIEW, RETURNED, REPLY, ATTENDED = range(1, 9)


def input_text(item, key, limit):
    value = item.get(key)
    return value.strip() if isinstance(value, str) and 0 < len(value.strip()) <= limit else ""


def staff_credentials(item):
    name = input_text(item, "nombre", 150)
    email = input_text(item, "correo", 150).lower()
    password = item.get("contrasena")
    if (name and re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email)
            and isinstance(password, str) and 12 <= len(password) <= 128):
        return name, email, generate_password_hash(password)
    return None


@app.post("/api/auth/autoridad")
def authority_login():
    return authenticate("autoridades", "id_autoridad")


@app.post("/api/auth/autoridades/registro")
def authority_registration():
    item = request.form
    institution = input_text(item, "institucion", 150)
    position = input_text(item, "cargo", 150)
    role = item.get("tipo_autoridad")
    violence_type = item.get("id_tipo_violencia", type=int)
    if role == "orientador":
        violence_type = None
    elif role != "especialista" or violence_type is None or not one(
        "SELECT 1 FROM tipos_violencia WHERE activo=1 AND id_tipo_violencia=%s", (violence_type,)
    ):
        return fail("Selecciona el tipo de autoridad y, si corresponde, el tipo de violencia.")
    credentials = staff_credentials(item)
    proof = request.files.get("comprobante")
    if not credentials or not institution or not position:
        return fail("Completa los datos y usa una contraseña de 12 a 128 caracteres.")
    if not proof or not proof.filename or len(proof.filename) > 255 or not proof.filename.lower().endswith(".pdf"):
        return fail("Adjunta un nombramiento o carta oficial en PDF.")
    content = proof.read(5 * 1024 * 1024 + 1)
    if len(content) > 5 * 1024 * 1024:
        return fail("El comprobante admite hasta 5 MB.", 413)
    if not content.startswith(b"%PDF-") or b"%%EOF" not in content[-1024:]:
        return fail("El comprobante debe estar en formato PDF.")
    filename = secure_filename(proof.filename)
    if not filename.lower().endswith(".pdf"):
        filename = "comprobante.pdf"
    name, email, password_hash = credentials
    existing = one(
        "SELECT a.id_autoridad,a.activo,a.contrasena_hash "
        "FROM autoridades a "
        "WHERE a.correo=%s FOR UPDATE OF a", (email,),
    )
    if existing:
        if existing["activo"] == 1 or not check_password_hash(existing["contrasena_hash"], item["contrasena"]):
            return fail("Ya existe una cuenta de autoridad con ese correo.", 409)
        authority_id = existing["id_autoridad"]
        run("UPDATE autoridades SET nombre=%s,institucion=%s,cargo=%s,tipo_autoridad=%s,"
            "id_tipo_violencia=%s,activo=0 WHERE id_autoridad=%s",
            (name, institution, position, role, violence_type, authority_id))
        run("DELETE FROM sesiones WHERE id_autoridad=%s", (authority_id,))
    else:
        authority_id = one(
            "INSERT INTO autoridades (nombre,correo,contrasena_hash,institucion,cargo,"
            "tipo_autoridad,id_tipo_violencia) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id_autoridad",
            (name, email, password_hash, institution, position, role, violence_type),
        )["id_autoridad"]
    run("INSERT INTO comprobantes_autoridad (id_autoridad,nombre,contenido) VALUES (%s,%s,%s) "
        "ON CONFLICT (id_autoridad) DO UPDATE SET nombre=EXCLUDED.nombre,contenido=EXCLUDED.contenido,"
        "fecha=CURRENT_TIMESTAMP,revisado_por=NULL,fecha_revision=NULL,observaciones=NULL",
        (authority_id, filename, content))
    g.db.commit()
    return jsonify({"mensaje": "Solicitud en revisión. Podrás iniciar sesión cuando un administrador valide tu comprobante."}), 201


@app.get("/api/canalizacion/autoridades")
@admin_required
def review_authorities():
    return jsonify({"autoridades": many(
        "SELECT a.id_autoridad,a.nombre,a.correo,a.institucion,a.cargo,a.tipo_autoridad,t.nombre AS violencia,"
        "p.nombre AS comprobante,p.fecha::text AS fecha_comprobante "
        "FROM autoridades a LEFT JOIN tipos_violencia t USING (id_tipo_violencia) "
        "LEFT JOIN comprobantes_autoridad p USING (id_autoridad) WHERE a.activo=0 ORDER BY a.id_autoridad"
    )})


@app.get("/api/canalizacion/autoridades/<int:authority_id>/comprobante")
@admin_required
def download_authority_proof(authority_id):
    proof = one("SELECT nombre,contenido FROM comprobantes_autoridad WHERE id_autoridad=%s", (authority_id,))
    if not proof:
        return fail("No hay comprobante para esta solicitud.", 404)
    response = send_file(io.BytesIO(proof["contenido"]), mimetype="application/octet-stream",
                         as_attachment=True, download_name=proof["nombre"])
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.patch("/api/canalizacion/autoridades/<int:authority_id>")
@admin_required
def decide_authority(authority_id):
    item = data()
    approve = item.get("aprobar")
    if type(approve) is not bool:
        return fail("Indica si apruebas el acceso.")
    pending = one("SELECT id_autoridad FROM autoridades WHERE id_autoridad=%s AND activo=0 FOR UPDATE", (authority_id,))
    if not pending:
        return fail("La solicitud ya fue revisada o no existe.", 409)
    if approve and not (item.get("comprobante_validado") is True and one(
        "SELECT 1 FROM comprobantes_autoridad WHERE id_autoridad=%s AND fecha::text=%s",
        (authority_id, input_text(item, "version_comprobante", 80)),
    )):
        return fail("Verifica el comprobante antes de aprobar el acceso.", 409)
    reason = input_text(item, "observaciones", 2000)
    run("UPDATE autoridades SET activo=%s WHERE id_autoridad=%s", (1 if approve else -1, authority_id))
    run("UPDATE comprobantes_autoridad SET revisado_por=%s,fecha_revision=CURRENT_TIMESTAMP,observaciones=%s "
        "WHERE id_autoridad=%s", (g.admin_id, reason or None, authority_id))
    g.db.commit()
    return jsonify({"ok": True})


@app.post("/api/canalizacion/administradores")
@admin_required
def add_administrator():
    credentials = staff_credentials(data())
    if not credentials:
        return fail("Escribe un nombre, un correo válido y una contraseña de 12 a 128 caracteres.")
    folio = "ADM-" + secrets.token_hex(16).upper()
    run("INSERT INTO administradores (nombre,correo,contrasena_hash,folio_hash) VALUES (%s,%s,%s,%s)",
        (*credentials, token_hash(folio)))
    g.db.commit()
    return jsonify({"folio": folio}), 201


@app.get("/api/canalizacion/administradores")
@admin_required
def list_administrators():
    return jsonify({"administradores": many(
        "SELECT id_administrador,nombre,correo,activo,id_administrador=%s AS cuenta_actual "
        "FROM administradores ORDER BY nombre", (g.admin_id,)
    )})


@app.patch("/api/canalizacion/administradores/<int:admin_id>")
@admin_required
def manage_administrator(admin_id):
    action = data().get("accion")
    if action not in ("desactivar", "renovar_folio"):
        return fail("Selecciona una acción válida.")
    if admin_id == g.admin_id:
        return fail("Otro administrador debe realizar este cambio.", 409)
    # Serialize revocations and recheck the actor after waiting for an in-flight change.
    one("SELECT pg_advisory_xact_lock(892174321)")
    if not current_admin():
        return fail("Se requiere una sesión administrativa activa.", 401)
    target = one("SELECT activo FROM administradores WHERE id_administrador=%s FOR UPDATE", (admin_id,))
    if not target or target["activo"] != 1:
        return fail("La cuenta administrativa no está activa.", 404)
    result = {"ok": True}
    if action == "desactivar":
        run("UPDATE administradores SET activo=0 WHERE id_administrador=%s", (admin_id,))
    else:
        folio = "ADM-" + secrets.token_hex(16).upper()
        run("UPDATE administradores SET folio_hash=%s WHERE id_administrador=%s", (token_hash(folio), admin_id))
        result["folio"] = folio
    run("DELETE FROM sesiones WHERE id_administrador=%s", (admin_id,))
    g.db.commit()
    return jsonify(result)


def authority_required(function):
    @wraps(function)
    def decorated(*args, **kwargs):
        token = bearer()
        authority = token and one(
            "SELECT a.id_autoridad,a.tipo_autoridad,a.id_tipo_violencia FROM autoridades a JOIN sesiones s "
            "USING (id_autoridad) WHERE s.token_hash=%s AND s.expira>CURRENT_TIMESTAMP AND a.activo=1",
            (token_hash(token),),
        )
        if not authority:
            return fail("Inicia sesión como autoridad autorizada.", 401)
        g.authority = authority
        return function(*args, **kwargs)
    return decorated


def authority_scope():
    if g.authority["tipo_autoridad"] == "orientador":
        return "r.ocurrio_en_escuela IS TRUE", ()
    return (
        "EXISTS (SELECT 1 FROM reporte_tipo_violencia t "
        "WHERE t.id_reporte=r.id_reporte AND t.id_tipo_violencia=%s)",
        (g.authority["id_tipo_violencia"],),
    )


def move_report(report_id, state, public_note=None, notice_message=None):
    run("UPDATE reportes SET id_estado=%s WHERE id_reporte=%s", (state, report_id))
    run("INSERT INTO seguimiento_reportes (id_reporte,id_estado,id_administrador,id_autoridad,observaciones,publica) "
        "VALUES (%s,%s,%s,%s,%s,TRUE)",
        (report_id, state, g.get("admin_id"), g.get("authority", {}).get("id_autoridad"), public_note))
    if state != RECEIVED:
        name = one("SELECT nombre FROM estados_reporte WHERE id_estado=%s", (state,))["nombre"]
        notify_reporter(report_id, notice_message or "Estado del reporte · " + name)


def case_violence(report_id):
    return [row["nombre"] for row in many(
        "SELECT t.nombre FROM reporte_tipo_violencia JOIN tipos_violencia t USING (id_tipo_violencia) "
        "WHERE id_reporte=%s ORDER BY t.id_tipo_violencia", (report_id,)
    )]


def case_review(report_id, authority_id=None):
    return one(
        "SELECT valoracion,propuesta,nivel_riesgo,observaciones,prioridad,vence,evaluacion,folio,fecha_evaluacion FROM canalizaciones WHERE id_reporte=%s "
        "AND (%s::bigint IS NULL OR id_autoridad=%s)", (report_id, authority_id, authority_id),
    )


@app.get("/api/autoridad/casos")
@authority_required
def authority_cases():
    scope, params = authority_scope()
    return jsonify({"casos": many(
        "SELECT r.id_reporte,r.folio,r.fecha_registro,r.ocurrio_en_escuela,e.nombre AS estado "
        "FROM reportes r LEFT JOIN estados_reporte e USING (id_estado) WHERE "
        + scope + " ORDER BY r.id_reporte DESC", params,
    )})


@app.post("/api/autoridad/casos/<int:report_id>/abrir")
@authority_required
def open_authority_case(report_id):
    scope, params = authority_scope()
    report = one("SELECT r.* FROM reportes r WHERE r.id_reporte=%s AND " + scope + " FOR UPDATE",
                 (report_id, *params))
    if not report:
        return fail("Caso no disponible.", 404)
    state = report["id_estado"]
    if state == RECEIVED:
        state = REVIEW
        move_report(report_id, state)
    authority_id = g.authority["id_autoridad"]
    review = case_review(report_id, authority_id)
    case = report_json(report)
    detail = case.get("detalle")
    permitted_detail = ({key: detail.get(key) for key in DETAIL_FIELDS}
                        if isinstance(detail, dict) else {"descripcion": case["descripcion"]})
    result = dict(folio=case["folio"], detalle=permitted_detail, tipos=case_violence(report_id),
                  evidencias=case_files(report_id),
                  personas=many("SELECT tipo_participacion,nombre,descripcion FROM personas_involucradas "
                                "WHERE id_reporte=%s ORDER BY id_persona", (report_id,)),
                  ampliaciones=many("SELECT detalle,fecha FROM bitacora_casos WHERE id_reporte=%s "
                                    "AND clase='ampliacion' ORDER BY id_evento", (report_id,)),
                  actividades=case_tasks(report_id, authority_id),
                  abierta=state not in (CLOSED, ATTENDED),
                  atenciones=many("SELECT detalle,fecha FROM bitacora_casos WHERE id_reporte=%s "
                                  "AND clase='atencion' AND id_autoridad=%s ORDER BY fecha,id_evento",
                                  (report_id, authority_id)),
                  responsable=case["responsable_id"] == authority_id and state not in (CLOSED, ATTENDED),
                  ocurrio_en_escuela=case["ocurrio_en_escuela"], evaluacion=review,
                  estado=one("SELECT nombre FROM estados_reporte WHERE id_estado=%s", (state,)),
                  puede_enviar=state == REVIEW or (state == RETURNED and review is not None))
    if result["estado"]:
        result["estado"] = result["estado"]["nombre"]
    g.db.commit()
    return jsonify({"caso": result})


@app.post("/api/autoridad/casos/<int:report_id>/enviar")
@authority_required
def send_authority_case(report_id):
    item = data()
    assessment = input_text(item, "valoracion", 8000)
    proposal = input_text(item, "propuesta", 8000)
    risk = item.get("nivel_riesgo")
    priority = item.get("prioridad")
    factors = input_text(item, "factores", 8000)
    level = item.get("nivel_atencion")
    enough = item.get("informacion_suficiente")
    immediate = item.get("riesgo_inmediato")
    if (not assessment or not proposal or risk not in RISKS[1:] or priority not in ("Normal", "Alta", "Urgente")
            or not factors or level not in ("Escolar", "Especializada", "Institucional")
            or type(enough) is not bool or type(immediate) is not bool):
        return fail("Completa todos los campos de evaluación, atención y prioridad.")
    evaluation = {
        "factores": factors, "nivel_atencion": level, "informacion_suficiente": enough,
        "riesgo_inmediato": immediate, "observaciones_evaluacion": input_text(item, "observaciones_evaluacion", 8000),
    }
    if not enough and not input_text(item, "solicitud_datos", 1000):
        return fail("Indica qué datos faltan para continuar.")
    scope, params = authority_scope()
    report = one("SELECT r.id_estado FROM reportes r WHERE r.id_reporte=%s AND " + scope + " FOR UPDATE",
                 (report_id, *params))
    if not report:
        return fail("Caso no disponible.", 404)
    authority_id = g.authority["id_autoridad"]
    if report["id_estado"] not in (REVIEW, RETURNED) or (
        report["id_estado"] == RETURNED and not case_review(report_id, authority_id)
    ):
        return fail("El caso no admite otro envío en este momento.", 409)
    days = {"Normal": 7, "Alta": 3, "Urgente": 1}[priority]
    run("INSERT INTO canalizaciones (id_reporte,id_autoridad,valoracion,propuesta,nivel_riesgo,"
        "folio,prioridad,vence,evaluacion,fecha_evaluacion) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,CURRENT_DATE+%s,%s,CURRENT_TIMESTAMP) "
        "ON CONFLICT (id_reporte) DO UPDATE SET valoracion=EXCLUDED.valoracion,propuesta=EXCLUDED.propuesta,"
        "nivel_riesgo=EXCLUDED.nivel_riesgo,prioridad=EXCLUDED.prioridad,vence=EXCLUDED.vence,"
        "evaluacion=EXCLUDED.evaluacion,fecha_evaluacion=EXCLUDED.fecha_evaluacion,"
        "id_autoridad=EXCLUDED.id_autoridad,id_administrador=NULL,observaciones=NULL,"
        "fecha_actualizacion=CURRENT_TIMESTAMP",
        (report_id, authority_id, assessment, proposal, risk, "CAN-" + secrets.token_hex(12).upper(),
         priority, days, Jsonb(evaluation)))
    record_event(report_id, "evaluacion", assessment)
    if not enough:
        extra = input_text(item, "solicitud_datos", 1000)
        notify_reporter(report_id, "Se requiere información adicional. Consulta el folio.")
        run("INSERT INTO seguimiento_reportes (id_reporte,id_estado,id_autoridad,observaciones,publica) "
            "VALUES (%s,%s,%s,%s,TRUE)", (report_id, report["id_estado"], authority_id, extra))
    else:
        move_report(report_id, REFERRAL_REVIEW)
    g.db.commit()
    return jsonify({"ok": True})


@app.get("/api/canalizacion")
@admin_required
def referrals():
    cases = many(
        "SELECT r.id_reporte,r.folio,e.nombre AS estado,r.id_estado,r.ocurrio_en_escuela,"
        "c.valoracion,c.propuesta,c.nivel_riesgo,c.observaciones,c.id_administrador,a.nombre AS autoridad,"
        "c.folio AS folio_canalizacion,c.prioridad,c.vence,c.evaluacion,c.fecha_evaluacion "
        "FROM canalizaciones c JOIN reportes r USING (id_reporte) JOIN estados_reporte e USING (id_estado) "
        "JOIN autoridades a USING (id_autoridad) WHERE c.evaluacion->>'informacion_suficiente' IS DISTINCT FROM 'false' "
        "ORDER BY c.fecha_actualizacion DESC"
    )
    for case in cases:
        report_id = case["id_reporte"]
        case["tipos"] = case_violence(report_id)
        case["evidencias"] = case_files(report_id)
        case["historial"] = many("SELECT e.nombre AS estado,s.fecha_actualizacion FROM seguimiento_reportes s "
                                 "JOIN estados_reporte e USING (id_estado) WHERE s.id_reporte=%s ORDER BY s.id_seguimiento",
                                 (report_id,))
        case["envios"] = many(
            "SELECT i.id_institucion,i.nombre,m.estado,m.fecha,m.vigente FROM envios_correo m "
            "JOIN instituciones i USING (id_institucion) WHERE id_reporte=%s ORDER BY i.nombre",
            (report_id,),
        )
        case["respuestas"] = many(
            "SELECT i.nombre,r.mensaje,r.resumen_publico,r.fecha FROM respuestas_instituciones r "
            "JOIN instituciones i USING (id_institucion) WHERE id_reporte=%s ORDER BY r.id_respuesta DESC",
            (report_id,),
        )
    return jsonify({"casos": cases, "instituciones": many(
        "SELECT id_institucion,nombre,correo,telefono,direccion FROM instituciones WHERE activa=1 ORDER BY nombre"
    )})


def mail_configured():
    return bool(os.getenv("CENTINELA_SMTP_FROM") and (
        os.getenv("CENTINELA_RESEND_API_KEY") or os.getenv("CENTINELA_SMTP_HOST")
    ))


def send_referral_email(report_id, delivery):
    host, sender = os.getenv("CENTINELA_SMTP_HOST"), os.getenv("CENTINELA_SMTP_FROM")
    if not mail_configured():
        raise ValueError("Falta la configuración del correo")
    message = EmailMessage()
    message["From"], message["To"] = sender, delivery["correo"]
    message["Subject"] = f"Solicitud de orientación institucional CD-{report_id}"
    message.set_content(
        f"Solicitamos orientación sobre {', '.join(case_violence(report_id))} "
        f"para la referencia institucional CD-{report_id}.\n"
        "Responda a este correo con los pasos para recibir atención."
    )
    deliver_email(host, message)


def deliver_email(host, message):
    api_key = os.getenv("CENTINELA_RESEND_API_KEY")
    if api_key:
        payload = {"from": str(message["From"]), "to": [str(message["To"])],
                   "subject": str(message["Subject"]), "text": message.get_content()}
        outgoing = Request(
            "https://api.resend.com/emails", data=json.dumps(payload).encode("utf-8"), method="POST",
            headers={"Authorization": "Bearer " + api_key, "Content-Type": "application/json",
                     "User-Agent": "CentinelaDigital/1"},
        )
        with urlopen(outgoing, timeout=8) as response:
            response.read()
        return
    with smtplib.SMTP(host, int(os.getenv("CENTINELA_SMTP_PORT", "587")), timeout=8) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        if os.getenv("CENTINELA_SMTP_USER"):
            smtp.login(os.environ["CENTINELA_SMTP_USER"], os.environ["CENTINELA_SMTP_PASSWORD"])
        smtp.send_message(message)


@app.post("/api/canalizacion/<int:report_id>/decision")
@admin_required
def decide_referral(report_id):
    action = data().get("accion")
    if action not in ("aprobar", "devolver"):
        return fail("Selecciona aprobar o devolver.")
    case = one(
        "SELECT r.id_estado,c.nivel_riesgo,c.id_administrador FROM reportes r JOIN canalizaciones c "
        "USING (id_reporte) WHERE r.id_reporte=%s FOR UPDATE OF r", (report_id,),
    )
    if not case or case["id_estado"] != REFERRAL_REVIEW:
        return fail("La canalización no está pendiente de revisión.", 409)
    if action == "devolver":
        if case["id_administrador"] is not None:
            return fail("Los envíos ya iniciaron. Reintenta los correos pendientes.", 409)
        notes = input_text(data(), "observaciones", 8000)
        if not notes:
            return fail("Escribe las observaciones para la autoridad.")
        run("UPDATE canalizaciones SET observaciones=%s,id_administrador=%s,"
            "fecha_actualizacion=CURRENT_TIMESTAMP WHERE id_reporte=%s", (notes, g.admin_id, report_id))
        move_report(report_id, RETURNED)
        g.db.commit()
        return jsonify({"ok": True})

    if not mail_configured():
        return fail("Configura el correo antes de aprobar la canalización.", 503)
    if case["id_administrador"] is None:
        destinations = many(
            "SELECT DISTINCT i.id_institucion,i.correo FROM reporte_tipo_violencia t "
            "JOIN canalizacion_tipos c USING (id_tipo_violencia) JOIN instituciones i USING (id_institucion) "
            "WHERE t.id_reporte=%s AND i.activa=1 AND NULLIF(TRIM(i.correo),'') IS NOT NULL", (report_id,),
        )
        institution_ids = data().get("instituciones")
        if institution_ids is not None:
            if (not isinstance(institution_ids, list) or not 1 <= len(institution_ids) <= 10
                    or any(type(value) is not int for value in institution_ids)):
                return fail("Selecciona de una a diez instituciones activas.")
            destinations = many(
                "SELECT id_institucion,correo FROM instituciones WHERE activa=1 "
                "AND NULLIF(TRIM(correo),'') IS NOT NULL AND id_institucion=ANY(%s)", (institution_ids,),
            )
            if len(destinations) != len(set(institution_ids)):
                return fail("Cada institución elegida debe estar activa y tener correo.")
        if not destinations:
            return fail("Configura una institución activa con correo para el tipo de violencia.", 409)
        for destination in destinations:
            run("INSERT INTO envios_correo (id_reporte,id_institucion,correo) VALUES (%s,%s,%s)",
                (report_id, destination["id_institucion"], destination["correo"].strip()))
        run("UPDATE canalizaciones SET id_administrador=%s,fecha_actualizacion=CURRENT_TIMESTAMP "
            "WHERE id_reporte=%s", (g.admin_id, report_id))
        g.db.commit()

    return dispatch_referral(report_id, case["nivel_riesgo"])


def dispatch_referral(report_id, risk):
    pending = many("SELECT id_institucion FROM envios_correo WHERE id_reporte=%s AND vigente AND estado<>'enviado'",
                   (report_id,))
    for institution in pending:
        delivery = one("SELECT * FROM envios_correo WHERE id_reporte=%s AND id_institucion=%s "
                       "AND vigente AND estado<>'enviado' FOR UPDATE", (report_id, institution["id_institucion"]))
        if delivery:
            try:
                send_referral_email(report_id, delivery)
                status = "enviado"
            except (OSError, ValueError, KeyError):
                status = "fallido"
                app.logger.warning("Falló el envío de la canalización %s a institución %s",
                                   report_id, delivery["id_institucion"])
            run("UPDATE envios_correo SET estado=%s,fecha=CURRENT_TIMESTAMP "
                "WHERE id_reporte=%s AND id_institucion=%s", (status, report_id, delivery["id_institucion"]))
        g.db.commit()
    report = one("SELECT id_estado FROM reportes WHERE id_reporte=%s FOR UPDATE", (report_id,))
    if one("SELECT 1 FROM envios_correo WHERE id_reporte=%s AND vigente AND estado<>'enviado'", (report_id,)):
        return fail("Quedan correos sin enviar. Revisa la configuración de correo y reintenta desde el panel.", 502)
    if report["id_estado"] == REFERRAL_REVIEW:
        run("UPDATE reportes SET nivel_riesgo=%s WHERE id_reporte=%s", (risk, report_id))
        move_report(report_id, REFERRED)
    g.db.commit()
    return jsonify({"ok": True})


@app.post("/api/canalizacion/<int:report_id>/respuestas")
@admin_required
def add_institution_reply(report_id):
    item = data()
    institution = item.get("id_institucion")
    message = input_text(item, "mensaje", 8000)
    summary = input_text(item, "resumen_publico", 8000)
    if type(institution) is not int or not message or not summary:
        return fail("Selecciona la institución y completa el mensaje y su resumen público.")
    case = one("SELECT id_estado FROM reportes WHERE id_reporte=%s FOR UPDATE", (report_id,))
    if not case or case["id_estado"] not in (REFERRED, REPLY):
        return fail("El caso debe estar canalizado y seguir abierto.", 409)
    if not one("SELECT 1 FROM envios_correo WHERE id_reporte=%s AND id_institucion=%s AND estado='enviado' AND vigente",
               (report_id, institution)):
        return fail("Selecciona una institución a la que se envió el correo.")
    run("INSERT INTO respuestas_instituciones (id_reporte,id_institucion,id_administrador,mensaje,resumen_publico) "
        "VALUES (%s,%s,%s,%s,%s)", (report_id, institution, g.admin_id, message, summary))
    run("UPDATE reportes SET respuesta_institucion=%s WHERE id_reporte=%s", (summary, report_id))
    move_report(report_id, REPLY, summary)
    g.db.commit()
    return jsonify({"ok": True}), 201


@app.post("/api/canalizacion/<int:report_id>/atendido")
@admin_required
def finish_referral(report_id):
    case = one("SELECT id_estado FROM reportes WHERE id_reporte=%s FOR UPDATE", (report_id,))
    if not case or case["id_estado"] != REPLY:
        return fail("Registra una respuesta institucional antes de cerrar el seguimiento.", 409)
    return close_case(report_id, ATTENDED)


def notify_reporter(report_id, message):
    run("INSERT INTO avisos (id_reporte,id_usuario,mensaje,correo_estado) "
        "SELECT id_reporte,id_usuario,%s,'pendiente' FROM reportes "
        "WHERE id_reporte=%s AND es_anonimo=0 AND id_usuario IS NOT NULL", (message, report_id))


@app.cli.command("enviar-avisos")
def send_queued_notices():
    """Entrega un lote de avisos de seguimiento a reportantes registrados."""
    host, sender = os.getenv("CENTINELA_SMTP_HOST"), os.getenv("CENTINELA_SMTP_FROM")
    if not mail_configured():
        raise RuntimeError("Configura el remitente y un proveedor de correo.")
    with db_connection() as db:
        for _ in range(50):
            row = db.execute(
                "SELECT a.id_aviso,a.mensaje,u.correo,r.folio FROM avisos a JOIN usuarios u USING (id_usuario) "
                "JOIN reportes r USING (id_reporte) WHERE u.activo=1 AND a.correo_estado IN ('pendiente','fallido') "
                "AND a.proximo_envio<=CURRENT_TIMESTAMP ORDER BY a.id_aviso LIMIT 1 FOR UPDATE OF a SKIP LOCKED"
            ).fetchone()
            if not row:
                break
            message = EmailMessage()
            try:
                message["From"], message["To"] = sender, row["correo"]
                message["Subject"] = "Actualización de Centinela Digital"
                message.set_content(row["mensaje"] + "\nConsulta tu reporte con el folio " + row["folio"] + ".")
                deliver_email(host, message)
                state = "enviado"
            except (OSError, ValueError, KeyError):
                state = "fallido"
            db.execute("UPDATE avisos SET correo_estado=%s,intentos=intentos+1,"
                       "proximo_envio=CURRENT_TIMESTAMP+interval '1 hour' WHERE id_aviso=%s",
                       (state, row["id_aviso"]))
            db.commit()


def record_event(report_id, kind, description):
    return one(
        "INSERT INTO bitacora_casos (id_reporte,id_administrador,id_autoridad,clase,detalle) "
        "VALUES (%s,%s,%s,%s,%s) RETURNING id_evento",
        (report_id, g.get("admin_id"), g.get("authority", {}).get("id_autoridad"), kind, description),
    )["id_evento"]


def case_files(report_id):
    return many(
        "SELECT id_evidencia,nombre_archivo,tipo_mime,uso,id_evento FROM evidencias "
        "WHERE id_reporte=%s ORDER BY id_evidencia", (report_id,),
    )


def case_tasks(report_id=None, authority_id=None):
    return many(
        "SELECT t.id_actividad,t.id_reporte,t.responsable_id,t.descripcion,t.vence::text AS vence,"
        "t.recurrencia_dias,t.estado,t.resultado,t.fecha,r.folio,a.nombre AS responsable,"
        "(t.vence<CURRENT_DATE AND t.estado='pendiente') AS vencida, "
        "(t.vence BETWEEN CURRENT_DATE AND CURRENT_DATE+3 AND t.estado='pendiente') AS proxima_a_vencer "
        "FROM actividades_caso t JOIN reportes r USING (id_reporte) JOIN autoridades a "
        "ON a.id_autoridad=t.responsable_id WHERE t.estado<>'eliminada' "
        "AND (%s::bigint IS NULL OR t.id_reporte=%s) AND (%s::bigint IS NULL OR t.responsable_id=%s) "
        "ORDER BY t.vence,t.id_actividad",
        (report_id, report_id, authority_id, authority_id),
    )


def lock_case(report_id):
    return one("SELECT * FROM reportes WHERE id_reporte=%s FOR UPDATE", (report_id,))


def authorized_case_worker(report_id):
    admin = current_admin()
    if admin:
        g.admin_id = admin["id_administrador"]
        return lock_case(report_id)
    authority = one(
        "SELECT a.id_autoridad,a.tipo_autoridad,a.id_tipo_violencia FROM autoridades a JOIN sesiones s "
        "USING (id_autoridad) WHERE s.token_hash=%s AND s.expira>CURRENT_TIMESTAMP AND a.activo=1",
        (token_hash(bearer()),),
    )
    if not authority:
        return None
    g.authority = authority
    scope, params = authority_scope()
    return one("SELECT r.* FROM reportes r WHERE r.id_reporte=%s AND " + scope
               + " AND (r.responsable_id=%s OR EXISTS (SELECT 1 FROM actividades_caso a "
                 "WHERE a.id_reporte=r.id_reporte AND a.responsable_id=%s AND a.estado='pendiente')) FOR UPDATE",
               (report_id, *params, authority["id_autoridad"], authority["id_autoridad"]))


def active_authority_for_case(report_id, authority_id):
    if type(authority_id) is not int:
        return None
    return one(
        "SELECT a.id_autoridad,a.nombre FROM autoridades a CROSS JOIN reportes r WHERE a.activo=1 "
        "AND r.id_reporte=%s AND a.id_autoridad=%s AND ((a.tipo_autoridad='orientador' AND r.ocurrio_en_escuela IS TRUE) "
        "OR (a.tipo_autoridad='especialista' AND EXISTS (SELECT 1 FROM reporte_tipo_violencia t "
        "WHERE t.id_reporte=r.id_reporte AND t.id_tipo_violencia=a.id_tipo_violencia)))", (report_id, authority_id),
    )


@app.get("/api/expedientes")
@admin_required
def list_case_files():
    return jsonify({
        "casos": many(
            "SELECT r.id_reporte,r.folio,r.folio_expediente,r.id_estado,e.nombre AS estado,r.fecha_registro,"
            "((r.fecha_registro AT TIME ZONE current_setting('TimeZone')) AT TIME ZONE 'America/Mexico_City')::date::text AS dia_registro,"
            "r.cierre,r.ocurrio_en_escuela,r.responsable_id,a.nombre AS responsable,c.folio AS folio_canalizacion,"
            "c.prioridad,c.vence,sv.calificacion,ARRAY(SELECT t.id_tipo_violencia FROM reporte_tipo_violencia t "
            "WHERE t.id_reporte=r.id_reporte) AS tipos FROM reportes r LEFT JOIN estados_reporte e USING (id_estado) "
            "LEFT JOIN autoridades a ON a.id_autoridad=r.responsable_id "
            "LEFT JOIN canalizaciones c USING (id_reporte) LEFT JOIN evaluaciones_servicio sv USING (id_reporte) "
            "ORDER BY r.id_reporte DESC"
        ),
        "tipos": many("SELECT id_tipo_violencia,nombre FROM tipos_violencia WHERE activo=1 ORDER BY nombre"),
        "personal": many("SELECT id_autoridad,nombre,tipo_autoridad,id_tipo_violencia FROM autoridades WHERE activo=1 ORDER BY nombre"),
        "actividades": [task for task in case_tasks() if task["estado"] == "pendiente"],
        "avisos": many(
            "SELECT a.mensaje,a.fecha,r.folio FROM avisos a JOIN reportes r USING (id_reporte) "
            "WHERE a.personal ORDER BY a.id_aviso DESC LIMIT 30"
        ),
        "evaluaciones": many(
            "SELECT r.folio,r.cierre,s.calificacion,s.comentario,s.sugerencia,s.categoria,s.fecha "
            "FROM evaluaciones_servicio s JOIN reportes r USING (id_reporte) ORDER BY s.fecha DESC"
        ),
        "cierres": many(
            "SELECT r.folio,c.fecha,e.nombre AS estado,s.calificacion FROM comprobantes_cierre c "
            "JOIN reportes r USING (id_reporte) JOIN estados_reporte e ON e.id_estado=c.id_estado "
            "LEFT JOIN evaluaciones_servicio s ON s.id_reporte=r.id_reporte AND s.fecha>=c.fecha "
            "AND NOT EXISTS (SELECT 1 FROM comprobantes_cierre siguiente WHERE siguiente.id_reporte=c.id_reporte "
            "AND siguiente.fecha>c.fecha AND siguiente.fecha<=s.fecha) ORDER BY c.fecha DESC"
        ),
    })


@app.get("/api/autoridad/avisos")
@authority_required
def authority_notices():
    scope, params = authority_scope()
    return jsonify({"avisos": many(
        "SELECT a.mensaje,a.fecha,r.folio FROM avisos a JOIN reportes r USING (id_reporte) "
        "WHERE a.id_autoridad=%s AND " + scope + " ORDER BY a.id_aviso DESC LIMIT 30",
        (g.authority["id_autoridad"], *params)
    )})


@app.get("/api/expedientes/<int:report_id>")
@admin_required
def case_file(report_id):
    item = one(
        "SELECT r.*,u.nombre AS nombre_reportante,u.correo AS correo_reportante,e.nombre AS estado "
        "FROM reportes r LEFT JOIN usuarios u ON u.id_usuario=r.id_usuario AND r.es_anonimo=0 "
        "LEFT JOIN estados_reporte e USING (id_estado) WHERE r.id_reporte=%s", (report_id,),
    )
    if not item:
        return fail("Expediente no encontrado.", 404)
    return jsonify({
        "caso": report_json(item), "tipos": case_violence(report_id), "evidencias": case_files(report_id),
        "evaluacion": case_review(report_id), "actividades": case_tasks(report_id),
        "personas": many("SELECT tipo_participacion,nombre,descripcion FROM personas_involucradas "
                        "WHERE id_reporte=%s ORDER BY id_persona", (report_id,)),
        "historial": many(
            "SELECT e.nombre AS estado,s.fecha_actualizacion,s.observaciones FROM seguimiento_reportes s "
            "JOIN estados_reporte e USING (id_estado) WHERE s.id_reporte=%s ORDER BY s.id_seguimiento",
            (report_id,),
        ),
        "bitacora": many(
            "SELECT b.id_evento,b.clase,b.detalle,b.fecha,COALESCE(a.nombre,d.nombre) AS autor "
            "FROM bitacora_casos b LEFT JOIN autoridades a USING (id_autoridad) "
            "LEFT JOIN administradores d USING (id_administrador) WHERE b.id_reporte=%s ORDER BY b.id_evento",
            (report_id,),
        ),
    })


@app.post("/api/expedientes")
@admin_required
def create_case_file():
    item = data()
    description = input_text(item, "descripcion", 10000)
    contact = input_text(item, "contacto", 150)
    name = input_text(item, "nombre", 150)
    school = item.get("ocurrio_en_escuela")
    kind = item.get("tipo_violencia")
    if not description or type(school) is not bool or type(kind) is not int or not one(
        "SELECT 1 FROM tipos_violencia WHERE id_tipo_violencia=%s AND activo=1", (kind,)
    ):
        return fail("Completa la narración, el tipo de violencia y el entorno.")
    if bool(name) != bool(contact):
        return fail("Completa el nombre y contacto, o deja ambos campos vacíos.")
    folio = "CD-" + secrets.token_hex(16).upper()
    report_id = run(
        "INSERT INTO reportes (folio,folio_expediente,descripcion,ocurrio_en_escuela,es_anonimo,id_estado,acceso_hash) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (folio, "EXP-" + secrets.token_hex(12).upper(), description, school, int(not name),
         RECEIVED, token_hash(secrets.token_urlsafe(32))),
    )
    run("INSERT INTO reporte_tipo_violencia VALUES (%s,%s)", (report_id, kind))
    if name:
        run("INSERT INTO personas_involucradas (id_reporte,tipo_participacion,nombre,descripcion,interna) "
            "VALUES (%s,%s,%s,%s,TRUE)", (report_id, "afectado", name, contact))
    move_report(report_id, RECEIVED)
    record_event(report_id, "apertura", "Expediente creado por administración.")
    g.db.commit()
    return jsonify({"id_reporte": report_id}), 201


@app.post("/api/expedientes/<int:report_id>/asignar")
@admin_required
def assign_case_file(report_id):
    case = lock_case(report_id)
    authority_id = data().get("responsable_id")
    if not case or case["id_estado"] in (CLOSED, ATTENDED):
        return fail("El expediente debe estar abierto.", 409)
    assignee = active_authority_for_case(report_id, authority_id)
    if not assignee:
        return fail("Selecciona una autoridad autorizada para este caso.")
    run("UPDATE reportes SET responsable_id=%s,folio_expediente=COALESCE(folio_expediente,%s) WHERE id_reporte=%s",
        (authority_id, "EXP-" + secrets.token_hex(12).upper(), report_id))
    record_event(report_id, "asignacion", "Responsable de atención: " + assignee["nombre"])
    run("INSERT INTO avisos (id_reporte,id_autoridad,mensaje) VALUES (%s,%s,%s)",
        (report_id, authority_id, "Se asignó un expediente a tu cuenta."))
    g.db.commit()
    return jsonify({"ok": True})


@app.post("/api/expedientes/<int:report_id>/acciones")
def add_case_action(report_id):
    case = authorized_case_worker(report_id)
    if not case:
        return fail("Expediente no disponible.", 404)
    if case["id_estado"] in (CLOSED, ATTENDED):
        return fail("El expediente está cerrado.", 409)
    item = data()
    kind = item.get("clase")
    note = input_text(item, "detalle", 8000)
    if kind not in ("atencion", "nota", "intervencion", "correccion", "persona") or not note:
        return fail("Selecciona una acción y describe lo sucedido.")
    if kind == "correccion":
        if not g.get("admin_id"):
            return fail("La corrección requiere permiso administrativo.", 403)
        try:
            description = json.loads(case["descripcion"])
        except (TypeError, ValueError):
            description = None
        if isinstance(description, dict):
            description["descripcion"] = note
            note_value = json.dumps(description, ensure_ascii=False)
        else:
            note_value = note
        run("UPDATE reportes SET descripcion=%s WHERE id_reporte=%s", (note_value, report_id))
    if kind == "persona":
        category = item.get("tipo_participacion")
        if category not in ("testigo", "afectado", "otra"):
            return fail("Selecciona el tipo de participación.")
        name = input_text(item, "nombre", 150) if not case["es_anonimo"] else None
        run("INSERT INTO personas_involucradas (id_reporte,tipo_participacion,nombre,descripcion,interna) "
            "VALUES (%s,%s,%s,%s,TRUE)", (report_id, category, name, note))
    event = record_event(report_id, kind, note)
    g.db.commit()
    return jsonify({"id_evento": event}), 201


@app.post("/api/expedientes/<int:report_id>/actividad")
def save_case_activity(report_id):
    case = authorized_case_worker(report_id)
    if not case:
        return fail("Expediente no disponible.", 404)
    if case["id_estado"] in (CLOSED, ATTENDED):
        return fail("El expediente está cerrado.", 409)
    item = data()
    action = item.get("accion")
    activity_id = item.get("id_actividad")
    activity = None
    worker = g.get("authority", {}).get("id_autoridad")
    if action != "crear":
        if type(activity_id) is not int:
            return fail("Selecciona una actividad.")
        activity = one("SELECT * FROM actividades_caso WHERE id_reporte=%s AND id_actividad=%s "
                       "AND estado='pendiente' FOR UPDATE", (report_id, activity_id))
        if not activity or (worker and worker != activity["responsable_id"]):
            return fail("Actividad no disponible.", 404)
    if action in ("crear", "editar"):
        title = input_text(item, "descripcion", 2000)
        owner = worker or item.get("responsable_id")
        recurrence = item.get("recurrencia_dias")
        series_end = item.get("fin_recurrencia")
        try:
            due = date.fromisoformat(item.get("vence"))
            series_end = date.fromisoformat(series_end) if series_end else None
        except (TypeError, ValueError):
            return fail("Escribe una fecha límite válida.")
        if not title or not active_authority_for_case(report_id, owner) or (
            recurrence is not None and (type(recurrence) is not int or not 1 <= recurrence <= 365)
        ):
            return fail("Revisa la actividad, el responsable y la frecuencia.")
        if series_end and (activity or not recurrence or not 0 < (series_end - due).days <= 366):
            return fail("Programa la serie nueva por un periodo de hasta un año después de la primera cita.")
        if activity:
            run("UPDATE actividades_caso SET descripcion=%s,responsable_id=%s,vence=%s,recurrencia_dias=%s "
                "WHERE id_actividad=%s", (title, owner, due, recurrence, activity_id))
        elif series_end:
            run("INSERT INTO actividades_caso (id_reporte,responsable_id,descripcion,vence) "
                "SELECT %s,%s,%s,%s::date + n * %s FROM generate_series(0,%s) AS series(n)",
                (report_id, owner, title, due, recurrence, (series_end - due).days // recurrence))
        else:
            run("INSERT INTO actividades_caso (id_reporte,responsable_id,descripcion,vence,recurrencia_dias) "
                "VALUES (%s,%s,%s,%s,%s)", (report_id, owner, title, due, recurrence))
        if not activity or activity["responsable_id"] != owner:
            run("INSERT INTO avisos (id_reporte,id_autoridad,mensaje) VALUES (%s,%s,%s)",
                (report_id, owner, "Se te asignó una actividad de seguimiento."))
        note = ("Actividad actualizada: " if activity else "Serie programada: " if series_end else "Actividad programada: ") + title
    elif action == "completar":
        result = input_text(item, "resultado", 8000)
        if not result:
            return fail("Registra el resultado de la actividad.")
        run("UPDATE actividades_caso SET estado='completada',resultado=%s WHERE id_actividad=%s", (result, activity_id))
        if activity["recurrencia_dias"]:
            run("INSERT INTO actividades_caso (id_reporte,responsable_id,descripcion,vence,recurrencia_dias) "
                "VALUES (%s,%s,%s,GREATEST(CURRENT_DATE,%s::date)+%s,%s)",
                (report_id, activity["responsable_id"], activity["descripcion"], activity["vence"],
                 activity["recurrencia_dias"], activity["recurrencia_dias"]))
        note = "Actividad completada: " + result
    elif action == "eliminar":
        run("UPDATE actividades_caso SET estado='eliminada' WHERE id_actividad=%s", (activity_id,))
        note = "Actividad cancelada: " + activity["descripcion"]
    else:
        return fail("Acción de actividad inválida.")
    record_event(report_id, "actividad", note)
    g.db.commit()
    return jsonify({"ok": True})


@app.post("/api/expedientes/<int:report_id>/evidencias")
@admin_required
def add_case_evidence(report_id):
    case = lock_case(report_id)
    if not case or case["id_estado"] in (CLOSED, ATTENDED):
        return fail("El expediente debe estar abierto.", 409)
    file = request.files.get("archivo")
    use = request.form.get("uso")
    event_id = request.form.get("id_evento", type=int)
    if not file or len(file.filename) > 255 or use not in ("canalizacion", "expediente", "atencion"):
        return fail("Selecciona un archivo y su destino.")
    if use == "atencion" and not one(
        "SELECT 1 FROM bitacora_casos WHERE id_reporte=%s AND id_evento=%s AND clase='atencion'",
        (report_id, event_id),
    ):
        return fail("Selecciona una atención registrada en este expediente.")
    if use == "canalizacion" and not case_review(report_id):
        return fail("El expediente todavía no tiene canalización.")
    content = file.read(10 * 1024 * 1024 + 1)
    if len(content) > 10 * 1024 * 1024:
        return fail("La evidencia admite hasta 10 MB.", 413)
    run("INSERT INTO evidencias (id_reporte,nombre_archivo,tipo_mime,contenido,uso,id_evento) "
        "VALUES (%s,%s,%s,%s,%s,%s)",
        (report_id, file.filename, file.mimetype, content, use, event_id if use == "atencion" else None))
    record_event(report_id, "evidencia", "Archivo adjunto: " + file.filename)
    g.db.commit()
    return jsonify({"ok": True}), 201


@app.get("/api/autoridad/casos/<int:report_id>/evidencias/<int:evidence_id>")
@authority_required
def authority_evidence(report_id, evidence_id):
    scope, params = authority_scope()
    if not one("SELECT 1 FROM reportes r WHERE r.id_reporte=%s AND " + scope, (report_id, *params)):
        return fail("Evidencia no disponible.", 404)
    return serve_evidence(report_id, evidence_id, True)


def close_case(report_id, target):
    item = data()
    reason = input_text(item, "motivo", 2000)
    result = input_text(item, "resultado", 8000)
    if item.get("confirmar") is not True or not reason or not result:
        return fail("Confirma el cierre y registra el motivo y el resultado.")
    if one("SELECT 1 FROM actividades_caso WHERE id_reporte=%s AND estado='pendiente'", (report_id,)):
        return fail("Completa o cancela las actividades pendientes antes de cerrar.", 409)
    run("UPDATE reportes SET cierre=CURRENT_TIMESTAMP,motivo_cierre=%s,resultado_cierre=%s,"
        "estado_previo_cierre=id_estado WHERE id_reporte=%s", (reason, result, report_id))
    run("INSERT INTO comprobantes_cierre (codigo,id_reporte,id_estado,fecha) "
        "SELECT %s,id_reporte,%s,cierre FROM reportes WHERE id_reporte=%s",
        (secrets.token_hex(24), target, report_id))
    record_event(report_id, "cierre", reason + " · " + result)
    move_report(report_id, target, notice_message=(
        "El caso concluyó. Consulta el comprobante y evalúa la atención desde el seguimiento."
    ))
    g.db.commit()
    return jsonify({"ok": True})


@app.post("/api/expedientes/<int:report_id>/estado")
@admin_required
def operational_state(report_id):
    case = lock_case(report_id)
    if not case:
        return fail("Expediente no encontrado.", 404)
    target = data().get("id_estado")
    if type(target) is not int:
        return fail("Selecciona un estado válido.")
    current = case["id_estado"]
    if target == CLOSED and current in (REPLY, REVIEW, 9):
        return close_case(report_id, CLOSED)
    reason = input_text(data(), "motivo", 2000)
    if not reason:
        return fail("Registra el motivo del cambio.")
    if target == 9 and current in (CLOSED, ATTENDED):
        run("UPDATE reportes SET cierre=NULL WHERE id_reporte=%s", (report_id,))
    elif (current, target) not in ((RECEIVED, REVIEW), (9, REVIEW), (9, REPLY)):
        return fail("Ese cambio no corresponde a la fase del expediente.", 409)
    elif target == REPLY and not case["respuesta_institucion"]:
        return fail("El expediente todavía no tiene respuesta institucional.", 409)
    record_event(report_id, "estatus", reason)
    move_report(report_id, target)
    g.db.commit()
    return jsonify({"ok": True})


def tracking_owner(report):
    if report["es_anonimo"]:
        return True
    user = current_user()
    return user and user["id_usuario"] == report["id_usuario"]


@app.post("/api/reportes/consulta/evaluacion")
def service_feedback():
    item = data()
    folio = input_text(item, "folio", 64).upper()
    score = item.get("calificacion")
    category = item.get("categoria")
    if type(score) is not int or not 1 <= score <= 5 or category not in (
        "Atención", "Tiempo de respuesta", "Comunicación", "Accesibilidad", "Otro"
    ):
        return fail("Selecciona una calificación y una categoría.")
    report = one("SELECT id_reporte,id_usuario,es_anonimo,cierre FROM reportes WHERE folio=%s FOR UPDATE", (folio,))
    if not report or not report["cierre"] or not tracking_owner(report):
        return fail("La evaluación no está disponible.", 404)
    run("INSERT INTO evaluaciones_servicio (id_reporte,calificacion,comentario,sugerencia,categoria) VALUES (%s,%s,%s,%s,%s)",
        (report["id_reporte"], score, input_text(item, "comentario", 4000), input_text(item, "sugerencia", 4000), category))
    g.db.commit()
    return jsonify({"ok": True}), 201


@app.post("/api/canalizacion/<int:report_id>/reasignar")
@admin_required
def reassign_institution(report_id):
    item = data()
    institution = item.get("id_institucion")
    previous = item.get("anterior")
    reason = input_text(item, "motivo", 2000)
    if type(institution) is not int or type(previous) is not int or previous == institution or not reason:
        return fail("Selecciona las instituciones y escribe el motivo de reasignación.")
    if not mail_configured():
        return fail("Configura el correo antes de reasignar.", 503)
    case = lock_case(report_id)
    if not case or case["id_estado"] not in (REFERRED, REPLY):
        return fail("La solicitud debe estar canalizada y abierta.", 409)
    destination = one(
        "SELECT correo,nombre FROM instituciones WHERE id_institucion=%s AND activa=1 "
        "AND NULLIF(TRIM(correo),'') IS NOT NULL", (institution,),
    )
    if not destination or not one("SELECT 1 FROM envios_correo WHERE id_reporte=%s "
                                  "AND id_institucion=%s AND vigente", (report_id, previous)):
        return fail("Selecciona una institución vigente y un nuevo destino activo.")
    if one("SELECT 1 FROM envios_correo WHERE id_reporte=%s AND id_institucion=%s AND vigente", (report_id, institution)):
        return fail("El nuevo destino ya tiene una canalización vigente.", 409)
    run("UPDATE envios_correo SET vigente=FALSE WHERE id_reporte=%s AND id_institucion=%s", (report_id, previous))
    run("INSERT INTO envios_correo (id_reporte,id_institucion,correo) VALUES (%s,%s,%s) "
        "ON CONFLICT (id_reporte,id_institucion) DO UPDATE SET correo=EXCLUDED.correo,estado='pendiente',"
        "fecha=NULL,vigente=TRUE", (report_id, institution, destination["correo"].strip()))
    record_event(report_id, "reasignacion", destination["nombre"] + " · " + reason)
    move_report(report_id, REFERRAL_REVIEW)
    g.db.commit()
    return dispatch_referral(report_id, case["nivel_riesgo"])


@app.post("/api/reportes/consulta/ampliacion")
def add_report_details():
    item = data()
    folio = input_text(item, "folio", 64).upper()
    detail = input_text(item, "detalle", 8000)
    if not detail:
        return fail("Completa la información adicional.")
    report = one("SELECT * FROM reportes WHERE folio=%s FOR UPDATE", (folio,))
    if not report or not tracking_owner(report) or report["id_estado"] not in (REVIEW, RETURNED):
        return fail("La ampliación no está disponible.", 404)
    report_id = report["id_reporte"]
    review = one("SELECT id_autoridad FROM canalizaciones WHERE id_reporte=%s "
                 "AND evaluacion->>'informacion_suficiente'='false'", (report_id,))
    if not review:
        return fail("No hay una solicitud de ampliación pendiente.", 409)
    record_event(report_id, "ampliacion", detail)
    run("INSERT INTO avisos (id_reporte,id_autoridad,mensaje) VALUES (%s,%s,%s)",
        (report_id, review["id_autoridad"], "El reportante agregó información para tu evaluación."))
    g.db.commit()
    return jsonify({"ok": True}), 201


@app.post("/api/expedientes/<int:report_id>/clasificacion")
@admin_required
def classify_case(report_id):
    case = lock_case(report_id)
    if not case or case["id_estado"] not in (RECEIVED, REVIEW):
        return fail("Clasifica el caso antes de enviarlo a canalización.", 409)
    kind = data().get("tipo_violencia")
    if type(kind) is not int or not one("SELECT 1 FROM tipos_violencia WHERE id_tipo_violencia=%s AND activo=1", (kind,)):
        return fail("Selecciona un tipo de violencia válido.")
    run("DELETE FROM reporte_tipo_violencia WHERE id_reporte=%s", (report_id,))
    run("INSERT INTO reporte_tipo_violencia VALUES (%s,%s)", (report_id, kind))
    if case["responsable_id"] and not active_authority_for_case(report_id, case["responsable_id"]):
        run("UPDATE reportes SET responsable_id=NULL WHERE id_reporte=%s", (report_id,))
    record_event(report_id, "clasificacion", "Clasificación: " + ", ".join(case_violence(report_id)))
    g.db.commit()
    return jsonify({"ok": True})


@app.get("/api/comprobantes/<codigo>")
def verify_closure_receipt(codigo):
    if not re.fullmatch(r"[a-f0-9]{48}", codigo):
        return fail("Comprobante no encontrado.", 404)
    item = one("SELECT c.fecha,e.nombre AS estado,RIGHT(r.folio,6) AS terminacion "
               "FROM comprobantes_cierre c JOIN reportes r USING (id_reporte) "
               "JOIN estados_reporte e ON e.id_estado=c.id_estado WHERE c.codigo=%s", (codigo,))
    if not item:
        return fail("Comprobante no encontrado.", 404)
    response = jsonify({"comprobante": item})
    response.headers["Cache-Control"] = "no-store"
    return response


@app.post("/api/canalizacion/instituciones")
@admin_required
def add_referral_institution():
    item = data()
    name = input_text(item, "nombre", 150)
    email = input_text(item, "correo", 150)
    address = input_text(item, "direccion", 255)
    phone = input_text(item, "telefono", 20)
    if not name or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        return fail("Escribe el nombre y el correo oficial de la institución.")
    if one("SELECT 1 FROM instituciones WHERE LOWER(nombre)=LOWER(%s) AND LOWER(correo)=LOWER(%s)", (name, email)):
        return fail("La institución ya está registrada con ese correo.", 409)
    run("INSERT INTO instituciones (nombre,correo,direccion,telefono) VALUES (%s,%s,%s,%s)",
        (name, email, address or None, phone or None))
    g.db.commit()
    return jsonify({"ok": True}), 201


@app.errorhandler(psycopg.errors.UniqueViolation)
def duplicate_record(error):
    g.db.rollback()
    return fail("El registro ya existe.", 409)

@app.errorhandler(psycopg.errors.IntegrityConstraintViolation)
def invalid_relation(error):
    g.db.rollback()
    return fail("Los datos referenciados no son válidos.", 400)

@app.get("/")
def home():
    return redirect("/static/templates/index.html")

@app.get("/<page>.html")
def page(page):
    return send_from_directory(FRONTEND / "templates", page + ".html")

@app.get("/healthz")
def liveness():
    return jsonify({"ok": True, "servicio": "centinela"})

if __name__ == "__main__":
    app.run(host=os.getenv("CENTINELA_API_HOST", "127.0.0.1"), port=int(os.getenv("PORT", os.getenv("CENTINELA_API_PORT", "5000"))), debug=False)

