import Head from 'next/head'
import FideicomisoGen from '../components/FideicomisoGen'

export default function Home() {
  return (
    <>
      <Head>
        <title>FideicomisoGen | Generador de Cesiones de Derechos Fideicomisarios</title>
        <meta name="description" content="Genera escrituras de cesión de derechos fideicomisarios para fideicomisos de zona restringida en México" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FideicomisoGen />
    </>
  )
}
