# Instrucciones para Insertar Pandillas de Ejemplo

Este documento explica cómo insertar las 3 pandillas de ejemplo en la zona sur de San Luis Potosí.

## Datos de las Pandillas

### 1. Los Sureños
- **Ubicación**: Colonia La Pila, Avenida Universidad 1250
- **Líder**: Javier "El Javi" Martínez
- **Integrantes**: 12
- **Edades**: 18-25 años
- **Horario**: Viernes y sábados, 20:00-02:00
- **Peligrosidad**: 6 (Alto)
- **Delitos**: Extorsión, Tráfico de drogas

### 2. Los Valles
- **Ubicación**: Colonia Valle de San Francisco, Calle Prolongación Alameda 850
- **Líder**: Carlos "El Charly" Rodríguez
- **Integrantes**: 8
- **Edades**: 16-22 años
- **Horario**: Jueves y domingos, 19:00-01:00
- **Peligrosidad**: 5 (Medio-Alto)
- **Delitos**: Robo a transeúnte, Venta de drogas

### 3. Los Escalones
- **Ubicación**: Colonia Escalerillas, Boulevard Antonio Rocha Cordero 2100
- **Líder**: Miguel "El Mike" Sánchez
- **Integrantes**: 6
- **Edades**: 17-24 años
- **Horario**: Sábados y domingos, 18:00-00:00
- **Peligrosidad**: 7 (Alto)
- **Delitos**: Robo a vehículo, Asalto

## Pasos para Insertar

### Opción 1: Usar el script completo (Recomendado)
1. Abre phpMyAdmin
2. Selecciona la base de datos `pandillas`
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido de `insertar_pandillas_ejemplo.sql`
5. Ejecuta el script

### Opción 2: Insertar paso a paso
1. Ejecuta primero las direcciones del archivo `insertar_pandillas_ejemplo_v2.sql`
2. Verifica los IDs de las direcciones insertadas
3. Ajusta los IDs en las consultas de las pandillas si es necesario
4. Ejecuta las inserciones de pandillas

## Verificación

Después de insertar, ejecuta esta consulta para verificar:

```sql
SELECT p.id_pandilla, p.nombre, p.lider, p.peligrosidad, p.numero_integrantes,
       d.colonia, d.calle, d.latitud, d.longitud 
FROM pandillas p 
INNER JOIN direcciones d ON p.id_direccion = d.id_direccion 
WHERE p.id_zona = 2;
```

## Nota Importante

⚠️ **Estos son datos de ejemplo ficticios creados únicamente para fines educativos y de desarrollo del proyecto SIGP. No representan información real sobre grupos delictivos.**

