# Bingo App – Documento de Requerimientos

## 1. Descripción general

**Bingo App** será una aplicación web que permitirá generar cartones de bingo personalizados para posteriormente descargarlos como imágenes.

La aplicación soportará dos modalidades:

1. **Bingo de números**
2. **Bingo de imágenes**

El usuario podrá indicar la cantidad de cartones que desea generar y configurar el bingo según la modalidad seleccionada.

El objetivo principal es generar cartones diferentes entre sí y listos para imprimir o utilizar digitalmente.

---

# 2. Flujo general

El flujo principal de la aplicación será:

1. Ingresar la cantidad de cartones que se desea generar.
2. Seleccionar el tipo de bingo:
   - Números.
   - Imágenes.
3. Configurar las opciones correspondientes al tipo seleccionado.
4. Validar que exista suficiente información para generar los cartones.
5. Generar los cartones.
6. Visualizar los cartones generados.
7. Descargar un cartón individualmente o todos los cartones.

---

# 3. Pantalla de configuración

La pantalla inicial deberá permitir configurar el bingo antes de generar los cartones.

## 3.1. Cantidad de cartones

El usuario deberá poder ingresar:

**Cantidad de cartones a generar**

Ejemplo:

```text
Cantidad de cartones: 20
```

La cantidad deberá:

- Ser un número entero.
- Ser mayor a 0.
- No aceptar valores negativos.
- No aceptar valores decimales.

---

# 4. Selección del tipo de bingo

El sistema deberá permitir seleccionar entre:

```text
( ) Bingo de números
( ) Bingo de imágenes
```

Las opciones de configuración mostradas posteriormente dependerán del tipo seleccionado.

---

# 5. Bingo de números

Cuando el usuario seleccione **Bingo de números**, la aplicación utilizará automáticamente el formato tradicional de bingo.

## 5.1. Tamaño

El bingo de números siempre tendrá una cuadrícula:

```text
5 × 5
```

No será necesario que el usuario seleccione el tamaño.

---

## 5.2. Encabezado

El cartón deberá utilizar las columnas tradicionales:

```text
B | I | N | G | O
```

---

## 5.3. Rangos

Cada columna deberá utilizar los siguientes rangos:

| Columna | Rango |
|---|---|
| B | 1 – 15 |
| I | 16 – 30 |
| N | 31 – 45 |
| G | 46 – 60 |
| O | 61 – 75 |

---

## 5.4. Casilla central

La posición central del cartón deberá ser una casilla:

```text
LIBRE
```

Por lo tanto, cada cartón tendrá:

- 24 números.
- 1 casilla libre.

---

## 5.5. Generación

El sistema deberá generar exactamente la cantidad de cartones solicitada por el usuario.

Ejemplo:

```text
Cantidad solicitada: 50

Resultado:
50 cartones de bingo 5 × 5
```

Los cartones deberán ser diferentes entre sí.

No deberá generarse dos veces exactamente el mismo cartón.

---

# 6. Bingo de imágenes

Cuando el usuario seleccione **Bingo de imágenes**, deberá poder configurar el tamaño de la cuadrícula.

---

# 7. Tamaño de cuadrícula

El usuario podrá seleccionar el tamaño del cartón.

Inicialmente se contemplan:

```text
3 × 3
4 × 4
5 × 5
6 × 6
```

El sistema deberá calcular automáticamente la cantidad de casillas.

Ejemplo:

| Tamaño | Casillas |
|---|---:|
| 3 × 3 | 9 |
| 4 × 4 | 16 |
| 5 × 5 | 25 |
| 6 × 6 | 36 |

---

# 8. Banco de imágenes

Para generar bingo de imágenes, el usuario deberá cargar un conjunto de imágenes que funcionará como **banco de imágenes del bingo**.

Los formatos permitidos inicialmente serán:

```text
PNG
JPG
JPEG
WEBP
```

---

# 9. Cantidad mínima de imágenes

La cantidad mínima de imágenes dependerá del tamaño de la cuadrícula.

Para generar **un solo cartón**, será necesario tener como mínimo una imagen diferente por cada casilla.

