let inscripciones = [];
let listaSocios = [];
let listaMembresias = [];

async function inicializar() {
    await Promise.all([obtenerInscripciones(), cargarListas()]);
}

async function obtenerInscripciones() {
    try {
        const respuesta = await fetch('backend/api_inscripciones.php');
        inscripciones = await respuesta.json();
        renderTabla();
    } catch (error) {
        document.querySelector("#tablaInscripciones tbody").innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error de BD</td></tr>`;
    }
}

async function cargarListas() {
    try {
        const resSocios = await fetch('backend/api_socios.php');
        listaSocios = await resSocios.json();
        
        const resMem = await fetch('backend/api_membresias.php');
        listaMembresias = await resMem.json();
    } catch (error) {
        console.error("Error cargando listas para el formulario", error);
    }
}

function renderTabla() {
    const tbody = document.querySelector("#tablaInscripciones tbody");
    tbody.innerHTML = "";
    
    if (inscripciones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay inscripciones registradas</td></tr>`;
        return;
    }

    inscripciones.forEach(ins => {
        const color = ins.estatus === 'activa' ? 'success' : 'danger';
        const fila = `
            <tr>
                <td class="fw-bold text-muted">#${ins.id_inscripcion}</td>
                <td class="fw-bold">${ins.socio}</td>
                <td><span class="badge bg-warning text-dark">${ins.membresia}</span></td>
                <td>${ins.fecha_inicio}</td>
                <td class="fw-bold text-primary">${ins.fecha_fin}</td>
                <td><span class="badge bg-${color} rounded-pill">${ins.estatus}</span></td>
                <td class="text-center">
                    ${ins.estatus === 'activa' 
                        ? `<button class="btn btn-sm btn-outline-danger mx-1" onclick="cambiarEstatus(${ins.id_inscripcion}, 'cancelada')">🚫 Cancelar</button>` 
                        : `<button class="btn btn-sm btn-outline-success mx-1" onclick="cambiarEstatus(${ins.id_inscripcion}, 'activa')">✅ Reactivar</button>`}
                </td>
            </tr>`;
        tbody.innerHTML += fila;
    });
}

function abrirModal() {
    // Llenar select de socios
    const selSocio = document.getElementById("selectSocio");
    selSocio.innerHTML = `<option value="" selected disabled>Elige un socio...</option>` + 
        listaSocios.filter(s => s.estatus === 'activo').map(s => `<option value="${s.id_socio}">${s.nombre}</option>`).join('');

    // Llenar select de membresias
    const selMem = document.getElementById("selectMembresia");
    selMem.innerHTML = `<option value="" selected disabled>Elige un plan...</option>` + 
        listaMembresias.filter(m => m.estatus === 'activo').map(m => `<option value="${m.id_membresia}" data-dias="${m.duracion_dias}">${m.nombre} ($${m.costo})</option>`).join('');

    // Poner fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("fecha_inicio").value = hoy;
    document.getElementById("fecha_fin").value = "";
}

function calcularVencimiento() {
    const select = document.getElementById("selectMembresia");
    const fechaInicio = document.getElementById("fecha_inicio").value;
    
    if (select.selectedIndex > 0 && fechaInicio) {
        const dias = parseInt(select.options[select.selectedIndex].getAttribute("data-dias"));
        let fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + dias);
        document.getElementById("fecha_fin").value = fecha.toISOString().split('T')[0];
    }
}

async function guardarInscripcion(event) {
    event.preventDefault();
    
    const payload = {
        id_socio: document.getElementById("selectSocio").value,
        id_membresia: document.getElementById("selectMembresia").value,
        fecha_inicio: document.getElementById("fecha_inicio").value,
        fecha_fin: document.getElementById("fecha_fin").value
    };

    try {
        const res = await fetch('backend/api_inscripciones.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        // Extraemos la respuesta cruda para ver el error real de SQL Server
        const textoRespuesta = await res.text();
        let datos;
        
        try {
            datos = JSON.parse(textoRespuesta);
        } catch (e) {
            console.error("Error PHP crudo:", textoRespuesta);
            throw new Error("El servidor devolvió un error interno de PHP.");
        }
        
        if (!res.ok) {
            console.error("Detalle del error BD:", datos.error);
            // Intentamos extraer el mensaje descriptivo de SQL Server
            const sqlError = (datos.error && datos.error[0]) ? datos.error[0].message : JSON.stringify(datos.error);
            throw new Error("BD rechazó el registro: " + sqlError);
        }
        
        obtenerInscripciones();
        bootstrap.Modal.getInstance(document.getElementById("modalInscripcion")).hide();
    } catch (error) {
        console.error(error);
        alert("🚨 Detalle del error:\n\n" + error.message);
    }
}

async function cambiarEstatus(id, nuevoEstatus) {
    if (confirm(`¿Marcar inscripción como ${nuevoEstatus}?`)) {
        await fetch('backend/api_inscripciones.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_inscripcion: id, estatus: nuevoEstatus })
        });
        obtenerInscripciones();
    }
}

document.addEventListener("DOMContentLoaded", inicializar);
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(inicializar, 1);
}