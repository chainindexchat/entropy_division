import { notFound } from "next/navigation";
import { getDocSlugs } from "@/lib/docs/get-docs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    // Dynamically import the MDX file
    const { default: Content } = await import(
      `@/content/about/${slug}.md`
    ).catch(() => {
      // Try .mdx extension if .md fails
      return import(`@/content/about/${slug}.mdx`);
    });

    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <Content />
        </article>
      </div>
    );
  } catch (error) {
    console.error(`Error loading doc: ${slug}`, error);
    notFound();
  }
}

// Generate static params for all markdown files
export function generateStaticParams() {
  const slugs = getDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Disable dynamic params (404 for unknown slugs)
export const dynamicParams = false;

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${title} - About`,
  };
}
