import type { MetaDescriptor } from 'react-router';

export const BASE_URL = 'https://www.colemanlai.com';
const SITE_NAME = 'Coleman Lai';
const AUTHOR = 'Coleman Lai';
const INDEXABLE_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

type JsonLd = Record<string, unknown>;

interface SeoOptions {
    title: string;
    description: string;
    /** Site-relative path; omit for pages that should not be indexed. */
    pathname?: string;
    keywords?: string[];
    type?: 'website' | 'article';
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
    structuredData?: JsonLd[];
}

export function absoluteUrl(src: string | undefined): string | undefined {
    if (!src) return undefined;
    return src.startsWith('http') ? src : `${BASE_URL}${src}`;
}

export function seoMeta({
    title,
    description,
    pathname,
    keywords,
    type = 'website',
    image,
    imageAlt,
    noindex = false,
    article,
    breadcrumbs,
    structuredData = [],
}: SeoOptions): MetaDescriptor[] {
    const url = pathname !== undefined ? `${BASE_URL}${pathname}` : undefined;
    const ogImage = absoluteUrl(image);
    const ogImageAlt = imageAlt || title;

    const tags: MetaDescriptor[] = [
        { title },
        { name: 'description', content: description },
        { name: 'author', content: AUTHOR },
        { name: 'robots', content: noindex ? 'noindex, follow' : INDEXABLE_ROBOTS },
        { property: 'og:type', content: type },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: ogImage ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
    ];

    if (keywords?.length) tags.push({ name: 'keywords', content: keywords.join(', ') });
    if (!noindex) tags.push({ name: 'googlebot', content: 'index, follow' });
    if (url) {
        tags.push({ property: 'og:url', content: url });
        tags.push({ tagName: 'link', rel: 'canonical', href: url });
    }
    if (ogImage) {
        tags.push(
            { property: 'og:image', content: ogImage },
            { property: 'og:image:alt', content: ogImageAlt },
            { name: 'twitter:image', content: ogImage },
            { name: 'twitter:image:alt', content: ogImageAlt },
        );
    }
    if (article?.publishedTime) tags.push({ property: 'article:published_time', content: article.publishedTime });
    if (article?.modifiedTime) tags.push({ property: 'article:modified_time', content: article.modifiedTime });
    if (article?.section) tags.push({ property: 'article:section', content: article.section });
    for (const tag of article?.tags ?? []) tags.push({ property: 'article:tag', content: tag });

    const jsonLd: JsonLd[] = [];
    if (breadcrumbs?.length) {
        jsonLd.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: crumb.name,
                item: crumb.url,
            })),
        });
    }
    jsonLd.push(...structuredData);
    for (const data of jsonLd) tags.push({ 'script:ld+json': data });

    return tags;
}

export function notFoundMeta(): MetaDescriptor[] {
    return seoMeta({
        title: 'Page Not Found | 404 Error | Coleman Lai',
        description: "Sorry, the page you're looking for doesn't exist. Return to Coleman Lai's homepage to explore software projects and origami.",
        noindex: true,
    });
}
