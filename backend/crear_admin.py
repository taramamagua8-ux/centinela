"""Crea una cuenta administrativa usando la base configurada en DATABASE_URL."""
import argparse
import hashlib
import secrets
from getpass import getpass

from werkzeug.security import generate_password_hash

from backend.database import connect, initialize


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("nombre")
    parser.add_argument("correo")
    parser.add_argument("--renovar-folio", action="store_true",
                        help="Genera un folio para una cuenta existente y cierra sus sesiones")
    args = parser.parse_args()
    email = args.correo.strip().lower()
    folio = "ADM-" + secrets.token_hex(16).upper()
    folio_hash = hashlib.sha256(folio.encode()).hexdigest()
    initialize()
    if args.renovar_folio:
        with connect() as connection:
            admin = connection.execute(
                "UPDATE administradores SET folio_hash=%s WHERE LOWER(correo)=%s RETURNING id_administrador",
                (folio_hash, email),
            ).fetchone()
            if not admin:
                parser.exit(1, "No existe una cuenta administrativa con ese correo.\n")
            connection.execute("DELETE FROM sesiones WHERE id_administrador=%s", (admin["id_administrador"],))
        print(f"Folio de acceso: {folio}")
        return
    password = getpass("Contraseña: ")
    if len(password) < 12 or password != getpass("Confirma la contraseña: "):
        parser.exit(1, "Usa al menos 12 caracteres y verifica que ambas contraseñas coincidan.\n")
    with connect() as connection:
        result = connection.execute(
            "INSERT INTO administradores (nombre, correo, contrasena_hash, folio_hash) "
            "VALUES (%s, %s, %s, %s) ON CONFLICT (correo) DO NOTHING RETURNING id_administrador",
            (args.nombre.strip(), email, generate_password_hash(password), folio_hash),
        )
        if result.fetchone() is None:
            parser.exit(1, "Ya existe una cuenta administrativa con ese correo.\n")
    print(f"Cuenta administrativa creada. Folio de acceso: {folio}")


if __name__ == "__main__":
    main()
