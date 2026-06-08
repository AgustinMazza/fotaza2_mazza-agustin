(function () {
  var modalEl = document.getElementById("modalPublicacion");
  var contenedor = document.getElementById("contenedorFotos");
  var indicadores = document.getElementById("indicadoresCarrusel");
  var contador = document
    .getElementById("contadorImagenes")
    .querySelector("span");
  var modalTitulo = document.getElementById("modalTitulo");
  var modalAutor = document.getElementById("modalAutor");
  var listaComent = document.getElementById("listaComentarios");
  var inputComent = document.getElementById("inputComentario");
  var btnComentar = document.getElementById("btnComentar");
  var seccionComentar = document.getElementById("seccionComentar");
  var msgCerrado = document.getElementById("mensajeComentariosCerrados");
  var btnToggleWrap = document.getElementById("btnToggleComentariosWrap");
  var btnToggle = document.getElementById("btnToggleComentarios");
  var estrellasEl = document.getElementById("estrellasContenedor");
  var promedioEl = document.getElementById("promedioEstrellas");
  var textoPromedio = document.getElementById("textoPromedio");
  var btnDenuncia = document.getElementById("btnDenuncia");
  var formDenunciaWrap = document.getElementById("formDenunciaWrap");
  var btnEnviarDenuncia = document.getElementById("btnEnviarDenuncia");
  var btnMeInteresa = document.getElementById("btnMeInteresa");
  var panelMeInteresa = document.getElementById("panelMeInteresa");
  var datosMeInteresa = document.getElementById("datosMeInteresa");

  var pubActual = null;
  var imagenActual = null;

  //Abrir modal
  modalEl.addEventListener("show.bs.modal", function (e) {
    var id = e.relatedTarget.getAttribute("data-id");
    pubActual = publicaciones.find(function (p) {
      return String(p.id) === String(id);
    });
    if (!pubActual) return;

    modalTitulo.textContent = pubActual.titulo;
    modalAutor.textContent =
      "Por: " +
      (pubActual.Usuario ? pubActual.Usuario.nombre_usuario : "Anónimo");

    //Carrusel
    contenedor.innerHTML = "";
    indicadores.innerHTML = "";
    (pubActual.imagenes || []).forEach(function (img, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-bs-target", "#carruselPublicacion");
      btn.setAttribute("data-bs-slide-to", idx);
      if (idx === 0) {
        btn.className = "active";
        btn.setAttribute("aria-current", "true");
      }
      indicadores.appendChild(btn);

      var slide = document.createElement("div");
      slide.className = "carousel-item" + (idx === 0 ? " active" : "");
      var imgEl = document.createElement("img");
      imgEl.src = "data:image/jpeg;base64," + img.base64;
      imgEl.className = "d-block w-100";
      imgEl.style.cssText = "max-height:480px;object-fit:contain;";
      slide.appendChild(imgEl);
      if (img.copyright) {
        var badge = document.createElement("div");
        badge.style.cssText =
          "position:absolute;bottom:8px;left:8px;z-index:10;";
        badge.innerHTML =
          '<span class="badge bg-dark bg-opacity-75">© Copyright</span>';
        if (img.marca_agua) {
          badge.innerHTML +=
            ' <span class="badge bg-secondary bg-opacity-75">' +
            img.marca_agua +
            "</span>";
        }
        slide.style.cssText = "position:relative;overflow:hidden;";
        slide.appendChild(badge);
      }

      contenedor.appendChild(slide);
    });

    bootstrap.Carousel.getOrCreateInstance(
      document.getElementById("carruselPublicacion"),
    ).to(0);

    cargarImagen(0);

    //Comentarios
    renderComentarios(pubActual.Comentarios || []);
    var cerrados = pubActual.comentariosCerrados;
    seccionComentar.classList.toggle("d-none", cerrados);
    msgCerrado.classList.toggle("d-none", !cerrados);
    //Btn toggle: solo para autor
    btnToggleWrap.classList.toggle("d-none", !pubActual.esAutor);
    actualizarBotonToggle(cerrados);

    formDenunciaWrap.classList.add("d-none");
    panelMeInteresa.classList.add("d-none");
  });

  //Cambio de slide
  document
    .getElementById("carruselPublicacion")
    .addEventListener("slid.bs.carousel", function (e) {
      cargarImagen(e.to);
    });

  function cargarImagen(idx) {
    if (!pubActual || !pubActual.imagenes[idx]) return;
    imagenActual = pubActual.imagenes[idx];

    var total = pubActual.imagenes.length;
    contador.textContent = total > 1 ? idx + 1 + " / " + total : "";
    actualizarPromedio(imagenActual.promedio, imagenActual.cantVotos);
    imagenActual.miVoto ? iluminarHasta(imagenActual.miVoto) : resetEstrellas();

    //Denuncia- ocultar al autor
    if (pubActual.esAutor) {
      btnDenuncia.classList.add("d-none");
      formDenunciaWrap.classList.add("d-none");
    } else {
      btnDenuncia.classList.remove("d-none");
      if (imagenActual.yaDenuncio) {
        btnDenuncia.textContent = "🚨 Denunciada";
        btnDenuncia.disabled = true;
        btnDenuncia.className = "btn btn-sm btn-danger";
      } else {
        btnDenuncia.textContent = "🚨 Denunciar";
        btnDenuncia.disabled = false;
        btnDenuncia.className = "btn btn-sm btn-outline-danger";
      }
      formDenunciaWrap.classList.add("d-none");
    }

    //Me interesa- ocultar al autor
    if (pubActual.esAutor) {
      btnMeInteresa.classList.add("d-none");
      panelMeInteresa.classList.add("d-none");
    } else {
      btnMeInteresa.classList.remove("d-none");
      if (imagenActual.yaMeInteresa) {
        btnMeInteresa.textContent = "💛 Ya me interesa";
        btnMeInteresa.disabled = true;
        btnMeInteresa.className = "btn btn-sm btn-success";
      } else {
        btnMeInteresa.textContent = "💛 Me interesa";
        btnMeInteresa.disabled = false;
        btnMeInteresa.className = "btn btn-sm btn-outline-success";
      }
      panelMeInteresa.classList.add("d-none");
    }

    //Si la publi es mia, no deja votar
    var seccionVoto = document
      .getElementById("estrellasContenedor")
      .closest(".mb-3.p-2.bg-light.rounded");
    if (pubActual.esAutor) {
      seccionVoto.classList.add("d-none");
    } else {
      seccionVoto.classList.remove("d-none");
    }
  }

  function actualizarPromedio(promedio, cant) {
    if (!promedio) {
      promedioEl.textContent = "☆☆☆☆☆";
      textoPromedio.textContent = "Sin valoraciones aún";
      return;
    }
    var llenas = Math.round(parseFloat(promedio));
    promedioEl.innerHTML =
      "<span style='color:#ffc107;'>" +
      "★".repeat(llenas) +
      "</span>" +
      "<span style='color:#ccc;'>" +
      "☆".repeat(5 - llenas) +
      "</span>";
    textoPromedio.textContent =
      promedio + " · " + cant + (cant === 1 ? " voto" : " votos");
  }

  //Comentarios
  function renderComentarios(lista) {
    if (!lista || lista.length === 0) {
      listaComent.innerHTML =
        '<p class="text-muted small text-center pt-1">No hay comentarios aún.</p>';
      return;
    }
    listaComent.innerHTML = lista
      .map(function (c) {
        var autor = c.Usuario ? c.Usuario.nombre_usuario : "Usuario";
        return (
          '<p class="small mb-1"><strong>' +
          autor +
          ":</strong> " +
          c.texto +
          "</p>"
        );
      })
      .join("");
  }

  btnComentar.addEventListener("click", function () {
    var texto = inputComent.value.trim();
    if (!texto || !pubActual) return;
    fetch("/publicaciones/comentar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicacion_id: pubActual.id, texto }),
    })
      .then(function (r) {
        if (r.ok) return r.json();
        return r.json().then(function (d) {
          throw new Error(d.error || "Error");
        });
      })
      .then(function (data) {
        var p = document.createElement("p");
        p.className = "small mb-1";
        p.innerHTML =
          "<strong>" + data.nombre_usuario + ":</strong> " + data.texto;
        if (listaComent.querySelector(".text-muted"))
          listaComent.innerHTML = "";
        listaComent.appendChild(p);
        inputComent.value = "";
      })
      .catch(function (err) {
        alert(err.message);
      });
  });

  //Toggle comentarios
  function actualizarBotonToggle(cerrados) {
    btnToggle.textContent = cerrados
      ? "🔓 Abrir comentarios"
      : "🔒 Cerrar comentarios";
    btnToggle.className = cerrados
      ? "btn btn-sm btn-outline-success w-100"
      : "btn btn-sm btn-outline-secondary w-100";
  }

  btnToggle.addEventListener("click", function () {
    if (!pubActual) return;
    fetch("/publicaciones/toggle-comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicacion_id: pubActual.id }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        pubActual.comentariosCerrados = data.cerrados;
        seccionComentar.classList.toggle("d-none", data.cerrados);
        msgCerrado.classList.toggle("d-none", !data.cerrados);
        actualizarBotonToggle(data.cerrados);
      });
  });

  //Estrellas
  estrellasEl.addEventListener("mouseover", function (e) {
    if (!e.target.classList.contains("estrella-voto")) return;
    iluminarHasta(parseInt(e.target.getAttribute("data-valor")));
  });
  estrellasEl.addEventListener("mouseleave", function () {
    imagenActual && imagenActual.miVoto
      ? iluminarHasta(imagenActual.miVoto)
      : resetEstrellas();
  });
  estrellasEl.addEventListener("click", function (e) {
    if (!e.target.classList.contains("estrella-voto") || !imagenActual) return;
    var valor = parseInt(e.target.getAttribute("data-valor"));
    fetch("/publicaciones/votar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagen_id: imagenActual.id, estrellas: valor }),
    })
      .then(function (r) {
        if (r.ok) return r.json();
        return r.json().then(function (d) {
          throw new Error(d.error || "Error");
        });
      })
      .then(function (data) {
        imagenActual.miVoto = valor;
        imagenActual.promedio = data.promedio;
        imagenActual.cantVotos = data.cantVotos;
        iluminarHasta(valor);
        actualizarPromedio(data.promedio, data.cantVotos);
        var imgEnArray = pubActual.imagenes.find(function (i) {
          return i.id === imagenActual.id;
        });
        if (imgEnArray) {
          imgEnArray.miVoto = valor;
          imgEnArray.promedio = data.promedio;
          imgEnArray.cantVotos = data.cantVotos;
        }
      })
      .catch(function (err) {
        alert(err.message);
      });
  });

  function iluminarHasta(n) {
    estrellasEl.querySelectorAll(".estrella-voto").forEach(function (s) {
      var v = parseInt(s.getAttribute("data-valor"));
      s.classList.toggle("text-warning", v <= n);
      s.classList.toggle("text-muted", v > n);
    });
  }
  function resetEstrellas() {
    estrellasEl.querySelectorAll(".estrella-voto").forEach(function (s) {
      s.classList.remove("text-warning");
      s.classList.add("text-muted");
    });
  }

  //Denuncia
  btnDenuncia.addEventListener("click", function () {
    formDenunciaWrap.classList.toggle("d-none");
  });
  btnEnviarDenuncia.addEventListener("click", function () {
    if (!imagenActual) return;
    var motivo = document.getElementById("selectMotivo").value;
    var descripcion = document.getElementById("textaDenuncia").value;
    if (!motivo) {
      alert("Seleccioná un motivo.");
      return;
    }
    fetch("/publicaciones/denunciar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagen_id: imagenActual.id, motivo, descripcion }),
    })
      .then(function (r) {
        if (r.ok) return r.json();
        return r.json().then(function (d) {
          throw new Error(d.error || "Error");
        });
      })
      .then(function () {
        btnDenuncia.textContent = "🚨 Denunciada";
        btnDenuncia.disabled = true;
        btnDenuncia.className = "btn btn-sm btn-danger";
        formDenunciaWrap.classList.add("d-none");
        imagenActual.yaDenuncio = true;
      })
      .catch(function (err) {
        alert(err.message);
      });
  });

  //Me interesa
  btnMeInteresa.addEventListener("click", function () {
    if (!imagenActual) return;
    fetch("/publicaciones/me-interesa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagen_id: imagenActual.id }),
    })
      .then(function (r) {
        if (r.ok) return r.json();
        return r.json().then(function (d) {
          throw new Error(d.error || "Error");
        });
      })
      .then(function (data) {
        btnMeInteresa.textContent = "💛 Ya me interesa";
        btnMeInteresa.disabled = true;
        btnMeInteresa.className = "btn btn-sm btn-success";
        imagenActual.yaMeInteresa = true;
        datosMeInteresa.textContent = data.autorNombre + " · " + data.autorMail;
        panelMeInteresa.classList.remove("d-none");
      })
      .catch(function (err) {
        alert(err.message);
      });
  });
})();
