const tags = [];

function renderTags() {
  document.getElementById("contenedorTags").innerHTML = tags
    .map(
      (t, i) => `
        <span class="tag-badge">
          #${t}
          <button type="button" onclick="quitarTag(${i})">✕</button>
        </span>
      `,
    )
    .join("");
  document.getElementById("etiquetas").value = tags.join(",");
}

function agregarEtiqueta() {
  const input = document.getElementById("inputEtiqueta");
  const valor = input.value.trim().toLowerCase().replace(/\s+/g, "-");
  if (valor && !tags.includes(valor)) {
    tags.push(valor);
    renderTags();
  }
  input.value = "";
  input.focus();
}

function quitarTag(i) {
  tags.splice(i, 1);
  renderTags();
}

document.getElementById("inputEtiqueta").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    agregarEtiqueta();
  }
});

let imagenesCargadas = [];

function leerArchivoComoBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

document
  .getElementById("inputImagenes")
  .addEventListener("change", async (e) => {
    const archivos = Array.from(e.target.files);
    for (const file of archivos) {
      const base64 = await leerArchivoComoBase64(file);
      imagenesCargadas.push({
        nombre: file.name,
        previewUrl: base64,
        base64,
        copyright: false,
        marcaAgua: "",
      });
    }
    e.target.value = "";
    renderImagenes();
  });

const zona = document.getElementById("zona-imagenes");
zona.addEventListener("dragover", (e) => {
  e.preventDefault();
  zona.style.borderColor = "#0d6efd";
});
zona.addEventListener("dragleave", () => {
  zona.style.borderColor = "#ccc";
});
zona.addEventListener("drop", async (e) => {
  e.preventDefault();
  zona.style.borderColor = "#ccc";
  const archivos = Array.from(e.dataTransfer.files).filter((f) =>
    f.type.startsWith("image/"),
  );
  for (const file of archivos) {
    const base64 = await leerArchivoComoBase64(file);
    imagenesCargadas.push({ nombre: file.name, previewUrl: base64, base64 });
  }
  renderImagenes();
});

function eliminarImagen(idx) {
  imagenesCargadas.splice(idx, 1);
  renderImagenes();
}

function renderImagenes() {
  const contenedorInputs = document.getElementById("inputsBase64");
  contenedorInputs.innerHTML = imagenesCargadas
    .map((img) => `<input type="hidden" name="imagenes" value="${img.base64}">`)
    .join("");

  document.getElementById("previewGrid").innerHTML = imagenesCargadas
    .map(
      (img, i) => `
        <div class="col-6 col-md-4">
          <div class="imagen-preview-card border rounded p-1">
            <img src="${img.previewUrl}" alt="Preview ${i + 1}">
            <button type="button" class="btn-eliminar" onclick="eliminarImagen(${i})">✕</button>
            <div class="mt-1 text-center">
              <small class="text-muted text-truncate d-block">${img.nombre}</small>
            </div>
          </div>
        </div>
      `,
    )
    .join("");

  const panel = document.getElementById("panelImagenes");
  if (imagenesCargadas.length === 0) {
    panel.innerHTML = "";
    return;
  }

  panel.innerHTML = `
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white fw-semibold">⚙️ Opciones por imagen</div>
          <div class="card-body p-0">
            ${imagenesCargadas
              .map(
                (img, i) => `
              <div class="p-3 ${i < imagenesCargadas.length - 1 ? "border-bottom" : ""}">
                <div class="d-flex align-items-center gap-3 mb-2">
                  <img src="${img.previewUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
                  <span class="fw-medium text-truncate">${img.nombre}</span>
                </div>
                <div class="form-check mb-2">
                  <input type="hidden" name="copyright" id="cr_hidden_${i}" value="${img.copyright ? "true" : "false"}">
                  <input class="form-check-input" type="checkbox"
                    id="cr_${i}" value="true"
                    ${img.copyright ? "checked" : ""}
                    onchange="toggleMarcaAgua(${i}, this.checked)">
                  <label class="form-check-label" for="cr_${i}">
                    🔒 Esta imagen tiene Copyright
                  </label>
                </div>
                <div id="opciones_cr_${i}" class="opciones-copyright ms-4">
                  <label class="form-label small fw-medium">Texto de marca de agua <span class="text-muted">(opcional)</span></label>
                  <input type="text" class="form-control form-control-sm"
                    name="marca_agua"
                    placeholder="Ej: © Tu Nombre 2025"
                    id="ma_${i}"
                    value="${img.marcaAgua || ""}">
                  <div class="form-text">Dejalo vacío si no querés marca de agua.</div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
}

function toggleMarcaAgua(idx, checked) {
  document.getElementById(`opciones_cr_${idx}`).style.display = checked
    ? "block"
    : "none";
  document.getElementById(`cr_hidden_${idx}`).value = checked
    ? "true"
    : "false";
  imagenesCargadas[idx].copyright = checked;
  if (!checked) {
    document.getElementById(`ma_${idx}`).value = "";
    imagenesCargadas[idx].marcaAgua = "";
  }
}

document.getElementById("formPublicacion").addEventListener("submit", (e) => {
  if (imagenesCargadas.length === 0) {
    e.preventDefault();
    alert("Debés agregar al menos una imagen.");
    return;
  }
  if (tags.length === 0) {
    e.preventDefault();
    alert("Debés agregar al menos una etiqueta.");
    return;
  }
  const btn = document.getElementById("btnPublicar");
  btn.disabled = true;
  btn.textContent = "Publicando...";
});
