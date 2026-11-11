"""API de Centinela Digital conectada a MariaDB/MySQL."""
from datetime import datetime
import json, os, secrets
from functools import wraps
from pathlib import Path

import pymysql
from flask import Flask, g, jsonify, request, send_from_directory, redirect
from werkzeug.security import check_password_hash, generate_password_hash

FRONTEND = Path(__file__).resolve().parent.parent / "frontend" / "static"
app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="/static")
app.config["JSON_AS_ASCII"] = False

def db_connection():
    return pymysql.connect(
        host=os.getenv("CENTINELA_DB_HOST", "127.0.0.1"),
        port=int(os.getenv("CENTINELA_DB_PORT", "3306")),
        user=os.getenv("CENTINELA_DB_USER", "root"),
        password=os.getenv("CENTINELA_DB_PASSWORD", ""),
        database=os.getenv("CENTINELA_DB_NAME", "centinela_digital"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
        connect_timeout=10,
        read_timeout=20,
        write_timeout=20,
    )

@app.before_request
def open_db():
    if request.path.startswith("/api/") and request.method != "OPTIONS":
        try:
            g.db = db_connection()
        except pymysql.MySQLError:
            app.logger.exception("No se pudo conectar con MySQL")
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
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Usuario-ID, X-Administrador-ID"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
    return response

@app.route("/api/<path:unused>", methods=["OPTIONS"])
def options(unused):
    return "", 204

def data():
    return request.get_json(silent=True) or {}

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
        cursor.execute(sql, params)
        return cursor.lastrowid

def fail(message, status=400):
    return jsonify({"error": message}), status

def admin_required(function):
    @wraps(function)
    def decorated(*args, **kwargs):
        admin_id = request.headers.get("X-Administrador-ID")
        valid = one(
            "SELECT id_administrador FROM administradores WHERE id_administrador=%s AND activo=1",
            (admin_id,),
        ) if admin_id else None
        if not valid:
            return fail("Se requiere un administrador autenticado.", 401)
        return function(*args, **kwargs)
    return decorated

def report_json(item):
    if not item:
        return None
    result = dict(item)
    for key in ("fecha_hecho", "fecha_registro"):
        if result.get(key):
            result[key] = result[key].isoformat(sep=" ")
    try:
        result["detalle"] = json.loads(result["descripcion"])
    except (KeyError, TypeError, json.JSONDecodeError):
        pass
    return result

@app.get("/api/health")
def health():
    one("SELECT 1")
    return jsonify({"ok": True, "servicio": "Centinela Digital"})

@app.post("/api/auth/registro")
def register():
    item = data()
    if not all(item.get(key) for key in ("nombre", "correo", "contrasena")):
        return fail("nombre, correo y contrasena son obligatorios.")
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
    item = data()
    user = one("SELECT * FROM usuarios WHERE correo=%s AND activo=1", (item.get("correo"),))
    if not user or not check_password_hash(user["contrasena_hash"], item.get("contrasena", "")):
        return fail("Correo o contraseña incorrectos.", 401)
    return jsonify({
        "token": secrets.token_urlsafe(24),
        "usuario": {"id": user["id_usuario"], "nombre": user["nombre"], "correo": user["correo"]},
    })

@app.post("/api/auth/logout")
def logout():
    return jsonify({"ok": True, "mensaje": "Sesión cerrada."})

@app.get("/api/auth/sesion")
def session_info():
    user = one(
        "SELECT id_usuario,nombre,correo,activo FROM usuarios WHERE id_usuario=%s",
        (request.headers.get("X-Usuario-ID"),),
    )
    if not user:
        return fail("Sesión no encontrada.", 401)
    return jsonify({"usuario": user})

@app.patch("/api/usuarios/me")
def update_user():
    user_id, item = request.headers.get("X-Usuario-ID"), data()
    if not user_id:
        return fail("Falta X-Usuario-ID.", 401)
    fields, values = [], []
    for key in ("nombre", "correo"):
        if key in item:
            fields.append(f"{key}=%s")
            values.append(item[key])
    if item.get("contrasena"):
        fields.append("contrasena_hash=%s")
        values.append(generate_password_hash(item["contrasena"]))
    if not fields:
        return fail("No hay cambios para actualizar.")
    values.append(user_id)
    run(f"UPDATE usuarios SET {', '.join(fields)} WHERE id_usuario=%s", values)
    g.db.commit()
    return jsonify({"ok": True})

@app.delete("/api/usuarios/me")
def delete_user():
    user_id = request.headers.get("X-Usuario-ID")
    if not user_id:
        return fail("Falta X-Usuario-ID.", 401)
    run("UPDATE usuarios SET activo=0 WHERE id_usuario=%s", (user_id,))
    g.db.commit()
    return jsonify({"ok": True})

@app.post("/api/reportes")
def create_report():
    item = data()
    detail = item.get("detalle", item.get("descripcion", ""))
    if isinstance(detail, dict):
        detail = json.dumps(detail, ensure_ascii=False)
    if not detail:
        return fail("La descripción del reporte es obligatoria.")
    state = one("SELECT id_estado FROM estados_reporte WHERE nombre=%s LIMIT 1", ("Recibido",))
    folio = f"CD-{datetime.now().year}-{secrets.randbelow(1000000):06d}"
    report_id = run(
        "INSERT INTO reportes (folio,descripcion,fecha_hecho,es_anonimo,id_estado) VALUES (%s,%s,%s,%s,%s)",
        (folio, detail, item.get("fecha_hecho"), int(item.get("es_anonimo", True)), state["id_estado"] if state else None),
    )
    for type_id in item.get("tipos_violencia", []):
        run("INSERT INTO reporte_tipo_violencia (id_reporte,id_tipo_violencia) VALUES (%s,%s)", (report_id, type_id))
    g.db.commit()
    return jsonify({"reporte": {"id_reporte": report_id, "folio": folio}}), 201

@app.get("/api/reportes")
@admin_required
def list_reports():
    reports = many("SELECT * FROM reportes ORDER BY fecha_registro DESC")
    return jsonify({"reportes": [report_json(item) for item in reports]})

@app.get("/api/reportes/<int:report_id>")
def get_report(report_id):
    item = one("SELECT * FROM reportes WHERE id_reporte=%s", (report_id,))
    if not item:
        return fail("Reporte no encontrado.", 404)
    return jsonify({"reporte": report_json(item)})

@app.patch("/api/reportes/<int:report_id>")
@admin_required
def update_report(report_id):
    item, fields, values = data(), [], []
    for key in ("descripcion", "fecha_hecho", "es_anonimo", "id_estado"):
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
def report_tracking(report_id):
    items = many(
        "SELECT s.id_seguimiento,s.id_reporte,s.observaciones,s.fecha_actualizacion,e.id_estado,e.nombre AS estado "
        "FROM seguimiento_reportes s JOIN estados_reporte e ON e.id_estado=s.id_estado "
        "WHERE s.id_reporte=%s ORDER BY s.fecha_actualizacion DESC",
        (report_id,),
    )
    return jsonify({"seguimiento": items})

@app.post("/api/reportes/<int:report_id>/seguimiento")
@admin_required
def add_tracking(report_id):
    item = data()
    if not item.get("id_estado"):
        return fail("id_estado es obligatorio.")
    if not one("SELECT id_reporte FROM reportes WHERE id_reporte=%s", (report_id,)):
        return fail("Reporte no encontrado.", 404)
    tracking_id = run(
        "INSERT INTO seguimiento_reportes (id_reporte,id_estado,id_administrador,observaciones) VALUES (%s,%s,%s,%s)",
        (report_id, item["id_estado"], request.headers.get("X-Administrador-ID"), item.get("observaciones")),
    )
    run("UPDATE reportes SET id_estado=%s WHERE id_reporte=%s", (item["id_estado"], report_id))
    g.db.commit()
    return jsonify({"id_seguimiento": tracking_id}), 201

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
def upload_evidence(report_id):
    if not one("SELECT id_reporte FROM reportes WHERE id_reporte=%s", (report_id,)):
        return fail("Reporte no encontrado.", 404)
    file = request.files.get("archivo")
    if not file or not file.filename:
        return fail("Debe adjuntarse un archivo.")
    directory = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(directory, exist_ok=True)
    safe_name = f"{secrets.token_hex(8)}_{os.path.basename(file.filename)}"
    file.save(os.path.join(directory, safe_name))
    evidence_id = run(
        "INSERT INTO evidencias (id_reporte,nombre_archivo,ruta_archivo,tipo_mime) VALUES (%s,%s,%s,%s)",
        (report_id, file.filename, safe_name, file.mimetype),
    )
    g.db.commit()
    return jsonify({"id_evidencia": evidence_id, "nombre_archivo": file.filename}), 201

@app.get("/api/reportes/<int:report_id>/evidencias")
def list_evidence(report_id):
    return jsonify({"evidencias": many("SELECT * FROM evidencias WHERE id_reporte=%s ORDER BY fecha_subida DESC", (report_id,))})

@app.delete("/api/reportes/<int:report_id>/evidencias/<int:evidence_id>")
@admin_required
def delete_evidence(report_id, evidence_id):
    run("DELETE FROM evidencias WHERE id_evidencia=%s AND id_reporte=%s", (evidence_id, report_id))
    g.db.commit()
    return jsonify({"ok": True})

@app.post("/api/reportes/<int:report_id>/personas")
def add_person(report_id):
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
def list_people(report_id):
    return jsonify({"personas": many("SELECT * FROM personas_involucradas WHERE id_reporte=%s", (report_id,))})

@app.patch("/api/reportes/<int:report_id>/personas/<int:person_id>")
def update_person(report_id, person_id):
    item = data()
    run(
        "UPDATE personas_involucradas SET tipo_participacion=%s,nombre=%s,descripcion=%s WHERE id_persona=%s AND id_reporte=%s",
        (item.get("tipo_participacion"), item.get("nombre"), item.get("descripcion"), person_id, report_id),
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
        "SELECT * FROM instituciones WHERE activa=1 AND (nombre LIKE %s OR municipio LIKE %s OR descripcion LIKE %s) ORDER BY nombre",
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
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", os.getenv("CENTINELA_API_PORT", "5000"))), debug=False)

