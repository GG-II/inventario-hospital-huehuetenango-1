import { db } from '../config/database';
import { roles, usuarios, subgrupos, estados, areas } from './schema';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Iniciando seed de base de datos...');

  try {
    // 1. ROLES
    console.log('📝 Insertando roles...');
    const rolesData = await db.insert(roles).values([
      { 
        nombre: 'Admin', 
        permisos: JSON.stringify(['*']),
        createdAt: new Date().toISOString()
      },
      { 
        nombre: 'Inventarios', 
        permisos: JSON.stringify(['equipos', 'traslados', 'bajas_aprobar', 'reportes']),
        createdAt: new Date().toISOString()
      },
      { 
        nombre: 'Jefe Servicio', 
        permisos: JSON.stringify(['equipos_ver', 'traslados_area', 'reportes_area']),
        createdAt: new Date().toISOString()
      },
      { 
        nombre: 'Informatica', 
        permisos: JSON.stringify(['equipos_ver_computo', 'reportes']),
        createdAt: new Date().toISOString()
      },
      { 
        nombre: 'Mantenimiento', 
        permisos: JSON.stringify(['equipos_ver', 'bajas_crear']),
        createdAt: new Date().toISOString()
      },
      { 
        nombre: 'Lectura', 
        permisos: JSON.stringify(['equipos_ver', 'reportes_ver']),
        createdAt: new Date().toISOString()
      },
    ]).returning();

    console.log(`✅ ${rolesData.length} roles insertados`);

    // 2. SUBGRUPOS SICOIN (predefinidos)
    console.log('📝 Insertando subgrupos SICOIN...');
    const subgruposData = await db.insert(subgrupos).values([
      { codigo: '321', nombre: 'De producción', descripcion: 'Maquinaria y equipo de producción' },
      { codigo: '322', nombre: 'De oficina y muebles', descripcion: 'Equipo de oficina y mobiliario' },
      { codigo: '323', nombre: 'Médico, sanitario y laboratorio', descripcion: 'Equipo médico y de laboratorio' },
      { codigo: '324', nombre: 'Educacional, cultural y recreativo', descripcion: 'Equipo educativo y recreativo' },
      { codigo: '325', nombre: 'Transporte, tracción y elevación', descripcion: 'Vehículos y equipo de transporte' },
      { codigo: '326', nombre: 'De comunicaciones', descripcion: 'Equipo de telecomunicaciones' },
      { codigo: '328', nombre: 'De cómputo', descripcion: 'Equipo informático y tecnológico' },
      { codigo: '329', nombre: 'Otros activos', descripcion: 'Otros activos no clasificados' },
    ]).returning();

    console.log(`✅ ${subgruposData.length} subgrupos insertados`);

    // 3. ESTADOS
    console.log('📝 Insertando estados de equipos...');
    const estadosData = await db.insert(estados).values([
      { nombre: 'Activo', color: 'green' },
      { nombre: 'En reparación', color: 'yellow' },
      { nombre: 'En resguardo', color: 'blue' },
      { nombre: 'En préstamo', color: 'purple' },
      { nombre: 'De baja (pendiente)', color: 'orange' },
      { nombre: 'Dado de baja', color: 'red' },
    ]).returning();

    console.log(`✅ ${estadosData.length} estados insertados`);

    // 4. ÁREAS (ejemplos del hospital)
    console.log('📝 Insertando áreas del hospital...');
    const areasData = await db.insert(areas).values([
      { nombre: 'Administración', jefe: 'Por asignar', createdAt: new Date().toISOString() },
      { nombre: 'Emergencia', jefe: 'Por asignar', createdAt: new Date().toISOString() },
      { nombre: 'Hospitalización', jefe: 'Por asignar', createdAt: new Date().toISOString() },
      { nombre: 'Quirófano', jefe: 'Por asignar', createdAt: new Date().toISOString() },
      { nombre: 'Laboratorio', jefe: 'Por asignar', createdAt: new Date().toISOString() },
      { nombre: 'Farmacia', jefe: 'Por asignar', createdAt: new Date().toISOString() },
      { nombre: 'Informática', jefe: 'Por asignar', createdAt: new Date().toISOString() },
      { nombre: 'Mantenimiento', jefe: 'Por asignar', createdAt: new Date().toISOString() },
      { nombre: 'Inventarios', jefe: 'Jefa de Inventarios', createdAt: new Date().toISOString() },
      { nombre: 'Consulta Externa', jefe: 'Por asignar', createdAt: new Date().toISOString() },
    ]).returning();

    console.log(`✅ ${areasData.length} áreas insertadas`);

    // 5. USUARIO ADMINISTRADOR
    console.log('📝 Creando usuario administrador...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminRole = rolesData.find(r => r.nombre === 'Admin');
    
    if (adminRole) {
      const adminUser = await db.insert(usuarios).values({
        username: 'admin',
        password: hashedPassword,
        nombre: 'Administrador del Sistema',
        email: 'admin@hospital.gob.gt',
        rolId: adminRole.id,
        activo: true,
        createdAt: new Date().toISOString(),
      }).returning();

      console.log(`✅ Usuario admin creado (ID: ${adminUser[0].id})`);
    }

    // 6. USUARIO DE INVENTARIOS (ejemplo)
    console.log('📝 Creando usuario de inventarios...');
    const hashedPassword2 = await bcrypt.hash('inventario123', 10);
    
    const inventariosRole = rolesData.find(r => r.nombre === 'Inventarios');
    
    if (inventariosRole) {
      const invUser = await db.insert(usuarios).values({
        username: 'inventario1',
        password: hashedPassword2,
        nombre: 'Personal de Inventarios',
        email: 'inventario@hospital.gob.gt',
        rolId: inventariosRole.id,
        activo: true,
        createdAt: new Date().toISOString(),
      }).returning();

      console.log(`✅ Usuario inventario1 creado (ID: ${invUser[0].id})`);
    }

    console.log('\n🎉 ¡Seed completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - ${rolesData.length} roles`);
    console.log(`   - ${subgruposData.length} subgrupos SICOIN`);
    console.log(`   - ${estadosData.length} estados`);
    console.log(`   - ${areasData.length} áreas`);
    console.log(`   - 2 usuarios`);
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123\n');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

// Ejecutar seed
seed()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });