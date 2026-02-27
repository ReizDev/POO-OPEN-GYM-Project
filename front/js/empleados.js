// Lógica específica para admin_empleados.html (Empleados)

let empleados = [];

// Obtener los datos desde la Base de Datos
async function obtenerEmpleados() {
    try {
        const respuesta = await fetch('backend/api_usuarios.php');
        
        // 1. Leemos la respuesta CRUDA (texto) antes de intentar convertirla a JSON
        const textoRespuesta = await respuesta.text();
        
        let datos;
        try {
            // 2. Intentamos convertirla a JSON
            datos = JSON.parse(textoRespuesta);
        } catch (e) {
            // 3. Si falla (Unexpected token '<'), significa que PHP arrojó un error en HTML
            console.error("PHP devolvió un error HTML:", textoRespuesta);
            
            // Extraemos un pedacito del error para mostrarlo en pantalla
            let errorCorto = textoRespuesta.replace(/(<([^>]+)>)/gi, "").substring(0, 80);
            throw new Error("PHP Falló: " + errorCorto + "...");
        }

        if (!respuesta.ok) {
            throw new Error(datos.error || "Error del servidor");
        }
        
        if (datos.error) throw new Error(datos.error);

        empleados = datos;
        renderTabla();
    } catch (error) {
        console.error("Error capturado:", error);
        const tbody = document.querySelector("#tablaEmpleados tbody");
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger fw-bold py-4">❌ ${error.message}</td></tr>`;
    }
}

// Dibujar la tabla
function renderTabla() {
    const tbody = document.querySelector("#tablaEmpleados tbody");
    tbody.innerHTML = "";
    
    if (empleados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No hay empleados registrados</td></tr>`;
        return;
    }

    empleados.forEach(emp => {
        const badgeColor = emp.rol === 'Administrador' ? 'primary' : 'info text-dark';
        const fila = `
            <tr>
                <td class="fw-bold text-muted">#${emp.id_usuario}</td>
                <td class="fw-semibold">${emp.nombre}</td>
                <td><span class="badge bg-${badgeColor} rounded-pill px-3 py-2">${emp.rol}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-warning mx-1" onclick="editarEmpleado(${emp.id_usuario})">✏️ Editar</button>
                    <button class="btn btn-sm btn-outline-danger mx-1" onclick="eliminarEmpleado(${emp.id_usuario})">🗑️ Borrar</button>
                </td>
            </tr>`;
        tbody.innerHTML += fila;
    });
}

function abrirModal() {
    document.getElementById("modalTitulo").textContent = "Registrar Empleado";
    document.getElementById("empleadoId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("rol").value = "";
}

// Guardar o Actualizar
async function guardarEmpleado(event) {
    event.preventDefault();
    
    const id = document.getElementById("empleadoId").value;
    const payload = {
        id_usuario: id,
        nombre: document.getElementById("nombre").value,
        rol: document.getElementById("rol").value
    };

    const metodo = id ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch('backend/api_usuarios.php', {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const textoRespuesta = await respuesta.text();
        
        let datos;
        try {
            datos = JSON.parse(textoRespuesta);
        } catch(e) {
            console.error("Error de PHP al guardar:", textoRespuesta);
            throw new Error("El servidor PHP falló al procesar los datos. Revisa la consola.");
        }

        if (!respuesta.ok) {
            throw new Error(datos.error || "Fallo al guardar en la BD");
        }

        // Refrescar los datos llamando de nuevo a la base de datos
        obtenerEmpleados();
        bootstrap.Modal.getInstance(document.getElementById("modalEmpleado")).hide();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error: " + error.message);
    }
}

function editarEmpleado(id) {
    const emp = empleados.find(e => e.id_usuario == id);
    if (emp) {
        document.getElementById("modalTitulo").textContent = "Editar Empleado";
        document.getElementById("empleadoId").value = emp.id_usuario;
        document.getElementById("nombre").value = emp.nombre;
        document.getElementById("rol").value = emp.rol;
        new bootstrap.Modal(document.getElementById("modalEmpleado")).show();
    }
}

async function eliminarEmpleado(id) {
    if (confirm("¿Seguro que deseas eliminar este empleado permanentemente?")) {
        try {
            const respuesta = await fetch('backend/api_usuarios.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario: id })
            });

            const textoRespuesta = await respuesta.text();
            let datos;
            try { 
                datos = JSON.parse(textoRespuesta); 
            } catch(e) { 
                console.error("Error de PHP al eliminar:", textoRespuesta);
                throw new Error("Error interno de PHP al eliminar."); 
            }

            if (!respuesta.ok) throw new Error(datos.error || "Fallo al eliminar en la BD");

            // Refrescar los datos llamando de nuevo a la base de datos
            obtenerEmpleados();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Hubo un error al intentar eliminar el empleado: " + error.message);
        }
    }
}

window.onload = obtenerEmpleados;