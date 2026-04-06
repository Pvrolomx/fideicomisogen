/**
 * FideicomisoGen - Generador de Cesiones de Derechos Fideicomisarios
 * Versión para Next.js API
 * 
 * Lógica dinámica: N cedentes → M cesionarios
 * Basado en machote Notaría 29 Bucerías (Adán Meza) + Banco del Bajío
 */

import {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak
} from 'docx';

// ============================================================================
// CONSTANTES NOTARIALES
// ============================================================================

// Guiones de relleno estándar notarial (evitan alteraciones)
const GUIONES_CORTOS = '------';
const GUIONES_MEDIOS = '------------';
const GUIONES_LARGOS = '------------------------';
const GUIONES_MUY_LARGOS = '----------------------------------------';
const GUIONES_LINEA = '----------------------------------------------------------------';

// ============================================================================
// CONFIGURACIÓN DEL NOTARIO
// ============================================================================

const CONFIG_NOTARIO = {
  notaria: {
    numero: 29,
    demarcacion: "primera demarcación notarial del Estado",
    ciudad: "Bucerías",
    municipio: "Bahía de Banderas",
    estado: "Nayarit",
    titular: {
      nombre: "Adán Meza Barajas",
      titulo: "licenciado"
    },
    suplente: {
      nombre: "Adán Gilberto Meza Espinosa",
      titulo: "notario suplente",
      convenio: {
        fecha: "26 veintiséis de abril de 2022 dos mil veintidós",
        publicacion: "Periódico Oficial Órgano del Gobierno del Estado de Nayarit"
      }
    }
  },
  banco: {
    nombre: "Banco del Bajío",
    razonSocial: "Banco del Bajío, Sociedad Anónima, Institución de Banca Múltiple",
    abreviatura: "BANBAJIO"
  }
};

// ============================================================================
// HELPERS - CONVERSIÓN A LETRA
// ============================================================================

const LETRAS_MAP = {
  '0': 'cero', '1': 'uno', '2': 'dos', '3': 'tres', '4': 'cuatro',
  '5': 'cinco', '6': 'seis', '7': 'siete', '8': 'ocho', '9': 'nueve',
  'A': 'a', 'B': 'be', 'C': 'ce', 'D': 'de', 'E': 'e', 'F': 'efe',
  'G': 'ge', 'H': 'hache', 'I': 'i', 'J': 'jota', 'K': 'ka', 'L': 'ele',
  'M': 'eme', 'N': 'ene', 'Ñ': 'eñe', 'O': 'o', 'P': 'pe', 'Q': 'cu',
  'R': 'erre', 'S': 'ese', 'T': 'te', 'U': 'u', 'V': 'uve', 'W': 'doble u',
  'X': 'equis', 'Y': 'ye', 'Z': 'zeta', '-': 'guion', '/': 'diagonal'
};

function convertirALetra(texto) {
  if (!texto) return '';
  return texto.toString().toUpperCase().split('').map(char => LETRAS_MAP[char] || char).join(', ');
}

function numeroALetras(num) {
  if (num === 0) return 'cero';
  
  const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  
  const convertir = (n) => {
    if (n === 0) return '';
    if (n < 10) return unidades[n];
    if (n < 20) return especiales[n - 10];
    if (n < 30) return n === 20 ? 'veinte' : 'veinti' + unidades[n - 20];
    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      return u === 0 ? decenas[d] : decenas[d] + ' y ' + unidades[u];
    }
    if (n === 100) return 'cien';
    if (n < 1000) {
      const c = Math.floor(n / 100);
      const resto = n % 100;
      return resto === 0 ? centenas[c] : centenas[c] + ' ' + convertir(resto);
    }
    if (n < 1000000) {
      const miles = Math.floor(n / 1000);
      const resto = n % 1000;
      let milTxt = miles === 1 ? 'mil' : convertir(miles) + ' mil';
      return resto === 0 ? milTxt : milTxt + ' ' + convertir(resto);
    }
    if (n < 1000000000) {
      const millones = Math.floor(n / 1000000);
      const resto = n % 1000000;
      let millonTxt = millones === 1 ? 'un millón' : convertir(millones) + ' millones';
      return resto === 0 ? millonTxt : millonTxt + ' ' + convertir(resto);
    }
    return n.toString();
  };
  
  return convertir(Math.floor(num));
}

