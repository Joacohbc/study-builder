# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------
# Script Principal: Extrae Imágenes de PDF, las Convierte a Base64 y Genera README
#
# Descripción:
# Este script combina las funcionalidades de los módulos pdf_image_extractor
# e image_to_base64 para extraer imágenes de archivos PDF, convertirlas a
# formato Base64 y generar un archivo README.md con las imágenes y su
# representación Base64.
#
# Dependencias:
# pip install PyMuPDF
#
# Uso:
# python pdf_to_base64_readme.py archivo.pdf --output mi_reporte.md
# -----------------------------------------------------------------------------

import os
import argparse
from pdf_image_extractor import extract_all_images
from image_to_base64 import image_bytes_to_base64

def generate_readme_with_images(pdf_paths, output_md_file, images_dir="imagenes_extraidas"):
    """
    Extrae imágenes de PDFs, las convierte a Base64 y genera un README.md.
    
    Args:
        pdf_paths (list): Lista de rutas a los archivos PDF.
        output_md_file (str): Ruta del archivo Markdown de salida.
        images_dir (str): Directorio donde guardar las imágenes extraídas.
    """
    print("=== Iniciando proceso de extracción y generación de README ===\n")
    
    # Extraer todas las imágenes de los PDFs
    all_images = extract_all_images(pdf_paths, images_dir)
    
    # Generar el archivo README.md
    with open(output_md_file, "w", encoding="utf-8") as md_file:
        # Escribir encabezado
        md_file.write("# Reporte de Imágenes Extraídas de PDFs\n\n")
        md_file.write("Este documento contiene las imágenes extraídas de los archivos PDF proporcionados y su representación en Base64.\n\n")
        md_file.write(f"**Fecha de generación:** {get_current_date()}\n\n")
        
        total_images = 0
        
        # Procesar cada PDF
        for pdf_path, images in all_images.items():
            pdf_name = os.path.basename(pdf_path)
            
            if not images:
                md_file.write(f"## 📄 {pdf_name}\n\n")
                md_file.write("*No se encontraron imágenes en este archivo.*\n\n")
                md_file.write("---\n\n")
                continue
            
            md_file.write(f"## 📄 {pdf_name}\n\n")
            md_file.write(f"**Total de imágenes encontradas:** {len(images)}\n\n")
            
            # Procesar cada imagen
            for idx, image_data in enumerate(images, start=1):
                try:
                    # Convertir imagen a Base64
                    base64_string = image_bytes_to_base64(image_data.image_bytes)
                    
                    # Generar nombre de archivo para la imagen
                    image_filename = f"imagen_{total_images + idx}.{image_data.extension}"
                    image_relative_path = os.path.join(images_dir, image_filename)
                    
                    # Escribir información de la imagen en el README
                    md_file.write(f"### 🖼️ Imagen #{total_images + idx}\n\n")
                    md_file.write(f"- **Archivo origen:** `{pdf_name}`\n")
                    md_file.write(f"- **Página:** {image_data.page_number}\n")
                    md_file.write(f"- **Formato:** {image_data.extension.upper()}\n")
                    md_file.write(f"- **Archivo guardado:** `{image_relative_path}`\n\n")
                    
                    # Mostrar la imagen
                    md_file.write(f"![{image_filename}]({image_relative_path})\n\n")
                    
                    # Mostrar Base64 en bloque de código
                    md_file.write("**Representación Base64:**\n\n")
                    md_file.write("```base64\n")
                    md_file.write(base64_string)
                    md_file.write("\n```\n\n")
                    
                    # Información adicional
                    md_file.write(f"**Tamaño de datos:** {len(image_data.image_bytes)} bytes\n")
                    md_file.write(f"**Tamaño Base64:** {len(base64_string)} caracteres\n\n")
                    
                    md_file.write("---\n\n")
                    
                except Exception as e:
                    error_msg = f"Error al procesar imagen #{total_images + idx}: {e}"
                    print(error_msg)
                    md_file.write(f"**❌ Error:** {error_msg}\n\n")
            
            total_images += len(images)
        
        # Escribir resumen final
        md_file.write("## 📊 Resumen del Proceso\n\n")
        md_file.write(f"- **Archivos PDF procesados:** {len(pdf_paths)}\n")
        md_file.write(f"- **Total de imágenes extraídas:** {total_images}\n")
        md_file.write(f"- **Directorio de imágenes:** `{images_dir}/`\n")
        md_file.write(f"- **Archivo de reporte:** `{output_md_file}`\n\n")
        
        if total_images == 0:
            md_file.write("⚠️ **No se encontraron imágenes en los archivos PDF proporcionados.**\n")
        else:
            md_file.write("✅ **Proceso completado exitosamente.**\n")
    
    # Mostrar resultado final
    if total_images == 0:
        print("\n⚠️  Proceso finalizado. No se encontraron imágenes en los archivos proporcionados.")
    else:
        print(f"\n✅ Proceso completado exitosamente!")
        print(f"   📊 Total de imágenes extraídas: {total_images}")
        print(f"   📁 Imágenes guardadas en: '{images_dir}/'")
        print(f"   📝 Reporte generado en: '{output_md_file}'")

def get_current_date():
    """Obtiene la fecha actual en formato legible."""
    from datetime import datetime
    return datetime.now().strftime("%d/%m/%Y %H:%M:%S")

def validate_pdf_files(pdf_paths):
    """
    Valida que todos los archivos PDF existan.
    
    Args:
        pdf_paths (list): Lista de rutas a validar.
        
    Returns:
        list: Lista de archivos válidos.
    """
    valid_files = []
    for pdf_path in pdf_paths:
        if os.path.exists(pdf_path):
            if pdf_path.lower().endswith('.pdf'):
                valid_files.append(pdf_path)
            else:
                print(f"⚠️  Advertencia: '{pdf_path}' no parece ser un archivo PDF.")
        else:
            print(f"❌ Error: El archivo '{pdf_path}' no fue encontrado.")
    
    return valid_files

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extrae imágenes de archivos PDF, las convierte a Base64 y genera un README.md completo.",
        epilog="Ejemplo: python pdf_to_base64_readme.py documento.pdf --output reporte.md --images-dir imagenes"
    )
    parser.add_argument(
        "pdf_files",
        metavar="PDF_FILE",
        type=str,
        nargs='+',
        help="La ruta a uno o más archivos PDF para procesar."
    )
    parser.add_argument(
        "-o", "--output",
        dest="output_file",
        type=str,
        default="reporte_imagenes.md",
        help="Nombre del archivo README.md de salida. (default: reporte_imagenes.md)"
    )
    parser.add_argument(
        "-d", "--images-dir",
        dest="images_dir",
        type=str,
        default="imagenes_extraidas",
        help="Directorio donde guardar las imágenes extraídas. (default: imagenes_extraidas)"
    )
    parser.add_argument(
        "--version",
        action="version",
        version="PDF to Base64 README Generator v1.0"
    )
    
    args = parser.parse_args()
    
    # Validar archivos PDF
    valid_pdf_files = validate_pdf_files(args.pdf_files)
    
    if not valid_pdf_files:
        print("❌ No se encontraron archivos PDF válidos para procesar.")
        exit(1)
    
    if len(valid_pdf_files) != len(args.pdf_files):
        print(f"⚠️  Se procesarán {len(valid_pdf_files)} de {len(args.pdf_files)} archivos.\n")
    
    try:
        generate_readme_with_images(valid_pdf_files, args.output_file, args.images_dir)
    except Exception as e:
        print(f"❌ Error crítico: {e}")
        exit(1)
