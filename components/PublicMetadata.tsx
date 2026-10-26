import Head from 'next/head'
import { brandFoundation } from '../lib/brand'

type PublicMetadataProps = {
  title: string
  description: string
}

export default function PublicMetadata({ title, description }: PublicMetadataProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:site_name" content={brandFoundation.companyName} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  )
}
