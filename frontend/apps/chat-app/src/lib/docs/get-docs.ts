import fs from "fs";
import path from "path";

export interface DocMetadata {
  slug: string;
  title: string;
  order?: number;
}

const DOCS_DIR = path.join(process.cwd(), "src/content/about");

/**
 * Get all markdown documents from the content directory
 */
export function getDocs(): DocMetadata[] {
  try {
    console.log("[getDocs] DOCS_DIR:", DOCS_DIR);
    if (!fs.existsSync(DOCS_DIR)) {
      console.log("[getDocs] Directory does not exist");
      return [];
    }

    const files = fs.readdirSync(DOCS_DIR);
    console.log("[getDocs] Found files:", files);
    const docs: DocMetadata[] = [];

    for (const file of files) {
      if (file.endsWith(".md") || file.endsWith(".mdx")) {
        const slug = file.replace(/\.(md|mdx)$/, "");
        const filePath = path.join(DOCS_DIR, file);
        const content = fs.readFileSync(filePath, "utf-8");

        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        let title = slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        let order = 999;

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const titleMatch = frontmatter.match(/title:\s*"?([^"\n]+)"?/);
          const orderMatch = frontmatter.match(/order:\s*(\d+)/);

          if (titleMatch) {
            title = titleMatch[1];
          }
          if (orderMatch) {
            order = Number.parseInt(orderMatch[1], 10);
          }
        }

        docs.push({ slug, title, order });
      }
    }

    // Sort by order, then by title
    const sortedDocs = docs.sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order ?? 999) - (b.order ?? 999);
      }
      return a.title.localeCompare(b.title);
    });
    console.log("[getDocs] Returning docs:", sortedDocs);
    return sortedDocs;
  } catch (error) {
    console.error("[getDocs] Error reading docs:", error);
    return [];
  }
}

/**
 * Get all document slugs (for static generation)
 */
export function getDocSlugs(): string[] {
  return getDocs().map((doc) => doc.slug);
}
