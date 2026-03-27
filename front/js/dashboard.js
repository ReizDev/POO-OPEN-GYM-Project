async function cargarDashboard() {
    try {
        const respuesta = await fetch('backend/api_dashboard.php');
        
        // Leemos el texto crudo primero para ver qué nos está escupiendo PHP
        const textoRespuesta = await respuesta.text();
        let datos;
        
        try {
            datos = JSON.parse(textoRespuesta);
        } catch (e) {
            console.error("🚨 ERROR CRUDO DE PHP:", textoRespuesta);
            throw new Error("El servidor devolvió un error inesperado. Revisa la consola.");
        }

        if (!respuesta.ok) throw new Error("Error al conectar con el servidor");
        
        if (datos.error) throw new Error(datos.error);

        // 1. Llenar Tarjetas de Métricas Superiores
        const txtSocios = document.getElementById('txtSocios');
        const txtEmpleados = document.getElementById('txtEmpleados');
        const txtTotal = document.getElementById('txtTotal');
        
        if (txtSocios) txtSocios.textContent = datos.totales.socios;
        if (txtEmpleados) txtEmpleados.textContent = datos.totales.empleados;
        if (txtTotal) txtTotal.textContent = parseInt(datos.totales.socios) + parseInt(datos.totales.empleados);

        // 2. Renderizar la Gráfica (Aislado para que no rompa lo demás si falla)
        try {
            renderizarGrafica(datos.grafica);
        } catch (errorGrafica) {
            console.error("Error al dibujar la gráfica:", errorGrafica);
            const canvas = document.getElementById('graficaMembresias');
            if (canvas) {
                canvas.style.display = 'none';
                if(!document.getElementById('msgErrorGrafica')) {
                    const msg = document.createElement('p');
                    msg.id = 'msgErrorGrafica';
                    msg.className = "text-danger text-center w-100 mt-3 fw-bold";
                    msg.textContent = "Error al cargar la gráfica.";
                    canvas.parentNode.appendChild(msg);
                }
            }
        }

        // 3. Llenar la Tabla de Próximos Vencimientos (Protegido)
        try {
            renderizarTablaVencimientos(datos.vencimientos);
        } catch (errorTabla) {
            console.error("Error al dibujar la tabla:", errorTabla);
            const tbody = document.querySelector("#tablaVencimientos tbody");
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">Error al cargar vencimientos.</td></tr>`;
            }
        }

    } catch (error) {
        console.error("Error general cargando dashboard:", error);
        const txtSocios = document.getElementById('txtSocios');
        if (txtSocios) txtSocios.textContent = "ERROR";
        
        const tbody = document.querySelector("#tablaVencimientos tbody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">Error de conexión con la base de datos.</td></tr>`;
        }
    }
}

function renderizarGrafica(datosGrafica) {
    const canvas = document.getElementById('graficaMembresias');
    
    // Validación crucial: Si el canvas no existe en el HTML, detenemos la gráfica sin generar error
    if (!canvas) {
        console.warn("Elemento canvas 'graficaMembresias' no encontrado en el HTML. Saltando gráfica.");
        return; 
    }

    const ctx = canvas.getContext('2d');
    
    // Si no hay datos para graficar
    if (datosGrafica.etiquetas.length === 0) {
        canvas.style.display = 'none';
        
        if(!document.getElementById('msgNoData')) {
            const msg = document.createElement('p');
            msg.id = 'msgNoData';
            msg.className = "text-muted text-center w-100 mt-3";
            msg.textContent = "No hay inscripciones activas aún.";
            canvas.parentNode.appendChild(msg);
        }
        return;
    }

    // Verificamos si la librería de gráficas existe (previene bloqueos)
    if (typeof Chart === 'undefined') {
        throw new Error("La librería Chart.js no se cargó correctamente (revisa tu internet o caché).");
    }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: datosGrafica.etiquetas,
            datasets: [{
                label: 'Socios Activos',
                data: datosGrafica.valores,
                backgroundColor: ['#ffc107', '#0d6efd', '#198754', '#dc3545', '#0dcaf0'],
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function renderizarTablaVencimientos(vencimientos) {
    const tbody = document.querySelector("#tablaVencimientos tbody");
    
    // Validación de seguridad para la tabla
    if (!tbody) {
        console.warn("Tabla 'tablaVencimientos' no encontrada en el HTML.");
        return;
    }

    tbody.innerHTML = "";

    if (vencimientos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">No hay vencimientos próximos</td></tr>`;
        return;
    }

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    vencimientos.forEach(v => {
        const fechaVence = new Date(v.fecha_fin + "T00:00:00");
        const diffTiempo = fechaVence.getTime() - hoy.getTime();
        const diffDias = Math.ceil(diffTiempo / (1000 * 3600 * 24));
        
        let colorTexto = "text-dark";
        let iconoAlerta = "";

        if (diffDias <= 3) {
            colorTexto = "text-danger fw-bold";
            iconoAlerta = "🔥"; 
        } else if (diffDias <= 7) {
            colorTexto = "text-warning text-dark fw-bold";
        }

        const fila = `
            <tr>
                <td class="fw-bold">${v.socio}</td>
                <td><span class="badge bg-secondary">${v.membresia}</span></td>
                <td class="${colorTexto}">${v.fecha_fin} ${iconoAlerta}</td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

document.addEventListener("DOMContentLoaded", cargarDashboard);