# Bingo App – Cálculo de imágenes requeridas

## 1. Flujo principal para Bingo de imágenes

El flujo obligatorio será:

```text
1. Usuario indica cantidad de cartones
                ↓
2. Usuario selecciona tamaño de cuadrícula
                ↓
3. Sistema calcula cantidad mínima de imágenes requeridas
                ↓
4. Sistema informa cuántas imágenes debe adjuntar
                ↓
5. Usuario adjunta las imágenes
                ↓
6. Sistema valida que tenga la cantidad requerida
                ↓
7. Se habilita "Generar cartones"
                ↓
8. Sistema genera los cartones
```

La carga de imágenes **no será el punto de partida para determinar cuántos cartones pueden generarse**.

La aplicación deberá determinar previamente cuántas imágenes necesita el usuario.

---

# 2. Datos ingresados por el usuario

Para realizar el cálculo inicial solamente serán necesarios:

### Cantidad de cartones

```text
X = cantidad de cartones que se desea generar
```

Ejemplo:

```text
20 cartones
```

### Tamaño de cuadrícula

```text
N × N
```

Ejemplo:

```text
4 × 4
```

La cantidad de imágenes que tendrá cada cartón será:

```text
K = N²
```

Para 4 × 4:

```text
K = 16
```

---

# 3. Regla de variación

La aplicación tendrá configurado internamente un porcentaje mínimo de diferencia entre cartones.

Inicialmente:

```text
P = 25 %
```

Por lo tanto:

```text
D = ceil(K × P)
```

Donde:

```text
D = cantidad mínima de imágenes diferentes
    entre cualquier par de cartones.
```

Ejemplo para 4 × 4:

```text
K = 16

D = ceil(16 × 0.25)

D = 4
```

Cada par de cartones deberá diferenciarse en al menos:

```text
4 imágenes
```

y podrá compartir como máximo:

```text
16 - 4 = 12 imágenes
```

---

# 4. Cálculo automático del banco requerido

Una vez conocidos:

```text
X = cantidad de cartones
K = cantidad de imágenes por cartón
D = diferencia mínima
```

la aplicación deberá calcular:

```text
M = cantidad mínima de imágenes que
    el usuario deberá adjuntar.
```

Por lo tanto:

```text
M = f(X, K, D)
```

La cantidad requerida NO será un valor fijo asociado únicamente al tamaño de la cuadrícula.

También dependerá de cuántos cartones se desean generar.

---

# 5. Condición que debe cumplir M

El sistema deberá encontrar un banco de `M` imágenes que permita generar:

```text
X cartones
```

donde cada cartón contenga:

```text
K imágenes diferentes
```

y para cualquier par de cartones:

```text
Ci y Cj
```

deberá cumplirse:

```text
|Ci ∩ Cj| <= K - D
```

Es decir:

```text
imágenes compartidas <= máximo permitido
```

---

# 6. Ejemplo

El usuario selecciona:

```text
Cantidad de cartones:
20

Cuadrícula:
4 × 4
```

Automáticamente:

```text
K = 16

D = 4

Coincidencia máxima = 12
```

En ese momento la aplicación deberá calcular `M`.

La interfaz deberá responder inmediatamente:

```text
20 cartones
4 × 4

Cada cartón tendrá:
16 imágenes

Diferencia mínima entre cartones:
4 imágenes

────────────────────────

Necesitas adjuntar:

XX IMÁGENES DIFERENTES

────────────────────────
```

Solamente después de obtener este resultado deberá mostrarse/habilitarse la sección para adjuntar imágenes.

---

# 7. Cálculo de M

El sistema deberá buscar el menor banco de imágenes que permita generar la configuración solicitada.

Conceptualmente:

```text
M = K

¿Con M imágenes puedo generar
X cartones cumpliendo D?
        ↓
       NO
        ↓
M = M + 1
        ↓
Volver a comprobar
        ↓
       NO
        ↓
M = M + 1
        ↓
       ...
        ↓
       SÍ
        ↓
M = cantidad requerida
```

Para un solo cartón:

```text
X = 1
```

el resultado será siempre:

```text
M = K
```

Ejemplo:

```text
1 cartón 4 × 4

→ 16 imágenes requeridas
```

---

# 8. La combinatoria simple no es suficiente

No se deberá utilizar únicamente:

```text
C(M,K) >= X
```

