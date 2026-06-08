document
  .getElementById("inputFotoPerfil")
  ?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      document.getElementById("inputFotoPerfilBase64").value = base64;

      const preview = document.getElementById("previewFotoPerfil");
      preview.innerHTML = `<img src="${base64}" class="rounded-circle" width="60" height="60" style="object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  });

async function toggleSeguir(accion, usuarioId) {
  const url = `/perfil/${accion}/${usuarioId}`;
  const res = await fetch(url, { method: "POST" });
  const data = await res.json();
  if (data.ok) location.reload();
  else alert(data.error || "Error al procesar la acción.");
}
const btnSeguir = document.getElementById("btnSeguir");
if (btnSeguir) {
  btnSeguir.addEventListener("click", () =>
    toggleSeguir("seguir", btnSeguir.dataset.id),
  );
}
const btnDejarDeSeguir = document.getElementById("btnDejarDeSeguir");
if (btnDejarDeSeguir) {
  btnDejarDeSeguir.addEventListener("click", () =>
    toggleSeguir("dejar-de-seguir", btnDejarDeSeguir.dataset.id),
  );
}
