let socios = [
  { id: 1, nombre: "Juan Pérez", email: "juan@example.com", telefono: "555-1234" },
  { id: 2, nombre: "María López", email: "maria@example.com", telefono: "555-5678" },
  { id: 3, nombre: "Carlos Ramírez", email: "carlos@example.com", telefono: "555-8765" },
  { id: 4, nombre: "Ana Torres", email: "ana@example.com", telefono: "555-4321" },
  { id: 5, nombre: "Pedro Sánchez", email: "pedro@example.com", telefono: "555-2468" },
  { id: 6, nombre: "Laura Fernández", email: "laura@example.com", telefono: "555-1357" },
  { id: 7, nombre: "José Martínez", email: "jose@example.com", telefono: "555-9876" },
  { id: 8, nombre: "Sofía Gómez", email: "sofia@example.com", telefono: "555-6543" }
];
let contadorId = socios.length + 1;
renderTabla();
guardarEnLocalStorage();