function formatearFecha(fecha) {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date(fecha + 'T12:00:00');
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const año = d.getFullYear();
  return `${dia} ${numeroALetras(dia)} de ${mes.charAt(0).toUpperCase() + mes.slice(1)} de ${año} ${numeroALetras(año)}`;
}

function formatearMontoUSD(monto) {
  const num = typeof monto === 'string' ? parseFloat(monto.replace(/,/g, '')) : monto;
  return `USD$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${numeroALetras(Math.floor(num))} dólares americanos ${Math.round((num % 1) * 100).toString().padStart(2, '0')}/100 moneda de curso legal de los Estados Unidos de América)`;
}

function formatearMontoMXN(monto) {
  const num = typeof monto === 'string' ? parseFloat(monto.replace(/,/g, '')) : monto;
  return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (${numeroALetras(Math.floor(num))} pesos ${Math.round((num % 1) * 100).toString().padStart(2, '0')}/100 moneda nacional)`;
}

// ============================================================================
// HELPERS - CONJUGACIÓN Y FORMATEO
// ============================================================================

function conjugarCedente(cedentes) {
  if (cedentes.length === 1) {
    return cedentes[0].genero === 'F' ? 'La Fideicomisaria Cedente' : 'El Fideicomisario Cedente';
  }
  return 'Los Fideicomisarios Cedentes';
}

function conjugarCesionario(cesionarios) {
  if (cesionarios.length === 1) {
    return cesionarios[0].genero === 'F' ? 'La Fideicomisaria Cesionaria' : 'El Fideicomisario Cesionario';
  }
  return 'Los Fideicomisarios Cesionarios';
}

function listarPersonas(personas, conector = 'y') {
  if (!personas || personas.length === 0) return '';
  if (personas.length === 1) return personas[0].nombreCompleto;
  if (personas.length === 2) return `${personas[0].nombreCompleto} ${conector} ${personas[1].nombreCompleto}`;
  const ultimos = personas.slice(-1)[0].nombreCompleto;
  const resto = personas.slice(0, -1).map(p => p.nombreCompleto).join(', ');
  return `${resto} ${conector} ${ultimos}`;
}

function articulo(persona) {
  return persona.genero === 'F' ? 'La señora' : 'El señor';
}

function articuloMayus(persona) {
  return persona.genero === 'F' ? 'LA SEÑORA' : 'EL SEÑOR';
}

// ============================================================================
// GENERADORES DE SECCIONES
// ============================================================================

function generarEncabezado(datos) {
  const cfg = CONFIG_NOTARIO.notaria;
  const fechaEscritura = datos.fechaEscritura || new Date().toISOString().split('T')[0];
  
  return [
    new Paragraph({
      children: [new TextRun({ text: `--- INSTRUMENTO: _______________ ${GUIONES_LINEA}`, bold: true })],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [new TextRun(`--- TOMO: _____ LIBRO: _____ ${GUIONES_LINEA}`)],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun(`--- En ${cfg.ciudad}, ${cfg.municipio}, ${cfg.estado}, a ${formatearFecha(fechaEscritura)}, `),
        new TextRun({ text: cfg.suplente.nombre, bold: true }),
        new TextRun(`, ${cfg.suplente.titulo}, adscrito a la notaría pública número ${numeroALetras(cfg.numero)} de la ${cfg.demarcacion}, en la que actúo por Convenio de Asociación Notarial celebrado con su titular ${cfg.titular.titulo} `),
        new TextRun({ text: cfg.titular.nombre, bold: true }),
        new TextRun(`, publicado el ${cfg.suplente.convenio.fecha}, en el ${cfg.suplente.convenio.publicacion}, hago constar: ${GUIONES_LARGOS}`)
      ],
      spacing: { after: 300 },
      alignment: AlignmentType.JUSTIFIED
    })
  ];
}

function generarActosJuridicos(datos) {
  const { cedentes, cesionarios, fideicomiso } = datos;
  const paragraphs = [];
  
  // I. Contrato de Cesión
  const numFideicomiso = fideicomiso.numero || '[NÚMERO]';
  const numFideicomisoLetra = numeroALetras(parseInt(numFideicomiso) || 0);
  
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({ text: `--- I.- EL CONTRATO DE CESIÓN DEL 100% (CIEN POR CIENTO) DE DERECHOS FIDEICOMISARIOS DEL FIDEICOMISO IDENTIFICADO ADMINISTRATIVAMENTE BAJO EL NÚMERO ${numFideicomiso} (${numFideicomisoLetra}), que ante mí otorgan y formalizan: ${GUIONES_MEDIOS}`, bold: true })
    ],
    spacing: { before: 200, after: 200 },
    alignment: AlignmentType.JUSTIFIED
  }));
  
  // A. Cedentes
  cedentes.forEach((cedente, idx) => {
    const letra = String.fromCharCode(65 + idx);
    const nombre = cedente.nombreCompleto || '[NOMBRE]';
    
    paragraphs.push(new Paragraph({
      children: [
        new TextRun(`--- ${letra}.- ${articulo(cedente)} `),
        new TextRun({ text: nombre.toUpperCase(), bold: true }),
        new TextRun(`, de nacionalidad ${cedente.nacionalidad || '[NACIONALIDAD]'}, quien comparece por su personal y propio derecho`),
        cedente.hablaEspanol !== false 
          ? new TextRun("; ") 
          : new TextRun(", y manifiesta que no conoce el idioma español por lo que designa como su intérprete de confianza a la persona que más adelante se indica; "),
        new TextRun(`a quien en lo sucesivo se le denominará indistintamente por su nombre o como `),
        new TextRun({ text: cedente.genero === 'F' ? '"LA FIDEICOMISARIA CEDENTE"' : '"EL FIDEICOMISARIO CEDENTE"', bold: true }),
        new TextRun(`. ${GUIONES_MEDIOS}`)
      ],
      spacing: { after: 150 },
      alignment: AlignmentType.JUSTIFIED
    }));
  });
  
  // Agrupación de cedentes si son múltiples
  if (cedentes.length > 1) {
    paragraphs.push(new Paragraph({
      children: [
        new TextRun(`--- A quienes en lo sucesivo se les denominará indistintamente por su propio nombre o como `),
        new TextRun({ text: '"LOS FIDEICOMISARIOS CEDENTES"', bold: true }),
        new TextRun(`. ${GUIONES_LARGOS}`)
      ],
      spacing: { after: 150 },
      alignment: AlignmentType.JUSTIFIED
    }));
  }
  
  // B. Cesionarios
  const letraInicio = cedentes.length;
  cesionarios.forEach((cesionario, idx) => {
    const letra = String.fromCharCode(65 + letraInicio + idx);
    const nombre = cesionario.nombreCompleto || '[NOMBRE]';
    
    paragraphs.push(new Paragraph({
      children: [
        new TextRun(`--- ${letra}.- ${articulo(cesionario)} `),
        new TextRun({ text: nombre.toUpperCase(), bold: true }),
        new TextRun(`, de nacionalidad ${cesionario.nacionalidad || '[NACIONALIDAD]'}, quien comparece por su personal y propio derecho`),
        cesionario.hablaEspanol !== false 
          ? new TextRun("; ") 
          : new TextRun(", y manifiesta que no conoce el idioma español por lo que designa como su intérprete de confianza a la persona que más adelante se indica; "),
        new TextRun(`a quien en lo sucesivo se le denominará indistintamente por su nombre o como `),
        new TextRun({ text: cesionario.genero === 'F' ? '"LA FIDEICOMISARIA CESIONARIA"' : '"EL FIDEICOMISARIO CESIONARIO"', bold: true }),
        new TextRun(`. ${GUIONES_MEDIOS}`)
      ],
      spacing: { after: 150 },
      alignment: AlignmentType.JUSTIFIED
    }));
  });
  
  // Agrupación de cesionarios si son múltiples
  if (cesionarios.length > 1) {
    paragraphs.push(new Paragraph({
      children: [
        new TextRun(`--- A quienes en lo sucesivo se les denominará indistintamente por su propio nombre o como `),
        new TextRun({ text: '"LOS FIDEICOMISARIOS CESIONARIOS"', bold: true }),
        new TextRun(`. ${GUIONES_LARGOS}`)
      ],
      spacing: { after: 150 },
      alignment: AlignmentType.JUSTIFIED
    }));
  }
  
  // C. Fiduciaria
  const letraFiduciaria = String.fromCharCode(65 + cedentes.length + cesionarios.length);
  const delegados = fideicomiso.delegados || [];
  const nombresDelegados = delegados.map(d => d.nombre).join(' y ') || '[DELEGADOS]';
  
  paragraphs.push(new Paragraph({
    children: [
      new TextRun(`--- ${letraFiduciaria}.- Con la comparecencia de `),
      new TextRun({ text: CONFIG_NOTARIO.banco.razonSocial.toUpperCase(), bold: true }),
      new TextRun(`, a quien en lo sucesivo y para los efectos del presente instrumento se le denominará como `),
      new TextRun({ text: '"LA FIDUCIARIA"', bold: true }),
      new TextRun(`, representada en este acto por sus Delegados Fiduciarios los Licenciados `),
      new TextRun({ text: nombresDelegados, bold: true }),
      new TextRun(`, quienes comparecen por instrucciones de ${conjugarCedente(cedentes)}. ${GUIONES_MUY_LARGOS}`)
    ],
    spacing: { after: 300 },
    alignment: AlignmentType.JUSTIFIED
  }));
  
  return paragraphs;
}

function generarInterprete(datos) {
  const { interprete, cedentes, cesionarios } = datos;
  if (!interprete || !interprete.activo) return [];
  
  const personasConInterprete = [...cedentes, ...cesionarios].filter(p => p.hablaEspanol === false);
  if (personasConInterprete.length === 0) return [];
  
  const nombreInterprete = interprete.datos?.nombre || '[INTÉRPRETE]';
  
  return [
    new Paragraph({
      children: [
        new TextRun(`--- ${listarPersonas(personasConInterprete)}, se hace${personasConInterprete.length > 1 ? 'n' : ''} asistir del Licenciado `),
        new TextRun({ text: nombreInterprete, bold: true }),
        new TextRun(`, en su calidad de intérprete del idioma español al inglés para los efectos del presente otorgamiento, quien acepta y protesta el cargo conferido, comprometiéndose a desempeñarlo legal y fielmente. ${GUIONES_MUY_LARGOS}`)
      ],
      spacing: { after: 300 },
      alignment: AlignmentType.JUSTIFIED
    })
  ];
}

function generarAntecedentes(datos) {
  const { fideicomiso, inmueble } = datos;
  const paragraphs = [];
  
  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: `--- A N T E C E D E N T E S ${GUIONES_LINEA}`, bold: true })],
    spacing: { before: 300, after: 200 },
    alignment: AlignmentType.CENTER
  }));
  
  // Escritura original del fideicomiso
  const esc = fideicomiso.escrituraOriginal || {};
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({ text: "--- Primero.- Del Contrato de Fideicomiso.- ", bold: true }),
      new TextRun(`Por escritura pública número ${esc.numero || '[NÚMERO]'} (${numeroALetras(parseInt(esc.numero) || 0)}), de fecha ${formatearFecha(esc.fecha || new Date().toISOString().split('T')[0])}, otorgada ante la fe del Licenciado ${esc.notario || '[NOTARIO]'}, Notario Público número ${esc.notariaNumero || '[#]'} de ${esc.notariaCiudad || '[CIUDAD]'}, se constituyó el fideicomiso identificado administrativamente bajo el número ${fideicomiso.numero || '[NÚMERO]'}, con `),
      new TextRun({ text: CONFIG_NOTARIO.banco.razonSocial, bold: true }),
      new TextRun(`, como fiduciaria. ${GUIONES_LARGOS}`)
    ],
    spacing: { after: 200 },
    alignment: AlignmentType.JUSTIFIED
  }));
  
  // Cesiones previas
  if (fideicomiso.cesionesPrevias && fideicomiso.cesionesPrevias.length > 0) {
    fideicomiso.cesionesPrevias.forEach((cesion, idx) => {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({ text: `--- ${idx === 0 ? 'Segundo' : (idx === 1 ? 'Tercero' : 'Siguiente')}.- De la Cesión ${idx + 1}.- `, bold: true }),
          new TextRun(`Por escritura pública número ${cesion.escritura || '[NÚMERO]'}, de fecha ${formatearFecha(cesion.fecha || new Date().toISOString().split('T')[0])}, ${cesion.cedente || '[CEDENTE]'} cedió el 100% de los derechos fideicomisarios a favor de ${cesion.cesionario || '[CESIONARIO]'}. ${GUIONES_LARGOS}`)
        ],
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED
      }));
    });
  }
  
  // Descripción del inmueble
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({ text: `--- ${fideicomiso.cesionesPrevias?.length > 0 ? 'Siguiente' : 'Segundo'}.- Del Inmueble.- `, bold: true }),
      new TextRun(`El inmueble fideicomitido es un ${inmueble.tipoInmueble || 'inmueble'} ${inmueble.numeroUnidad ? `identificado con el número ${inmueble.numeroUnidad}` : ''}, ubicado en ${inmueble.direccion || '[DIRECCIÓN]'}, ${inmueble.ciudad || '[CIUDAD]'}, ${inmueble.estado || '[ESTADO]'}`),
      inmueble.esCondominio ? new TextRun(`, que forma parte del Régimen de Propiedad en Condominio denominado "${inmueble.nombreCondominio || '[CONDOMINIO]'}"`) : new TextRun(''),
      new TextRun(`, inscrito en el Registro Público de la Propiedad bajo el folio real electrónico ${inmueble.folioReal || '[FOLIO]'} (${convertirALetra(inmueble.folioReal || '')}). ${GUIONES_MEDIOS}`)
    ],
    spacing: { after: 200 },
    alignment: AlignmentType.JUSTIFIED
  }));
  
  // Descripción legal si existe
  if (inmueble.descripcionLegal) {
    paragraphs.push(new Paragraph({
      children: [
        new TextRun(inmueble.descripcionLegal),
        new TextRun(` ${GUIONES_LARGOS}`)
      ],
      spacing: { after: 200 },
      alignment: AlignmentType.JUSTIFIED
    }));
  }
  
  return paragraphs;
}

function generarContraprestacion(datos) {
  const { contraprestacion, cedentes, cesionarios, cuentasOrigen, cuentasDestino } = datos;
  
  const montoUSD = parseFloat((contraprestacion.montoUSD || '0').replace(/,/g, ''));
  const montoMXN = parseFloat((contraprestacion.montoMXN || '0').replace(/,/g, ''));
  const tipoCambio = contraprestacion.tipoCambio || '[TC]';
  const cuentaOrigen = cuentasOrigen?.[0] || {};
  const cuentaDestino = cuentasDestino?.[0] || {};
  
  return [
    new Paragraph({
      children: [
        new TextRun({ text: "--- QUINTA.- DE LA CONTRAPRESTACIÓN.- ", bold: true }),
        new TextRun(`El valor de contraprestación pactada entre ${conjugarCedente(cedentes)} y ${conjugarCesionario(cesionarios)}, sin intervención del fiduciario, es por la cantidad de `),
        new TextRun({ text: formatearMontoUSD(montoUSD), bold: true }),
        new TextRun(`, que para efectos fiscales, tomando el tipo de cambio que publica el Banco de México en el Diario Oficial de la Federación de $${tipoCambio} (${numeroALetras(parseFloat(tipoCambio) || 0)} pesos moneda nacional), equivale a `),
        new TextRun({ text: formatearMontoMXN(montoMXN), bold: true }),
        new TextRun(`; cantidad que manifiestan bajo protesta de decir verdad, ${conjugarCedente(cedentes)} y ${conjugarCesionario(cesionarios)}, sin intervención del fiduciario, es liquidada por ${conjugarCesionario(cesionarios)} a ${conjugarCedente(cedentes)} mediante transferencia de fondos`),
        contraprestacion.formaPago === 'escrow' 
          ? new TextRun(` a través de la cuenta Escrow número ${contraprestacion.cuentaEscrow || '[CUENTA]'}, aperturada con la empresa depositaria denominada ${contraprestacion.empresaEscrowId === 'armour' ? 'Armour Secure Escrow, S. de R.L. de C.V.' : contraprestacion.empresaEscrowOtra || '[EMPRESA]'}`)
          : new TextRun(''),
        new TextRun(`, con recursos procedentes de la cuenta con terminación número ${cuentaOrigen.terminacion || '[XXXX]'}, de institución financiera denominada ${cuentaOrigen.banco || '[BANCO]'} a nombre de ${listarPersonas(cesionarios)}, hacia la cuenta con terminación número ${cuentaDestino.terminacion || '[XXXX]'}, de la institución financiera denominada ${cuentaDestino.banco || '[BANCO]'} a nombre de ${listarPersonas(cedentes)}, otorgando a la firma del presente instrumento el recibo y liberación más amplio que en derecho proceda. ${GUIONES_MUY_LARGOS}`)
      ],
      spacing: { after: 300 },
      alignment: AlignmentType.JUSTIFIED
    })
  ];
}

function generarFideicomisariosSustitutos(datos) {
  const { cesionarios, sustitutosPorCesionario } = datos;
  const paragraphs = [];
  
  // Título de la sección
  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: "--- II.- PRIMER CONVENIO MODIFICATORIO AL CONTRATO DE FIDEICOMISO ---", bold: true })],
    spacing: { before: 300, after: 200 },
    alignment: AlignmentType.CENTER
  }));
  
  cesionarios.forEach((cesionario, cesIdx) => {
    const sustitutos = sustitutosPorCesionario?.[cesionario.id] || [];
    if (sustitutos.length === 0) return;
    
    let textoSustitutos = "";
    sustitutos.forEach((sustituto, idx) => {
      const porcentaje = sustituto.porcentaje || '0';
      const porcentajeLetra = numeroALetras(parseInt(porcentaje));
      if (idx === 0) {
        textoSustitutos += `designa como Fideicomisario Sustituto a ${sustituto.nombre || '[NOMBRE]'}, de nacionalidad ${sustituto.nacionalidad || '[NACIONALIDAD]'}, en un ${porcentaje}% (${porcentajeLetra} por ciento)`;
      } else {
        textoSustitutos += `; a ${sustituto.nombre || '[NOMBRE]'}, de nacionalidad ${sustituto.nacionalidad || '[NACIONALIDAD]'}, en un ${porcentaje}% (${porcentajeLetra} por ciento)`;
      }
    });
    
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({ text: `--- TERCERA.- DESIGNACIÓN DE FIDEICOMISARIOS SUSTITUTOS.- `, bold: true }),
        new TextRun(`${cesionario.nombreCompleto || '[CESIONARIO]'} establece que, para el caso de su fallecimiento, incapacidad legal para administrar bienes o declaración de ausencia, ${textoSustitutos} de los derechos fideicomisarios; en lo sucesivo los Fideicomisarios Sustitutos, quienes en dicho supuesto asumirán todos los derechos y obligaciones que a favor de ${cesionario.nombreCompleto || '[CESIONARIO]'} se derivan de este fideicomiso. ${GUIONES_MUY_LARGOS}`)
      ],
      spacing: { after: 200 },
      alignment: AlignmentType.JUSTIFIED
    }));
  });
  
  return paragraphs;
}

function generarGenerales(datos) {
  const { cedentes, cesionarios, interprete } = datos;
  const paragraphs = [];
  
  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: `--- G E N E R A L E S ${GUIONES_LINEA}`, bold: true })],
    spacing: { before: 300, after: 200 },
    alignment: AlignmentType.CENTER
  }));
  
  // Generales de cada persona
  const todasPersonas = [...cedentes, ...cesionarios];
  todasPersonas.forEach((persona, idx) => {
    if (!persona.nombreCompleto) return;
    
    const estadoCivil = persona.estadoCivil === 'casado' ? 'casado(a)' : 
                        persona.estadoCivil === 'soltero' ? 'soltero(a)' : 
                        persona.estadoCivil === 'divorciado' ? 'divorciado(a)' : 
                        persona.estadoCivil === 'viudo' ? 'viudo(a)' : 'soltero(a)';
    
    let identificacion = '';
    if (persona.pasaporteNumero) {
      identificacion = `pasaporte número ${persona.pasaporteNumero} (${convertirALetra(persona.pasaporteNumero)}) de ${persona.pasaportePais || 'Estados Unidos'}`;
    } else if (persona.ineNumero) {
      identificacion = `credencial para votar expedida por el Instituto Nacional Electoral con clave de elector ${persona.ineNumero} (${convertirALetra(persona.ineNumero)})`;
    }
    
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({ text: persona.nombreCompleto.toUpperCase(), bold: true }),
        new TextRun(`, ${persona.genero === 'F' ? 'mexicana' : 'mexicano'} por ${persona.nacionalidad === 'Mexicana' ? 'nacimiento' : 'naturalización'}, ${estadoCivil}`),
        persona.nombreConyuge ? new TextRun(` bajo el régimen de separación de bienes con ${persona.nombreConyuge}`) : new TextRun(''),
        new TextRun(`, ${persona.ocupacion || '[OCUPACIÓN]'}, nacido${persona.genero === 'F' ? 'a' : ''} el ${formatearFecha(persona.fechaNacimiento || new Date().toISOString().split('T')[0])} en ${persona.lugarNacimiento || '[LUGAR]'}, ${persona.paisNacimiento || '[PAÍS]'}`),
        new TextRun(`, con domicilio en ${persona.domicilioCalle || '[CALLE]'} ${persona.domicilioNumero || ''}, ${persona.domicilioColonia ? `colonia ${persona.domicilioColonia}, ` : ''}${persona.domicilioCiudad || '[CIUDAD]'}, ${persona.domicilioEstado || '[ESTADO]'}, ${persona.domicilioPais || '[PAÍS]'}, código postal ${persona.domicilioCP || '[CP]'} (${convertirALetra(persona.domicilioCP || '')})`),
        identificacion ? new TextRun(`; se identifica con ${identificacion}`) : new TextRun(''),
        persona.rfc ? new TextRun(`; RFC: ${persona.rfc} (${convertirALetra(persona.rfc)})`) : new TextRun(''),
        persona.curp ? new TextRun(`; CURP: ${persona.curp} (${convertirALetra(persona.curp)})`) : new TextRun(''),
        new TextRun(`. ${GUIONES_LARGOS}`)
      ],
      spacing: { after: 200 },
      alignment: AlignmentType.JUSTIFIED
    }));
  });
  
  // Generales del intérprete
  if (interprete?.activo && interprete.datos) {
    const int = interprete.datos;
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({ text: "INTÉRPRETE: ", bold: true }),
        new TextRun({ text: int.nombre?.toUpperCase() || '[INTÉRPRETE]', bold: true }),
        new TextRun(`, de nacionalidad ${int.nacionalidad || 'Mexicana'}, ${int.estadoCivil || 'casado'}, ${int.ocupacion || 'Abogado'}, nacido el ${formatearFecha(int.fechaNacimiento || '1966-04-27')} en ${int.lugarNacimiento || 'Puerto Vallarta, Jalisco'}`),
        new TextRun(`, con domicilio en ${int.domicilioCalle || 'Brasil'} ${int.domicilioNumero || '1434'}, colonia ${int.domicilioColonia || '5 de Diciembre'}, ${int.domicilioCiudad || 'Puerto Vallarta'}, ${int.domicilioEstado || 'Jalisco'}, código postal ${int.domicilioCP || '48350'}`),
        int.ineNumero ? new TextRun(`; INE: ${int.ineNumero} (${convertirALetra(int.ineNumero)})`) : new TextRun(''),
        int.rfc ? new TextRun(`; RFC: ${int.rfc} (${convertirALetra(int.rfc)})`) : new TextRun(''),
        int.curp ? new TextRun(`; CURP: ${int.curp} (${convertirALetra(int.curp)})`) : new TextRun(''),
        new TextRun(`. ${GUIONES_LARGOS}`)
      ],
      spacing: { after: 200 },
      alignment: AlignmentType.JUSTIFIED
    }));
  }
  
  return paragraphs;
}

function generarCertificaciones(datos) {
  const { cedentes, cesionarios } = datos;
  
  return [
    new Paragraph({
      children: [new TextRun({ text: `--- C E R T I F I C A C I O N E S ${GUIONES_LINEA}`, bold: true })],
      spacing: { before: 300, after: 200 },
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "--- I.- ", bold: true }),
        new TextRun(`Que me fueron exhibidos los documentos que acreditan la legal existencia, capacidad y personalidad de los comparecientes, mismos que obran agregados al apéndice del presente instrumento. ${GUIONES_MUY_LARGOS}`)
      ],
      spacing: { after: 200 },
      alignment: AlignmentType.JUSTIFIED
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "--- II.- ", bold: true }),
        new TextRun(`Que los comparecientes tienen a mi juicio capacidad legal para contratar y obligarse, y que sus voluntades se encuentran exentas de todo vicio. ${GUIONES_MUY_LARGOS}`)
      ],
      spacing: { after: 200 },
      alignment: AlignmentType.JUSTIFIED
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "--- III.- ", bold: true }),
        new TextRun(`Que leí en voz alta el presente instrumento a los comparecientes, les expliqué su valor y consecuencias legales, y habiéndolo entendido en su contenido y alcances, lo ratifican y firman, firmando también el intérprete en su caso. ${GUIONES_MUY_LARGOS}`)
      ],
      spacing: { after: 200 },
      alignment: AlignmentType.JUSTIFIED
    }),
    new Paragraph({
      children: [new TextRun(`DOY FE. ${GUIONES_LINEA}`)],
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER
    })
  ];
}

// ============================================================================
// CONFIGURACIÓN DE ESTRUCTURA POR BANCO
// ============================================================================

// Mapeo de secciones a funciones generadoras
const GENERADORES = {
  encabezado: generarEncabezado,
  actosJuridicos: generarActosJuridicos,
  interprete: generarInterprete,
  antecedentes: generarAntecedentes,
  contraprestacion: generarContraprestacion,
  sustitutos: generarFideicomisariosSustitutos,
  generales: generarGenerales,
  certificaciones: generarCertificaciones
};

// Estructura de secciones por banco
// El orden del array define el orden en el documento
const ESTRUCTURAS_BANCO = {
  bajio: {
    nombre: 'Banco del Bajío',
    secciones: [
      'encabezado',
      'actosJuridicos',
      'interprete',
      'antecedentes',
      'contraprestacion',
      'sustitutos',
      'generales',
      'certificaciones'
    ],
    estilos: {
      fuente: 'Arial',
      tamanoFuente: 22, // 11pt en half-points
      pagina: {
        ancho: 12240,   // 8.5" en twips (Oficio)
        alto: 20160,    // 14" en twips (Oficio mexicano)
        margenSuperior: 1440,
        margenDerecho: 1440,
        margenInferior: 1440,
        margenIzquierdo: 1800
      }
    }
  },
  
  // Plantilla para otros bancos (futuro)
  monex: {
    nombre: 'Monex',
    secciones: [
      'encabezado',
      'actosJuridicos',
      'interprete',
      'antecedentes',
      'contraprestacion',
      'sustitutos',
      'generales',
      'certificaciones'
    ],
    estilos: {
      fuente: 'Arial',
      tamanoFuente: 22,
      pagina: {
        ancho: 12240,
        alto: 20160,
        margenSuperior: 1440,
        margenDerecho: 1440,
        margenInferior: 1440,
        margenIzquierdo: 1800
      }
    }
  },
  
  banorte: {
    nombre: 'Banorte',
    secciones: [
      'encabezado',
      'actosJuridicos',
      'interprete',
      'antecedentes',
      'contraprestacion',
      'sustitutos',
      'generales',
      'certificaciones'
    ],
    estilos: {
      fuente: 'Arial',
      tamanoFuente: 22,
      pagina: {
        ancho: 12240,
        alto: 20160,
        margenSuperior: 1440,
        margenDerecho: 1440,
        margenInferior: 1440,
        margenIzquierdo: 1800
      }
    }
  }
};

// ============================================================================
// FUNCIÓN PRINCIPAL DE GENERACIÓN
// ============================================================================

export async function generarCesionFideicomiso(datos, bancoId = 'bajio') {
  // Obtener configuración del banco
  const configBanco = ESTRUCTURAS_BANCO[bancoId] || ESTRUCTURAS_BANCO.bajio;
  const { secciones, estilos } = configBanco;
  
  // Generar contenido en el orden definido por el banco
  const children = [];
  
  for (const seccionId of secciones) {
    const generador = GENERADORES[seccionId];
    if (generador) {
      const contenido = generador(datos);
      if (contenido && contenido.length > 0) {
        children.push(...contenido);
      }
    }
  }
  
  // Crear documento con estilos del banco
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { 
            font: estilos.fuente, 
            size: estilos.tamanoFuente 
          }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { 
            width: estilos.pagina.ancho, 
            height: estilos.pagina.alto 
          },
          margin: { 
            top: estilos.pagina.margenSuperior, 
            right: estilos.pagina.margenDerecho, 
            bottom: estilos.pagina.margenInferior, 
            left: estilos.pagina.margenIzquierdo 
          }
        }
      },
      children: children
    }]
  });
  
  return Packer.toBuffer(doc);
}

// Exportar configuraciones para uso externo
export { 
  CONFIG_NOTARIO, 
  ESTRUCTURAS_BANCO,
  GENERADORES,
  numeroALetras, 
  formatearFecha, 
  convertirALetra 
};
