# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------
# Módulo para Extraer Imágenes de PDFs
#
# Descripción:
# Este módulo proporciona funciones para extraer imágenes de archivos PDF
# utilizando PyMuPDF. Las imágenes se pueden guardar en disco o devolver
# como datos en memoria.
#
# Dependencias:
# pip install PyMuPDF
#
# Uso:
# from pdf_image_extractor import extract_images_from_pdf, extract_all_images
# -----------------------------------------------------------------------------

import fitz  # PyMuPDF
import os

class ImageData:
    """Clase para almacenar información de una imagen extraída."""
    def __init__(self, image_bytes, extension, page_number, image_index):
        self.image_bytes = image_bytes
        self.extension = extension
        self.page_number = page_number
        self.image_index = image_index

def extract_images_from_pdf(pdf_path, output_dir=None):
    """
    Extrae todas las imágenes de un archivo PDF.
    
    Args:
        pdf_path (str): Ruta al archivo PDF.
        output_dir (str, optional): Directorio donde guardar las imágenes.
                                  Si no se especifica, solo devuelve los datos.
        
    Returns:
        list: Lista de objetos ImageData con la información de las imágenes.
        
    Raises:
        FileNotFoundError: Si el archivo PDF no existe.
        Exception: Si hay un error al procesar el PDF.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"El archivo '{pdf_path}' no fue encontrado.")
    
    extracted_images = []
    
    # Crear directorio de salida si se especifica
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Directorio '{output_dir}' creado.")
    
    try:
        # Abrir el documento PDF
        doc = fitz.open(pdf_path)
        image_counter = 0
        
        print(f"Procesando archivo: {pdf_path}")
        
        # Iterar a través de cada página del PDF
        for page_index in range(len(doc)):
            page = doc.load_page(page_index)
            image_list = page.get_images(full=True)
            
            if not image_list:
                continue
            
            print(f"Página {page_index + 1}: {len(image_list)} imagen(es) encontrada(s).")
            
            # Iterar sobre cada imagen en la lista
            for image_index, img in enumerate(image_list, start=1):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # Crear objeto ImageData
                image_data = ImageData(
                    image_bytes=image_bytes,
                    extension=image_ext,
                    page_number=page_index + 1,
                    image_index=image_index
                )
                extracted_images.append(image_data)
                
                # Guardar imagen en disco si se especifica output_dir
                if output_dir:
                    image_filename = f"imagen_{image_counter + 1}.{image_ext}"
                    image_path = os.path.join(output_dir, image_filename)
                    
                    with open(image_path, "wb") as img_file:
                        img_file.write(image_bytes)
                    
                    print(f"  - Imagen #{image_counter + 1} guardada como: {image_path}")
                
                image_counter += 1
        
        doc.close()
        
        if not extracted_images:
            print("No se encontraron imágenes en el PDF.")
        else:
            print(f"Se extrajeron {len(extracted_images)} imágenes del PDF.")
        
        return extracted_images
        
    except Exception as e:
        raise Exception(f"Error al procesar el PDF '{pdf_path}': {e}")

def extract_all_images(pdf_paths, output_dir=None):
    """
    Extrae todas las imágenes de múltiples archivos PDF.
    
    Args:
        pdf_paths (list): Lista de rutas a los archivos PDF.
        output_dir (str, optional): Directorio donde guardar las imágenes.
        
    Returns:
        dict: Diccionario con las rutas de PDF como claves y listas de ImageData como valores.
    """
    all_images = {}
    
    for pdf_path in pdf_paths:
        try:
            images = extract_images_from_pdf(pdf_path, output_dir)
            all_images[pdf_path] = images
        except Exception as e:
            print(f"Error procesando '{pdf_path}': {e}")
            all_images[pdf_path] = []
    
    return all_images

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Extrae imágenes de archivos PDF."
    )
    parser.add_argument(
        "pdf_files",
        metavar="PDF_FILE",
        type=str,
        nargs='+',
        help="La ruta a uno o más archivos PDF para procesar."
    )
    parser.add_argument(
        "-o", "--output-dir",
        dest="output_dir",
        type=str,
        default="imagenes_extraidas",
        help="Directorio donde guardar las imágenes extraídas. (default: imagenes_extraidas)"
    )
    
    args = parser.parse_args()
    
    try:
        all_images = extract_all_images(args.pdf_files, args.output_dir)
        
        total_images = sum(len(images) for images in all_images.values())
        print(f"\nProceso completado. Total de imágenes extraídas: {total_images}")
        
    except Exception as e:
        print(f"Error: {e}")
