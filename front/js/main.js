// Lógica global para todo el proyecto (ej. Modo Oscuro)

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    
    // Extra: Guarda la preferencia en el navegador para que no se quite al cambiar de página
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("tema", "oscuro");
    } else {
        localStorage.setItem("tema", "claro");
    }
}

// Al cargar cualquier página, revisar si estaba el modo oscuro activado
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("tema") === "oscuro") {
        document.body.classList.add("dark-mode");
    }
});