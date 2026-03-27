let pagos = [];
let inscripcionesActivas = [];

async function inicializar() {
    await Promise.all([obtenerPagos(), cargarInscripciones()]);
}

async function obtenerPagos() {
    try {
        const respuesta = await fetch('backend/api_pagos.php');
        pagos = await respuesta.json();
        renderTabla();
    } catch (error) {
        document.querySelector("#tablaPagos tbody").innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error de BD</td></tr>`;
    }
}

async function cargarInscripciones() {
    try {
        const respuesta = await fetch('backend/api_inscripciones.php');
        const todas = await respuesta.json();
        // Solo mostraremos las inscripciones que están activas para poder pagarlas
        inscripcionesActivas = todas.filter(ins => ins.estatus === 'activa');
    } catch (error) {
        console.error("Error cargando inscripciones", error);
    }
}

function renderTabla() {
    const tbody = document.querySelector("#tablaPagos tbody");
    tbody.innerHTML = "";
    
    if (pagos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay pagos registrados aún.</td></tr>`;
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
            </tr>`;
        tbody.innerHTML += fila;
    });
}

function abrirModal() {
    const select = document.getElementById("selectInscripcion");
    select.innerHTML = `<option value="" selected disabled>Elige la inscripción...</option>` + 
        inscripcionesActivas.map(ins => `<option value="${ins.id_inscripcion}">Socio: ${ins.socio} - Plan: ${ins.membresia}</option>`).join('');

    document.getElementById("monto").value = "";
    document.getElementById("metodo_pago").value = "Efectivo";
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
        
        if (!res.ok) throw new Error("Fallo al procesar el pago");
        
        // Refrescamos la tabla de pagos
        obtenerPagos();
        bootstrap.Modal.getInstance(document.getElementById("modalPago")).hide();
    } catch (error) {
        alert("Error al guardar el pago.");
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", inicializar);
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(inicializar, 1);
}