Ejemplo:

```text
Cuadrícula: 4 × 4

Casillas: 16

Mínimo para generar 1 cartón:
16 imágenes diferentes
```

Por lo tanto:

| Cuadrícula | Mínimo para 1 cartón |
|---|---:|
| 3 × 3 | 9 imágenes |
| 4 × 4 | 16 imágenes |
| 5 × 5 | 25 imágenes |
| 6 × 6 | 36 imágenes |

---

# 10. Regla de múltiples cartones

Esta es una de las reglas principales de la aplicación.

**Cambiar únicamente la posición de las mismas imágenes NO será considerado suficiente para generar cartones diferentes.**

Ejemplo:

Si existe una cuadrícula:

```text
4 × 4
```

y el usuario carga exactamente:

```text
16 imágenes
```

solamente podrá generarse:

```text
1 cartón
```

Aunque matemáticamente las 16 imágenes puedan organizarse en posiciones diferentes, todos los cartones continuarían teniendo exactamente las mismas imágenes.

Esto no es válido para el objetivo de la aplicación, ya que todos los participantes tendrían esencialmente el mismo conjunto de elementos.

---

# 11. Combinaciones diferentes

Para generar múltiples cartones, deberá existir un banco de imágenes superior al número de casillas del cartón.

Ejemplo:

```text
Cuadrícula: 4 × 4
Casillas por cartón: 16

Banco de imágenes: 25
```

Cada cartón seleccionará 16 imágenes de las 25 disponibles.

Ejemplo conceptual:

```text
Cartón 1:
1, 2, 3, 4, 5, 6, 7, 8,
9, 10, 11, 12, 13, 14, 15, 16

Cartón 2:
1, 2, 3, 4, 5, 6, 7, 8,
9, 10, 11, 12, 13, 17, 18, 19

Cartón 3:
1, 2, 3, 4, 5, 6, 7, 8,
9, 10, 14, 15, 16, 20, 21, 22
```

De esta manera los participantes no tendrán exactamente las mismas imágenes.

---

# 12. Regla de unicidad

Dos cartones se considerarán diferentes únicamente cuando tengan una **combinación diferente de imágenes**.

Por ejemplo:

```text
Cartón A:
🐶 🐱 🐭
🐹 🐰 🦊
🐻 🐼 🐨
```

y:

```text
Cartón B:
🐨 🐼 🐻
🦊 🐰 🐹
🐭 🐱 🐶
```

contienen exactamente las mismas 9 imágenes.

Por lo tanto, para efectos de generación:

```text
Cartón A = Cartón B
```

aunque las imágenes se encuentren en posiciones diferentes.

El sistema no deberá utilizar únicamente cambios de posición para considerar que dos cartones son distintos.

---

# 13. Cálculo de imágenes necesarias

Cuando el usuario seleccione:

- Cantidad de cartones.
- Tamaño de cuadrícula.

El sistema deberá determinar si el banco de imágenes disponible permite generar la cantidad solicitada.

La cantidad máxima de combinaciones posibles se calculará utilizando:

```text
C(n, k)
```

Donde:

```text
n = cantidad total de imágenes disponibles
k = cantidad de casillas del cartón
```

La fórmula será:

```text
C(n,k) = n! / (k! × (n-k)!)
```

Ejemplo:

Para:

```text
Cuadrícula: 4 × 4
k = 16

Imágenes disponibles: 17
n = 17
```

Existen:

```text
C(17,16) = 17
```

combinaciones diferentes.

Por lo tanto, matemáticamente podrían generarse hasta:

```text
17 cartones con conjuntos diferentes.
```

---

# 14. Indicador de imágenes necesarias

La interfaz deberá ayudar al usuario a saber cuántas imágenes necesita.

Ejemplo:

```text
Cantidad de cartones: 20
Cuadrícula: 4 × 4

Necesitas cargar al menos 18 imágenes diferentes.
```

El sistema deberá calcular automáticamente el mínimo número de imágenes `n` que permita:

```text
C(n, 16) >= 20
```

De esta manera el usuario no tendrá que calcular manualmente cuántas imágenes necesita.

