// Lógica global para todo el proyecto (Modo Oscuro, Sesión y Permisos)

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    
    // Guarda la preferencia en el navegador
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("tema", "oscuro");
    } else {
        localStorage.setItem("tema", "claro");
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    console.log("Cerrando sesión...");
    localStorage.removeItem('usuario_gym');
    window.location.href = 'index.html'; 
}

// Disponible globalmente
window.cerrarSesion = cerrarSesion;

// ==========================================
// SISTEMA DE SEGURIDAD Y ROLES (RBAC)
// ==========================================
function aplicarPermisos() {
    // 1. Validar que no estemos en el login
    if(window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) return;

    const usuarioString = localStorage.getItem('usuario_gym');
    
    // 2. Si alguien intenta entrar sin iniciar sesión, lo echamos
    if (!usuarioString) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = JSON.parse(usuarioString);
    const rol = usuario.rol;
    const urlActual = window.location.pathname;

    // Mostrar el nombre del usuario en el panel (opcional, si tienes un elemento con id "nombreUsuario")
    const spanUsuario = document.getElementById("nombreUsuario");
    if(spanUsuario) spanUsuario.textContent = usuario.nombre + " (" + rol + ")";

    // ---------------------------------------------------------
    // REGLAS GENERALES: Administrador tiene acceso a todo.
    // Editor y Consultor NO pueden ver Empleados ni Reportes.
    // ---------------------------------------------------------
    if (rol !== 'Administrador') {
        const paginasProhibidas = ['admin_empleados.html', 'admin_reportes.html'];
        
        // Bloquear acceso por URL
        if(paginasProhibidas.some(pag => urlActual.includes(pag))){
            alert("Acceso denegado. Esta función es exclusiva del Administrador.");
            window.location.href = 'admin.html';
            return;
        }
        
        // Ocultar los botones correspondientes en el Dashboard
        const linksProhibidos = document.querySelectorAll('a[href="admin_empleados.html"], a[href="admin_reportes.html"]');
        linksProhibidos.forEach(link => {
            if(link.parentElement) link.parentElement.style.display = 'none';
        });
    }

    // ---------------------------------------------------------
    // REGLAS PARA "EDITOR"
    // ---------------------------------------------------------
    if (rol === 'Editor') {
        // Regla General Editor: No puede eliminar ningún registro de la base de datos
        document.querySelectorAll('button[onclick*="eliminar"]').forEach(btn => btn.remove());

        // Regla Membresías Editor: Solo puede "Consultar" (no crear ni editar planes)
        if (urlActual.includes('admin_membresias.html')) {
            document.querySelectorAll('button[data-bs-target="#modalMembresia"], button[onclick*="editarMembresia"]').forEach(btn => btn.remove());
        }
        // Nota: El editor conserva intactos los botones para Registrar Socios, Pagos e Inscripciones.
    }

    // ---------------------------------------------------------
    // REGLAS PARA "CONSULTOR"
    // ---------------------------------------------------------
    if (rol === 'Consultor') {
        // Regla General Consultor: NO puede modificar NADA. 
        // Eliminamos de tajo todos los botones que abran formularios o ejecuten acciones.
        const elementosAccion = document.querySelectorAll(`
            button[data-bs-target], 
            button[data-bs-toggle="modal"], 
            button[onclick*="abrirModal"],
            button[onclick*="editar"],
            button[onclick*="eliminar"],
            button[onclick*="cambiarEstatus"],
            form button[type="submit"]
        `);
        elementosAccion.forEach(btn => btn.remove());
    }
}

// Al cargar cualquier página, aplicar tema, eventos y verificar seguridad
document.addEventListener("DOMContentLoaded", () => {
    // Tema oscuro
    if (localStorage.getItem("tema") === "oscuro") {
        document.body.classList.add("dark-mode");
    }
    
    // Asignar evento al botón de cerrar sesión donde sea que esté
    const botonesCerrar = document.querySelectorAll('button.btn-danger, button');
    botonesCerrar.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('cerrar ses')) {
            btn.removeEventListener('click', cerrarSesion);
            btn.addEventListener('click', cerrarSesion);
        }
    });

    // Aplicar permisos iniciales
    setTimeout(aplicarPermisos, 300);
});

// Interceptor mágico: Cada vez que JavaScript dibuja una tabla nueva desde la BD, 
// volvemos a pasar la barredora de permisos para asegurarnos de que no aparezcan botones prohibidos.
const originalFetch = window.fetch;
window.fetch = async function() {
    const response = await originalFetch.apply(this, arguments);
    setTimeout(aplicarPermisos, 100);
    return response;
};