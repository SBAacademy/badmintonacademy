import React from "react";

interface SEOJsonLdProps {
  schema: Record<string, any> | Array<Record<string, any>>;
}

export function SEOJsonLd({ schema }: SEOJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
