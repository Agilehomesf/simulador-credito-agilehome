# Simulador de Crédito Hipotecario Multibanco Agile Home

Aplicación web para simular y comparar créditos hipotecarios de diferentes bancos colombianos.

## Ejecutar la aplicación en Replit

Hemos desarrollado un sistema robusto para ejecutar la aplicación en Replit, con múltiples niveles de respaldo para garantizar el funcionamiento consistente.

### NUEVOS SCRIPTS MEJORADOS (RECOMENDADOS)
```
./persistent_start.sh    # Inicia el servidor con enfoque de máxima persistencia
./monitor.sh             # Verifica y reinicia automáticamente si es necesario
./keep_alive.sh          # Script de diagnóstico y reinicio rápido
```

Estos nuevos scripts están específicamente diseñados para mantener la aplicación funcionando en el entorno gratuito de Replit:
- Detección y selección automática de puertos disponibles
- Mecanismos de recuperación automática
- Registro de diagnóstico detallado
- Monitoreo del estado del servidor

### MÉTODO ESTÁNDAR
```
./start_in_replit.sh
```
Este script unificado:
- Detiene procesos previos que puedan estar bloqueando puertos
- Utiliza el script `replit_server.py` con detección automática de puertos
- Incluye múltiples métodos de respaldo (Gunicorn, Flask, importación directa)
- Muestra instrucciones claras y mensajes de estado coloridos
- Genera logs detallados para diagnóstico

### Métodos alternativos (uso menos recomendado):

```
python replit_server.py       # Script optimizado con múltiples estrategias de inicio
python run_gunicorn.py        # Inicio directo con Gunicorn 
python main.py                # Flask básico (modo desarrollo)
./start_replit.sh             # Script alternativo con Gunicorn
./start_simulator.sh          # Script original
```

## Acceso a la aplicación

La aplicación estará disponible a través de la interfaz de Replit:

1. Haz clic en el botón "Webview" en la parte superior de la interfaz
2. O utiliza la URL específica que Replit asigna a tu proyecto (termina en .replit.dev)

## Solución de problemas en Replit

Si encuentras dificultades para acceder a la aplicación:

1. **Problema**: Mensaje "The app is currently not running"  
   **Solución**: 
   - Ejecuta `./persistent_start.sh` para reiniciar con enfoque mejorado de persistencia
   - O ejecuta `./monitor.sh` para diagnóstico y reinicio automático

2. **Problema**: El servidor no inicia  
   **Solución**: Verifica:
   - Logs con `cat server_persistent.log` o `cat replit_server.log`
   - Procesos activos con `ps aux | grep python`
   - Puerto bloqueado con `lsof -i :8080`
   - Restablece matando todos los procesos: `pkill -f python && pkill -f gunicorn`

3. **Problema**: Errores en la interfaz  
   **Solución**: Limpia la caché del navegador o intenta con otro navegador

4. **Problema**: No puedes ver la aplicación  
   **Solución**:
   - Asegúrate de hacer clic en el botón "Webview" en la parte superior
   - Ejecuta `./monitor.sh` para verificar el estado y reiniciar si es necesario
   - Intenta acceder a la ruta de salud: `curl -s http://localhost:8080/health`

5. **Problema**: La aplicación se "duerme" después de un tiempo  
   **Solución**:
   - Replit en modo gratuito tiene limitaciones de inactividad (30-60 minutos)
   - Usa `./persistent_start.sh` para reiniciar rápidamente
   - Considera servicios de ping externos como UptimeRobot para mantenerla activa

## Características principales

- **Cálculo de Préstamos**: Ingrese el valor de la propiedad, el porcentaje de cuota inicial y el plazo para calcular préstamos hipotecarios.
- **Comparación de Bancos**: Compare visualmente las tasas y pagos mensuales de diferentes bancos colombianos.
- **Tabla de Amortización**: Vea un desglose detallado de los pagos a lo largo del préstamo para cada banco.
- **Mapa de Calor de Tasas**: Visualice y compare tasas de interés con diferencias porcentuales codificadas por colores.
- **Contacto Directo**: Conéctese fácilmente con consultores de Agile Home a través de WhatsApp para obtener asistencia personalizada.

## Cómo actualizar las tasas de interés

Para actualizar las tasas de interés de los bancos, siga estos pasos:

1. Abra el archivo `static/data/bank_rates.json`
2. Modifique los valores de las tasas (rate) para cada banco según sea necesario
3. Actualice la fecha de la última actualización en el campo "lastUpdated"
4. Guarde el archivo
5. Vuelva a desplegar la aplicación

Ejemplo del formato del archivo JSON:

```json
{
  "banks": {
    "Banco de Occidente": {
      "rate": 0.15,
      "logoClass": "bi-bank"
    },
    "Caja Social": {
      "rate": 0.145,
      "logoClass": "bi-house"
    },
    // ... más bancos
  },
  "lastUpdated": "2025-04-30"
}
```

Notas importantes:
- Las tasas deben especificarse en formato decimal (ej: 0.15 para 15%)
- No modifique los "logoClass" a menos que desee cambiar los íconos
- La propiedad "lastUpdated" debe tener formato "AAAA-MM-DD" o cualquier formato de fecha que prefiera
- Mantenga la estructura del JSON intacta para evitar errores

## Reglas de negocio especiales

- **Banco de Bogotá** es el único banco que se muestra para plazos superiores a 20 años cuando el valor de la propiedad es ≤ $213.525.000 COP.

## Funcionamiento técnico
 
La aplicación carga las tasas de interés desde este archivo JSON cuando se inicia, lo que permite actualizar las tasas sin modificar el código JavaScript principal.