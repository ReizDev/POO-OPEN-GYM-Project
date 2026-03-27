// Lógica global para todo el proyecto (ej. Modo Oscuro y Permisos)

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    
    // Guarda la preferencia en el navegador
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("tema", "oscuro");
    } else {
        localStorage.setItem("tema", "claro");
    }
}

// Función para cerrar sesión declarada de forma estándar (hoisting)
function cerrarSesion() {
    console.log("Cerrando sesión..."); // Mensaje en consola para verificar que se ejecuta
    localStorage.removeItem('usuario_gym');
    window.location.href = 'index.html'; // Redirige a la página de login
}

// Hacemos que esté disponible globalmente por si hay un onclick="" en el HTML
window.cerrarSesion = cerrarSesion;

// Función para aplicar permisos en cualquier página
function aplicarPermisos() {
    // Evitamos ejecutar esto en la página de login
    if(window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) return;

    const usuarioString = localStorage.getItem('usuario_gym');
    
    // Si no hay usuario guardado, lo mandamos al login
    if (!usuarioString) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = JSON.parse(usuarioString);
    const rol = usuario.rol;

    // Si es Consultor: No puede modificar nada
    if (rol === 'Consultor') {
        const elementosAEliminar = document.querySelectorAll('.btn-success, .btn-primary[data-bs-toggle="modal"], button[onclick*="eliminar"], button[onclick*="editar"]');
        elementosAEliminar.forEach(el => el.remove());
        console.log("Acceso de Consultor: Solo lectura activo.");
    }

    // Si es Editor:
    // Basado en requerimientos: Puede registrar socios, actualizar estatus, gestionar inscripciones y pagos.
    // NO PUEDE: Gestionar usuarios, crear/modificar membresías, ni generar reportes.
    if (rol === 'Editor') {
        const botonesEliminar = document.querySelectorAll('button[onclick*="eliminar"]');
        botonesEliminar.forEach(btn => btn.remove());

        // Bloqueamos las rutas a las que no tiene acceso
        const paginasProhibidas = ['admin_empleados.html', 'admin_membresias.html', 'admin_reportes.html'];
        const urlActual = window.location.pathname;
        
        if(paginasProhibidas.some(pag => urlActual.includes(pag))){
            alert("Acceso denegado. Esta función es exclusiva del Administrador.");
            window.location.href = 'admin.html';
        }
        
        // Ocultar los botones de estos módulos en el dashboard principal
        const linksProhibidos = document.querySelectorAll('a[href="admin_empleados.html"], a[href="admin_membresias.html"], a[href="admin_reportes.html"]');
        linksProhibidos.forEach(link => {
            if(link.parentElement) link.parentElement.style.display = 'none';
        });
        
        console.log("Acceso de Editor: Eliminación y módulos de Administrador bloqueados.");
    }
}

// Al cargar cualquier página, revisar si estaba el modo oscuro activado y aplicar permisos
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("tema") === "oscuro") {
        document.body.classList.add("dark-mode");
    }
    
    // Búsqueda más robusta del botón de cerrar sesión
    // Busca botones con la clase btn-danger o que su texto contenga "Cerrar"
    const botonesCerrar = document.querySelectorAll('button.btn-danger, button');
    botonesCerrar.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('cerrar ses')) {
            // Removemos el evento anterior por si acaso y agregamos el nuevo
            btn.removeEventListener('click', cerrarSesion);
            btn.addEventListener('click', cerrarSesion);
        }
    });

    // Aplicar permisos con un pequeño retraso para asegurar que las tablas se hayan renderizado
    setTimeout(aplicarPermisos, 500);
});

// Sobrescribimos el fetch global para interceptar llamadas y aplicar permisos después de que carguen datos dinámicos (como las tablas)
const originalFetch = window.fetch;
window.fetch = async function() {
    const response = await originalFetch.apply(this, arguments);
    setTimeout(aplicarPermisos, 100);
    return response;
};