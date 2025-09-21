import { normalizePages } from "nextra/normalize-pages";
import { getPageMap } from "nextra/page-map";
import { z } from "zod";

const PostFrontMatterSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "date must be a valid date format"
  }),
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
});

type PostFrontMatter = z.infer<typeof PostFrontMatterSchema>

export async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap("/posts"),
    route: "/posts",
  });

  const validPosts = directories
    .filter((post) => post.name !== "index")
    .map((post) => {
      try {
        // Validate frontmatter using zod
        const validatedFrontMatter = PostFrontMatterSchema.parse(post.frontMatter);
        return {
          ...post,
          frontMatter: validatedFrontMatter
        };
      } catch (error) {
        console.error(`Invalid frontmatter in ${post.name}:`, error);
        return null;
      }
    })
    .filter((post): post is NonNullable<typeof post> => post !== null);

  return validPosts.sort(
    (a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
  );
}

export async function getTags() {
  const posts = await getPosts();
  const tags = posts.flatMap((post) => post.frontMatter.tags);
  return tags;
}
