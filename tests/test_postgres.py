"""Integration tests. Run only against a disposable local PostgreSQL database."""
import io
import os
import unittest
from urllib.parse import urlparse

import psycopg

url = os.environ.get('DATABASE_URL', '')
if urlparse(url).hostname not in ('localhost', '127.0.0.1'):
    raise RuntimeError('Use a disposable local database for integration tests.')

from backend.database import initialize
from backend.main import app


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

    def test_workflows(self):
        c = self.client
        self.assertEqual(c.get('/api/health').status_code, 200)
        self.assertEqual(len(c.get('/api/tipos-violencia').json['tipos']), 5)
        self.assertEqual(c.get('/api/instituciones').json, {'instituciones': []})
        user = {'nombre': 'Prueba local', 'correo': 'local@example.invalid', 'contrasena': 'local-test-password'}
        self.assertEqual(c.post('/api/auth/registro', json=user).status_code, 201)
        self.assertEqual(c.post('/api/auth/registro', json=user).status_code, 409)
        login = c.post('/api/auth/login', json=user)
        self.assertEqual(login.status_code, 200)
        headers = {'Authorization': 'Bearer ' + login.json['token']}
        self.assertEqual(c.get('/api/auth/sesion', headers=headers).status_code, 200)
        self.assertEqual(c.patch('/api/usuarios/me', headers={'X-Usuario-ID': '1'}, json={'nombre': 'Ataque'}).status_code, 401)
        self.assertEqual(c.patch('/api/usuarios/me', headers=headers, json={'nombre': 'Nombre actualizado'}).status_code, 200)
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
