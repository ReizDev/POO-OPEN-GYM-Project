// Lógica específica para admin.html (Dashboard)

let chartInstance = null;

async function cargarDatos() {
    const statusDiv = document.getElementById("statusConnection");
    
    try {
        // Hacemos la petición a la carpeta backend
        const peticionSocios = await fetch('backend/api_socios.php');
        const peticionUsuarios = await fetch('backend/api_usuarios.php');

        // Verificamos que la petición haya sido exitosa
        if (!peticionSocios.ok || !peticionUsuarios.ok) {
            throw new Error("No se encontraron las APIs o hay un error en el servidor.");
        }

        // Convertimos la respuesta a JSON
        const socios = await peticionSocios.json();
        const empleados = await peticionUsuarios.json();

        // Si PHP nos devuelve un error de SQL (ej. falta la extensión)
        if (socios.error || empleados.error) {
            throw new Error(socios.error || empleados.error);
        }

        // Procesamos los datos reales
        const sociosActivos = socios.filter(s => s.estatus === 'activo').length;
        const sociosInactivos = socios.length - sociosActivos;
        const numEmpleados = empleados.length;
        const total = socios.length + numEmpleados;

        // Actualizamos los números en pantalla
        document.getElementById("txtSocios").textContent = sociosActivos;
        document.getElementById("txtEmpleados").textContent = numEmpleados;
        document.getElementById("txtTotal").textContent = total;

        // Mostramos mensaje de éxito en pantalla
        statusDiv.className = "alert alert-success text-center fw-semibold mb-4 shadow-sm";
        statusDiv.innerHTML = "✅ Conectado exitosamente a SQL Server";

        // Dibujamos la gráfica
        dibujarGrafica(sociosActivos, sociosInactivos, numEmpleados);

    } catch (error) {
        console.error(error);
        // Mostramos mensaje de error si falla la conexión
        statusDiv.className = "alert alert-danger text-center fw-semibold mb-4 shadow-sm";
        statusDiv.innerHTML = "❌ Error: No se pudo conectar a la base de datos.";
        
        // Dibujamos gráfica vacía por defecto
        dibujarGrafica(0, 0, 0);
    }
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