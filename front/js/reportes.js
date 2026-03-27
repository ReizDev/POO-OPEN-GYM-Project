async function cargarReporte() {
    try {
        const respuesta = await fetch('backend/api_reportes.php');
        
        if (!respuesta.ok) throw new Error("Error de conexión");
        
        const datos = await respuesta.json();
        
        if (datos.error) throw new Error(datos.error);

        // 1. Mostrar Totales Principales
        document.getElementById('totalIngresos').textContent = `$${datos.ingresos_totales.toFixed(2)}`;
        document.getElementById('totalInscripciones').textContent = datos.inscripciones_activas;

        // 2. Mostrar Desglose por Método de Pago
        const listaMetodos = document.getElementById('listaMetodos');
        listaMetodos.innerHTML = '';
        if (datos.metodos_pago.length === 0) {
            listaMetodos.innerHTML = '<li class="list-group-item text-center text-muted">No hay pagos registrados</li>';
        } else {
            datos.metodos_pago.forEach(item => {
                listaMetodos.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span class="fw-bold">${item.metodo}</span>
                        <span class="badge bg-success rounded-pill fs-6">$${item.total.toFixed(2)}</span>
                    </li>
                `;
            });
        }

        // 3. Mostrar Últimos Pagos
        const tbody = document.querySelector('#tablaRecientes tbody');
        tbody.innerHTML = '';
        if (datos.pagos_recientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay pagos recientes</td></tr>';
        } else {
            datos.pagos_recientes.forEach(p => {
                tbody.innerHTML += `
                    <tr>
                        <td class="text-muted fw-bold">#${p.id_pago}</td>
                        <td class="fw-bold">${p.socio}</td>
                        <td class="text-success fw-bold">$${parseFloat(p.monto).toFixed(2)}</td>
                        <td>${p.metodo_pago}</td>
                        <td class="small text-muted">${p.fecha_pago}</td>
                    </tr>
                `;
            });
        }

    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al cargar el reporte.");
        document.getElementById('totalIngresos').textContent = "ERROR";
        document.getElementById('totalInscripciones').textContent = "ERROR";
    }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarReporte);