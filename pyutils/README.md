# PyUtils - Herramientas para Procesamiento de PDFs e Imágenes

Este directorio contiene un conjunto de herramientas modulares para extraer imágenes de archivos PDF y convertirlas a formato Base64.

## 📁 Archivos

### 1. `image_to_base64.py`
**Propósito:** Convierte imágenes a formato Base64.

**Funciones principales:**
- `image_file_to_base64(image_path)`: Convierte un archivo de imagen a Base64
- `image_bytes_to_base64(image_bytes)`: Convierte bytes de imagen a Base64
- `save_base64_to_file(base64_string, output_file)`: Guarda Base64 en archivo

**Uso como script:**
```bash
python image_to_base64.py imagen.jpg -o base64_output.txt
```

### 2. `pdf_image_extractor.py`
**Propósito:** Extrae imágenes de archivos PDF.

**Funciones principales:**
- `extract_images_from_pdf(pdf_path, output_dir)`: Extrae imágenes de un PDF
- `extract_all_images(pdf_paths, output_dir)`: Extrae imágenes de múltiples PDFs

**Uso como script:**
```bash
python pdf_image_extractor.py documento.pdf -o imagenes_extraidas/
```

### 3. `pdf_to_base64_readme.py`
**Propósito:** Script principal que combina ambas funcionalidades y genera un README.md completo.

**Funciones principales:**
- `generate_readme_with_images(pdf_paths, output_md_file, images_dir)`: Proceso completo
- `validate_pdf_files(pdf_paths)`: Valida archivos PDF

**Uso como script:**
```bash
python pdf_to_base64_readme.py documento.pdf --output reporte.md --images-dir imagenes/
```

### 4. `script.py`
**Nota:** Este es el script original que ahora ha sido dividido en los módulos anteriores.

## 🛠️ Dependencias

```bash
pip install PyMuPDF
```

## 💡 Ejemplos de Uso

### Convertir una imagen a Base64:
```bash
python image_to_base64.py mi_imagen.png -o imagen_base64.txt
```

### Extraer imágenes de un PDF:
```bash
python pdf_image_extractor.py documento.pdf -o carpeta_imagenes/
```

### Proceso completo (extraer + convertir + generar README):
```bash
python pdf_to_base64_readme.py documento1.pdf documento2.pdf --output informe_completo.md
```

## 📝 Estructura del README Generado

El script principal genera un README.md que incluye:
- 📄 Información de cada PDF procesado
- 🖼️ Visualización de cada imagen extraída
- 📊 Datos Base64 de cada imagen
- 📈 Resumen estadístico del proceso

## 🔧 Características

- **Modular:** Cada funcionalidad está separada en su propio módulo
- **Reutilizable:** Los módulos pueden importarse y usarse en otros proyectos
- **Robusto:** Manejo de errores y validación de archivos
- **Informativo:** Salida detallada del progreso y resultados
- **Flexible:** Múltiples opciones de configuración vía argumentos
