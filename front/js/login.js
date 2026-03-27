document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const respuesta = await fetch('backend/api_usuarios.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accion: 'login',
                nombre: usuario,
                contrasena: password
            })
        });

        // Leemos la respuesta como texto crudo primero para detectar errores de PHP
        const textoRespuesta = await respuesta.text();
        let datos;

        try {
            datos = JSON.parse(textoRespuesta);
        } catch (e) {
            // Si no es JSON, significa que PHP arrojó un error (ej. fatal error de base de datos)
            console.error("Error detallado de PHP:", textoRespuesta);
            throw new Error("Error interno PHP: " + textoRespuesta.replace(/(<([^>]+)>)/gi, "").substring(0, 150));
        }

        if (respuesta.ok && datos.status === 'success') {
            // Guardamos los datos del usuario en el navegador
            localStorage.setItem('usuario_gym', JSON.stringify(datos.usuario));
            
            // Redirigimos al panel principal
            window.location.href = 'admin.html';
        } else {
            // Mostramos el mensaje de error (Credenciales inválidas)
            errorDiv.textContent = datos.message || "Error al iniciar sesión";
            errorDiv.classList.remove('d-none');
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        // Ahora mostrará el error real que está escupiendo PHP
        errorDiv.textContent = error.message || "Error de conexión con el servidor.";
        errorDiv.classList.remove('d-none');
    }
});