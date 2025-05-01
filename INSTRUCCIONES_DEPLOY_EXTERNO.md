# Instrucciones para Desplegar el Simulador de Crédito Hipotecario en Otras Plataformas

Este documento proporciona instrucciones detalladas para desplegar el Simulador de Crédito Hipotecario en diferentes plataformas gratuitas como alternativa a Replit.

## Opción 1: PythonAnywhere (Recomendada)

PythonAnywhere es una plataforma especialmente diseñada para aplicaciones Python/Flask con un plan gratuito generoso.

### Requisitos
- Cuenta gratuita en [PythonAnywhere](https://www.pythonanywhere.com/)

### Pasos para el despliegue

1. **Registrarse en PythonAnywhere**
   - Crea una cuenta gratuita en [PythonAnywhere](https://www.pythonanywhere.com/)

2. **Crear una aplicación web**
   - Desde el dashboard, ve a la pestaña "Web"
   - Haz clic en "Añadir una nueva aplicación web"
   - Elige "Flask" como framework
   - Selecciona la versión de Python más reciente disponible (recomendado: 3.9 o superior)

3. **Subir los archivos del proyecto**
   - En la pestaña "Files", navega a la ruta de tu aplicación web (generalmente `/home/tuusuario/mysite/`)
   - Puedes subir los archivos usando el uploader de archivos o clonar desde GitHub
   - Asegúrate de incluir todos los archivos y carpetas importantes (static, templates, flask_app.py, etc.)

4. **Configurar entorno virtual e instalar dependencias**
   - Abre un terminal/consola de PythonAnywhere
   - Ejecuta los siguientes comandos:
   ```bash
   cd /home/tuusuario/mysite
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements_export.txt
   ```

5. **Configurar el archivo WSGI**
   - En la pestaña "Web", busca la sección "Code" y el enlace al archivo WSGI
   - Reemplaza el contenido con:
   ```python
   import sys
   path = '/home/tuusuario/mysite'
   if path not in sys.path:
       sys.path.append(path)
   
   from flask_app import app as application
   ```
   - Reemplaza `tuusuario` con tu nombre de usuario de PythonAnywhere

6. **Reiniciar la aplicación web**
   - En la pestaña "Web", presiona el botón "Reload"
   - Tu aplicación estará disponible en `https://tuusuario.pythonanywhere.com`

## Opción 2: Render.com (Plan Gratuito)

Render ofrece hosting gratuito para aplicaciones web con buen rendimiento.

### Requisitos
- Cuenta gratuita en [Render](https://render.com/)
- Repositorio Git (GitHub, GitLab, etc.)

### Pasos para el despliegue

1. **Crear un repositorio Git**
   - Sube todo el código a un repositorio Git (GitHub, GitLab, etc.)
   - Asegúrate de incluir un archivo `requirements.txt` con todas las dependencias

2. **Registrarse en Render**
   - Crea una cuenta en [Render](https://render.com/) (puedes usar tu cuenta de GitHub)

3. **Crear un nuevo Web Service**
   - Desde el dashboard, haz clic en "New" y selecciona "Web Service"
   - Conecta tu repositorio Git
   - Elige un nombre para tu aplicación

4. **Configurar la aplicación**
   - Build Command: `pip install -r requirements_export.txt`
   - Start Command: `gunicorn flask_app:app`
   - Selecciona el plan gratuito

5. **Variables de entorno (si es necesario)**
   - Agrega cualquier variable de entorno necesaria en la sección "Environment"

6. **Desplegar**
   - Haz clic en "Create Web Service"
   - Render desplegará automáticamente tu aplicación y te proporcionará una URL

## Opción 3: Netlify + Netlify Functions (Para versión estática + API)

Si prefieres una solución más orientada al frontend, puedes usar Netlify con Functions para la parte backend.

### Requisitos
- Cuenta gratuita en [Netlify](https://www.netlify.com/)
- Conocimientos básicos de JavaScript/Node.js para adaptar el backend

### Pasos para el despliegue

1. **Adaptar la aplicación a una estructura Jamstack**
   - Mueve todo el HTML, CSS y JavaScript a la carpeta `/static`
   - Crea una carpeta `netlify/functions` para las funciones serverless

2. **Registrarse en Netlify**
   - Crea una cuenta en [Netlify](https://www.netlify.com/) (puedes usar tu cuenta de GitHub)

3. **Crear un nuevo sitio**
   - Desde el dashboard, haz clic en "New site from Git"
   - Conecta tu repositorio Git

4. **Configurar la compilación y despliegue**
   - Build command: (dejar en blanco si no hay proceso de build)
   - Publish directory: `static`

5. **Desplegar**
   - Haz clic en "Deploy site"
   - Netlify desplegará tu sitio y te proporcionará una URL

## Consideraciones Importantes

1. **Archivos estáticos**: Todas las plataformas mencionadas manejan automáticamente la entrega de archivos estáticos, pero la estructura de carpetas puede variar ligeramente.

2. **Persistencia**: Ninguna de estas opciones gratuitas garantiza una disponibilidad del 100%, pero tienen límites más generosos que Replit.

3. **Dominio personalizado**: Todas estas plataformas permiten configurar un dominio personalizado, incluso en sus planes gratuitos.

4. **Seguridad**: Evita subir claves secretas o credenciales directamente en el código. Utiliza variables de entorno proporcionadas por la plataforma.

## Soporte y Ayuda

Si encuentras problemas durante el despliegue, consulta la documentación oficial de cada plataforma:

- [Documentación de PythonAnywhere](https://help.pythonanywhere.com/)
- [Documentación de Render](https://render.com/docs)
- [Documentación de Netlify](https://docs.netlify.com/)

## Nota final

Recuerda que siempre es importante mantener una copia local o un repositorio Git con el código completo del proyecto para poder desplegarlo en cualquier plataforma cuando sea necesario.