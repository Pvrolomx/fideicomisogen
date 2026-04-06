# FideicomisoGen

Generador de Cesiones de Derechos Fideicomisarios para fideicomisos de zona restringida en México.

## Características

- **N cedentes → M cesionarios**: Cualquier configuración de partes
- **Persona física o moral**: Con apoderados/representantes legales
- **Intérprete integrado**: Para comparecientes que no hablan español
- **Números en letra**: Estilo notarial (RFC, CURP, pasaporte, etc.)
- **Bancos pre-cargados**: Bajío, Monex, Banorte, BBVA, Mifel
- **Delegados fiduciarios**: Pre-cargados por banco
- **Fideicomisarios sustitutos**: Con porcentajes validados al 100%
- **Régimen fiscal completo**: ISR, IVA, transmisiones patrimoniales

## Secciones

1. **Comparecientes** - Cedentes, cesionarios, intérprete
2. **Fideicomiso** - Número, banco, permiso SRE, escritura original, cesiones previas
3. **Inmueble** - Ubicación, descripción legal, datos registrales
4. **Contraprestación** - Precio, tipo de cambio, escrow, cuentas
5. **Sustitutos** - Designación por cesionario
6. **Fiscal** - Avalúo, impuestos
7. **Revisión** - Validaciones y generación

## Stack

- Next.js 14
- React 18
- Tailwind CSS

## Desarrollo

```bash
npm install
npm run dev
```

## Deploy

Configurado para Vercel con dominio `fideicomisogen.expatadvisormx.com`

## Autor

Expat Advisor MX - Rolo (Rolando Romero García)
