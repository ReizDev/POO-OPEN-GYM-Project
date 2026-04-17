let filtroActual = 'todos';
let myChartMetodos = null;
let myChartTendencia = null;

// Función de Auto-Rescate: Si falta Chart.js en el HTML, JS lo descarga solo
function asegurarLibreriaGraficas() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve(); // Ya existe, continuamos normal
        } else {
            console.warn("Librería de gráficas no encontrada. Descargando automáticamente...");
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("No se pudo conectar a internet para descargar Chart.js"));
            document.head.appendChild(script);
        }
    });
}

async function cargarReporte(filtro = 'todos', idPago = null) {
    try {
        let url = `backend/api_reportes.php?filtro=${filtro}`;
        if (idPago) {
            url += `&id_pago=${idPago}`;
            document.getElementById('tituloTabla').textContent = `Resultado para el Folio #${idPago}`;
        } else {
            const titulos = {
                'todos': 'Historial Completo',
                'semana': 'Pagos de Esta Semana',
                'mes': 'Pagos de Este Mes',
                'ano': 'Pagos de Este Año'
            };
            document.getElementById('tituloTabla').textContent = titulos[filtro];
        }

        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error("Error de conexión");
        
        const datos = await respuesta.json();
        if (datos.error) throw new Error(datos.error);

        // 1. Actualizar Tarjetas de Resumen
        document.getElementById('totalIngresos').textContent = `$${datos.ingresos_totales.toFixed(2)}`;
        document.getElementById('totalPagos').textContent = datos.cantidad_pagos;

        // 2. DIBUJAR GRÁFICAS (Añadimos 'await' para que espere si tiene que descargar la librería)
        await renderizarGraficas(datos);

        // 3. Actualizar Desglose por Método
        const listaMetodos = document.getElementById('listaMetodos');
        listaMetodos.innerHTML = '';
        if (datos.metodos_pago.length === 0) {
            listaMetodos.innerHTML = '<li class="list-group-item text-center text-muted border-0 bg-transparent">No hay ingresos en este periodo</li>';
        } else {
            datos.metodos_pago.forEach(item => {
                listaMetodos.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent text-light border-secondary">
                        <span class="fw-bold">${item.metodo}</span>
                        <span class="badge bg-success rounded-pill fs-6">$${item.total.toFixed(2)}</span>
                    </li>
                `;
            });
        }

        // 4. Llenar Tabla de Detalles
        const tbody = document.querySelector('#tablaDetalle tbody');
        tbody.innerHTML = '';
        if (datos.pagos_detalle.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No se encontraron pagos con estos criterios.</td></tr>';
        } else {
            datos.pagos_detalle.forEach(p => {
                tbody.innerHTML += `
                    <tr>
                        <td class="text-danger fw-bold">#${p.id_pago}</td>
                        <td class="fw-bold text-light">${p.socio}</td>
                        <td class="text-success fw-bold">$${parseFloat(p.monto).toFixed(2)}</td>
                        <td><span class="badge bg-secondary">${p.metodo_pago}</span></td>
                        <td class="small text-muted">${p.fecha_pago}</td>
                    </tr>
                `;
            });
        }

    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al cargar el reporte.");
    }
}

// Funciones de los Botones
function cambiarFiltro(filtro, botonElemento) {
    document.getElementById('inputFolio').value = '';
    const botones = document.querySelectorAll('#grupoFiltros button');
    botones.forEach(btn => {
        btn.classList.remove('active', 'btn-danger');
        btn.classList.add('btn-outline-danger');
    });
    botonElemento.classList.remove('btn-outline-danger');
    botonElemento.classList.add('btn-danger', 'active');
    filtroActual = filtro;
    cargarReporte(filtro, null);
}

function buscarFolio() {
    const idPago = document.getElementById('inputFolio').value;
    if (!idPago) return alert("Por favor, ingresa un número de folio.");
    const botones = document.querySelectorAll('#grupoFiltros button');
    botones.forEach(btn => {
        btn.classList.remove('active', 'btn-danger');
        btn.classList.add('btn-outline-danger');
    });
    cargarReporte('todos', idPago);
}

document.addEventListener("DOMContentLoaded", () => cargarReporte('todos'));


// ==========================================
// DIBUJO DE GRÁFICAS - AHORA ASÍNCRONO
// ==========================================
async function renderizarGraficas(datos) {
    const ctxMetodos = document.getElementById('graficaMetodos');
    const ctxTendencia = document.getElementById('graficaTendencia');

    if (!ctxMetodos || !ctxTendencia) {
        console.error("Faltan las etiquetas <canvas> en el HTML.");
        return;
    }

    // Limpiamos mensajes viejos
    document.querySelectorAll('.empty-msg').forEach(el => el.remove());

    // Aseguramos que Chart.js esté instalado antes de continuar
    try {
        await asegurarLibreriaGraficas();
    } catch (error) {
        ctxTendencia.parentElement.innerHTML = `<p class="text-danger text-center fw-bold mt-5">❌ Error de conexión: No se pudo descargar Chart.js</p>`;
        return;
    }

    // Destruimos las viejas después de asegurar la librería
    if (myChartMetodos) myChartMetodos.destroy();
    if (myChartTendencia) myChartTendencia.destroy();

    // --- GRÁFICA 1: DONA ---
    if (datos.metodos_pago && datos.metodos_pago.length > 0) {
        ctxMetodos.style.display = 'block';
        myChartMetodos = new Chart(ctxMetodos, {
            type: 'doughnut',
            data: {
                labels: datos.metodos_pago.map(m => m.metodo),
                datasets: [{
                    data: datos.metodos_pago.map(m => m.total),
                    backgroundColor: ['#198754', '#0d6efd', '#ffc107', '#dc3545']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#ffffff' } } } }
        });
    } else {
        ctxMetodos.style.display = 'none';
        ctxMetodos.parentElement.insertAdjacentHTML('beforeend', '<p class="empty-msg text-muted text-center mt-5">Sin pagos registrados</p>');
    }

    // --- GRÁFICA 2: TENDENCIA ---
    if (datos.tendencia && datos.tendencia.fechas && datos.tendencia.fechas.length > 0) {
        ctxTendencia.style.display = 'block';
        myChartTendencia = new Chart(ctxTendencia, {
            type: 'line', 
            data: {
                labels: datos.tendencia.fechas,
                datasets: [{
                    label: 'Ingresos Diarios ($)',
                    data: datos.tendencia.totales,
                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                    borderColor: '#dc3545',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { x: { ticks: { color: '#ffffff' } }, y: { ticks: { color: '#ffffff' } } },
                plugins: { legend: { labels: { color: '#ffffff' } } }
            }
        });
    } else {
        ctxTendencia.style.display = 'none';
        
        let mensajeError = "No hay pagos en este periodo de tiempo.";
        if (!datos.tendencia) {
            mensajeError = "⚠️ FALTA EL CÓDIGO EN api_reportes.php";
        }
        
        ctxTendencia.parentElement.insertAdjacentHTML('beforeend', `<p class="empty-msg text-warning text-center fw-bold mt-5">${mensajeError}</p>`);
    }
}