para calcular las imágenes requeridas.

Esto permitiría cartones excesivamente similares.

Por ejemplo:

```text
Cartón A:
A B C D E F G H I J K L M N O P

Cartón B:
A B C D E F G H I J K L M N O Q
```

Aunque matemáticamente son dos combinaciones diferentes, solamente cambia:

```text
1 de 16 imágenes
```

El sistema deberá rechazarlas porque para 4 × 4 se requieren:

```text
mínimo 4 imágenes diferentes.
```

---

# 9. Validación del cálculo

El valor `M` obtenido deberá permitir construir `X` conjuntos:

```text
C1
C2
C3
...
CX
```

cada uno con:

```text
|Ci| = K
```

y cualquier par deberá cumplir:

```text
K - |Ci ∩ Cj| >= D
```

La aplicación deberá realizar este cálculo **antes de solicitar las imágenes al usuario**.

---

# 10. Interfaz de carga

Una vez calculado `M`, se mostrará:

```text
Necesitas adjuntar 24 imágenes diferentes.

[ Seleccionar imágenes ]

0 / 24 imágenes
```

A medida que el usuario adjunte:

```text
5 / 24
12 / 24
20 / 24
24 / 24 ✓
```

---

# 11. Habilitación de generación

Mientras:

```text
imágenesCargadas < M
```

el botón deberá permanecer deshabilitado:

```text
[ Generar cartones ]
        🔒
```

Cuando:

```text
imágenesCargadas >= M
```

se habilitará:

```text
[ Generar cartones ]
```

---

# 12. Cambio de configuración

Si después de cargar imágenes el usuario modifica:

- Cantidad de cartones.
- Tamaño de cuadrícula.

La aplicación deberá recalcular inmediatamente:

```text
M
```

Ejemplo:

```text
Configuración anterior:

10 cartones
4 × 4
Necesarias: 20 imágenes

Nueva configuración:

30 cartones
4 × 4
Necesarias: 25 imágenes
```

Si solamente existen 20 imágenes cargadas:

```text
20 / 25 imágenes
```

el botón de generación volverá a quedar deshabilitado hasta completar las imágenes faltantes.

---

# 13. Regla funcional principal

### RF-IMG-001

Al seleccionar Bingo de imágenes, el usuario deberá indicar primero:

1. Cantidad de cartones.
2. Tamaño de cuadrícula.

### RF-IMG-002

El sistema deberá calcular automáticamente la cantidad de celdas:

```text
K = N²
```

### RF-IMG-003

El sistema deberá calcular la diferencia mínima entre cartones.

```text
D = ceil(K × 0.25)
```

### RF-IMG-004

El sistema deberá determinar automáticamente la cantidad mínima `M` de imágenes necesarias para generar los `X` cartones respetando la diferencia mínima.

### RF-IMG-005

El cálculo de `M` deberá realizarse antes de solicitar al usuario que adjunte las imágenes.

### RF-IMG-006

La interfaz deberá informar claramente:

```text
Necesitas adjuntar M imágenes diferentes.
```

### RF-IMG-007

La sección de carga deberá mostrar:

```text
imágenes cargadas / imágenes requeridas
```

### RF-IMG-008

El sistema no deberá permitir generar los cartones mientras no se alcance la cantidad requerida.

### RF-IMG-009

Si cambia la cantidad de cartones o el tamaño de la cuadrícula, el sistema deberá recalcular automáticamente `M`.

---

# 14. Flujo final

```text
BINGO DE IMÁGENES

¿Cuántos cartones necesitas?

[ 20 ]

Tamaño:

[ 3 × 3 ]
[ 4 × 4 ] ✓
[ 5 × 5 ]
[ 6 × 6 ]

           ↓

Sistema calcula:

Cartones: 20
Celdas por cartón: 16
Diferencia mínima: 4

           ↓

Necesitas adjuntar:

[ XX IMÁGENES ]

           ↓

Adjuntar imágenes

[ Seleccionar archivos ]

XX / XX ✓

           ↓

[ GENERAR 20 CARTONES ]
```

## Regla central

La aplicación deberá responder primero a la pregunta:

> **“Para la cantidad de cartones y tamaño que seleccioné, ¿cuántas imágenes diferentes tengo que adjuntar?”**

Solamente después de responder esta pregunta se iniciará el proceso de carga y generación de cartones.
