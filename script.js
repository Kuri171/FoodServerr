// Variables globales
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
      { 
        usuario: 'cliente', 
        contrasena: '1234', 
        inventario: [
          { nombre: 'Leche', cantidad: '1', fecha: '2025-06-15', consumido: false },
          { nombre: 'Pan', cantidad: '1', fecha: '2025-06-17', consumido: false },
          { nombre: 'Manzanas', cantidad: '5', fecha: '2025-06-21', consumido: false },
          { nombre: 'Zanahorias', cantidad: '8', fecha: '2025-06-23', consumido: false }
        ],
        notificaciones: [
          { tipo: 'warning', mensaje: 'La leche caduca en 3 días', fecha: '2025-06-12' },
          { tipo: 'success', mensaje: 'Has agregado zanahorias', fecha: '2025-06-10' }
        ],
        preferencias: {
          tema: 'claro',
          notificaciones: true,
          idioma: 'es'
        }
      }
    ];
    
    let usuarioActual = null;
    let inventario = [];
    let productoEditando = null;
    let productoEliminando = null;

    // Función para mostrar notificación
    function mostrarNotificacion(mensaje, tipo = 'success') {
      const notification = document.getElementById('notification');
      notification.textContent = mensaje;
      notification.className = `notification ${tipo} hidden`;
      notification.classList.remove('hidden');
      
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }

    // Funciones para el modal de edición
    function abrirModal(index) {
      productoEditando = index;
      const producto = inventario[index];
      document.getElementById('editNombre').value = producto.nombre;
      document.getElementById('editCantidad').value = producto.cantidad;
      document.getElementById('editFecha').value = producto.fecha;
      document.getElementById('editModal').style.display = 'flex';
    }

    function cerrarModal() {
      document.getElementById('editModal').style.display = 'none';
      productoEditando = null;
    }

    function guardarEdicion() {
      if (productoEditando !== null) {
        const nuevoNombre = document.getElementById('editNombre').value;
        const nuevaCantidad = document.getElementById('editCantidad').value;
        const nuevaFecha = document.getElementById('editFecha').value;

        if (nuevoNombre && nuevaCantidad && nuevaFecha) {
          inventario[productoEditando] = {
            ...inventario[productoEditando],
            nombre: nuevoNombre,
            cantidad: nuevaCantidad,
            fecha: nuevaFecha
          };
          guardarInventario();
          renderInventory();
          renderDashboard();
          cerrarModal();
          mostrarNotificacion('Producto actualizado correctamente');
        } else {
          mostrarNotificacion('Por favor complete todos los campos', 'error');
        }
      }
    }

    // Funciones para el modal de eliminación
    function abrirDeleteModal(index) {
      productoEliminando = index;
      const producto = inventario[index];
      document.getElementById('deleteMessage').textContent = `¿Estás seguro de que deseas eliminar "${producto.nombre}"?`;
      document.getElementById('deleteModal').style.display = 'flex';
    }

    function cerrarDeleteModal() {
      document.getElementById('deleteModal').style.display = 'none';
      productoEliminando = null;
    }

    function confirmarEliminacion() {
      if (productoEliminando !== null) {
        const productoEliminado = inventario[productoEliminando].nombre;
        inventario.splice(productoEliminando, 1);
        guardarInventario();
        renderInventory();
        renderDashboard();
        cerrarDeleteModal();
        mostrarNotificacion(`"${productoEliminado}" eliminado correctamente`, 'warning');
      }
    }

    // Funciones principales
    function guardarUsuarios() {
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    function registrar() {
      const usuario = document.getElementById('usuarioRegistro').value;
      const contrasena = document.getElementById('contrasenaRegistro').value;
      const confirmarContrasena = document.getElementById('confirmarContrasenaRegistro').value;

      if (!usuario || !contrasena || !confirmarContrasena) {
        mostrarNotificacion('Por favor complete todos los campos', 'error');
        return;
      }

      if (contrasena !== confirmarContrasena) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
      }

      if (usuarios.some(u => u.usuario === usuario)) {
        mostrarNotificacion('El nombre de usuario ya existe', 'error');
        return;
      }

      usuarios.push({ 
        usuario, 
        contrasena, 
        inventario: [],
        notificaciones: [],
        preferencias: {
          tema: 'claro',
          notificaciones: true,
          idioma: 'es'
        }
      });
      guardarUsuarios();
      mostrarNotificacion('Registro exitoso. Por favor inicie sesión.');
      navigateTo('login');
    }

    function login() {
      const usuario = document.getElementById('usuarioLogin').value;
      const contrasena = document.getElementById('contrasenaLogin').value;
      const encontrado = usuarios.find(u => u.usuario === usuario && u.contrasena === contrasena);
      
      if (encontrado) {
        usuarioActual = encontrado;
        inventario = usuarioActual.inventario || [];
        mostrarNotificacion(`Bienvenido ${usuarioActual.usuario}`);
        navigateTo('dashboard');
      } else {
        mostrarNotificacion('Credenciales incorrectas', 'error');
      }
    }

    function logout() {
      if (usuarioActual) {
        usuarioActual.inventario = inventario;
        guardarUsuarios();
      }
      mostrarNotificacion('Sesión cerrada correctamente');
      usuarioActual = null;
      inventario = [];
      navigateTo('login');
    }

    function guardarInventario() {
      if (usuarioActual) {
        usuarioActual.inventario = inventario;
        guardarUsuarios();
      }
    }

    function toggleConsumido(index) {
      inventario[index].consumido = !inventario[index].consumido;
      guardarInventario();
      renderInventory();
      renderDashboard();
      mostrarNotificacion(
        inventario[index].consumido 
          ? `"${inventario[index].nombre}" marcado como consumido` 
          : `"${inventario[index].nombre}" marcado como no consumido`
      );
    }

    let currentScreen = 'login';

    function navigateTo(screen) {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      const target = document.getElementById(screen);
      if (target) target.classList.remove('hidden');

      currentScreen = screen;
      updateActiveMenu();

      const menu = document.getElementById('menuInferior');
      if (menu) menu.style.display = (screen === 'login' || screen === 'register') ? 'none' : 'flex';

      switch (screen) {
        case 'dashboard': renderDashboard(); break;
        case 'inventory': renderInventory(); break;
        case 'alerts': renderAlerts(); break;
        case 'profile': renderProfile(); break;
      }
    }

    function updateActiveMenu() {
      document.querySelectorAll('.menu-button').forEach(button => {
        button.classList.remove('text-green-600');
        button.classList.add('text-gray-600');
      });
      const activeButton = document.querySelector(`.menu-button[data-screen="${currentScreen}"]`);
      if (activeButton) {
        activeButton.classList.remove('text-gray-600');
        activeButton.classList.add('text-green-600');
      }
    }

    function diasRestantes(fechaStr) {
      const hoy = new Date();
      const fecha = new Date(fechaStr);
      const diff = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
      return diff;
    }

