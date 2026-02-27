// Lógica específica para admin-panel.html (Socios)

let socios = [];

// Obtener los datos desde la Base de Datos
async function obtenerSocios() {
    try {
        const respuesta = await fetch('backend/api_socios.php');
        if (!respuesta.ok) throw new Error("Error de conexión con el servidor");
        
        socios = await respuesta.json();
        
        if (socios.error) throw new Error(socios.error);

        renderTabla();
    } catch (error) {
        console.error(error);
        const tbody = document.querySelector("#tablaSocios tbody");
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger fw-bold py-4">❌ Error: No se pudo conectar con la Base de Datos.</td></tr>`;
    }
}

// Dibujar la tabla
function renderTabla() {
    const tbody = document.querySelector("#tablaSocios tbody");
    tbody.innerHTML = "";
    
    if (socios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay socios registrados</td></tr>`;
        return;
    }

    socios.forEach(socio => {
        const colorEstado = socio.estatus === 'activo' ? 'success' : 'danger';
        const fila = `
            <tr>
                <td class="fw-bold text-muted">#${socio.id_socio}</td>
                <td class="fw-semibold">${socio.nombre}</td>
                <td>${socio.correo}</td>
                <td>${socio.telefono}</td>
                <td><span class="badge bg-${colorEstado} rounded-pill px-3 py-2">${socio.estatus}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-warning mx-1" onclick="editarSocio(${socio.id_socio})">✏️ Editar</button>
                    <button class="btn btn-sm btn-outline-danger mx-1" onclick="eliminarSocio(${socio.id_socio})">🗑️ Borrar</button>
                </td>
            </tr>`;
        tbody.innerHTML += fila;
    });
}

function abrirModal() {
    document.getElementById("modalTitulo").textContent = "Registrar Nuevo Socio";
    document.getElementById("socioId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("correo").value = "";
    document.getElementById("telefono").value = "";
}

// Guardar o Actualizar
async function guardarSocio(event) {
    event.preventDefault();
    
    const id = document.getElementById("socioId").value;
    const payload = {
        id_socio: id,
        nombre: document.getElementById("nombre").value,
        correo: document.getElementById("correo").value,
        telefono: document.getElementById("telefono").value
    };

    const metodo = id ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch('backend/api_socios.php', {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) throw new Error("Fallo al guardar en la BD");

        obtenerSocios();
        bootstrap.Modal.getInstance(document.getElementById("modalSocio")).hide();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error al intentar guardar el socio.");
    }
}

function editarSocio(id) {
    const socio = socios.find(s => s.id_socio == id);
    if (socio) {
        document.getElementById("modalTitulo").textContent = "Editar Socio";
        document.getElementById("socioId").value = socio.id_socio;
        document.getElementById("nombre").value = socio.nombre;
        document.getElementById("correo").value = socio.correo;
        document.getElementById("telefono").value = socio.telefono;
        new bootstrap.Modal(document.getElementById("modalSocio")).show();
    }
}

async function eliminarSocio(id) {
    if (confirm("¿Seguro que deseas eliminar este socio permanentemente?")) {
        try {
            const respuesta = await fetch('backend/api_socios.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_socio: id })
            });

            if (!respuesta.ok) throw new Error("Fallo al eliminar en la BD");

            obtenerSocios();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Hubo un error al intentar eliminar el socio.");
        }
    }
}

window.onload = obtenerSocios;