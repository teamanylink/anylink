import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { codeImport } from "remark-code-import";
import remarkGfm from "remark-gfm";
import { createHighlighter } from "shiki";

const prettyCodeOptions: Options = {
  theme: "github-dark",
  keepBackground: false,
  getHighlighter: (options) =>
    createHighlighter({
      ...options,
    }),
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  onVisitHighlightedLine(node) {
    if (!node.properties.className) {
      node.properties.className = [];
    }
    node.properties.className.push("line--highlighted");
  },
  onVisitHighlightedChars(node) {
    if (!node.properties.className) {
      node.properties.className = [];
    }
    node.properties.className = ["word--highlighted"];
  },
};

const blogs = defineCollection({
  name: "blogs",
  directory: "data/blogs", 
  include: "*.mdx",
  schema: (z) => ({
    title: z.string(),
    date: z.string(),
    author: z.string(),
    authorAvatar: z.string(),
    description: z.string(),
    image: z.string(),
    categories: z.array(z.string()),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(
      context,
      document,
      {
        remarkPlugins: [codeImport, remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypePrettyCode, prettyCodeOptions],
          [
            rehypeAutolinkHeadings,
            {
              properties: {
                className: ["subheading-anchor"],
                ariaLabel: "Link to section",
              },
            },
          ],
        ],
      }
    );
    const slug = document._meta.path;
    return {
      ...document,
      body,
      slug,
    };
  },
});

export default defineConfig({
  collections: [blogs],
});
