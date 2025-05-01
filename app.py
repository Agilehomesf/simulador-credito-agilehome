import os
from flask import Flask, render_template, send_from_directory

# Create the Flask application
app = Flask(__name__, static_folder='static')
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Imprimir mensaje de diagnóstico (reducido para no saturar los logs)
print("Aplicación Flask inicializada")

@app.route('/')
def index():
    """Render the main page of the mortgage simulator"""
    return render_template('index.html')

@app.route('/static/img/<path:filename>')
def serve_image(filename):
    """Route to serve image files"""
    return send_from_directory('static/img', filename)

# Para verificación de estado y monitoreo por Replit
@app.route('/health')
def health_check():
    """Ruta para comprobar que la aplicación está funcionando"""
    return "El simulador de crédito hipotecario está en línea", 200

# Solo si se ejecuta directamente
if __name__ == '__main__':
    # Intentar capturar el puerto que proporciona Replit
    port = int(os.environ.get("PORT", 8080))
    # En Replit, asegúrate de que la aplicación escuche en 0.0.0.0 para que sea accesible
    print(f"Iniciando servidor (directamente) en puerto {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
