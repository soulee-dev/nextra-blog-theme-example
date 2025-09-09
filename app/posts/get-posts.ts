import { normalizePages } from "nextra/normalize-pages";
import { getPageMap } from "nextra/page-map";

type FrontMatter = {
  title: string
  description: string
  date: string
}

type Post = {
  name: string
  route: string
  frontMatter: FrontMatter
  [key: string]: any
}

export async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap("/posts"),
    route: "/posts",
  });

  console.log("directories!!", directories)

  return directories
    .filter((post) => post.name !== "index")
    .sort(
      (a, b) => new Date(b.frontMatter.date) - new Date(a.frontMatter.date),
    );
}

export async function getTags() {
  const posts = await getPosts();
  const tags = posts.flatMap((post) => post.frontMatter.tags);
  return tags;
}
