const Service = require('node-windows').Service;
const path = require('path');

// Crear objeto del servicio (debe coincidir con el de instalación)
const svc = new Service({
  name: 'Inventario Hospital Huehue',
  script: path.join(__dirname, 'dist', 'index.js')
});

// Escuchar el evento "uninstall"
svc.on('uninstall', function() {
  console.log('✅ Servicio desinstalado correctamente');
  console.log('💡 El sistema ya no se iniciará automáticamente');
  console.log('');
  console.log('Para volver a instalarlo, ejecute: node install-service.js');
});

svc.on('error', function(err) {
  console.error('❌ Error al desinstalar el servicio:', err);
  console.log('');
  console.log('💡 Sugerencias:');
  console.log('   - Asegúrese de ejecutar como Administrador');
  console.log('   - Verifique que el servicio esté instalado: Get-Service "Inventario Hospital Huehue"');
});

// Desinstalar el servicio
console.log('🗑️  Desinstalando servicio de Windows...');
console.log('');
svc.uninstall();