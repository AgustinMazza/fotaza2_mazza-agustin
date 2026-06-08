document.querySelectorAll(".marcar-leida").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.dataset.id;
    const res = await fetch(`/notificaciones/marcar-leida/${id}`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.ok) location.reload();
  });
});
