import sharp from "sharp";

/**
 * Aplica una marca de agua de texto sobre una imagen.
 * @param {Buffer} inputBuffer  - Buffer original de la imagen
 * @param {string} texto        - Texto a estampar (ej: "© usuario2025" o texto personalizado)
 * @returns {Promise<Buffer>}   - Buffer de la imagen con la marca aplicada
 */
export async function aplicarMarcaAgua(inputBuffer, texto) {
  const meta = await sharp(inputBuffer).metadata();
  const w = meta.width || 800;
  const h = meta.height || 600;

  //proporcional
  const fontSize = Math.max(40, Math.round(w * 0.1));
  const cx = w / 2;
  const cy = h / 2;

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${cx + 2}" y="${cy + 2}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="black"
        fill-opacity="0.30"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-30, ${cx}, ${cy})"
      >${escaparXML(texto)}</text>
      <text
        x="${cx}" y="${cy}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="white"
        fill-opacity="0.55"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-30, ${cx}, ${cy})"
      >${escaparXML(texto)}</text>
    </svg>
  `;

  const bufferConMarca = await sharp(inputBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();

  return bufferConMarca;
}

function escaparXML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
