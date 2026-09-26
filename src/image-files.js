export async function loadImage(file) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error(
      `${file.name}: el archivo no es una imagen PNG, JPG o WEBP válida.`,
    );
  if (file.size > 15 * 1024 * 1024)
    throw new Error(`${file.name}: supera el límite de 15 MB.`);
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    // Hash decoded pixels so renamed files and identical images in different formats are detected.
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    if (canvas.width * canvas.height > 25_000_000)
      throw new Error("La imagen supera los 25 megapíxeles.");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(img, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const hash = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", pixels)),
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return {
      blob: file,
      id: crypto.randomUUID(),
      name: file.name,
      url,
      hash: `${canvas.width}x${canvas.height}:${hash}`,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw new Error(
      `${file.name}: no se pudo leer la imagen. ${error.message}`,
    );
  }
}
