import Script from 'next/script'

export function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Teman Kas',
    applicationCategory: 'FinanceApplication',
    description: 'Aplikasi mobile-first untuk mencatat dan memantau arus kas harian. Catat pemasukan, pengeluaran, target tabungan dengan mudah.',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    author: {
      '@type': 'Organization',
      name: 'Teman Kas',
      url: 'https://temankas.com',
    },
    featureList: [
      'Pencatatan pemasukan dan pengeluaran',
      'Tampilan kalender transaksi',
      'Target tabungan',
      'Kategori custom',
      'Multi-wallet',
      'Recurring transactions',
      'Multi-user workspace',
    ],
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Teman Kas',
    url: 'https://temankas.com',
    logo: 'https://temankas.com/favicon/apple-touch-icon.png',
    description: 'Aplikasi pencatatan keuangan pribadi dan bisnis',
    sameAs: [
      'https://twitter.com/temankas',
      'https://www.instagram.com/temankas',
    ],
  }

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Apakah Teman Kas gratis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ya, Teman Kas sepenuhnya gratis untuk digunakan. Anda dapat mencatat transaksi tanpa batas, membuat kategori custom, dan menggunakan semua fitur utama tanpa biaya.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah data saya aman?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Data Anda tersimpan dengan aman menggunakan enkripsi standar industri. Kami tidak membagikan data keuangan Anda kepada pihak ketiga.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah bisa digunakan di mobile?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ya, Teman Kas dirancang mobile-first dan dapat diakses dari browser smartphone Anda dengan pengalaman yang optimal.',
        },
      },
    ],
  }

  return (
    <>
      <Script
        id="structured-data-webapp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <Script
        id="structured-data-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  )
}
