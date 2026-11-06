"""
Archivo principal para ejecutar el Simulador de Crédito Hipotecario en PythonAnywhere
Este archivo servirá como punto de entrada para la plataforma PythonAnywhere
"""

from flask import Flask, render_template, send_from_directory, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    """Render the main page of the mortgage simulator"""
    return render_template('index.html')

@app.route('/static/img/<path:filename>')
def serve_image(filename):
    """Route to serve image files"""
    return send_from_directory('static/img', filename)

@app.route('/health')
def health_check():
    """Ruta para comprobar que la aplicación está funcionando"""
    return jsonify({"status": "ok", "message": "El Simulador de Crédito Hipotecario está funcionando correctamente"})

# Configuración para PythonAnywhere - descomentar si es necesario
# app.config['PREFERRED_URL_SCHEME'] = 'https'

if __name__ == '__main__':
    # Solo para desarrollo local - PythonAnywhere usará su propio WSGI
    app.run(host='0.0.0.0', port=8000, debug=True)