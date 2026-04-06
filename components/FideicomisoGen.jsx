import React, { useState, useMemo, useEffect } from 'react';

// ============================================================================
// UTILIDADES - CONVERSIÓN A LETRA (ESTILO NOTARIAL)
// ============================================================================

const LETRAS_MAP = {
  '0': 'cero', '1': 'uno', '2': 'dos', '3': 'tres', '4': 'cuatro',
  '5': 'cinco', '6': 'seis', '7': 'siete', '8': 'ocho', '9': 'nueve',
  'A': 'a', 'B': 'be', 'C': 'ce', 'D': 'de', 'E': 'e', 'F': 'efe',
  'G': 'ge', 'H': 'hache', 'I': 'i', 'J': 'jota', 'K': 'ka', 'L': 'ele',
  'M': 'eme', 'N': 'ene', 'Ñ': 'eñe', 'O': 'o', 'P': 'pe', 'Q': 'cu',
  'R': 'erre', 'S': 'ese', 'T': 'te', 'U': 'u', 'V': 'uve', 'W': 'doble u',
  'X': 'equis', 'Y': 'ye', 'Z': 'zeta', '-': 'guion', '/': 'diagonal',
  ' ': 'espacio', '.': 'punto', ',': 'coma', '*': 'asterisco'
};

function convertirALetra(texto) {
  if (!texto) return '';
  return texto.toString().toUpperCase().split('').map(char => LETRAS_MAP[char] || char).join(', ');
}

function formatearConLetra(texto) {
  if (!texto) return '[PENDIENTE]';
  const enLetra = convertirALetra(texto);
  return `${texto.toString().toUpperCase()} (${enLetra})`;
}

