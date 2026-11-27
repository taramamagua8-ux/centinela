"""Integration tests. Run only against a disposable local PostgreSQL database."""
import io
import os
import unittest
from urllib.parse import urlparse
from unittest.mock import patch

from werkzeug.security import generate_password_hash

import psycopg

url = os.environ.get('DATABASE_URL', '')
if urlparse(url).hostname not in ('localhost', '127.0.0.1'):
    raise RuntimeError('Use a disposable local database for integration tests.')

from backend.database import connect, initialize
from backend.main import app, token_hash


class IntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with psycopg.connect(url) as db:
            db.execute('DROP SCHEMA IF EXISTS centinela CASCADE')
        initialize()
        initialize()
        app.config['TESTING'] = True

    def setUp(self):
        self.client = app.test_client()

    def test_institutional_case_lifecycle(self):
        c = self.client
        password = "password-para-prueba"
        with connect() as db:
            db.execute("INSERT INTO administradores (nombre,correo,contrasena_hash,folio_hash) VALUES (%s,%s,%s,%s)",
                       ("Admin prueba", "admin@example.invalid", generate_password_hash(password), token_hash("ADM-PRUEBA")))
            destinations = [db.execute("INSERT INTO instituciones (nombre,correo) VALUES (%s,%s) RETURNING id_institucion",
                                       (name, email)).fetchone()["id_institucion"] for name, email in (
                                           ("Institución A", "a@example.invalid"), ("Institución B", "b@example.invalid"))]

        def post(path, body=None, headers=None, status=200):
            result = c.post("/api" + path, json=body, headers=headers)
            self.assertEqual(result.status_code, status, result.get_data(as_text=True))
            return result.json

        def auth(role, email, **extra):
            result = post("/auth/" + role, {"correo": email, "contrasena": password, **extra})
            return {"Authorization": "Bearer " + result["token"]}

        def get(path, headers):
            response = c.get("/api" + path, headers=headers)
            self.assertEqual(response.status_code, 200, response.get_data(as_text=True))
            return response.json

        post("/auth/admin", {"correo": "admin@example.invalid", "contrasena": password}, status=401)
        admin = auth("admin", "admin@example.invalid", folio="ADM-PRUEBA")
        extra_admin = post("/canalizacion/administradores", {
            "nombre": "Admin alterno", "correo": "admin2@example.invalid", "contrasena": password,
        }, admin, 201)
        second_admin = auth("admin", "admin2@example.invalid", folio=extra_admin["folio"])
        admins = get("/canalizacion/administradores", admin)["administradores"]
        second_id = next(item["id_administrador"] for item in admins if item["correo"] == "admin2@example.invalid")
        second_path = "/api/canalizacion/administradores/" + str(second_id)
        self.assertEqual(c.patch(second_path, headers=second_admin, json={"accion": "desactivar"}).status_code, 409)
        rotated = c.patch(second_path, headers=admin, json={"accion": "renovar_folio"})
        self.assertEqual(rotated.status_code, 200)
        self.assertEqual(c.get("/api/canalizacion", headers=second_admin).status_code, 401)
        second_admin = auth("admin", "admin2@example.invalid", folio=rotated.json["folio"])
        self.assertEqual(c.patch(second_path, headers=admin, json={"accion": "desactivar"}).status_code, 200)
        self.assertEqual(c.get("/api/canalizacion", headers=second_admin).status_code, 401)
        institution_data = {"nombre": "Institución C", "correo": "c@example.invalid"}
        post("/canalizacion/instituciones", institution_data, status=401)
        post("/canalizacion/instituciones", institution_data, admin, 201)
        with connect() as db:
            replacement = db.execute("SELECT id_institucion FROM instituciones WHERE correo=%s",
                                     (institution_data["correo"],)).fetchone()["id_institucion"]
        post("/canalizacion/instituciones", institution_data, admin, 409)
        staff = {}
        for role in ("orientador", "especialista"):
            email = role + "@example.invalid"
            fields = {"nombre": role, "correo": email, "contrasena": password,
                      "institucion": "Prueba", "cargo": role, "tipo_autoridad": role, "id_tipo_violencia": "2"}
            signup = "/api/auth/autoridades/registro"
            self.assertEqual(c.post(signup, data=fields).status_code, 400)
            proof = b"%PDF-1.4\n%%EOF\n"
            uploaded = c.post(signup, data={**fields, "comprobante": (io.BytesIO(proof), "nombramiento.pdf")})
            self.assertEqual(uploaded.status_code, 201, uploaded.get_data(as_text=True))
            post("/auth/autoridad", {"correo": email, "contrasena": password}, status=401)
            request = get("/canalizacion/autoridades", admin)["autoridades"][0]
            staff[role] = request["id_autoridad"]
            decision = "/api/canalizacion/autoridades/" + str(staff[role])
            self.assertEqual(c.get(decision + "/comprobante").status_code, 401)
            self.assertEqual(c.get(decision + "/comprobante", headers=admin).data, proof)
            self.assertEqual(c.patch(decision, headers=admin, json={"aprobar": True}).status_code, 409)
            self.assertEqual(c.patch(decision, headers=admin,
                                     json={"aprobar": True, "comprobante_validado": True,
                                           "version_comprobante": request["fecha_comprobante"]}).status_code, 200)
        orientation = auth("autoridad", "orientador@example.invalid")
        specialist = auth("autoridad", "especialista@example.invalid")

        def create(school, kind):
            return post("/reportes", {"rol": "victima", "es_anonimo": True, "terminos": True,
                "tipo_violencia": kind, "ocurrio_en_escuela": school, "detalle": {
                    "fecha": "2026-11-10", "hora": "11:15", "lugar": "Lugar ficticio",
                    "haOcurrido": "NO", "descripcion": "Descripción ficticia", "huboTestigos": "Sí",
                }}, status=201)["reporte"]

        school = create(True, 1)
        external = create(False, 2)
        self.assertIn(school["folio"], [item["folio"] for item in get("/expedientes", admin)["avisos"]])
        external_path = f"/expedientes/{external['id_reporte']}"
        post(external_path + "/actividad", {"accion": "crear", "descripcion": "Calendario preventivo",
             "responsable_id": staff["especialista"], "vence": "2026-12-01", "recurrencia_dias": 30,
             "fin_recurrencia": "2027-02-01"}, admin)
        self.assertEqual([task["vence"] for task in get(external_path, admin)["actividades"]],
                         ["2026-12-01", "2026-12-31", "2027-01-30"])
        self.assertEqual([x["folio"] for x in get("/autoridad/casos", orientation)["casos"]], [school["folio"]])
        self.assertEqual([x["folio"] for x in get("/autoridad/casos", specialist)["casos"]], [external["folio"]])
        report_id = school["id_reporte"]
        review = f"/autoridad/casos/{report_id}"
        intake = f"/canalizacion/{report_id}"
        case = f"/expedientes/{report_id}"
        post(review + "/abrir", headers=specialist, status=404)
        result = post(review + "/abrir", headers=orientation)
        self.assertEqual(result["caso"]["detalle"]["hora"], "11:15")
        payload = {"valoracion": "Caso ficticio", "propuesta": "Atención de prueba", "nivel_riesgo": "Medio",
                   "prioridad": "Alta", "nivel_atencion": "Escolar", "factores": "Factores ficticios",
                   "informacion_suficiente": False, "riesgo_inmediato": True, "solicitud_datos": "Hora de salida"}
        post(review + "/enviar", payload, orientation)
        folio = {"folio": school["folio"]}
        self.assertTrue(post("/reportes/consulta", folio)["reporte"]["puede_ampliar"])
        post("/reportes/consulta/ampliacion", {**folio, "detalle": "Información de prueba"}, status=201)
        self.assertEqual(len(post(review + "/abrir", headers=orientation)["caso"]["ampliaciones"]), 1)
        payload["informacion_suficiente"] = True
        post(review + "/enviar", payload, orientation)
        referrals = get("/canalizacion", admin)["casos"]
        self.assertTrue(referrals[0]["folio_canalizacion"].startswith("CAN-"))
        self.assertEqual(referrals[0]["prioridad"], "Alta")
        self.assertTrue(referrals[0]["fecha_evaluacion"])
        post(intake + "/decision", {"accion": "devolver", "observaciones": "Revisar datos"}, admin)
        self.assertEqual(post(review + "/abrir", headers=orientation)["caso"]["evaluacion"]["observaciones"], "Revisar datos")
        self.assertNotIn("Revisar datos", str(post("/reportes/consulta", folio)))
        post(review + "/enviar", payload, orientation)
        with patch.dict(os.environ, {"CENTINELA_SMTP_HOST": "example.invalid", "CENTINELA_SMTP_FROM": "alert@example.invalid"}):
            with patch("backend.main.deliver_email", side_effect=[OSError("error simulado"), None, None, None]) as mail:
                approval = {"accion": "aprobar", "instituciones": destinations}
                post(intake + "/decision", approval, admin, 502)
                post(intake + "/decision", approval, admin)
                self.assertEqual(mail.call_count, 3)
                self.assertNotIn("Descripción ficticia", mail.call_args.args[1].get_content())
                self.assertNotIn(school["folio"], mail.call_args.args[1].get_content())

        post(intake + "/respuestas", {"id_institucion": destinations[0], "mensaje": "Interno",
            "resumen_publico": "Respuesta pública"}, admin, 201)
        published = post("/reportes/consulta", folio)["reporte"]
        self.assertEqual(published["respuesta_institucion"], "Respuesta pública")
        self.assertEqual([item["nombre"] for item in published["instituciones_canalizadas"]],
                         ["Institución A", "Institución B"])
        with patch.dict(os.environ, {"CENTINELA_SMTP_HOST": "example.invalid", "CENTINELA_SMTP_FROM": "alert@example.invalid"}):
            with patch("backend.main.deliver_email") as mail:
                post(intake + "/reasignar", {"id_institucion": replacement, "anterior": destinations[1],
                                           "motivo": "Cambio de destino"}, admin)
                mail.assert_called_once()
        deliveries = get("/canalizacion", admin)["casos"][0]["envios"]
        self.assertFalse(next(item for item in deliveries if item["id_institucion"] == destinations[1])["vigente"])
        post(intake + "/respuestas", {"id_institucion": replacement, "mensaje": "Respuesta del nuevo destino",
             "resumen_publico": "Respuesta pública"}, admin, 201)
        post(case + "/asignar", {"responsable_id": staff["orientador"]}, admin)
        self.assertIn(school["folio"], [item["folio"] for item in get("/autoridad/avisos", orientation)["avisos"]])
        event = post(case + "/acciones", {"clase": "atencion", "detalle": "Atención de prueba"}, orientation, 201)
        self.assertEqual(post(review + "/abrir", headers=orientation)["caso"]["atenciones"][0]["detalle"], "Atención de prueba")
        attachment = c.post("/api" + case + "/evidencias", headers=admin,
                            data={"archivo": (io.BytesIO(b"prueba"), "prueba.txt"), "uso": "atencion",
                                  "id_evento": event["id_evento"]})
        self.assertEqual(attachment.status_code, 201)
        info = get(case, admin)
        evidence = info["evidencias"][0]["id_evidencia"]
        self.assertEqual(c.get(f"/api/autoridad/casos/{report_id}/evidencias/{evidence}", headers=orientation).data, b"prueba")
        self.assertEqual(c.get(f"/api/autoridad/casos/{report_id}/evidencias/{evidence}", headers=specialist).status_code, 404)
        post(case + "/actividad", {"accion": "crear", "descripcion": "Seguimiento", "vence": "2025-11-25"}, orientation)
        activity = get(case, admin)["actividades"][0]
        self.assertTrue(activity["vencida"])
        post(case + "/actividad", {"accion": "editar", "id_actividad": activity["id_actividad"],
                                  "descripcion": "Seguimiento editado", "vence": "2025-11-26",
                                  "responsable_id": staff["orientador"]}, admin)
        pending = get("/expedientes", admin)["actividades"]
        self.assertTrue(any(task["descripcion"] == "Seguimiento editado" and task["vencida"] for task in pending))
        post(case + "/actividad", {"accion": "crear", "descripcion": "Cancelar prueba",
                                  "vence": "2025-11-27", "responsable_id": staff["orientador"]}, admin)
        cancelled = next(task for task in get(case, admin)["actividades"] if task["descripcion"] == "Cancelar prueba")
        post(case + "/actividad", {"accion": "eliminar", "id_actividad": cancelled["id_actividad"]}, admin)
        self.assertFalse(any(task["id_actividad"] == cancelled["id_actividad"] for task in get(case, admin)["actividades"]))
        close = {"confirmar": True, "motivo": "Concluido", "resultado": "Atención completada"}
        post(intake + "/atendido", close, admin, 409)
        post(case + "/actividad", {"accion": "completar", "id_actividad": activity["id_actividad"], "resultado": "Listo"}, orientation)
        post(intake + "/atendido", close, admin)
        track = post("/reportes/consulta", folio)["reporte"]
        self.assertEqual(track["estado"], "Atendido")
        self.assertTrue(track["puede_evaluar"])
        receipt = get("/comprobantes/" + track["comprobante"]["codigo"], {})
        self.assertEqual(receipt["comprobante"]["terminacion"], school["folio"][-6:])
        self.assertNotIn(school["folio"], str(receipt))
        self.assertNotIn("Interno", str(track))
        post("/reportes/consulta/evaluacion", {**folio, "calificacion": 5, "categoria": "Atención",
             "comentario": "Buena atención", "sugerencia": "Más horarios"}, status=201)
        post("/reportes/consulta/evaluacion", {**folio, "calificacion": 1, "categoria": "Otro"}, status=409)
        post(case + "/acciones", {"clase": "nota", "detalle": "No debe guardarse"}, admin, 409)
        self.assertEqual(get("/expedientes", admin)["evaluaciones"][0]["calificacion"], 5)
        post(case + "/estado", {"id_estado": 9, "motivo": "Revisión posterior"}, admin)
        self.assertEqual(post("/reportes/consulta", folio)["reporte"]["estado"], "Abierto en seguimiento")
        history = get("/expedientes", admin)["cierres"]
        self.assertTrue(any(row["folio"] == school["folio"] and row["calificacion"] == 5 for row in history))

    def test_workflows(self):
        c = self.client
        self.assertEqual(c.get('/api/health').status_code, 200)
        self.assertEqual(len(c.get('/api/tipos-violencia').json['tipos']), 5)
        self.assertEqual(c.get('/api/instituciones').status_code, 200)
        user = {'nombre': 'Prueba local', 'correo': 'local@example.invalid', 'contrasena': 'local-test-password'}
        self.assertEqual(c.post('/api/auth/registro', json=user).status_code, 201)
        self.assertEqual(c.post('/api/auth/registro', json=user).status_code, 409)
        login = c.post('/api/auth/login', json=user)
        self.assertEqual(login.status_code, 200)
        headers = {'Authorization': 'Bearer ' + login.json['token']}
        self.assertEqual(c.get('/api/auth/sesion', headers=headers).status_code, 200)
        self.assertEqual(c.patch('/api/usuarios/me', headers={'X-Usuario-ID': '1'}, json={'nombre': 'Ataque'}).status_code, 401)
        self.assertEqual(c.patch('/api/usuarios/me', headers=headers, json={'nombre': 'Nombre actualizado'}).status_code, 200)
        self.assertEqual(c.patch('/api/usuarios/me', headers=headers, json={"contrasena": 123}).status_code, 400)
        self.assertEqual(c.post('/api/auth/registro', json={**user, "correo": "inválido"}).status_code, 400)
        registered = c.post('/api/reportes', headers=headers, json={
            "rol": "victima", "es_anonimo": False, "terminos": True, "tipo_violencia": 2,
            "ocurrio_en_escuela": True, "detalle": {"fecha": "2026-11-10", "lugar": "Prueba",
            "haOcurrido": "NO", "descripcion": "Descripción reservada"},
        })
        self.assertEqual(registered.status_code, 201)
        query = {"folio": registered.json["reporte"]["folio"]}
        private = c.post('/api/reportes/consulta', json=query).json["reporte"]
        self.assertFalse({"tipos", "ocurrio_en_escuela", "nivel_riesgo", "detalle", "rol_reportante"} & private.keys())
        own = c.post('/api/reportes/consulta', json=query, headers=headers).json["reporte"]
        self.assertTrue(own["ocurrio_en_escuela"])
        self.assertEqual(own["detalle"]["descripcion"], "Descripción reservada")
        with connect() as db:
            db.execute("INSERT INTO avisos (id_reporte,id_usuario,mensaje,correo_estado) "
                       "SELECT id_reporte,id_usuario,'Aviso de prueba','pendiente' FROM reportes WHERE folio=%s",
                       (query["folio"],))
        notices = c.get('/api/usuarios/me/reportes', headers=headers).json["avisos"]
        self.assertEqual([(notice["folio"], notice["mensaje"]) for notice in notices],
                         [(query["folio"], "Aviso de prueba")])
        with patch.dict(os.environ, {"CENTINELA_RESEND_API_KEY": "simulada",
                                     "CENTINELA_SMTP_FROM": "avisos@example.invalid"}):
            with patch("backend.main.urlopen") as send:
                job = app.test_cli_runner().invoke(args=["enviar-avisos"])
                self.assertEqual(job.exit_code, 0, job.output)
                send.assert_called_once()
                self.assertEqual(send.call_args.args[0].full_url, "https://api.resend.com/emails")
                self.assertEqual(app.test_cli_runner().invoke(args=["enviar-avisos"]).exit_code, 0)
                send.assert_called_once()
        report = c.post('/api/reportes', json={'detalle': {'descripcion': 'Prueba sin datos reales'}, 'tipos_violencia': [1], 'fecha_hecho': '2026-11-10'})
        self.assertEqual(report.status_code, 201)
        report = report.json['reporte']
        path = '/api/reportes/' + str(report['id_reporte'])
        access = {'X-Reporte-Token': report['token_acceso']}
        self.assertEqual(c.get(path).status_code, 403)
        self.assertEqual(c.get(path, headers=access).status_code, 200)
        self.assertNotIn('acceso_hash', c.get(path, headers=access).json['reporte'])
        self.assertEqual(c.get('/api/reportes', headers={'X-Administrador-ID': '1'}).status_code, 401)
        upload = c.post(path + '/evidencias', headers=access, data={'archivo': (io.BytesIO(b'local test evidence'), 'prueba.txt')})
        self.assertEqual(upload.status_code, 201)
        evidence_path = path + '/evidencias/' + str(upload.json['id_evidencia'])
        self.assertEqual(c.get(evidence_path).status_code, 403)
        self.assertEqual(c.get(evidence_path, headers=access).data, b'local test evidence')
        self.assertEqual(c.get(path + '/evidencias', headers=access).status_code, 200)
        self.assertEqual(c.post(path + '/personas', headers=access, json={'tipo_participacion': 'testigo', 'nombre': 'Prueba'}).status_code, 201)
        self.assertEqual(len(c.get(path + '/personas', headers=access).json['personas']), 1)
        public = c.get('/api/reportes/folio/' + report['folio'])
        self.assertEqual(public.status_code, 200)
        self.assertNotIn('descripcion', public.json['reporte'])
        self.assertEqual(c.get(path + '/estado').json['estado']['nombre'], 'Recibido')
        initialize()
        self.assertEqual(c.get(evidence_path, headers=access).data, b'local test evidence')
        self.assertEqual(c.post('/api/auth/logout', headers=headers).status_code, 200)
        self.assertEqual(c.get('/api/auth/sesion', headers=headers).status_code, 401)


if __name__ == '__main__':
    unittest.main()
