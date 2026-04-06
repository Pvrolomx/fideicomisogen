import { generarCesionFideicomiso } from '../../lib/generator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const datos = req.body;
    
    // Validaciones básicas
    if (!datos.cedentes || datos.cedentes.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un cedente' });
    }
    
    if (!datos.cesionarios || datos.cesionarios.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un cesionario' });
    }
    
    // Generar el documento
    const buffer = await generarCesionFideicomiso(datos);
    
    // Nombre del archivo basado en el número de fideicomiso
    const numFideicomiso = datos.fideicomiso?.numero || 'borrador';
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `cesion_fideicomiso_${numFideicomiso}_${fecha}.docx`;
    
    // Enviar el archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    return res.send(buffer);
    
  } catch (error) {
    console.error('Error generando documento:', error);
    return res.status(500).json({ 
      error: 'Error al generar el documento',
      details: error.message 
    });
  }
}

// Configuración para permitir body más grande (documentos pueden tener mucho texto)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
