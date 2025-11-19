const Service = require('node-windows').Service;
const path = require('path');

// Crear objeto del servicio
const svc = new Service({
  name: 'Inventario Hospital Huehue',
  description: 'Sistema de Control de Inventarios - Hospital Regional de Huehuetenango',
  script: path.join(__dirname, 'dist', 'index.js'),
  nodeOptions: [
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: 'NODE_ENV',
      value: 'production'
    },
    {
      name: 'PORT',
      value: '3000'
    }
  ]
});

// Escuchar el evento "install"
svc.on('install', function() {
  console.log('✅ Servicio instalado correctamente');
  console.log('⏳ Iniciando servicio...');
  svc.start();
});

svc.on('start', function() {
  console.log('✅ Servicio iniciado correctamente');
  console.log('🌐 El sistema está disponible en: http://localhost:3000');
  console.log('📋 Puede acceder desde otras computadoras usando: http://[IP-DE-ESTA-PC]:3000');
  console.log('');
  console.log('💡 Para ver los logs en tiempo real, ejecute: .\\view-logs.ps1');
  console.log('');
  console.log('🛠️  Comandos útiles:');
  console.log('   - Ver estado: Get-Service "Inventario Hospital Huehue"');
  console.log('   - Reiniciar: Restart-Service "Inventario Hospital Huehue"');
  console.log('   - Detener: Stop-Service "Inventario Hospital Huehue"');
});

svc.on('alreadyinstalled', function() {
  console.log('⚠️  El servicio ya está instalado');
  console.log('💡 Para reinstalar, primero ejecute: node uninstall-service.js');
});

svc.on('error', function(err) {
  console.error('❌ Error al instalar el servicio:', err);
  console.log('');
  console.log('💡 Sugerencias:');
  console.log('   - Asegúrese de ejecutar como Administrador');
  console.log('   - Verifique que Node.js esté instalado: node --version');
  console.log('   - Verifique que el archivo dist/index.js existe');
});

// Instalar el servicio
console.log('📦 Instalando servicio de Windows...');
console.log('');
svc.install();