---

# 15. Carga de imágenes

La aplicación deberá proporcionar una sección para cargar las imágenes.

Preferiblemente deberá soportar:

- Selección de archivos.
- Arrastrar y soltar archivos.

La interfaz deberá mostrar el progreso.

Ejemplo:

```text
Imágenes requeridas: 18

Imágenes cargadas:
14 / 18
```

---

# 16. Previsualización de imágenes

Cada imagen cargada deberá mostrar una miniatura.

Ejemplo conceptual:

```text
[imagen] [imagen] [imagen] [imagen]

[imagen] [imagen] [imagen] [imagen]

[imagen] [imagen] [imagen] [imagen]
```

Cada imagen deberá poder:

- Visualizarse.
- Eliminarse.
- Reemplazarse.

---

# 17. Validación antes de generar

El botón:

```text
Generar cartones
```

deberá permanecer deshabilitado mientras no existan suficientes imágenes para generar la cantidad de cartones solicitada.

Ejemplo:

```text
Cartones solicitados: 20
Cuadrícula: 4 × 4

Necesarias: 18 imágenes
Cargadas: 16 imágenes

[ Generar cartones ] DESHABILITADO
```

Cuando se alcance la cantidad necesaria:

```text
Necesarias: 18 imágenes
Cargadas: 18 imágenes

[ Generar cartones ] HABILITADO
```

---

# 18. Distribución de imágenes

Al generar los cartones:

1. Cada cartón deberá contener exactamente el número de imágenes correspondiente a su cuadrícula.
2. Una imagen no podrá repetirse dentro del mismo cartón.
3. Cada cartón deberá utilizar una combinación diferente de imágenes.
4. No podrán existir dos cartones con exactamente el mismo conjunto de imágenes.
5. Una vez seleccionada la combinación de imágenes de cada cartón, su posición dentro de la cuadrícula podrá aleatorizarse.

---

# 19. Distribución equilibrada

El algoritmo deberá intentar distribuir las imágenes de manera equilibrada.

Se deberá evitar, cuando sea posible, que:

- Una imagen aparezca excesivamente en los cartones.
- Algunas imágenes prácticamente nunca aparezcan.
- Los cartones sean demasiado similares entre sí.

El objetivo será generar cartones suficientemente variados utilizando el banco de imágenes disponible.

---

# 20. Vista previa de cartones

Después de la generación, se deberá mostrar una pantalla de resultados.

Ejemplo:

```text
20 cartones generados correctamente.

< Cartón 1 de 20 >
```

El usuario deberá poder:

- Ver el cartón actual.
- Ir al cartón anterior.
- Ir al siguiente cartón.
- Seleccionar un cartón específico.

---

# 21. Regenerar cartones

El usuario podrá seleccionar:

```text
Regenerar
```

Esto generará nuevamente los cartones utilizando la misma configuración.

La nueva generación deberá volver a realizar la selección y distribución aleatoria.

---

# 22. Formato visual

Los cartones deberán mantener una estructura uniforme.

Cada casilla deberá tener:

- Mismo ancho.
- Mismo alto.
- Separación uniforme.
- Imagen centrada.

Las imágenes deberán adaptarse al espacio disponible sin deformarse.

Preferiblemente se utilizará un comportamiento equivalente a:

```css
object-fit: contain;
```

para evitar distorsiones.

---

# 23. Exportación

Cada cartón deberá poder exportarse como una imagen independiente.

Formato inicial:

```text
PNG
```

La imagen deberá tener una resolución suficientemente alta para poder imprimirse sin pérdida significativa de calidad.

---

# 24. Contenido de la imagen exportada

La imagen generada deberá contener **únicamente el cartón**.

No deberá incluir:

- Botones.
- Menús.
- Navegación.
- Número del cartón.
- Textos de configuración.
- Controles de la aplicación.
- Botones de descarga.

Es decir:

