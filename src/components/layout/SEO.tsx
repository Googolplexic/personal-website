import { Helmet } from 'react-helmet-async'

const BASE_URL = "https://www.colemanlai.com";
const SITE_NAME = "Coleman Lai";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const AUTHOR = "Coleman Lai";

interface SEOProps {
    title: string;
    description: string;
    keywords?: string[] | string;
    type?: string;
    pathname?: string;
    image?: string;
    imageAlt?: string;
    noindex?: boolean;
    article?: {
        publishedTime?: string;
        modifiedTime?: string;
        section?: string;
        tags?: string[];
    };
    breadcrumbs?: Array<{ name: string; url: string }>;
    structuredData?: Record<string, unknown> | Record<string, unknown>[];
    children?: React.ReactNode;
}

export function SEO({
    title,
    description,
    keywords,
    type = "website",
    pathname = "",
    image,
    imageAlt,
    noindex = false,
    article,
    breadcrumbs,
    structuredData,
    children
}: SEOProps) {
    const url = pathname ? `${BASE_URL}${pathname}` : BASE_URL;
    const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    const ogImage = image || DEFAULT_OG_IMAGE;
    const ogImageAlt = imageAlt || title;

    const allStructuredData: Record<string, unknown>[] = [];

    if (breadcrumbs && breadcrumbs.length > 0) {
        allStructuredData.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": crumb.name,
                "item": crumb.url
            }))
        });
    }

    if (structuredData) {
        if (Array.isArray(structuredData)) {
            allStructuredData.push(...structuredData);
        } else {
            allStructuredData.push(structuredData);
        }
    }

    return (
        <Helmet htmlAttributes={{ lang: 'en' }} prioritizeSeoTags>
            {/* Primary */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywordsString && <meta name="keywords" content={keywordsString} />}
            <meta name="author" content={AUTHOR} />
            {noindex && <meta name="robots" content="noindex, follow" />}

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={ogImageAlt} />

            {/* Article-specific OG tags */}
            {article?.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
            {article?.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
            {article?.section && <meta property="article:section" content={article.section} />}
            {article?.tags?.map((tag, i) => <meta key={`at-${i}`} property="article:tag" content={tag} />)}


            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="twitter:image:alt" content={ogImageAlt} />

            {/* Canonical */}
            <link rel="canonical" href={url} />

            {/* JSON-LD Structured Data */}
            {allStructuredData.map((data, i) => (
                <script key={`ld-${i}`} type="application/ld+json">
                    {JSON.stringify(data)}
                </script>
            ))}

            {children}
        </Helmet>
    );
}