function numeroALetrasCompleto(num) {
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

function formatearNumeroEscritura(num) {
  if (!num) return '[NÚMERO]';
  const numero = parseInt(num.toString().replace(/,/g, ''));
  if (isNaN(numero)) return '[NÚMERO]';
  return `${numero.toLocaleString('es-MX')} (${numeroALetrasCompleto(numero)})`;
}

function formatearFechaNotarial(fecha) {
  if (!fecha) return '[FECHA]';
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date(fecha + 'T12:00:00');
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const año = d.getFullYear();
  return `${dia} ${numeroALetrasCompleto(dia)} de ${mes.charAt(0).toUpperCase() + mes.slice(1)} del año ${año} ${numeroALetrasCompleto(año)}`;
}

function formatearMontoUSD(monto) {
  if (!monto) return '$0.00';
  const numero = typeof monto === 'string' ? parseFloat(monto.replace(/,/g, '')) : monto;
  if (isNaN(numero)) return '$0.00';
  return 'USD$' + numero.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatearMontoMXN(monto) {
  if (!monto) return '$0.00';
  const numero = typeof monto === 'string' ? parseFloat(monto.replace(/,/g, '')) : monto;
  if (isNaN(numero)) return '$0.00';
  return '$' + numero.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SECCIONES = [
  { id: 1, nombre: 'Comparecientes', icono: '👥', color: 'amber' },
  { id: 2, nombre: 'Fideicomiso', icono: '🏦', color: 'blue' },
  { id: 3, nombre: 'Inmueble', icono: '🏠', color: 'cyan' },
  { id: 4, nombre: 'Contraprestación', icono: '💰', color: 'green' },
  { id: 5, nombre: 'Sustitutos', icono: '👥', color: 'violet' },
  { id: 6, nombre: 'Fiscal', icono: '📊', color: 'red' },
  { id: 7, nombre: 'Revisión', icono: '✅', color: 'gray' }
];

const NACIONALIDADES = [
  'Estadounidense', 'Canadiense', 'Mexicana', 'Británica', 'Francesa', 
  'Alemana', 'Española', 'Italiana', 'Australiana', 'Otra'
];

const ESTADOS_CIVILES = [
  { valor: 'soltero', etiqueta: 'Soltero(a)', requiereConyuge: false },
  { valor: 'casado', etiqueta: 'Casado(a)', requiereConyuge: true },
  { valor: 'divorciado', etiqueta: 'Divorciado(a)', requiereConyuge: false },
  { valor: 'viudo', etiqueta: 'Viudo(a)', requiereConyuge: false },
  { valor: 'union_libre', etiqueta: 'Unión libre', requiereConyuge: true }
];

const ESTATUS_MIGRATORIO = [
  { valor: 'turista', etiqueta: 'Turista / De paso', requiereRFC: false, requiereFM: false },
  { valor: 'residente_temporal', etiqueta: 'Residente Temporal', requiereRFC: true, requiereFM: true },
  { valor: 'residente_permanente', etiqueta: 'Residente Permanente', requiereRFC: true, requiereFM: true },
  { valor: 'mexicano', etiqueta: 'Mexicano', requiereRFC: true, requiereFM: false }
];

const BANCOS_FIDUCIARIOS = [
  { id: 'bajio', nombre: 'Banco del Bajío', razonSocial: 'Banco del Bajío, S.A., Institución de Banca Múltiple' },
  { id: 'monex', nombre: 'Monex', razonSocial: 'Monex Casa de Bolsa, S.A. de C.V.' },
  { id: 'banorte', nombre: 'Banorte', razonSocial: 'Banco Mercantil del Norte, S.A., Institución de Banca Múltiple' },
  { id: 'bbva', nombre: 'BBVA', razonSocial: 'BBVA México, S.A., Institución de Banca Múltiple' },
  { id: 'mifel', nombre: 'Mifel', razonSocial: 'Banca Mifel, S.A., Institución de Banca Múltiple' },
  { id: 'otro', nombre: 'Otro', razonSocial: '' }
];

const TIPOS_INMUEBLE = [
  { valor: 'departamento', etiqueta: 'Departamento' },
  { valor: 'casa', etiqueta: 'Casa' },
  { valor: 'terreno', etiqueta: 'Terreno / Lote' },
  { valor: 'local', etiqueta: 'Local Comercial' },
  { valor: 'bodega', etiqueta: 'Bodega' },
  { valor: 'oficina', etiqueta: 'Oficina' }
];

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

const EMPRESAS_ESCROW = [
  { id: 'armour', nombre: 'Armour Secure Escrow', razonSocial: 'Armour Secure Escrow, S. de R.L. de C.V.' },
  { id: 'stewart', nombre: 'Stewart Title', razonSocial: 'Stewart Title Guaranty de México, S.A. de C.V.' },
  { id: 'first_american', nombre: 'First American Title', razonSocial: 'First American Title de México, S.A. de C.V.' },
  { id: 'otro', nombre: 'Otra', razonSocial: '' }
];

// ============================================================================
// FACTORIES
// ============================================================================

const personaVacia = () => ({
  id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  tipoPersona: 'fisica',
  tipoComparecencia: 'propio_derecho',
  apoderado: null,
  personaMoral: null,
  nombreCompleto: '',
  genero: 'M',
  nacionalidad: 'Estadounidense',
  hablaEspanol: false,
  estadoCivil: 'soltero',
  nombreConyuge: '',
  fechaNacimiento: '',
  lugarNacimiento: '',
  paisNacimiento: 'Estados Unidos de América',
  ocupacion: '',
  estatusMigratorio: 'turista',
  pasaporteNumero: '',
  pasaportePais: 'Estados Unidos',
  ineNumero: '',
  fmNumero: '',
  rfc: '',
  curp: '',
  domicilioCalle: '',
  domicilioNumero: '',
  domicilioColonia: '',
  domicilioCiudad: '',
  domicilioEstado: '',
  domicilioPais: 'Estados Unidos de América',
  domicilioCP: '',
  telefono: '',
  email: ''
});

const apoderadoVacio = () => ({
  nombre: '',
  genero: 'M',
  tipoRepresentacion: 'apoderado',
  escrituraPoder: '',
  fechaPoder: '',
  notarioPoder: '',
  notariaNumero: '',
  notariaCiudad: '',
  nacionalidad: 'Mexicana',
  estadoCivil: 'soltero',
  ocupacion: '',
  rfc: '',
  curp: '',
  ineNumero: ''
});

const personaMoralVacia = () => ({
  razonSocial: '',
  rfc: '',
  folioMercantil: '',
  escrituraConstitutiva: '',
  fechaConstitucion: '',
  notarioConstitucion: '',
  notariaNumeroConstitucion: '',
  notariaCiudadConstitucion: ''
});

const delegadoVacio = () => ({
  id: `delegado-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  nombre: '',
  escritura: '',
  fecha: ''
});

const cesionPreviaVacia = () => ({
  id: `cesion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  escritura: '',
  fecha: '',
  notario: '',
  notariaNumero: '',
  notariaCiudad: '',
  cedente: '',
  cesionario: ''
});

const cuentaVacia = (tipo) => ({
  id: `cuenta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  tipo,
  titular: '',
  banco: '',
  terminacion: '',
  pais: 'Estados Unidos'
});

const sustitutoVacio = () => ({
  id: `sustituto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  nombre: '',
  genero: 'M',
  nacionalidad: 'Estadounidense',
  porcentaje: '',
  relacion: ''
});

// Intérprete default (Rolo)
const INTERPRETE_DEFAULT = {
  nombre: 'Rolando Romero García',
  genero: 'M',
  nacionalidad: 'Mexicana',
  estadoCivil: 'casado',
  ocupacion: 'Abogado',
  fechaNacimiento: '1966-04-27',
  lugarNacimiento: 'Puerto Vallarta, Jalisco',
  domicilioCalle: 'Brasil',
  domicilioNumero: '1434',
  domicilioColonia: '5 de Diciembre',
  domicilioCiudad: 'Puerto Vallarta',
  domicilioEstado: 'Jalisco',
  domicilioCP: '48350',
  rfc: 'ROGR660427SK8',
  curp: 'ROGR660427HJCMRL00',
  ineNumero: 'IDMEX1794679634',
  telefono: '3222221234',
  email: 'rolo@expatadvisormx.com'
};

// Delegados pre-cargados (Bajío)
const DELEGADOS_DEFAULT = [
  { id: 'del-1', nombre: 'Carlos Héctor Castillo Estrada', escritura: '43,808', fecha: '2014-05-21' },
  { id: 'del-2', nombre: 'Rafael Ortega Villaseñor', escritura: '20,561', fecha: '2019-10-29' }
];

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const ESTADO_INICIAL = {
  // Sección 1: Comparecientes
  cedentes: [personaVacia()],
  cesionarios: [personaVacia()],
  interprete: {
    activo: false,
    usarDefault: true,
    incluirContacto: false,
    datos: { ...INTERPRETE_DEFAULT }
  },
  
  // Sección 2: Fideicomiso
  fideicomiso: {
    numero: '',
    bancoId: 'bajio',
    bancoNombre: 'Banco del Bajío',
    bancoRazonSocial: BANCOS_FIDUCIARIOS[0].razonSocial,
    permisoSRE: '',
    permisoFolio: '',
    permisoFecha: '',
    delegados: [...DELEGADOS_DEFAULT],
    escrituraOriginal: {
      numero: '',
      fecha: '',
      notario: '',
      notariaNumero: '',
      notariaCiudad: ''
    },
    cesionesPrevias: []
  },
  
  // Sección 3: Inmueble
  inmueble: {
    tipoInmueble: 'departamento',
    numeroUnidad: '',
    numeroUnidadLetra: '',
    direccion: '',
    ciudad: 'Puerto Vallarta',
    municipio: 'Puerto Vallarta',
    estado: 'Jalisco',
    esCondominio: true,
    nombreCondominio: '',
    indiviso: '',
    descripcionLegal: '',
    folioReal: '',
    ciudadRegistro: 'Puerto Vallarta',
    cuentaPredial: '',
    claveCatastral: '',
    regimenCondominio: {
      escritura: '',
      fecha: '',
      notario: '',
      notariaNumero: '',
      notariaCiudad: ''
    }
  },
  
  // Sección 4: Contraprestación
  contraprestacion: {
    montoUSD: '',
    tipoCambio: '',
    montoMXN: '',
    fechaTipoCambio: '',
    formaPago: 'escrow',
    empresaEscrowId: 'armour',
    empresaEscrowOtra: '',
    cuentaEscrow: ''
  },
  cuentasOrigen: [cuentaVacia('origen')],
  cuentasDestino: [cuentaVacia('destino')],
  
  // Sección 5: Sustitutos
  sustitutosPorCesionario: {},
  
  // Sección 6: Fiscal
  fiscal: {
    isrEnajenacion: 'casa_habitacion',
    comprobantesCFE: true,
    montoISRRetenido: '',
    isrAdquisicion: 'no_genera',
    iva: 'exento_habitacional',
    montoIVA: '',
    baseTransmisiones: 'avaluo',
    tasaTransmisiones: '2',
    montoTransmisiones: '',
    avaluoMonto: '',
    avaluoFecha: '',
    avaluoPerito: '',
    avaluoTitulo: 'Arquitecto',
    estado: 'Jalisco'
  }
};

// ============================================================================
// COMPONENTE: NAVEGACIÓN POR PASOS
// ============================================================================

function NavegacionPasos({ seccionActual, setSeccionActual, validaciones }) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2 overflow-x-auto">
          {SECCIONES.map((sec, idx) => {
            const esActual = seccionActual === sec.id;
            const estaCompleta = validaciones[`seccion${sec.id}`];
            
            return (
              <button
                key={sec.id}
                onClick={() => setSeccionActual(sec.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                  esActual 
                    ? 'bg-blue-100 text-blue-800 font-semibold' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  esActual ? 'bg-blue-600 text-white' :
                  estaCompleta ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {estaCompleta && !esActual ? '✓' : sec.id}
                </span>
                <span className="hidden md:inline">{sec.nombre}</span>
                <span className="md:hidden">{sec.icono}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: FORMULARIO DE PERSONA
// ============================================================================

function PersonaForm({ persona, onChange, onRemove, tipo, index, totalPersonas }) {
  const titulo = tipo === 'cedente' ? 'Cedente' : 'Cesionario';
  const bgColor = tipo === 'cedente' ? 'bg-amber-50' : 'bg-emerald-50';
  const borderColor = tipo === 'cedente' ? 'border-amber-200' : 'border-emerald-200';
  const headerBg = tipo === 'cedente' ? 'bg-amber-100' : 'bg-emerald-100';
  
  const estadoCivilConfig = ESTADOS_CIVILES.find(ec => ec.valor === persona.estadoCivil);
  const estatusConfig = ESTATUS_MIGRATORIO.find(em => em.valor === persona.estatusMigratorio);
  const esMexicano = persona.nacionalidad === 'Mexicana';
  
  useEffect(() => {
    if (esMexicano && persona.estatusMigratorio !== 'mexicano') {
      onChange({ ...persona, estatusMigratorio: 'mexicano', hablaEspanol: true });
    }
  }, [esMexicano]);

  const handleChange = (campo, valor) => {
    onChange({ ...persona, [campo]: valor });
  };

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg mb-4 overflow-hidden`}>
      <div className={`${headerBg} px-4 py-2 flex justify-between items-center`}>
        <h3 className="font-semibold text-gray-800">
          {titulo} {totalPersonas > 1 ? index + 1 : ''}
          {persona.nombreCompleto && (
            <span className="font-normal text-gray-600 ml-2">— {persona.nombreCompleto}</span>
          )}
        </h3>
        {totalPersonas > 1 && (
          <button onClick={onRemove} className="text-red-600 hover:text-red-800 text-sm font-medium">
            ✕ Eliminar
          </button>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Tipo de persona y comparecencia */}
        <fieldset className="border border-gray-200 rounded-lg p-3 bg-white">
          <legend className="text-xs font-semibold text-gray-500 px-2">Tipo de Compareciente</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de persona</label>
              <div className="flex gap-3">
                <label className="flex items-center text-sm cursor-pointer">
                  <input type="radio" checked={persona.tipoPersona === 'fisica'} onChange={() => handleChange('tipoPersona', 'fisica')} className="mr-1" />
                  👤 Física
                </label>
                <label className="flex items-center text-sm cursor-pointer">
                  <input type="radio" checked={persona.tipoPersona === 'moral'} 
                    onChange={() => onChange({ ...persona, tipoPersona: 'moral', personaMoral: persona.personaMoral || personaMoralVacia(), apoderado: persona.apoderado || apoderadoVacio() })} className="mr-1" />
                  🏢 Moral
                </label>
              </div>
            </div>
            {persona.tipoPersona === 'fisica' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Comparece</label>
                <div className="flex gap-3">
                  <label className="flex items-center text-sm cursor-pointer">
                    <input type="radio" checked={persona.tipoComparecencia === 'propio_derecho'} onChange={() => handleChange('tipoComparecencia', 'propio_derecho')} className="mr-1" />
                    Propio derecho
                  </label>
                  <label className="flex items-center text-sm cursor-pointer">
                    <input type="radio" checked={persona.tipoComparecencia === 'mediante_apoderado'} 
                      onChange={() => onChange({ ...persona, tipoComparecencia: 'mediante_apoderado', apoderado: persona.apoderado || apoderadoVacio() })} className="mr-1" />
                    Mediante apoderado
                  </label>
                </div>
              </div>
            )}
          </div>
        </fieldset>

        {/* Datos persona moral */}
        {persona.tipoPersona === 'moral' && (
          <fieldset className="border border-indigo-200 rounded-lg p-3 bg-indigo-50">
            <legend className="text-xs font-semibold text-indigo-700 px-2">🏢 Persona Moral</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Razón social *</label>
                <input type="text" value={persona.personaMoral?.razonSocial || ''} 
                  onChange={(e) => onChange({ ...persona, personaMoral: { ...persona.personaMoral, razonSocial: e.target.value }})}
                  placeholder="Ej: Desarrollos Inmobiliarios, S.A. de C.V." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">RFC</label>
                <input type="text" value={persona.personaMoral?.rfc || ''} 
                  onChange={(e) => onChange({ ...persona, personaMoral: { ...persona.personaMoral, rfc: e.target.value.toUpperCase() }})}
                  maxLength={13} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Folio Mercantil</label>
                <input type="text" value={persona.personaMoral?.folioMercantil || ''} 
                  onChange={(e) => onChange({ ...persona, personaMoral: { ...persona.personaMoral, folioMercantil: e.target.value }})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
              </div>
            </div>
          </fieldset>
        )}

        {/* Datos apoderado */}
        {(persona.tipoPersona === 'moral' || persona.tipoComparecencia === 'mediante_apoderado') && (
          <fieldset className="border border-purple-200 rounded-lg p-3 bg-purple-50">
            <legend className="text-xs font-semibold text-purple-700 px-2">👔 {persona.tipoPersona === 'moral' ? 'Representante Legal / Apoderado' : 'Apoderado'}</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
                <input type="text" value={persona.apoderado?.nombre || ''} 
                  onChange={(e) => onChange({ ...persona, apoderado: { ...persona.apoderado, nombre: e.target.value }})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Escritura de poder</label>
                <input type="text" value={persona.apoderado?.escrituraPoder || ''} 
                  onChange={(e) => onChange({ ...persona, apoderado: { ...persona.apoderado, escrituraPoder: e.target.value }})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha del poder</label>
                <input type="date" value={persona.apoderado?.fechaPoder || ''} 
                  onChange={(e) => onChange({ ...persona, apoderado: { ...persona.apoderado, fechaPoder: e.target.value }})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
          </fieldset>
        )}
        
        {/* Datos básicos persona física */}
        {persona.tipoPersona === 'fisica' && (
          <>
            <fieldset className="border border-gray-200 rounded-lg p-3 bg-white">
              <legend className="text-xs font-semibold text-gray-500 px-2">Datos Básicos</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
                  <input type="text" value={persona.nombreCompleto} onChange={(e) => handleChange('nombreCompleto', e.target.value)}
                    placeholder="Ej: John Michael Smith" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Género</label>
                  <div className="flex gap-4">
                    <label className="flex items-center text-sm"><input type="radio" checked={persona.genero === 'M'} onChange={() => handleChange('genero', 'M')} className="mr-1" /> M</label>
                    <label className="flex items-center text-sm"><input type="radio" checked={persona.genero === 'F'} onChange={() => handleChange('genero', 'F')} className="mr-1" /> F</label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nacionalidad *</label>
                  <select value={persona.nacionalidad} onChange={(e) => handleChange('nacionalidad', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    {NACIONALIDADES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {!esMexicano && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">¿Habla español?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-sm"><input type="radio" checked={persona.hablaEspanol === true} onChange={() => handleChange('hablaEspanol', true)} className="mr-1" /> Sí</label>
                      <label className="flex items-center text-sm"><input type="radio" checked={persona.hablaEspanol === false} onChange={() => handleChange('hablaEspanol', false)} className="mr-1" /> No</label>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ocupación</label>
                  <input type="text" value={persona.ocupacion} onChange={(e) => handleChange('ocupacion', e.target.value)} placeholder="Ej: empresario jubilado" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-gray-200 rounded-lg p-3 bg-white">
              <legend className="text-xs font-semibold text-gray-500 px-2">Estado Civil</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <select value={persona.estadoCivil} onChange={(e) => handleChange('estadoCivil', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    {ESTADOS_CIVILES.map(ec => <option key={ec.valor} value={ec.valor}>{ec.etiqueta}</option>)}
                  </select>
                </div>
                {estadoCivilConfig?.requiereConyuge && (
                  <div>
                    <input type="text" value={persona.nombreConyuge} onChange={(e) => handleChange('nombreConyuge', e.target.value)} placeholder="Nombre del cónyuge" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                )}
              </div>
            </fieldset>

            <fieldset className="border border-gray-200 rounded-lg p-3 bg-white">
              <legend className="text-xs font-semibold text-gray-500 px-2">Nacimiento</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                  <input type="date" value={persona.fechaNacimiento} onChange={(e) => handleChange('fechaNacimiento', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Lugar (ciudad, estado)</label>
                  <input type="text" value={persona.lugarNacimiento} onChange={(e) => handleChange('lugarNacimiento', e.target.value)} placeholder="Ej: Denver, Colorado" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">País</label>
                  <input type="text" value={persona.paisNacimiento} onChange={(e) => handleChange('paisNacimiento', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-gray-200 rounded-lg p-3 bg-white">
              <legend className="text-xs font-semibold text-gray-500 px-2">Identificación / Estatus Migratorio</legend>
              <div className="space-y-3">
                <select value={persona.estatusMigratorio} onChange={(e) => handleChange('estatusMigratorio', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  {ESTATUS_MIGRATORIO.map(em => <option key={em.valor} value={em.valor}>{em.etiqueta}</option>)}
                </select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {persona.estatusMigratorio !== 'mexicano' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Pasaporte</label>
                        <input type="text" value={persona.pasaporteNumero} onChange={(e) => handleChange('pasaporteNumero', e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                        {persona.pasaporteNumero && <p className="text-xs text-gray-400 mt-1">({convertirALetra(persona.pasaporteNumero)})</p>}
                      </div>
                      {estatusConfig?.requiereFM && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">FM</label>
                          <input type="text" value={persona.fmNumero} onChange={(e) => handleChange('fmNumero', e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                        </div>
                      )}
                    </>
                  )}
                  {(estatusConfig?.requiereRFC || esMexicano) && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">RFC</label>
                        <input type="text" value={persona.rfc} onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())} maxLength={13} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">CURP</label>
                        <input type="text" value={persona.curp} onChange={(e) => handleChange('curp', e.target.value.toUpperCase())} maxLength={18} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                      </div>
                    </>
                  )}
                  {esMexicano && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">INE</label>
                      <input type="text" value={persona.ineNumero} onChange={(e) => handleChange('ineNumero', e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-gray-200 rounded-lg p-3 bg-white">
              <legend className="text-xs font-semibold text-gray-500 px-2">Domicilio</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <input type="text" value={persona.domicilioCalle} onChange={(e) => handleChange('domicilioCalle', e.target.value)} placeholder="Calle" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <input type="text" value={persona.domicilioNumero} onChange={(e) => handleChange('domicilioNumero', e.target.value)} placeholder="Número" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <input type="text" value={persona.domicilioColonia} onChange={(e) => handleChange('domicilioColonia', e.target.value)} placeholder="Colonia" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <input type="text" value={persona.domicilioCiudad} onChange={(e) => handleChange('domicilioCiudad', e.target.value)} placeholder="Ciudad" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <input type="text" value={persona.domicilioEstado} onChange={(e) => handleChange('domicilioEstado', e.target.value)} placeholder="Estado" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <input type="text" value={persona.domicilioPais} onChange={(e) => handleChange('domicilioPais', e.target.value)} placeholder="País" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <input type="text" value={persona.domicilioCP} onChange={(e) => handleChange('domicilioCP', e.target.value)} placeholder="C.P." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-gray-200 rounded-lg p-3 bg-white">
              <legend className="text-xs font-semibold text-gray-500 px-2">Contacto</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input type="tel" value={persona.telefono} onChange={(e) => handleChange('telefono', e.target.value)} placeholder="Teléfono" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                </div>
                <div>
                  <input type="email" value={persona.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            </fieldset>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SECCIÓN 1: COMPARECIENTES
// ============================================================================

function Seccion1Comparecientes({ datos, setDatos }) {
  const { cedentes, cesionarios, interprete } = datos;
  const necesitaInterprete = [...cedentes, ...cesionarios].some(p => p.tipoPersona === 'fisica' && !p.hablaEspanol);
  
  useEffect(() => {
    if (necesitaInterprete && !interprete.activo) {
      setDatos({ ...datos, interprete: { ...interprete, activo: true } });
    }
  }, [necesitaInterprete]);

  return (
    <div className="space-y-6">
      {/* Cedentes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2">
            <span>📤</span> Cedente(s) — Quien vende
          </h2>
          <button onClick={() => setDatos({ ...datos, cedentes: [...cedentes, personaVacia()] })}
            className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md">
            + Agregar cedente
          </button>
        </div>
        {cedentes.map((cedente, idx) => (
          <PersonaForm key={cedente.id} persona={cedente} tipo="cedente" index={idx} totalPersonas={cedentes.length}
            onChange={(p) => { const c = [...cedentes]; c[idx] = p; setDatos({ ...datos, cedentes: c }); }}
            onRemove={() => cedentes.length > 1 && setDatos({ ...datos, cedentes: cedentes.filter((_, i) => i !== idx) })} />
        ))}
      </section>

      {/* Cesionarios */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
            <span>📥</span> Cesionario(s) — Quien compra
          </h2>
          <button onClick={() => setDatos({ ...datos, cesionarios: [...cesionarios, personaVacia()] })}
            className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md">
            + Agregar cesionario
          </button>
        </div>
        {cesionarios.map((cesionario, idx) => (
          <PersonaForm key={cesionario.id} persona={cesionario} tipo="cesionario" index={idx} totalPersonas={cesionarios.length}
            onChange={(p) => { const c = [...cesionarios]; c[idx] = p; setDatos({ ...datos, cesionarios: c }); }}
            onRemove={() => cesionarios.length > 1 && setDatos({ ...datos, cesionarios: cesionarios.filter((_, i) => i !== idx) })} />
        ))}
      </section>

      {/* Intérprete */}
      {necesitaInterprete && (
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2 mb-3">
            <span>🗣️</span> Intérprete
          </h2>
          <p className="text-sm text-blue-700 mb-3">
            Se requiere intérprete porque algunos comparecientes no hablan español.
          </p>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={interprete.usarDefault} onChange={(e) => setDatos({ ...datos, interprete: { ...interprete, usarDefault: e.target.checked, datos: e.target.checked ? { ...INTERPRETE_DEFAULT } : interprete.datos }})} className="mr-2 rounded" />
              <span className="text-sm">Usar intérprete default (Lic. Rolando Romero García)</span>
            </label>
            {!interprete.usarDefault && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={interprete.datos.nombre} onChange={(e) => setDatos({ ...datos, interprete: { ...interprete, datos: { ...interprete.datos, nombre: e.target.value }}})} placeholder="Nombre del intérprete" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            )}
            <label className="flex items-center">
              <input type="checkbox" checked={interprete.incluirContacto} onChange={(e) => setDatos({ ...datos, interprete: { ...interprete, incluirContacto: e.target.checked }})} className="mr-2 rounded" />
              <span className="text-sm">Incluir teléfono y email en el documento</span>
            </label>
          </div>
        </section>
      )}
    </div>
  );
}

// ============================================================================
// SECCIÓN 2: FIDEICOMISO
// ============================================================================

function Seccion2Fideicomiso({ datos, setDatos }) {
  const { fideicomiso } = datos;
  
  const handleChange = (campo, valor) => {
    setDatos({ ...datos, fideicomiso: { ...fideicomiso, [campo]: valor } });
  };
  
  const handleBancoChange = (bancoId) => {
    const banco = BANCOS_FIDUCIARIOS.find(b => b.id === bancoId);
    setDatos({ ...datos, fideicomiso: { ...fideicomiso, bancoId, bancoNombre: banco?.nombre || '', bancoRazonSocial: banco?.razonSocial || '' }});
  };

  return (
    <div className="space-y-6">
      {/* Datos básicos */}
      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">🏦</span> Datos del Fideicomiso
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de fideicomiso *</label>
            <input type="text" value={fideicomiso.numero} onChange={(e) => handleChange('numero', e.target.value)}
              placeholder="Ej: 2640" className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
            {fideicomiso.numero && <p className="text-xs text-gray-500 mt-1">{formatearNumeroEscritura(fideicomiso.numero)}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Banco Fiduciario *</label>
            <select value={fideicomiso.bancoId} onChange={(e) => handleBancoChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              {BANCOS_FIDUCIARIOS.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Permiso SRE */}
      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Permiso SRE</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Número de permiso</label>
            <input type="text" value={fideicomiso.permisoSRE} onChange={(e) => handleChange('permisoSRE', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Folio</label>
            <input type="text" value={fideicomiso.permisoFolio} onChange={(e) => handleChange('permisoFolio', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
            <input type="date" value={fideicomiso.permisoFecha} onChange={(e) => handleChange('permisoFecha', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
      </section>

      {/* Escritura original */}
      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Escritura de Constitución Original</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Número de escritura *</label>
            <input type="text" value={fideicomiso.escrituraOriginal.numero} 
              onChange={(e) => setDatos({ ...datos, fideicomiso: { ...fideicomiso, escrituraOriginal: { ...fideicomiso.escrituraOriginal, numero: e.target.value }}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
            <input type="date" value={fideicomiso.escrituraOriginal.fecha} 
              onChange={(e) => setDatos({ ...datos, fideicomiso: { ...fideicomiso, escrituraOriginal: { ...fideicomiso.escrituraOriginal, fecha: e.target.value }}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notario *</label>
            <input type="text" value={fideicomiso.escrituraOriginal.notario} 
              onChange={(e) => setDatos({ ...datos, fideicomiso: { ...fideicomiso, escrituraOriginal: { ...fideicomiso.escrituraOriginal, notario: e.target.value }}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notaría #</label>
            <input type="text" value={fideicomiso.escrituraOriginal.notariaNumero} 
              onChange={(e) => setDatos({ ...datos, fideicomiso: { ...fideicomiso, escrituraOriginal: { ...fideicomiso.escrituraOriginal, notariaNumero: e.target.value }}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad, Estado</label>
            <input type="text" value={fideicomiso.escrituraOriginal.notariaCiudad} 
              onChange={(e) => setDatos({ ...datos, fideicomiso: { ...fideicomiso, escrituraOriginal: { ...fideicomiso.escrituraOriginal, notariaCiudad: e.target.value }}})}
              placeholder="Ej: Guadalajara, Jalisco" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
      </section>

      {/* Cesiones previas */}
      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Cesiones Previas</h3>
          <button onClick={() => setDatos({ ...datos, fideicomiso: { ...fideicomiso, cesionesPrevias: [...fideicomiso.cesionesPrevias, cesionPreviaVacia()] }})}
            className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md">
            + Agregar cesión
          </button>
        </div>
        {fideicomiso.cesionesPrevias.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Esta es la primera cesión del fideicomiso.</p>
        ) : (
          <div className="space-y-3">
            {fideicomiso.cesionesPrevias.map((cesion, idx) => (
              <div key={cesion.id} className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-600">Cesión #{idx + 1}</span>
                  <button onClick={() => setDatos({ ...datos, fideicomiso: { ...fideicomiso, cesionesPrevias: fideicomiso.cesionesPrevias.filter((_, i) => i !== idx) }})}
                    className="text-red-500 text-xs">✕ Eliminar</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input type="text" value={cesion.escritura} placeholder="Escritura" className="px-2 py-1 border rounded text-sm font-mono"
                    onChange={(e) => { const c = [...fideicomiso.cesionesPrevias]; c[idx] = { ...c[idx], escritura: e.target.value }; setDatos({ ...datos, fideicomiso: { ...fideicomiso, cesionesPrevias: c }}); }} />
                  <input type="date" value={cesion.fecha} className="px-2 py-1 border rounded text-sm"
                    onChange={(e) => { const c = [...fideicomiso.cesionesPrevias]; c[idx] = { ...c[idx], fecha: e.target.value }; setDatos({ ...datos, fideicomiso: { ...fideicomiso, cesionesPrevias: c }}); }} />
                  <input type="text" value={cesion.cedente} placeholder="Cedente" className="px-2 py-1 border rounded text-sm"
                    onChange={(e) => { const c = [...fideicomiso.cesionesPrevias]; c[idx] = { ...c[idx], cedente: e.target.value }; setDatos({ ...datos, fideicomiso: { ...fideicomiso, cesionesPrevias: c }}); }} />
                  <input type="text" value={cesion.cesionario} placeholder="Cesionario" className="px-2 py-1 border rounded text-sm"
                    onChange={(e) => { const c = [...fideicomiso.cesionesPrevias]; c[idx] = { ...c[idx], cesionario: e.target.value }; setDatos({ ...datos, fideicomiso: { ...fideicomiso, cesionesPrevias: c }}); }} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 text-sm font-semibold text-blue-600">
          📌 Esta será: Cesión #{fideicomiso.cesionesPrevias.length + 1}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// SECCIÓN 3: INMUEBLE
// ============================================================================

function Seccion3Inmueble({ datos, setDatos }) {
  const { inmueble } = datos;
  
  const handleChange = (campo, valor) => {
    setDatos({ ...datos, inmueble: { ...inmueble, [campo]: valor } });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-cyan-600">🏠</span> Tipo y Ubicación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de inmueble</label>
            <select value={inmueble.tipoInmueble} onChange={(e) => handleChange('tipoInmueble', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              {TIPOS_INMUEBLE.map(t => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de unidad</label>
            <input type="text" value={inmueble.numeroUnidad} onChange={(e) => handleChange('numeroUnidad', e.target.value)} placeholder="Ej: 5204" className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número en letra</label>
            <input type="text" value={inmueble.numeroUnidadLetra} onChange={(e) => handleChange('numeroUnidadLetra', e.target.value)} placeholder="cinco mil doscientos cuatro" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección / Ubicación *</label>
            <input type="text" value={inmueble.direccion} onChange={(e) => handleChange('direccion', e.target.value)} placeholder="Ej: Km 11 Carretera Puerto Vallarta-Barra de Navidad" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <input type="text" value={inmueble.ciudad} onChange={(e) => handleChange('ciudad', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
            <input type="text" value={inmueble.municipio} onChange={(e) => handleChange('municipio', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={inmueble.estado} onChange={(e) => handleChange('estado', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              {ESTADOS_MEXICO.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <label className="flex items-center">
            <input type="checkbox" checked={inmueble.esCondominio} onChange={(e) => handleChange('esCondominio', e.target.checked)} className="mr-2 rounded" />
            <span className="text-sm font-medium">El inmueble forma parte de un Régimen de Condominio</span>
          </label>
          {inmueble.esCondominio && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={inmueble.nombreCondominio} onChange={(e) => handleChange('nombreCondominio', e.target.value)} placeholder="Nombre del condominio" className="px-3 py-2 border border-gray-300 rounded-md" />
              <input type="text" value={inmueble.indiviso} onChange={(e) => handleChange('indiviso', e.target.value)} placeholder="Indiviso (ej: 0.7275%)" className="px-3 py-2 border border-gray-300 rounded-md font-mono" />
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-yellow-600">📐</span> Descripción Legal (Medidas y Colindancias)
        </h3>
        <p className="text-sm text-gray-500 mb-2">Copie y pegue la descripción legal del certificado de gravámenes o escritura anterior.</p>
        <textarea value={inmueble.descripcionLegal} onChange={(e) => handleChange('descripcionLegal', e.target.value)} rows={8} placeholder="El inmueble tiene una superficie de..." className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" />
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-green-600">📋</span> Datos Registrales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Folio Real *</label>
            <input type="text" value={inmueble.folioReal} onChange={(e) => handleChange('folioReal', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
            {inmueble.folioReal && <p className="text-xs text-gray-500 mt-1">({convertirALetra(inmueble.folioReal)})</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad del Registro</label>
            <input type="text" value={inmueble.ciudadRegistro} onChange={(e) => handleChange('ciudadRegistro', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Predial *</label>
            <input type="text" value={inmueble.cuentaPredial} onChange={(e) => handleChange('cuentaPredial', e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clave Catastral</label>
            <input type="text" value={inmueble.claveCatastral} onChange={(e) => handleChange('claveCatastral', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" />
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// SECCIÓN 4: CONTRAPRESTACIÓN
// ============================================================================

function Seccion4Contraprestacion({ datos, setDatos }) {
  const { contraprestacion, cuentasOrigen, cuentasDestino } = datos;
  
  useEffect(() => {
    if (contraprestacion.montoUSD && contraprestacion.tipoCambio) {
      const usd = parseFloat(contraprestacion.montoUSD.replace(/,/g, ''));
      const tc = parseFloat(contraprestacion.tipoCambio);
      if (!isNaN(usd) && !isNaN(tc)) {
        setDatos({ ...datos, contraprestacion: { ...contraprestacion, montoMXN: (usd * tc).toFixed(2) } });
      }
    }
  }, [contraprestacion.montoUSD, contraprestacion.tipoCambio]);

  const handleChange = (campo, valor) => {
    setDatos({ ...datos, contraprestacion: { ...contraprestacion, [campo]: valor } });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-green-600">💰</span> Precio y Tipo de Cambio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio en USD *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">USD$</span>
              <input type="text" value={contraprestacion.montoUSD} onChange={(e) => handleChange('montoUSD', e.target.value)} placeholder="280,000.00" className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-md font-mono text-right" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cambio DOF *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input type="text" value={contraprestacion.tipoCambio} onChange={(e) => handleChange('tipoCambio', e.target.value)} placeholder="16.9948" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md font-mono text-right" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equivalente MXN</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input type="text" value={contraprestacion.montoMXN ? parseFloat(contraprestacion.montoMXN).toLocaleString('es-MX') : ''} readOnly className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md font-mono text-right bg-gray-50" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-blue-600">💳</span> Forma de Pago
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {[
            { id: 'escrow', label: 'Escrow' },
            { id: 'transferencia_directa', label: 'Transferencia directa' },
            { id: 'mixto', label: 'Mixto' }
          ].map(f => (
            <label key={f.id} className={`flex items-center p-3 border rounded-lg cursor-pointer ${contraprestacion.formaPago === f.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
              <input type="radio" checked={contraprestacion.formaPago === f.id} onChange={() => handleChange('formaPago', f.id)} className="mr-2" />
              <span className="text-sm">{f.label}</span>
            </label>
          ))}
        </div>
        {contraprestacion.formaPago === 'escrow' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa Escrow</label>
              <select value={contraprestacion.empresaEscrowId} onChange={(e) => handleChange('empresaEscrowId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                {EMPRESAS_ESCROW.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de cuenta Escrow</label>
              <input type="text" value={contraprestacion.cuentaEscrow} onChange={(e) => handleChange('cuentaEscrow', e.target.value.toUpperCase())} placeholder="Ej: ASE-260280" className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
            </div>
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Cuenta(s) de Origen (Comprador)</h3>
          <button onClick={() => setDatos({ ...datos, cuentasOrigen: [...cuentasOrigen, cuentaVacia('origen')] })} className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">+ Agregar</button>
        </div>
        {cuentasOrigen.map((cuenta, idx) => (
          <div key={cuenta.id} className="bg-amber-50 rounded p-3 mb-2 grid grid-cols-4 gap-2 items-end">
            <input type="text" value={cuenta.terminacion} placeholder="Terminación" maxLength={4} className="px-2 py-1 border rounded text-sm font-mono"
              onChange={(e) => { const c = [...cuentasOrigen]; c[idx] = { ...c[idx], terminacion: e.target.value }; setDatos({ ...datos, cuentasOrigen: c }); }} />
            <input type="text" value={cuenta.banco} placeholder="Banco" className="px-2 py-1 border rounded text-sm"
              onChange={(e) => { const c = [...cuentasOrigen]; c[idx] = { ...c[idx], banco: e.target.value }; setDatos({ ...datos, cuentasOrigen: c }); }} />
            <input type="text" value={cuenta.titular} placeholder="Titular" className="px-2 py-1 border rounded text-sm"
              onChange={(e) => { const c = [...cuentasOrigen]; c[idx] = { ...c[idx], titular: e.target.value }; setDatos({ ...datos, cuentasOrigen: c }); }} />
            {cuentasOrigen.length > 1 && (
              <button onClick={() => setDatos({ ...datos, cuentasOrigen: cuentasOrigen.filter((_, i) => i !== idx) })} className="text-red-500 text-xs">✕</button>
            )}
          </div>
        ))}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Cuenta(s) de Destino (Vendedor)</h3>
          <button onClick={() => setDatos({ ...datos, cuentasDestino: [...cuentasDestino, cuentaVacia('destino')] })} className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded">+ Agregar</button>
        </div>
        {cuentasDestino.map((cuenta, idx) => (
          <div key={cuenta.id} className="bg-emerald-50 rounded p-3 mb-2 grid grid-cols-4 gap-2 items-end">
            <input type="text" value={cuenta.terminacion} placeholder="Terminación" maxLength={4} className="px-2 py-1 border rounded text-sm font-mono"
              onChange={(e) => { const c = [...cuentasDestino]; c[idx] = { ...c[idx], terminacion: e.target.value }; setDatos({ ...datos, cuentasDestino: c }); }} />
            <input type="text" value={cuenta.banco} placeholder="Banco" className="px-2 py-1 border rounded text-sm"
              onChange={(e) => { const c = [...cuentasDestino]; c[idx] = { ...c[idx], banco: e.target.value }; setDatos({ ...datos, cuentasDestino: c }); }} />
            <input type="text" value={cuenta.titular} placeholder="Titular" className="px-2 py-1 border rounded text-sm"
              onChange={(e) => { const c = [...cuentasDestino]; c[idx] = { ...c[idx], titular: e.target.value }; setDatos({ ...datos, cuentasDestino: c }); }} />
            {cuentasDestino.length > 1 && (
              <button onClick={() => setDatos({ ...datos, cuentasDestino: cuentasDestino.filter((_, i) => i !== idx) })} className="text-red-500 text-xs">✕</button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

// ============================================================================
// SECCIÓN 5: SUSTITUTOS
// ============================================================================

function Seccion5Sustitutos({ datos, setDatos }) {
  const { cesionarios, sustitutosPorCesionario } = datos;
  
  const agregarSustituto = (cesionarioId) => {
    setDatos({ ...datos, sustitutosPorCesionario: { ...sustitutosPorCesionario, [cesionarioId]: [...(sustitutosPorCesionario[cesionarioId] || []), sustitutoVacio()] }});
  };

  return (
    <div className="space-y-6">
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
        <h2 className="font-bold text-violet-800 flex items-center gap-2">
          <span>👥</span> Fideicomisarios Sustitutos
        </h2>
        <p className="text-sm text-violet-700 mt-1">
          Designar quiénes heredarán los derechos en caso de fallecimiento del cesionario. Los porcentajes deben sumar 100%.
        </p>
      </div>
      
      {cesionarios.map((ces, cesIdx) => {
        const sustitutos = sustitutosPorCesionario[ces.id] || [];
        const total = sustitutos.reduce((sum, s) => sum + (parseFloat(s.porcentaje) || 0), 0);
        
        return (
          <section key={ces.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">
                {ces.nombreCompleto || `Cesionario ${cesIdx + 1}`}
                {sustitutos.length > 0 && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${total === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {total}%
                  </span>
                )}
              </h3>
              <button onClick={() => agregarSustituto(ces.id)} className="text-sm bg-violet-500 hover:bg-violet-600 text-white px-3 py-1 rounded">+ Agregar sustituto</button>
            </div>
            
            {sustitutos.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Sin sustitutos designados.</p>
            ) : (
              <div className="space-y-2">
                {sustitutos.map((sust, idx) => (
                  <div key={sust.id} className="bg-violet-50 rounded p-3 grid grid-cols-4 gap-2 items-end">
                    <input type="text" value={sust.nombre} placeholder="Nombre" className="col-span-2 px-2 py-1 border rounded text-sm"
                      onChange={(e) => { const s = [...sustitutos]; s[idx] = { ...s[idx], nombre: e.target.value }; setDatos({ ...datos, sustitutosPorCesionario: { ...sustitutosPorCesionario, [ces.id]: s }}); }} />
                    <div className="flex items-center gap-1">
                      <input type="number" value={sust.porcentaje} placeholder="%" min="1" max="100" className="w-16 px-2 py-1 border rounded text-sm font-mono text-right"
                        onChange={(e) => { const s = [...sustitutos]; s[idx] = { ...s[idx], porcentaje: e.target.value }; setDatos({ ...datos, sustitutosPorCesionario: { ...sustitutosPorCesionario, [ces.id]: s }}); }} />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <button onClick={() => { const s = sustitutos.filter((_, i) => i !== idx); setDatos({ ...datos, sustitutosPorCesionario: { ...sustitutosPorCesionario, [ces.id]: s }}); }} className="text-red-500 text-xs justify-self-end">✕</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ============================================================================
// SECCIÓN 6: FISCAL
// ============================================================================

function Seccion6Fiscal({ datos, setDatos }) {
  const { fiscal, contraprestacion } = datos;
  
  useEffect(() => {
    const base = fiscal.baseTransmisiones === 'avaluo' ? parseFloat(fiscal.avaluoMonto) || 0 : parseFloat(contraprestacion.montoMXN) || 0;
    const tasa = parseFloat(fiscal.tasaTransmisiones) || 0;
    setDatos({ ...datos, fiscal: { ...fiscal, montoTransmisiones: (base * tasa / 100).toFixed(2) } });
  }, [fiscal.baseTransmisiones, fiscal.avaluoMonto, fiscal.tasaTransmisiones, contraprestacion.montoMXN]);

  const handleChange = (campo, valor) => {
    setDatos({ ...datos, fiscal: { ...fiscal, [campo]: valor } });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-cyan-600">📊</span> Avalúo Catastral
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor del avalúo (MXN) *</label>
            <input type="text" value={fiscal.avaluoMonto} onChange={(e) => handleChange('avaluoMonto', e.target.value)} placeholder="1,639,508.42" className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del avalúo</label>
            <input type="date" value={fiscal.avaluoFecha} onChange={(e) => handleChange('avaluoFecha', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perito valuador</label>
            <input type="text" value={fiscal.avaluoPerito} onChange={(e) => handleChange('avaluoPerito', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-red-600">💸</span> ISR por Enajenación (Vendedor)
        </h3>
        <div className="space-y-2">
          {[
            { id: 'casa_habitacion', label: 'Exento por casa habitación', desc: 'Últimos 6 meses con comprobantes CFE' },
            { id: 'monto_menor', label: 'Exento por monto (hasta 700,000 UDIs)', desc: '' },
            { id: 'no_aplica', label: 'No aplica exención - Se retiene ISR', desc: '' }
          ].map(opt => (
            <label key={opt.id} className={`flex items-start p-3 border rounded-lg cursor-pointer ${fiscal.isrEnajenacion === opt.id ? 'border-red-300 bg-red-50' : 'hover:bg-gray-50'}`}>
              <input type="radio" checked={fiscal.isrEnajenacion === opt.id} onChange={() => handleChange('isrEnajenacion', opt.id)} className="mt-1 mr-3" />
              <div>
                <span className="text-sm font-medium">{opt.label}</span>
                {opt.desc && <p className="text-xs text-gray-500">{opt.desc}</p>}
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-blue-600">🏷️</span> IVA
        </h3>
        <div className="space-y-2">
          {[
            { id: 'exento_habitacional', label: 'Exento por uso habitacional' },
            { id: 'terreno', label: 'No objeto (terreno)' },
            { id: 'gravado', label: 'Gravado al 16%' }
          ].map(opt => (
            <label key={opt.id} className={`flex items-center p-3 border rounded-lg cursor-pointer ${fiscal.iva === opt.id ? 'border-blue-300 bg-blue-50' : 'hover:bg-gray-50'}`}>
              <input type="radio" checked={fiscal.iva === opt.id} onChange={() => handleChange('iva', opt.id)} className="mr-3" />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-purple-600">🏛️</span> Impuesto sobre Transmisiones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
            <select value={fiscal.baseTransmisiones} onChange={(e) => handleChange('baseTransmisiones', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="avaluo">Valor de avalúo</option>
              <option value="operacion">Valor de operación</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa (%)</label>
            <input type="text" value={fiscal.tasaTransmisiones} onChange={(e) => handleChange('tasaTransmisiones', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto calculado</label>
            <input type="text" value={formatearMontoMXN(fiscal.montoTransmisiones)} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50" />
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// SECCIÓN 7: REVISIÓN Y GENERACIÓN
// ============================================================================

function Seccion7Revision({ datos, validaciones }) {
  const [generando, setGenerando] = useState(false);
  const [generado, setGenerado] = useState(false);
  
  const handleGenerar = async () => {
    setGenerando(true);
    await new Promise(r => setTimeout(r, 2000));
    setGenerando(false);
    setGenerado(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📋</span> Revisión Final
        </h2>
        <p className="text-sm text-gray-600 mt-1">Verifique que todos los datos estén correctos antes de generar.</p>
      </div>

      {/* Resumen por sección */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 mb-2">👥 Comparecientes</h3>
          <p className="text-sm">Cedentes: {datos.cedentes.length} | Cesionarios: {datos.cesionarios.length}</p>
          <p className="text-xs text-gray-600 mt-1">{datos.cedentes.map(c => c.nombreCompleto || '[Sin nombre]').join(', ')}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🏦 Fideicomiso</h3>
          <p className="text-sm">#{datos.fideicomiso.numero} - {datos.fideicomiso.bancoNombre}</p>
          <p className="text-xs text-gray-600 mt-1">Cesión #{datos.fideicomiso.cesionesPrevias.length + 1}</p>
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h3 className="font-semibold text-cyan-800 mb-2">🏠 Inmueble</h3>
          <p className="text-sm">{datos.inmueble.nombreCondominio || datos.inmueble.direccion || '[Sin dirección]'}</p>
          <p className="text-xs text-gray-600 mt-1">Folio: {datos.inmueble.folioReal || '[Pendiente]'}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">💰 Contraprestación</h3>
          <p className="text-sm">{formatearMontoUSD(datos.contraprestacion.montoUSD)}</p>
          <p className="text-xs text-gray-600 mt-1">≈ {formatearMontoMXN(datos.contraprestacion.montoMXN)}</p>
        </div>
      </div>

      {/* Validaciones */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">✅ Validaciones</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[
            { ok: validaciones.seccion1, label: 'Comparecientes' },
            { ok: validaciones.seccion2, label: 'Fideicomiso' },
            { ok: validaciones.seccion3, label: 'Inmueble' },
            { ok: validaciones.seccion4, label: 'Contraprestación' },
            { ok: validaciones.seccion5, label: 'Sustitutos' },
            { ok: validaciones.seccion6, label: 'Fiscal' }
          ].map((v, i) => (
            <div key={i} className={`flex items-center gap-1 ${v.ok ? 'text-green-600' : 'text-yellow-600'}`}>
              <span>{v.ok ? '✓' : '⚠'}</span>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón generar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <button onClick={handleGenerar} disabled={generando}
          className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${generando ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
          {generando ? '⏳ Generando documento...' : '📄 Generar Escritura .docx'}
        </button>
        
        {generado && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 font-semibold mb-3">
              <span>✓</span> Documento generado exitosamente
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                ⬇️ Descargar .docx
              </button>
              <button className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                👁️ Vista previa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// APP PRINCIPAL
// ============================================================================

export default function FideicomisoGen() {
  const [seccionActual, setSeccionActual] = useState(1);
  const [datos, setDatos] = useState(ESTADO_INICIAL);
  
  // Validaciones por sección
  const validaciones = useMemo(() => ({
    seccion1: datos.cedentes.some(c => c.nombreCompleto) && datos.cesionarios.some(c => c.nombreCompleto),
    seccion2: !!datos.fideicomiso.numero && !!datos.fideicomiso.escrituraOriginal.numero,
    seccion3: !!datos.inmueble.folioReal,
    seccion4: !!datos.contraprestacion.montoUSD && !!datos.contraprestacion.tipoCambio,
    seccion5: true, // Sustitutos son opcionales
    seccion6: !!datos.fiscal.avaluoMonto,
    seccion7: true
  }), [datos]);

  const renderSeccion = () => {
    switch (seccionActual) {
      case 1: return <Seccion1Comparecientes datos={datos} setDatos={setDatos} />;
      case 2: return <Seccion2Fideicomiso datos={datos} setDatos={setDatos} />;
      case 3: return <Seccion3Inmueble datos={datos} setDatos={setDatos} />;
      case 4: return <Seccion4Contraprestacion datos={datos} setDatos={setDatos} />;
      case 5: return <Seccion5Sustitutos datos={datos} setDatos={setDatos} />;
      case 6: return <Seccion6Fiscal datos={datos} setDatos={setDatos} />;
      case 7: return <Seccion7Revision datos={datos} validaciones={validaciones} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">FideicomisoGen</h1>
              <p className="text-xs text-gray-500">Generador de Cesiones de Derechos Fideicomisarios</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Sección {seccionActual} de 7</div>
              <div className="text-sm font-medium text-blue-600">{SECCIONES[seccionActual - 1]?.nombre}</div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navegación por pasos */}
      <NavegacionPasos seccionActual={seccionActual} setSeccionActual={setSeccionActual} validaciones={validaciones} />
      
      {/* Contenido */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {renderSeccion()}
        
        {/* Navegación inferior */}
        <div className="mt-8 flex justify-between">
          <button onClick={() => setSeccionActual(Math.max(1, seccionActual - 1))} disabled={seccionActual === 1}
            className={`px-6 py-3 rounded-lg font-medium ${seccionActual === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
            ← Anterior
          </button>
          <button onClick={() => setSeccionActual(Math.min(7, seccionActual + 1))} disabled={seccionActual === 7}
            className={`px-6 py-3 rounded-lg font-medium ${seccionActual === 7 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            Siguiente →
          </button>
        </div>
      </main>
    </div>
  );
}
