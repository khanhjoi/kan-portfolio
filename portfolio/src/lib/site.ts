/** Must match repo name on GitHub Pages. Set at build time via NEXT_PUBLIC_BASE_PATH. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** File in portfolio/public/ — copied to site root on static export */
export const RESUME_PDF_PATH = "/NguyenChiKhanh_CV.pdf";

export function resumePdfHref(): string {
  return withBasePath(RESUME_PDF_PATH);
}

export function withBasePath(href: string): string {
  if (!href) return BASE_PATH || "/";
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  if (href.startsWith("#")) return `${BASE_PATH}${href}`;
  const path = href.startsWith("/") ? href : `/${href}`;
  return `${BASE_PATH}${path}`;
}

/** Home page section anchor; works from blog routes too */
export function homeSectionHref(sectionId: string): string {
  const id = sectionId.toLowerCase().replace(/^#/, "");
  return withBasePath(`/#${id}`);
}
