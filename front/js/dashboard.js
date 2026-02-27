// Lógica específica para admin.html (Dashboard)

let chartInstance = null;

async function cargarDatos() {
    // Variables libres listas para recibir los datos reales de tu BD
    let sociosActivos = 0;
    let sociosInactivos = 0;
    let empleados = 0;
    let total = 0;

    // Actualizamos los números en pantalla
    document.getElementById("txtSocios").textContent = sociosActivos;
    document.getElementById("txtEmpleados").textContent = empleados;
    document.getElementById("txtTotal").textContent = total;

    // Dibujamos la gráfica inicial
    dibujarGrafica(sociosActivos, sociosInactivos, empleados);
}

// Función para crear la gráfica de Chart.js
function dibujarGrafica(activos, inactivos, empleados) {
    const ctx = document.getElementById('chartPrincipal').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy(); 
    }
    
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Socios Activos', 'Socios Inactivos', 'Empleados'],
            datasets: [{
                data: [activos, inactivos, empleados],
                backgroundColor: ['#198754', '#dc3545', '#0dcaf0'],
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '65%'
        }
    });
}

// Ejecutar cuando la página cargue
window.onload = cargarDatos;