```text
┌────┬────┬────┬────┐
│ 🖼 │ 🖼 │ 🖼 │ 🖼 │
├────┼────┼────┼────┤
│ 🖼 │ 🖼 │ 🖼 │ 🖼 │
├────┼────┼────┼────┤
│ 🖼 │ 🖼 │ 🖼 │ 🖼 │
├────┼────┼────┼────┤
│ 🖼 │ 🖼 │ 🖼 │ 🖼 │
└────┴────┴────┴────┘
```

---

# 25. Descarga individual

La vista previa deberá incluir:

```text
Descargar cartón
```

Esto descargará únicamente el cartón actualmente seleccionado.

Ejemplo:

```text
carton-001.png
```

---

# 26. Descarga masiva

La aplicación deberá permitir:

```text
Descargar todos
```

Cuando existan varios cartones, se generará un archivo ZIP.

Ejemplo:

```text
cartones-bingo.zip
```

Contenido:

```text
carton-001.png
carton-002.png
carton-003.png
carton-004.png
...
carton-020.png
```

---

# 27. Manejo de errores

La aplicación deberá mostrar mensajes claros cuando exista algún problema.

Ejemplos:

```text
Debes ingresar la cantidad de cartones.
```

```text
La cantidad de cartones debe ser mayor a 0.
```

```text
Debes seleccionar un tipo de bingo.
```

```text
Necesitas cargar al menos 18 imágenes para generar 20 cartones de 4 × 4.
```

```text
El archivo seleccionado no es una imagen válida.
```

```text
No existen suficientes combinaciones para generar la cantidad de cartones solicitada.
```

---

# 28. Requerimientos funcionales

### RF-001
El sistema deberá permitir ingresar la cantidad de cartones a generar.

### RF-002
El sistema deberá permitir seleccionar entre bingo de números y bingo de imágenes.

### RF-003
El bingo de números deberá utilizar automáticamente una cuadrícula 5 × 5.

### RF-004
El bingo de números deberá utilizar las columnas B, I, N, G y O.

### RF-005
El bingo de números deberá respetar los rangos tradicionales correspondientes a cada columna.

### RF-006
El bingo de números deberá incluir una casilla central libre.

### RF-007
El sistema deberá generar la cantidad solicitada de cartones numéricos diferentes.

### RF-008
El bingo de imágenes deberá permitir seleccionar el tamaño de la cuadrícula.

### RF-009
El sistema deberá calcular automáticamente la cantidad de casillas según el tamaño seleccionado.

### RF-010
El sistema deberá calcular la cantidad mínima de imágenes necesarias según el tamaño de la cuadrícula y la cantidad de cartones solicitados.

### RF-011
El sistema deberá permitir cargar imágenes desde el dispositivo.

### RF-012
El sistema deberá mostrar la cantidad de imágenes cargadas y requeridas.

### RF-013
El sistema deberá permitir eliminar una imagen cargada.

### RF-014
El sistema deberá permitir reemplazar una imagen cargada.

### RF-015
El sistema deberá mostrar una vista previa de las imágenes cargadas.

### RF-016
El sistema no deberá permitir generar cartones mientras no exista una cantidad suficiente de imágenes.

### RF-017
Una imagen no podrá repetirse dentro del mismo cartón.

### RF-018
Cada cartón deberá utilizar una combinación de imágenes diferente.

### RF-019
Dos cartones que contienen exactamente las mismas imágenes deberán considerarse iguales aunque las posiciones sean diferentes.

### RF-020
El sistema deberá evitar generar combinaciones de cartones duplicadas.

### RF-021
El sistema deberá distribuir las imágenes de manera aleatoria.

### RF-022
El sistema deberá intentar mantener una distribución equilibrada de las imágenes entre todos los cartones.

### RF-023
El sistema deberá mostrar una vista previa de los cartones generados.

### RF-024
El usuario deberá poder navegar entre los cartones generados.

### RF-025
El usuario deberá poder regenerar los cartones.

### RF-026
El usuario deberá poder descargar individualmente cada cartón.

### RF-027
El usuario deberá poder descargar todos los cartones generados.

### RF-028
La descarga masiva deberá generar un archivo ZIP.

### RF-029
Cada cartón deberá exportarse como una imagen PNG independiente.

