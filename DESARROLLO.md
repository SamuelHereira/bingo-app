# Ejecutar Bingo App

Requisitos: Node.js 20.19+ o 22.12+ y npm.

```sh
npm install
npm run dev
```

Abre la dirección local que muestra Vite. Para producción:

```sh
npm test
npm run build
npm run preview
```

La carpeta `dist` se puede servir en cualquier alojamiento estático. No requiere servidor de aplicación, usuarios ni base de datos. En producción debe servirse con HTTPS para la detección de imágenes duplicadas mediante Web Crypto; localhost también funciona.

## Implementación

### Ajustes de variedad y presentación

El cálculo sigue la regla de calculo-imagenes.md: K=N², D=ceil(K/4), y todos los pares comparten como máximo K-D imágenes. Antes de habilitar la carga se construye y verifica una familia de X conjuntos. Un Worker permite cambiar la configuración sin bloquear la pantalla y descarta cálculos obsoletos.

Para un cartón M=K. Se utilizan cotas inferiores de intersección total y empaquetamiento de Johnson, construcciones exactas de complementos disjuntos y planos proyectivos para 3×3 y 4×4. Para 20 cartones 4×4 el mínimo demostrado es 21 (20 imágenes permiten como máximo 5 cartones bajo esta regla).

Limitación respecto a RF-IMG-004: para el caso general se realiza una búsqueda constructiva acotada desde la cota inferior; si no encuentra solución utiliza palabras afines sobre un cuerpo primo. Todo resultado satisface la separación, pero solo se declara mínimo demostrado cuando coincide con la cota inferior. En los demás casos la interfaz muestra el intervalo y que el mínimo exacto no está demostrado. El fracaso de una búsqueda heurística nunca se presenta como prueba de imposibilidad. Los números ilustrativos del Markdown no se usan como valores predefinidos.

Generar y regenerar aplica una misma permutación del banco a todos los conjuntos y mezcla sus posiciones, preservando la separación. Si se cargan más de M imágenes, cada lote selecciona aleatoriamente M de ellas. El porcentaje de diferencia no elimina la posibilidad de empates durante el juego.

El selector de color actualiza los cartones existentes y se conserva en las descargas PNG y ZIP. Los cartones de imágenes muestran únicamente una cuadrícula cuadrada, sin encabezado BINGO ni casilla libre, incluso en la vista previa inicial.

- JavaScript modular y Vite; `fflate` genera los ZIP.
- Las imágenes permanecen en el navegador. El generador no se conserva al recargar; una partida iniciada en Sorteo sí intenta guardar su banco y estado.
- Los conjuntos se validan contra todos los anteriores, sin considerar posiciones, antes de pedir imágenes y nuevamente al generar.
- Se rechazan imágenes con los mismos píxeles decodificados, incluso si cambia su nombre. Versiones visualmente similares pero recomprimidas o retocadas pueden contar como imágenes diferentes.
- PNG de 2000 px de ancho; 2280 px de alto en la modalidad numérica para incluir BINGO. La exportación solo contiene el cartón; no incluye controles ni identificadores.
- Límites operativos: 5000 cartones por lote, 15 MB y 25 megapíxeles por imagen. Un ZIP muy grande requiere memoria proporcional al contenido; se recomienda dividir lotes grandes en dispositivos con poca memoria.
- Las fuentes de Google son opcionales y usan fuentes de respaldo si no hay conexión. Ninguna imagen se envía a ese servicio.

## Pruebas

`npm test` comprueba mínimos demostrados, separación de todos los pares en los cuatro tamaños, planes alterados, configuraciones obsoletas, bancos insuficientes o duplicados, regeneración, color, exportación y reglas numéricas.

## Sorteo

La navegación principal separa Generar cartones y Sorteo. Cambiar entre secciones conserva ambos estados. El sorteo permite números del 1 al 75 con su letra BINGO, o un banco independiente de PNG/JPEG/WEBP. Antes de iniciar se pueden agregar, eliminar y reemplazar imágenes; la detección de duplicados usa los mismos píxeles decodificados que el generador.

Después de generar cartones de imágenes se conserva una copia del banco realmente utilizado: la unión de las imágenes de todos los cartones, sin incluir archivos cargados que no aparezcan en ninguno. La opción Usar estas imágenes copia ese banco completo al sorteo. Las copias mantienen sus propios objetos URL y blobs, por lo que editar el banco del generador no rompe una partida en curso.

Cada extracción usa Web Crypto con muestreo por rechazo para seleccionar un índice sin sesgo entre los elementos restantes. El elemento se elimina de disponibles y se añade al historial cronológico. El botón se bloquea durante el guardado y al agotar el banco. Actual y anterior se derivan del historial; reiniciar y volver a configurar requieren confirmación.

IndexedDB guarda una partida por navegador y origen. Al inicio guarda atómicamente el estado y los blobs de imágenes; cada extracción posterior guarda los identificadores y el orden sin duplicar los archivos. Al recargar se restaura automáticamente la partida, también si terminó. No se guardan URLs blob efímeras. Si el almacenamiento falla se informa y la partida puede continuar en memoria. Borrar los datos del sitio elimina la partida; los bancos generados aún no reutilizados solo duran en la sesión. Para dirigir una partida utiliza una sola pestaña de Sorteo.

Pantalla completa usa la API del navegador y muestra un aviso cuando no está disponible. El diseño se adapta a móvil y proyector. No requiere backend ni envía las imágenes a un servidor.

### Validación de Sorteo

`npm test` verifica las 75 extracciones sin repetición, límites de letras, muestreo sin sesgo, unión de bancos, reinicio, restauración y rechazo de estados corruptos. IndexedDB se prueba con `fake-indexeddb`, incluyendo la conservación de blobs entre instancias. En navegador se comprobaron una partida completa de 75 números, fin automático, recuperación tras recarga, cancelación y confirmación de reinicio y pantalla completa.

La prueba manual de carga local de imágenes requiere que la extensión de control del navegador tenga permiso de acceso a archivos. Esto no afecta a usuarios que seleccionen archivos normalmente en la aplicación.
