"""Crea una cuenta administrativa usando la base configurada en DATABASE_URL."""
import argparse
from getpass import getpass

from werkzeug.security import generate_password_hash

from backend.database import connect, initialize


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("nombre")
    parser.add_argument("correo")
    args = parser.parse_args()
    password = getpass("Contraseña: ")
    if len(password) < 12 or password != getpass("Confirma la contraseña: "):
        parser.exit(1, "Usa al menos 12 caracteres y verifica que ambas contraseñas coincidan.\n")
    initialize()
    with connect() as connection:
        result = connection.execute(
            "INSERT INTO administradores (nombre, correo, contrasena_hash) "
            "VALUES (%s, %s, %s) ON CONFLICT (correo) DO NOTHING RETURNING id_administrador",
            (args.nombre.strip(), args.correo.strip().lower(), generate_password_hash(password)),
        )
        if result.fetchone() is None:
            parser.exit(1, "Ya existe una cuenta administrativa con ese correo.\n")
    print("Cuenta administrativa creada.")


if __name__ == "__main__":
    main()
