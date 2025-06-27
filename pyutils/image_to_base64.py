# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------
# Módulo para Convertir Imágenes a Base64
#
# Descripción:
# Este módulo proporciona funciones para convertir imágenes a formato Base64.
# Puede trabajar con archivos de imagen en disco o con datos de imagen en memoria.
#
# Uso:
# from image_to_base64 import image_file_to_base64, image_bytes_to_base64
# -----------------------------------------------------------------------------

import base64
import os

def image_file_to_base64(image_path):
    """
    Convierte un archivo de imagen a su representación en Base64.
    
    Args:
        image_path (str): Ruta al archivo de imagen.
        
    Returns:
        str: Cadena Base64 de la imagen.
        
    Raises:
        FileNotFoundError: Si el archivo no existe.
        Exception: Si hay un error al leer el archivo.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"El archivo '{image_path}' no fue encontrado.")
    
    try:
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()
            base64_string = base64.b64encode(image_bytes).decode('utf-8')
            return base64_string
    except Exception as e:
        raise Exception(f"Error al convertir la imagen a Base64: {e}")

def image_bytes_to_base64(image_bytes):
    """
    Convierte bytes de imagen a su representación en Base64.
    
    Args:
        image_bytes (bytes): Datos de la imagen en bytes.
        
    Returns:
        str: Cadena Base64 de la imagen.
    """
    return base64.b64encode(image_bytes).decode('utf-8')

def save_base64_to_file(base64_string, output_file):
    """
    Guarda una cadena Base64 en un archivo de texto.
    
    Args:
        base64_string (str): Cadena Base64 a guardar.
        output_file (str): Ruta del archivo de salida.
    """
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(base64_string)
    print(f"Base64 guardado en: {output_file}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Convierte imágenes a formato Base64."
    )
    parser.add_argument(
        "image_file",
        type=str,
        help="Ruta al archivo de imagen."
    )
    parser.add_argument(
        "-o", "--output",
        dest="output_file",
        type=str,
        help="Archivo de salida para guardar el Base64 (opcional)."
    )
    
    args = parser.parse_args()
    
    try:
        base64_result = image_file_to_base64(args.image_file)
        print("Conversión exitosa!")
        print(f"Base64: {base64_result[:50]}..." if len(base64_result) > 50 else f"Base64: {base64_result}")
        
        if args.output_file:
            save_base64_to_file(base64_result, args.output_file)
            
    except Exception as e:
        print(f"Error: {e}")
