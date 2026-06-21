'use client';

import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const SITE_NAME = 'AlgoKube';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

interface CourseMeta {
  name?: string;
  title?: string;
  difficulty?: string;
  lesson_count?: number;
  section_count?: number;
  category?: string;
  price?: number;
  read_time?: string;
}

interface LessonMeta {
  read_time?: string;
  last_updated?: string;
  difficulty?: string;
  is_free?: boolean;
  access_type?: string;
  teaches?: string[];
  courseName?: string;
  courseSlug?: string;
  sectionTitle?: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
  image?: string;
  course?: CourseMeta;
  lesson?: LessonMeta;
  noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({ title, description, path, type = 'website', image, course, lesson, noindex }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Learn to Code, Step by Step`;
  const desc = description || 'Structured programming courses with interactive examples. Learn Python, JavaScript, AI, and more.';
  const url = `${SITE_URL}${path || ''}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  const courseJsonLd = course ? {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name || course.title,
    "description": desc,
    "provider": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
    },
    "url": url,
    "educationalLevel": course.difficulty || "Beginner",
    ...(course.lesson_count && { "numberOfLessons": course.lesson_count }),
    ...(course.section_count && { "numberOfSections": course.section_count }),
    ...(course.category && { "courseCategory": course.category }),
    ...(course.price !== undefined && {
      "offers": {
        "@type": "Offer",
        "price": course.price || "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "category": course.price === 0 ? "Free" : "Paid",
      }
    }),
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseWorkload": course.read_time || `${course.lesson_count || 0} lessons`,
    },
  } : null;

  const articleJsonLd = lesson ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": desc,
    "author": { "@type": "Organization", "name": SITE_NAME },
    "publisher": { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
    "url": url,
    "image": ogImage,
    "inLanguage": "en",
    ...(lesson.read_time && { "timeRequired": lesson.read_time }),
    ...(lesson.last_updated && { "dateModified": lesson.last_updated }),
  } : null;

  const learningResourceJsonLd = lesson ? {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": title,
    "description": desc,
    "url": url,
    "image": ogImage,
    "inLanguage": "en",
    "learningResourceType": "Lesson",
    "educationalLevel": lesson.difficulty || "Beginner",
    "isAccessibleForFree": lesson.is_free !== false && lesson.access_type !== "premium",
    ...(lesson.teaches && { "teaches": lesson.teaches }),
    ...(lesson.read_time && { "timeRequired": lesson.read_time }),
    ...(lesson.last_updated && { "dateModified": lesson.last_updated }),
    ...(lesson.courseName && lesson.courseSlug && {
      "isPartOf": {
        "@type": "Course",
        "name": lesson.courseName,
        "url": `${SITE_URL}/course/${lesson.courseSlug}`,
        ...(lesson.sectionTitle && { "hasPart": { "@type": "CourseInstance", "name": lesson.sectionTitle } }),
      },
    }),
    "provider": { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
  } : null;

  const breadcrumbJsonLd = path ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      ...(course ? [{ "@type": "ListItem", "position": 2, "name": course.name || course.title, "item": url }] : []),
      ...(lesson ? [
        { "@type": "ListItem", "position": 2, "name": lesson.courseName || "Course", "item": `${SITE_URL}/course/${lesson.courseSlug || ''}` },
        { "@type": "ListItem", "position": 3, "name": title, "item": url },
      ] : []),
    ].filter(Boolean),
  } : null;

  const jsonLd = courseJsonLd || articleJsonLd;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {course && (
        <meta name="keywords" content={`${course.name || course.title}, learn ${course.name || ''}, ${course.category || ''}, programming course, coding tutorial, AlgoKube`} />
      )}

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
      {breadcrumbJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      )}
      {learningResourceJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(learningResourceJsonLd)}
        </script>
      )}
    </>
  );
};

export default SEO;