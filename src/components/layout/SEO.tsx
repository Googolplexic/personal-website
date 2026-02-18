import { Helmet } from 'react-helmet-async'

interface SEOProps {
    title: string;
    description: string;
    keywords?: string[] | string;
    type?: string;
    pathname?: string;
    children?: React.ReactNode;
}

export function SEO({
    title,
    description,
    keywords,
    type = "website",
    pathname = "",
    children
}: SEOProps) {
    const baseUrl = "https://www.colemanlai.com";
    const url = pathname ? `${baseUrl}${pathname}` : baseUrl;
    const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

    return (
        <Helmet htmlAttributes={{ lang: 'en' }}>
            {/* Basic */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywordsString && <meta name="keywords" content={keywordsString} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />

            {/* Canonical */}
            <link rel="canonical" href={url} />

            {children}
        </Helmet>
    );
}
