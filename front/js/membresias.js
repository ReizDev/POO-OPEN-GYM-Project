// Lógica para admin_membresias.html

let membresias = [];

async function obtenerMembresias() {
    try {
        const respuesta = await fetch('backend/api_membresias.php');
        if (!respuesta.ok) throw new Error("Error del servidor");
        
        membresias = await respuesta.json();
        if (membresias.error) throw new Error(membresias.error);

        renderTabla();
    } catch (error) {
        console.error(error);
        document.querySelector("#tablaMembresias tbody").innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">❌ Error de BD.</td></tr>`;
    }
}

function renderTabla() {
    const tbody = document.querySelector("#tablaMembresias tbody");
    tbody.innerHTML = "";
    
    if (membresias.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay membresías registradas</td></tr>`;
        return;
    }

    membresias.forEach(mem => {
        const color = mem.estatus === 'activo' ? 'success' : 'secondary';
        const fila = `
            <tr>
                <td class="fw-bold text-muted">#${mem.id_membresia}</td>
                <td class="fw-bold">${mem.nombre}</td>
                <td>$${parseFloat(mem.costo).toFixed(2)}</td>
                <td>${mem.duracion_dias} días</td>
                <td><span class="badge bg-${color} rounded-pill px-3 py-2">${mem.estatus}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary mx-1" onclick="editarMembresia(${mem.id_membresia})">✏️ Editar</button>
                    <button class="btn btn-sm btn-outline-danger mx-1" onclick="eliminarMembresia(${mem.id_membresia})">🗑️ Borrar</button>
                </td>
            </tr>`;
        tbody.innerHTML += fila;
    });
}

function abrirModal() {
    document.getElementById("modalTitulo").textContent = "Crear Membresía";
    document.getElementById("membresiaId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("costo").value = "";
    document.getElementById("duracion_dias").value = "";
    document.getElementById("divEstatus").style.display = "none"; 
    document.getElementById("estatus").value = "activo";
}

async function guardarMembresia(event) {
    event.preventDefault();
    const id = document.getElementById("membresiaId").value;
    
    const payload = {
        id_membresia: id,
        nombre: document.getElementById("nombre").value,
        costo: document.getElementById("costo").value,
        duracion_dias: document.getElementById("duracion_dias").value,
        estatus: document.getElementById("estatus").value
    };

    const metodo = id ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch('backend/api_membresias.php', {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!respuesta.ok) throw new Error("Fallo al guardar");
        
        obtenerMembresias();
        bootstrap.Modal.getInstance(document.getElementById("modalMembresia")).hide();
    } catch (error) {
        console.error(error);
        alert("Error al guardar la membresía.");
    }
}

function editarMembresia(id) {
    const mem = membresias.find(m => m.id_membresia == id);
    if (mem) {
        document.getElementById("modalTitulo").textContent = "Editar Membresía";
        document.getElementById("membresiaId").value = mem.id_membresia;
        document.getElementById("nombre").value = mem.nombre;
        document.getElementById("costo").value = mem.costo;
        document.getElementById("duracion_dias").value = mem.duracion_dias;
        document.getElementById("divEstatus").style.display = "block"; 
        document.getElementById("estatus").value = mem.estatus;
        
        new bootstrap.Modal(document.getElementById("modalMembresia")).show();
    }
}

async function eliminarMembresia(id) {
    if (confirm("¿Eliminar membresía? (No recomendado si hay socios usándola)")) {
        try {
            await fetch('backend/api_membresias.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_membresia: id })
            });
            obtenerMembresias();
        } catch (error) {
            console.error(error);
        }
    }
}

// Reemplazamos window.onload por una llamada directa y segura
document.addEventListener("DOMContentLoaded", obtenerMembresias);
// Si DOMContentLoaded ya pasó, lo ejecutamos de inmediato:
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(obtenerMembresias, 1);
}