let pagos = [];
let inscripciones = [];

async function inicializar() {
    obtenerPagos();
}

async function obtenerPagos() {
    try {
        const respuesta = await fetch('backend/api_pagos.php');
        if (!respuesta.ok) throw new Error("Error de conexión");
        
        const texto = await respuesta.text();
        let datos;
        try { datos = JSON.parse(texto); } catch(e) { throw new Error(texto); }
        
        if (datos.error) throw new Error(datos.error);
        pagos = datos;
        renderTabla();
    } catch (error) {
        console.error(error);
        document.querySelector("#tablaPagos tbody").innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error de BD.</td></tr>`;
    }
}

function renderTabla() {
    const tbody = document.querySelector("#tablaPagos tbody");
    tbody.innerHTML = "";
    
    if (pagos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay pagos registrados aún.</td></tr>`;
        return;
    }

    pagos.forEach(p => {
        const fila = `
            <tr>
                <td class="fw-bold text-muted">#${p.id_pago}</td>
                <td class="fw-bold">${p.socio}</td>
                <td><span class="badge bg-warning text-dark">${p.membresia}</span></td>
                <td class="fw-bold text-success">$${parseFloat(p.monto).toFixed(2)}</td>
                <td>${p.metodo_pago}</td>
                <td class="text-muted small">${p.fecha_pago}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-danger" onclick="eliminarPago(${p.id_pago})">🗑️ Eliminar</button>
                </td>
            </tr>`;
        tbody.innerHTML += fila;
    });
}

async function abrirModal() {
    // Vaciamos el input al abrir
    document.getElementById("monto").value = "";
    const select = document.getElementById("selectInscripcion");
    select.innerHTML = '<option value="">Cargando inscripciones...</option>';
    
    try {
        const res = await fetch('backend/api_inscripciones.php');
        inscripciones = await res.json();
        
        // Mostramos solo inscripciones activas
        const activas = inscripciones.filter(i => i.estatus === 'activa');
        
        let html = '<option value="" selected disabled>Selecciona una inscripción...</option>';
        activas.forEach(ins => {
            // AQUÍ LA MAGIA: Guardamos el costo de forma "invisible" en la etiqueta (data-costo)
            html += `<option value="${ins.id_inscripcion}" data-costo="${ins.costo}">
                        #${ins.id_inscripcion} - ${ins.socio} (${ins.membresia})
                     </option>`;
        });
        
        select.innerHTML = html;
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">Error al cargar</option>';
    }
}

// === NUEVA FUNCIÓN: AUTOCOMPLETAR ===
function autocompletarMonto() {
    const select = document.getElementById("selectInscripcion");
    const opcion = select.options[select.selectedIndex];
    
    // Si la opción que tocamos tiene un costo guardado, lo pegamos en la casilla
    if (opcion && opcion.dataset.costo) {
        document.getElementById("monto").value = parseFloat(opcion.dataset.costo).toFixed(2);
    } else {
        document.getElementById("monto").value = "";
    }
}

async function guardarPago(event) {
    event.preventDefault();
    
    const payload = {
        id_inscripcion: document.getElementById("selectInscripcion").value,
        monto: document.getElementById("monto").value,
        metodo_pago: document.getElementById("metodo_pago").value
    };

    try {
        const res = await fetch('backend/api_pagos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const textoRespuesta = await res.text();
        let datos;
        try { datos = JSON.parse(textoRespuesta); } catch (e) { throw new Error("Error interno PHP."); }
        
        if (!res.ok) {
            const errorMsg = (datos.error && datos.error[0]) ? datos.error[0].message : "Error al guardar";
            throw new Error(errorMsg);
        }
        
        obtenerPagos();
        bootstrap.Modal.getInstance(document.getElementById("modalPago")).hide();
    } catch (error) {
        alert("🚨 Detalle del error:\n\n" + error.message);
        console.error(error);
    }
}

async function eliminarPago(id) {
    if (confirm("⚠️ ¿Estás seguro de que deseas ELIMINAR este pago permanentemente?")) {
        try {
            const res = await fetch('backend/api_pagos.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_pago: id })
            });
            
            const textoRespuesta = await res.text();
            let datos;
            
            try { datos = JSON.parse(textoRespuesta); } 
            catch (e) { throw new Error("Error interno PHP."); }
            
            if (!res.ok) {
                const errorMsg = (datos.error && datos.error[0]) ? datos.error[0].message : "Error al borrar";
                throw new Error(errorMsg);
            }
            
            obtenerPagos();
        } catch (error) {
            alert("🚨 " + error.message);
        }
    }
}

document.addEventListener("DOMContentLoaded", inicializar);