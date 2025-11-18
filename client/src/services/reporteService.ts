import PDFDocument from 'pdfkit';
import { db } from '../config/database';
import { equipos, areas, estados, subgrupos } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class ReporteService {
  /**
   * Generar reporte de inventario anual
   */
  async generarReporteInventario(): Promise<Buffer> {
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
        
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('Reporte de Inventario Anual', { align: 'center' });
        
        doc.fontSize(10)
          .font('Helvetica')
          .text(`Fecha: ${new Date().toLocaleDateString('es-GT', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`, { align: 'center' });
        
        doc.moveDown(2);

        // Obtener todos los equipos
        const todosEquipos = await db
          .select()
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
        const subgruposMap = new Map(subgruposData.map(s => [s.id, s.nombre]));

        // Título de la tabla
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .text('Listado de Equipos', { underline: true });
        doc.moveDown();

        // Encabezados de tabla
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('No.', 50, doc.y, { width: 30, continued: true });
        doc.text('Código', 80, doc.y, { width: 90, continued: true });
        doc.text('Descripción', 170, doc.y, { width: 180, continued: true });
        doc.text('Área', 350, doc.y, { width: 100, continued: true });
        doc.text('Estado', 450, doc.y, { width: 100 });
        
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        let y = doc.y;
        doc.font('Helvetica');

        todosEquipos.forEach((equipo: any, index: number) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
            
            doc.fontSize(9).font('Helvetica-Bold');
            doc.text('No.', 50, y, { width: 30, continued: true });
            doc.text('Código', 80, y, { width: 90, continued: true });
            doc.text('Descripción', 170, y, { width: 180, continued: true });
            doc.text('Área', 350, y, { width: 100, continued: true });
            doc.text('Estado', 450, y, { width: 100 });
            
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            y = doc.y;
            doc.font('Helvetica');
          }

          const area = areasMap.get(equipo.areaId) || 'N/A';
          const estado = estadosMap.get(equipo.estadoId) || 'N/A';
          const descripcionCorta = equipo.descripcion.length > 35 
            ? equipo.descripcion.substring(0, 32) + '...' 
            : equipo.descripcion;

          doc.fontSize(8);
          doc.text(`${index + 1}`, 50, y, { width: 30 });
          doc.text(equipo.codigoSICOIN, 80, y, { width: 90 });
          doc.text(descripcionCorta, 170, y, { width: 180 });
          doc.text(area, 350, y, { width: 100 });
          doc.text(estado, 450, y, { width: 100 });

          y += 18;
        });

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Resumen
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text('Resumen', { underline: true });
        doc.moveDown();
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total de equipos registrados: ${todosEquipos.length}`);
        
        const valorTotal = todosEquipos.reduce((sum: number, e: any) => sum + (e.precioUnitario || 0), 0);
        doc.text(`Valor total del inventario: Q ${(valorTotal / 100).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);

        doc.end();
      } catch (error) {
        console.error('Error al generar reporte:', error);
        reject(error);
      }
    });
  }

  /**
   * Generar tarjeta de responsabilidad por área
   */
  async generarTarjetaResponsabilidad(areaId: number): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const [area] = await db
          .select()
          .from(areas)
          .where(eq(areas.id, areaId))
          .limit(1);

        if (!area) {
          throw new Error('Área no encontrada');
        }

        const equiposArea = await db
          .select()
          .from(equipos)
          .where(eq(equipos.areaId, areaId))
          .orderBy(equipos.codigoSICOIN);

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
        
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('TARJETA DE RESPONSABILIDAD', { align: 'center' });
        
        doc.moveDown(2);

        // Datos del área
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Área: `, { continued: true }).font('Helvetica').text(area.nombre);
        doc.font('Helvetica-Bold').text(`Jefe: `, { continued: true })
          .font('Helvetica').text(area.jefe || 'Por asignar.');
        doc.font('Helvetica-Bold').text(`Fecha: `, { continued: true })
          .font('Helvetica').text(new Date().toLocaleDateString('es-GT'));
        
        doc.moveDown(2);

        doc.fontSize(11).font('Helvetica-Bold').text('Equipos asignados:', { underline: true });
        doc.moveDown();

        // Encabezados
        doc.fontSize(9).font('Helvetica-Bold');
        let y = doc.y;
        doc.text('No.', 50, y, { width: 30, continued: true });
        doc.text('Código', 80, y, { width: 90, continued: true });
        doc.text('Descripción', 170, y, { width: 200, continued: true });
        doc.text('Precio', 370, y, { width: 80, align: 'right', continued: true });
        doc.text('Estado', 450, y, { width: 100 });
        
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        y = doc.y;
        let totalValor = 0;
        doc.font('Helvetica');

        equiposArea.forEach((equipo: any, index: number) => {
          if (y > 680) {
            doc.addPage();
            y = 50;
          }

          const precio = equipo.precioUnitario || 0;
          totalValor += precio;
          const estado = estadosMap.get(equipo.estadoId) || 'N/A';
          const descripcionCorta = equipo.descripcion.length > 40
            ? equipo.descripcion.substring(0, 37) + '...'
            : equipo.descripcion;

          doc.fontSize(8);
          doc.text(`${index + 1}`, 50, y, { width: 30 });
          doc.text(equipo.codigoSICOIN, 80, y, { width: 90 });
          doc.text(descripcionCorta, 170, y, { width: 200 });
          doc.text(`Q ${(precio / 100).toFixed(2)}`, 370, y, { width: 80, align: 'right' });
          doc.text(estado, 450, y, { width: 100 });

          y += 16;
        });

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Totales
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(`Total de equipos: ${equiposArea.length}`);
        doc.text(`Valor total: Q ${(totalValor / 100).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);

        // Espacios para firmas
        doc.moveDown(4);
        doc.fontSize(10).font('Helvetica');
        
        doc.text('_____________________________', 50);
        doc.moveDown(0.3);
        doc.text('Recibí conforme', 50);
        doc.text(`Jefe de ${area.nombre}`, 50);

        const yFirma = doc.y - 60;
        doc.text('_____________________________', 350, yFirma);
        doc.text('Entregado por', 350, yFirma + 15);
        doc.text('Departamento de Inventarios', 350, yFirma + 30);

        doc.end();
      } catch (error) {
        console.error('Error al generar tarjeta:', error);
        reject(error);
      }
    });
  }
}

export const reporteService = new ReporteService();