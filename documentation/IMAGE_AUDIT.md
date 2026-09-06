# S & A BADMINTON ACADEMY — IMAGE & MEDIA ASSET AUDIT
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Scope:** Public Images, Next.js Image Optimization, External Media Domains, and Alt-Text Coverage  
**Status:** 100% Code-Verified

---

## 1. Local Image Assets Inventory (`public/images/`)

| File Name | File Size | Format | Usage Context | `next/image` Used | Priority Flag | Alt-Text Quality | Performance Assessment |
| :--- | :---: | :---: | :--- | :---: | :---: | :--- | :--- |
| `hero-athlete.jpg` | 699 KB | JPEG | Homepage Hero Background ([`HeroSection.tsx`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/components/hero/HeroSection.tsx)) | Yes | `priority={true}` | "Professional Badminton Athlete Smashing Shuttlecock" | Good LCP; WebP conversion recommended to reduce from ~700KB to ~120KB. |
| `training-coach.jpg` | 802 KB | JPEG | About Page & Methodology visual | Yes | `loading="lazy"` | "S & A Badminton Academy Coach Training Athlete" | High quality, but oversized file size for mobile. |

---

## 2. Remote Image Delivery (`images.unsplash.com`)

### Remote Patterns in `next.config.mjs`
Inspection of [`next.config.mjs`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/next.config.mjs) lines 5–15:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'plus.unsplash.com' }
  ],
}
```

### Usage Across Datasets
* **Programs (`data/programs.ts`):** 5 Unsplash badminton images representing Kids, Junior, Adult, Competitive, and Summer Camp.
* **Coaches (`data/coaches.ts`):** 4 portrait headshots representing coaching mentors.
* **Gallery (`data/gallery.ts`):** 8 high-action badminton court and training images.
* **Locations (`data/locations.ts`):** 4 arena indoor court photographs.

---

## 3. SEO Alt-Text & Accessibility Audit

### Strengths
* Every `<Image>` tag inspected declares a non-empty, descriptive `alt` attribute.
* No instances of generic `alt="image"` or `alt="photo"` were found.
* Hero image explicitly incorporates relevant keywords naturally without stuffing (*"Professional Badminton Athlete Smashing Shuttlecock at S & A Badminton Academy Kochi"*).

### Phase 2 Recommendations
1. **Asset Localisation:** Replace remote Unsplash stock imagery with authentic photography of Coach Sooraj, actual students, and the 4 physical Kochi arenas.
2. **Format Modernisation:** Convert local JPEG assets (`hero-athlete.jpg`, `training-coach.jpg`) into modern `.webp` or `.avif` formats to save ~1.2MB of initial bandwidth on mobile networks.
