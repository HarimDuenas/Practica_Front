// --- Manejo del modal de login (funciona en cualquier página) ---
document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');

  if (loginBtn && loginModal && closeModal) {
    loginBtn.onclick = function() {
      loginModal.style.display = 'block';
    };
    closeModal.onclick = function() {
      loginModal.style.display = 'none';
    };
    window.onclick = function(event) {
      if (event.target === loginModal) {
        loginModal.style.display = 'none';
      }
    };
  }
});

// Capturamos el formulario
const form = document.getElementById("formLogin");

// Escuchamos el evento "submit"
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // evita que la página se recargue

  // Obtener los valores escritos por el usuario
  const login = document.getElementById("login").value;
  const contrasena = document.getElementById("password").value;

  // Enviar los datos al servidor usando fetch + async/await
  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cuenta: login, // nombre del campo esperado el backend
        contrasena: contrasena
      })
    });

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      console.warn("Respuesta no JSON del servidor", parseErr);
      data = {};
    }

    // Revisar la respuesta
    if (res.ok) {
      const cuenta = data.usuario?.cuenta;
      if (cuenta) {
        // Notificación de ÉXITO con SweetAlert2
        Swal.fire({
            title: "¡Acceso Permitido! 🎉",
            text: `Bienvenido(a), ${cuenta}.`,
            icon: "success",
            confirmButtonText: "Continuar"
        });

        const user = data.usuario.cuenta;
        const password = contrasena;

        localStorage.setItem("usuario", user);
        localStorage.setItem("contrasena", password)

        // Actualizar UI
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan) userNameSpan.textContent = cuenta;
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
      } else {
        // Caso 200 OK sin usuario inesperado
        Swal.fire({
            title: "Error Inesperado",
            text: 'Respuesta incompleta del servidor.',
            icon: "warning",
            confirmButtonText: "Aceptar"
        });
      }
    } else {
      // Notificación de ERROR (400, 401, etc.) con SweetAlert2
      const errorMessage = data?.error ?? `Error ${res.status}: ${res.statusText}`;
      Swal.fire({
        title: "Error de Autenticación 😔",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Reintentar"
      });
      
      // Limpiar campos del formulario
      const loginInput = document.getElementById("login");
      const passInput = document.getElementById("password");
      if (loginInput) loginInput.value = "";
      if (passInput) passInput.value = "";
    }

  } catch (err) {
    console.error("Error al conectar con el servidor:", err);
    // Notificación de ERROR DE CONEXIÓN con SweetAlert2
    Swal.fire({
        title: "Error de Conexión 🔌",
        text: "No se pudo conectar con el servidor. Asegúrate de que el Backend esté corriendo en http://localhost:3000.",
        icon: "error",
        confirmButtonText: "Aceptar"
    });
  }
});