function renderDashboard() {
  const contenedor = document.getElementById('listaDashboard');
  contenedor.innerHTML = ''; // Limpiar al inicio

  // Mostrar mensaje si no hay productos
  if (inventario.length === 0) {
    contenedor.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        No hay productos en tu inventario. 
        <button onclick="navigateTo('inventory')" class="text-green-600 underline">Agrega tu primer producto</button>
      </div>
    `;
    return;
  }

  // Crear encabezado
  const header = document.createElement('div');
  header.className = 'mb-6';
  header.innerHTML = `
    <h1 class="text-6xl font-bold text-green-600">FoodSaver</h1>
    <p class="text-gray-600 mt-2">menú principal</p>
    <h2 class="text-xl font-semibold mt-6 mb-4 text-gray-700">Saquen del equipo a sam</h2>
    <h3 class="text-lg font-medium text-gray-700 mb-3">Inventario</h3>
  `;
  contenedor.appendChild(header);

  // Mostrar productos
  const productosOrdenados = [...inventario].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  productosOrdenados.forEach((producto, index) => {
    const dias = diasRestantes(producto.fecha);
    const textoDias = dias > 0 ? `${dias} Dias restantes` : 'Expiró';

    const item = document.createElement('div');
    item.className = `flex items-center justify-between p-4 mb-3 bg-white rounded-lg shadow-sm item-card ${producto.consumido ? 'consumido' : ''}`;
    item.innerHTML = `
      <div class="flex items-center">
        <span class="text-lg text-gray-700">${producto.nombre}</span>
      </div>
      <span class="text-sm ${dias <= 3 ? 'text-red-500' : dias <= 7 ? 'text-yellow-500' : 'text-green-500'}">${textoDias}</span>
    `;
    contenedor.appendChild(item);
  });

  // Agregar sección de recetas al final
  const recetasHTML = `
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Recetas recomendadas</h2>
  <!-- Contenido principal -->
  <main class="max-w-7xl mx-auto px-4 py-8">
    <!-- Contenedor de tarjetas en formato de cuadrícula -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      
      <!-- Primera tarjeta de receta -->
      <div class="bg-white shadow rounded-xl overflow-hidden flex flex-col">
        <div class="relative">
          <img 
            src="https://imgur.com/46JEauE.png" 
            alt="Imagen de receta" 
            class="w-full h-48 object-cover"
          >
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between">
          <h3 class="text-lg font-semibold mb-2">
            Pancakes de avena y fresa con jarabe de miel
          </h3>
          <div class="flex justify-between text-sm text-gray-600">
            <span class="flex items-center gap-1">
              <i class="fa-solid fa-clock"></i> 30 minutos
            </span>
            <span class="flex items-center gap-1">
              <i class="fa-solid fa-utensils"></i> desayono
            </span>
          </div>
        </div>
      </div>
      <!-- sehunda tarjeta de receta -->
      <div class="bg-white shadow rounded-xl overflow-hidden flex flex-col">
        <div class="relative">
          <img 
            src="https://i.imgur.com/Gae86RM.png" 
            alt="Imagen de receta" 
            class="w-full h-48 object-cover"
          >
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between">
          <h3 class="text-lg font-semibold mb-2">
            Arroz con pollo y verduras en una sola olla
          </h3>
          <div class="flex justify-between text-sm text-gray-600">
            <span class="flex items-center gap-1">
              <i class="fa-solid fa-clock"></i> 30 minutos
            </span>
            <span class="flex items-center gap-1">
              <i class="fa-solid fa-utensils"></i> Aperitivo
            </span>
          </div>
        </div>
      </div>
      <!-- tereera tarjeta de receta -->
      <div class="bg-white shadow rounded-xl overflow-hidden flex flex-col">
        <div class="relative">
          <img 
            src="https://imgur.com/gDGTW2A.png" 
            alt="Imagen de receta" 
            class="w-full h-48 object-cover"
          >
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between">
          <h3 class="text-lg font-semibold mb-2">
            Salmón asado con lima fresca y salsa de jengibre
          </h3>
          <div class="flex justify-between text-sm text-gray-600">
            <span class="flex items-center gap-1">
              <i class="fa-solid fa-clock"></i> 30 minutos
            </span>
            <span class="flex items-center gap-1">
              <i class="fa-solid fa-utensils"></i> Aperitivo
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
  contenedor.insertAdjacentHTML('beforeend', recetasHTML);
}


    function renderInventory() {
      const contenedor = document.getElementById('listaInventario');
      contenedor.innerHTML = '';
      
      if (inventario.length === 0) {
        contenedor.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            Tu inventario está vacío. Agrega tu primer producto.
          </div>
        `;
      }

      inventario.forEach((producto, index) => {
        const dias = diasRestantes(producto.fecha);
        const textoDias = dias > 0 ? `${dias} days left` : 'Expired';
        
        const item = document.createElement('div');
        item.className = `flex items-center justify-between p-4 mb-3 bg-white rounded-lg shadow-sm item-card ${producto.consumido ? 'consumido' : ''}`;
        item.innerHTML = `
          <div class="flex items-center">
            <span class="text-lg text-gray-700">${producto.icono} ${producto.nombre} (${producto.cantidad})</span>
          </div>
          <div class="flex items-center">
            <span class="text-sm mr-4 ${dias <= 3 ? 'text-red-500' : dias <= 7 ? 'text-yellow-500' : 'text-green-500'}">${producto.fecha}</span>
            <button onclick="abrirModal(${index})" class="text-blue-500 mr-2">editar</button>
            <button onclick="abrirDeleteModal(${index})" class="text-red-500">borrar</button>
          </div>
        `;
        contenedor.appendChild(item);
      });
    }

    function agregarProducto() {
      const nombre = document.getElementById('nombreProducto').value;
      const cantidad = document.getElementById('cantidadProducto').value;
      const fecha = document.getElementById('fechaProducto').value;

      if (nombre && cantidad && fecha) {
        inventario.push({ 
          nombre, 
          cantidad, 
          fecha, 
          consumido: false 
        });
        guardarInventario();
        document.getElementById('nombreProducto').value = '';
        document.getElementById('cantidadProducto').value = '';
        document.getElementById('fechaProducto').value = '';
        renderInventory();
        renderDashboard();
        mostrarNotificacion(`"${nombre}" agregado al inventario`);
        
        // Agregar notificación
        if (usuarioActual) {
          usuarioActual.notificaciones.unshift({
            tipo: 'success',
            mensaje: `Has agregado ${nombre}`,
            fecha: new Date().toISOString().split('T')[0]
          });
          guardarUsuarios();
        }
      } else {
        mostrarNotificacion('Por favor complete todos los campos', 'error');
      }
    }

    function renderAlerts() {
      const contenedor = document.getElementById('alerts');
      contenedor.innerHTML = '';
      
      if (!usuarioActual || !usuarioActual.notificaciones || usuarioActual.notificaciones.length === 0) {
        contenedor.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            No hay notificaciones recientes.
          </div>
        `;
        return;
      }

      const header = document.createElement('div');
      header.className = 'mb-6';
      header.innerHTML = `
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-800">Notificaciones</h1>
        </div>
        <p class="text-gray-600 mt-2">Tus alertas y actividades recientes</p>
      `;
      contenedor.appendChild(header);

      const listaNotificaciones = document.createElement('div');
      listaNotificaciones.className = 'space-y-3';
      
      usuarioActual.notificaciones.forEach(notif => {
        const notificacion = document.createElement('div');
        notificacion.className = `p-4 rounded-lg ${
          notif.tipo === 'success' ? 'bg-green-100 text-green-800' : 
          notif.tipo === 'error' ? 'bg-red-100 text-red-800' : 
          'bg-yellow-100 text-yellow-800'
        }`;
        notificacion.innerHTML = `
          <div class="flex justify-between">
            <span>${notif.mensaje}</span>
            <span class="text-sm text-gray-600">${notif.fecha}</span>
          </div>
        `;
        listaNotificaciones.appendChild(notificacion);
      });

      contenedor.appendChild(listaNotificaciones);
    }

    function renderProfile() {
      const contenedor = document.getElementById('profile');
      contenedor.innerHTML = '';
      
      const header = document.createElement('div');
      header.className = 'mb-6';
      header.innerHTML = `
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-800">Perfil de Usuario</h1>
        </div>
      `;
      contenedor.appendChild(header);

      const profileContent = document.createElement('div');
      profileContent.className = 'bg-white p-6 rounded-xl shadow space-y-6';
      
      // Información básica parte de la sección del perfil
      const infoSection = document.createElement('div');
      infoSection.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 text-gray-700">Información Básica</h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Nombre de usuario:</span>
            <span class="font-medium">${usuarioActual?.usuario || 'No disponible'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Correo electrónico:</span>
            <span class="font-medium">${usuarioActual?.usuario || 'usuario'}@foodsaver.com</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Miembro desde:</span>
            <span class="font-medium">${new Date().toLocaleDateString()}</span>
          </div>
        </div>
      `;
      profileContent.appendChild(infoSection);

      // Estadísticas parte de la sección del perfil
      const statsSection = document.createElement('div');
      statsSection.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 text-gray-700">Estadísticas</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-green-50 p-3 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-600">${inventario.length}</div>
            <div class="text-sm text-gray-600">Productos en inventario</div>
          </div>
          <div class="bg-blue-50 p-3 rounded-lg text-center">
            <div class="text-2xl font-bold text-blue-600">${inventario.filter(p => p.consumido).length}</div>
            <div class="text-sm text-gray-600">Productos consumidos</div>
          </div>
          <div class="bg-yellow-50 p-3 rounded-lg text-center">
            <div class="text-2xl font-bold text-yellow-600">${inventario.filter(p => diasRestantes(p.fecha) <= 3).length}</div>
            <div class="text-sm text-gray-600">Productos por caducar</div>
          </div>
          <div class="bg-purple-50 p-3 rounded-lg text-center">
            <div class="text-2xl font-bold text-purple-600">${usuarioActual?.notificaciones?.length || 0}</div>
            <div class="text-sm text-gray-600">Notificaciones</div>
          </div>
        </div>
      `;
      profileContent.appendChild(statsSection);

      // Preferencias parte de la sección del perfil
      const prefsSection = document.createElement('div');
      prefsSection.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 text-gray-700">Preferencias</h2>
        <div class="space-y-3">
        </div>
      `;
      profileContent.appendChild(prefsSection);

      // Botón de cerrar sesión
      const logoutSection = document.createElement('div');
      logoutSection.className = 'pt-4';
      logoutSection.innerHTML = `
        <button onclick="logout()" class="w-full bg-red-600 text-white px-4 py-2 rounded">Cerrar sesión</button>
      `;
      profileContent.appendChild(logoutSection);

      contenedor.appendChild(profileContent);
    }

    window.onload = () => {
      // Pantalla de login
      document.getElementById('login').innerHTML = `
        <div class="h-screen flex flex-col justify-center items-center space-y-4">
          <h1 class="text-3xl font-bold text-green-600">FoodSaver</h1>
          <div class="bg-white p-6 rounded-lg shadow-md w-80">
            <h2 class="text-xl font-semibold mb-4 text-center">Iniciar sesión</h2>
            <input id="usuarioLogin" type="text" placeholder="Usuario" class="w-full p-2 border rounded mb-3" />
            <input id="contrasenaLogin" type="password" placeholder="Contraseña" class="w-full p-2 border rounded mb-4" />
            <button onclick="login()" class="w-full bg-green-600 text-white px-4 py-2 rounded">Iniciar sesión</button>
            <button onclick="navigateTo('register')" class="w-full mt-3 text-green-600 underline">Crear cuenta</button>
            <div class="mt-4 text-sm text-gray-500 text-center">
              Usuario predeterminado: cliente / 1234
            </div>
          </div>
        </div>
      `;

      // Pantalla de registro
      document.getElementById('register').innerHTML = `
        <div class="h-screen flex flex-col justify-center items-center space-y-4">
          <h1 class="text-3xl font-bold text-green-600">FoodSaver</h1>
          <div class="bg-white p-6 rounded-lg shadow-md w-80">
            <h2 class="text-xl font-semibold mb-4 text-center">Registrarse</h2>
            <input id="usuarioRegistro" type="text" placeholder="Usuario" class="w-full p-2 border rounded mb-3" />
            <input id="contrasenaRegistro" type="password" placeholder="Contraseña" class="w-full p-2 border rounded mb-3" />
            <input id="confirmarContrasenaRegistro" type="password" placeholder="Confirmar Contraseña" class="w-full p-2 border rounded mb-4" />
            <button onclick="registrar()" class="w-full bg-green-600 text-white px-4 py-2 rounded">Registrarse</button>
            <button onclick="navigateTo('login')" class="w-full mt-3 text-green-600 underline">Ya tengo cuenta</button>
          </div>
        </div>
      `;

      // Pantalla de dashboard
      const dashboardDiv = document.getElementById('dashboard');
      dashboardDiv.innerHTML = `
        <div class="mb-6">
          <div id="listaDashboard" class="space-y-4"></div>
        </div>
      `;

      // Pantalla de inventario
      const inventoryDiv = document.getElementById('inventory');
      inventoryDiv.innerHTML = `
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Inventario</h2>
          </div>
          <div id="listaInventario" class="space-y-4"></div>
          <div class="bg-white p-4 rounded shadow space-y-4 mt-6">
            <h3 class="text-lg font-semibold">Agregar Producto</h3>
            <input type="text" id="nombreProducto" placeholder="Nombre" class="w-full p-2 border rounded" />
            <input type="text" id="cantidadProducto" placeholder="Cantidad" class="w-full p-2 border rounded" />
            <input type="date" id="fechaProducto" class="w-full p-2 border rounded" />
            <button onclick="agregarProducto()" class="bg-green-600 text-white px-4 py-2 rounded w-full">Agregar</button>
          </div>
        </div>
      `;

      // Pantalla de alertas
      const alertsDiv = document.getElementById('alerts');
      alertsDiv.innerHTML = `
        <div class="space-y-2"></div>
      `;

      navigateTo('login');
    };