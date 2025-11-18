import PDFDocument from 'pdfkit';
import { db } from '../config/database';
import { equipos, areas, estados, subgrupos } from '../db/schema';
import { eq } from 'drizzle-orm';

export const reportePDFService = {
  /**
   * Generar reporte de inventario anual en PDF
   */
  async generarInventarioPDF(): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Encabezado
        doc.fontSize(18)
          .font('Helvetica-Bold')
          .text('Hospital Regional de Huehuetenango', { align: 'center' });
        
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .text('"Dr. Jorge Vides Molina"', { align: 'center' });
        
        doc.moveDown();
        
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('REPORTE DE INVENTARIO ANUAL', { align: 'center' });
        
        doc.moveDown(0.5);
        
        doc.fontSize(10)
          .font('Helvetica')
          .text(`Fecha de generación: ${new Date().toLocaleDateString('es-GT', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`, { align: 'center' });
        
        doc.moveDown(2);

        // Obtener todos los equipos con sus relaciones
        const todosEquipos = await db
          .select({
            id: equipos.id,
            codigoSICOIN: equipos.codigoSICOIN,
            descripcion: equipos.descripcion,
            marca: equipos.marca,
            modelo: equipos.modelo,
            precioUnitario: equipos.precioUnitario,
            areaId: equipos.areaId,
            estadoId: equipos.estadoId,
            subgrupoId: equipos.subgrupoId,
          })
          .from(equipos)
          .orderBy(equipos.codigoSICOIN);

        // Obtener catálogos
        const [areasData, estadosData, subgruposData] = await Promise.all([
          db.select().from(areas),
          db.select().from(estados),
          db.select().from(subgrupos),
        ]);

        const areasMap = new Map(areasData.map(a => [a.id, a.nombre]));
        const estadosMap = new Map(estadosData.map(e => [e.id, e.nombre]));
        const subgruposMap = new Map(subgruposData.map(s => [s.id, `${s.codigo} - ${s.nombre}`]));

        // Título de la tabla
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .text('Listado de Equipos', { underline: true });
        doc.moveDown();

        // Encabezados de tabla
        doc.fontSize(8).font('Helvetica-Bold');
        const tableTop = doc.y;
        doc.text('No.', 50, tableTop, { width: 25, continued: true });
        doc.text('Código', 75, tableTop, { width: 80, continued: true });
        doc.text('Descripción', 155, tableTop, { width: 150, continued: true });
        doc.text('Área', 305, tableTop, { width: 90, continued: true });
        doc.text('Estado', 395, tableTop, { width: 70, continued: true });
        doc.text('Precio', 465, tableTop, { width: 85, align: 'right' });
        
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        let y = doc.y;
        let totalValor = 0;
        doc.font('Helvetica');

        // Listar equipos
        todosEquipos.forEach((equipo, index) => {
          // Nueva página si es necesario
          if (y > 700) {
            doc.addPage();
            y = 50;
            
            // Re-dibujar encabezados
            doc.fontSize(8).font('Helvetica-Bold');
            doc.text('No.', 50, y, { width: 25, continued: true });
            doc.text('Código', 75, y, { width: 80, continued: true });
            doc.text('Descripción', 155, y, { width: 150, continued: true });
            doc.text('Área', 305, y, { width: 90, continued: true });
            doc.text('Estado', 395, y, { width: 70, continued: true });
            doc.text('Precio', 465, y, { width: 85, align: 'right' });
            
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            y = doc.y;
            doc.font('Helvetica');
          }

          const area = areasMap.get(equipo.areaId) || 'N/A';
          const estado = estadosMap.get(equipo.estadoId) || 'N/A';
          const precio = equipo.precioUnitario || 0;
          totalValor += precio;
          
          const descripcionCorta = equipo.descripcion.length > 32 
            ? equipo.descripcion.substring(0, 29) + '...' 
            : equipo.descripcion;

          doc.fontSize(7);
          doc.text(`${index + 1}`, 50, y, { width: 25 });
          doc.text(equipo.codigoSICOIN, 75, y, { width: 80 });
          doc.text(descripcionCorta, 155, y, { width: 150 });
          doc.text(area, 305, y, { width: 90 });
          doc.text(estado, 395, y, { width: 70 });
          doc.text(`Q ${(precio / 100).toFixed(2)}`, 465, y, { width: 85, align: 'right' });

          y += 14;
        });

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Resumen
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text('Resumen del Inventario', { underline: true });
        doc.moveDown();
        
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total de equipos registrados: ${todosEquipos.length}`);
        doc.text(`Valor total del inventario: Q ${(totalValor / 100).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        
        doc.moveDown(2);

        // Agrupación por área
        const equiposPorArea = todosEquipos.reduce((acc, eq) => {
          const area = areasMap.get(eq.areaId) || 'Sin área';
          if (!acc[area]) acc[area] = { cantidad: 0, valor: 0 };
          acc[area].cantidad++;
          acc[area].valor += eq.precioUnitario;
          return acc;
        }, {} as Record<string, { cantidad: number; valor: number }>);

        doc.fontSize(12).font('Helvetica-Bold').text('Equipos por Área:');
        doc.moveDown();
        doc.fontSize(10).font('Helvetica');
        
        Object.entries(equiposPorArea).forEach(([area, datos]) => {
          doc.text(`• ${area}: ${datos.cantidad} equipos - Q ${(datos.valor / 100).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);
        });

        doc.moveDown(2);

        // Agrupación por subgrupo
        const equiposPorSubgrupo = todosEquipos.reduce((acc, eq) => {
          const subgrupo = subgruposMap.get(eq.subgrupoId) || 'Sin subgrupo';
          if (!acc[subgrupo]) acc[subgrupo] = { cantidad: 0, valor: 0 };
          acc[subgrupo].cantidad++;
          acc[subgrupo].valor += eq.precioUnitario;
          return acc;
        }, {} as Record<string, { cantidad: number; valor: number }>);

        doc.fontSize(12).font('Helvetica-Bold').text('Equipos por Subgrupo SICOIN:');
        doc.moveDown();
        doc.fontSize(10).font('Helvetica');
        
        Object.entries(equiposPorSubgrupo).forEach(([subgrupo, datos]) => {
          doc.text(`• ${subgrupo}: ${datos.cantidad} equipos - Q ${(datos.valor / 100).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);
        });

        // Pie de página
        doc.moveDown(3);
        doc.fontSize(8).font('Helvetica').fillColor('gray');
        doc.text(
          `Generado por Sistema de Inventario Hospitalario - ${new Date().toISOString()}`,
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        console.error('Error al generar reporte PDF:', error);
        reject(error);
      }
    });
  },

  /**
   * Generar tarjeta de responsabilidad por área en PDF
   */
  async generarTarjetaPDF(areaId: number): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Verificar que el área exista
        const [area] = await db
          .select()
          .from(areas)
          .where(eq(areas.id, areaId))
          .limit(1);

        if (!area) {
          throw new Error('Área no encontrada');
        }

        // Obtener equipos del área
        const equiposArea = await db
          .select({
            id: equipos.id,
            codigoSICOIN: equipos.codigoSICOIN,
            descripcion: equipos.descripcion,
            marca: equipos.marca,
            modelo: equipos.modelo,
            precioUnitario: equipos.precioUnitario,
            estadoId: equipos.estadoId,
            subgrupoId: equipos.subgrupoId,
          })
          .from(equipos)
          .where(eq(equipos.areaId, areaId))
          .orderBy(equipos.codigoSICOIN);

        // Obtener estados
        const estadosData = await db.select().from(estados);
        const estadosMap = new Map(estadosData.map(e => [e.id, e.nombre]));

        const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Encabezado
        doc.fontSize(18)
          .font('Helvetica-Bold')
          .text('Hospital Regional de Huehuetenango', { align: 'center' });
        
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .text('"Dr. Jorge Vides Molina"', { align: 'center' });
        
        doc.moveDown();
        
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('TARJETA DE RESPONSABILIDAD', { align: 'center' });
        
        doc.moveDown(2);

        // Datos del área
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Área:', { continued: true })
          .font('Helvetica')
          .text(` ${area.nombre}`);
        
        doc.font('Helvetica-Bold')
          .text('Responsable:', { continued: true })
          .font('Helvetica')
          .text(` ${area.jefe || 'Por asignar'}`);
        
        doc.font('Helvetica-Bold')
          .text('Fecha:', { continued: true })
          .font('Helvetica')
          .text(` ${new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}`);
        
        doc.moveDown(2);

        // Título de equipos
        doc.fontSize(11).font('Helvetica-Bold').text('Equipos asignados:', { underline: true });
        doc.moveDown();

        // Encabezados de tabla
        doc.fontSize(8).font('Helvetica-Bold');
        let y = doc.y;
        doc.text('No.', 50, y, { width: 25, continued: true });
        doc.text('Código SICOIN', 75, y, { width: 85, continued: true });
        doc.text('Descripción', 160, y, { width: 180, continued: true });
        doc.text('Estado', 340, y, { width: 70, continued: true });
        doc.text('Precio', 410, y, { width: 90, align: 'right' });
        
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
        doc.moveDown(0.5);

        y = doc.y;
        let totalValor = 0;
        doc.font('Helvetica');

        // Listar equipos
        equiposArea.forEach((equipo, index) => {
          // Nueva página si es necesario
          if (y > 680) {
            doc.addPage();
            y = 50;
            
            // Re-dibujar encabezados
            doc.fontSize(8).font('Helvetica-Bold');
            doc.text('No.', 50, y, { width: 25, continued: true });
            doc.text('Código SICOIN', 75, y, { width: 85, continued: true });
            doc.text('Descripción', 160, y, { width: 180, continued: true });
            doc.text('Estado', 340, y, { width: 70, continued: true });
            doc.text('Precio', 410, y, { width: 90, align: 'right' });
            
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
            doc.moveDown(0.5);
            y = doc.y;
            doc.font('Helvetica');
          }

          const precio = equipo.precioUnitario || 0;
          totalValor += precio;
          const estado = estadosMap.get(equipo.estadoId) || 'N/A';
          
          const descripcionCorta = equipo.descripcion.length > 40
            ? equipo.descripcion.substring(0, 37) + '...'
            : equipo.descripcion;

          doc.fontSize(7);
          doc.text(`${index + 1}`, 50, y, { width: 25 });
          doc.text(equipo.codigoSICOIN, 75, y, { width: 85 });
          doc.text(descripcionCorta, 160, y, { width: 180 });
          doc.text(estado, 340, y, { width: 70 });
          doc.text(`Q ${(precio / 100).toFixed(2)}`, 410, y, { width: 90, align: 'right' });

          y += 14;
        });

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
        doc.moveDown();

        // Totales
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(`Total de equipos: ${equiposArea.length}`);
        doc.text(`Valor total: Q ${(totalValor / 100).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

        // Espacios para firmas
        doc.moveDown(4);
        doc.fontSize(10).font('Helvetica');
        
        const firmaPosY = doc.y;
        
        // Firma izquierda - Recibí conforme
        doc.text('_____________________________', 70, firmaPosY);
        doc.text('Recibí conforme', 70, firmaPosY + 20);
        doc.text(`Jefe de ${area.nombre}`, 70, firmaPosY + 35);
        doc.fontSize(9).text(`${area.jefe || ''}`, 70, firmaPosY + 50);

        // Firma derecha - Entregado por
        doc.fontSize(10);
        doc.text('_____________________________', 320, firmaPosY);
        doc.text('Entregado por', 320, firmaPosY + 20);
        doc.text('Departamento de Inventarios', 320, firmaPosY + 35);

        // Pie de página
        doc.fontSize(8).font('Helvetica').fillColor('gray');
        doc.text(
          `Sistema de Inventario Hospitalario - ${new Date().toISOString()}`,
          50,
          750,
          { align: 'center', width: 500 }
        );

        doc.end();
      } catch (error) {
        console.error('Error al generar tarjeta PDF:', error);
        reject(error);
      }
    });
  },
};