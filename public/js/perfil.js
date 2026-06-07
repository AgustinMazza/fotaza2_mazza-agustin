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