### RF-030
La imagen exportada deberá contener únicamente la cuadrícula del bingo.

---

# 29. Requerimientos no funcionales

### RNF-001 – Responsive

La aplicación deberá poder utilizarse desde:

- Computadoras.
- Tablets.
- Dispositivos móviles.

### RNF-002 – Procesamiento

La generación de los cartones deberá realizarse de manera eficiente sin bloquear innecesariamente la interfaz.

### RNF-003 – Privacidad

Las imágenes cargadas deberán utilizarse únicamente para generar los cartones.

Preferiblemente todo el procesamiento deberá realizarse localmente en el navegador cuando sea técnicamente posible.

### RNF-004 – Calidad de exportación

Los cartones deberán generarse con resolución suficiente para impresión.

### RNF-005 – Usabilidad

La interfaz deberá mostrar claramente:

- Configuración actual.
- Cantidad de cartones.
- Tamaño.
- Imágenes necesarias.
- Imágenes cargadas.
- Estado de generación.

---

# 30. Criterios de aceptación generales

1. El usuario puede seleccionar bingo numérico o bingo de imágenes.
2. El usuario puede indicar cuántos cartones necesita.
3. El bingo numérico se genera utilizando el formato tradicional 5 × 5.
4. El bingo de imágenes permite seleccionar el tamaño de la cuadrícula.
5. El sistema calcula automáticamente cuántas imágenes son necesarias.
6. Con exactamente el mismo número de imágenes que casillas, solamente puede generarse un cartón.
7. Para múltiples cartones se requieren combinaciones diferentes de imágenes.
8. Cambiar únicamente la posición de las imágenes no convierte un cartón en un cartón diferente.
9. No existen imágenes repetidas dentro de un mismo cartón.
10. No existen dos cartones con exactamente el mismo conjunto de imágenes.
11. El sistema valida que existan suficientes combinaciones antes de generar.
12. Se genera exactamente la cantidad de cartones solicitada.
13. Los cartones pueden visualizarse antes de descargarse.
14. Los cartones pueden descargarse individualmente.
15. Todos los cartones pueden descargarse conjuntamente.
16. La descarga masiva genera un ZIP.
17. Cada cartón se descarga como PNG.
18. La imagen descargada contiene únicamente la cuadrícula.
19. Las imágenes mantienen sus proporciones y no se deforman.
20. Los cartones generados tienen calidad suficiente para ser impresos.

---

# 31. Ejemplo de funcionamiento

El usuario ingresa:

```text
Cantidad de cartones:
20

Tipo:
Imágenes

Cuadrícula:
4 × 4
```

El sistema determina:

```text
Casillas por cartón:
16

Cartones:
20

Cantidad mínima de imágenes:
18
```

La interfaz muestra:

```text
Carga tus imágenes

0 / 18
```

El usuario carga las 18 imágenes.

```text
18 / 18 ✓
```

Se habilita:

```text
[ Generar 20 cartones ]
```

El sistema genera 20 combinaciones diferentes.

Cada combinación contiene:

```text
16 imágenes diferentes
```

y ninguna de las 20 combinaciones es idéntica a otra.

Finalmente:

```text
✓ 20 cartones generados

[ < ] Cartón 1 de 20 [ > ]

[ Descargar cartón ]

[ Descargar todos (.ZIP) ]

[ Regenerar ]
```

---

# 32. Alcance inicial del MVP

Para la primera versión se contempla:

- Bingo de números 5 × 5.
- Bingo de imágenes.
- Cuadrículas 3 × 3, 4 × 4, 5 × 5 y 6 × 6.
- Carga de imágenes.
- Cálculo automático de imágenes necesarias.
- Validación de combinaciones.
- Generación aleatoria de cartones.
- Vista previa.
- Descarga PNG.
- Descarga masiva ZIP.
- Procesamiento preferentemente en el navegador.

No se requiere inicialmente:

- Registro de usuarios.
- Inicio de sesión.
- Base de datos.
- Guardado permanente de bingos.
- Historial de cartones.
- Pagos.
- Compartir bingos mediante enlaces.
- Aplicación móvil nativa.