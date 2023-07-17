import Head from "next/head";
import Link from "next/link";
import Meta from "../../components/Meta";
import ContentArea from "../../components/ContentArea";
import Sidebar from "../../components/Sidebar";
import Pagination from "../../components/Pagination";
import BasicPage from "../../components/BasicPage";
import { Markdown } from "@urbit/foundation-design-system";
import userspaceTree from "../../cache/userspace.json";
import { join } from "path";
import {
  RenderTree,
  getPage,
  getPreviousPost,
  getNextPost,
} from "@urbit/foundation-design-system";

export default function GuidePage({
  search,
  posts,
  data,
  markdown,
  params,
  previousPost,
  nextPost,
}) {
  if (!params.slug) {
    return (
      <BasicPage
        wide
        post={{ title: data.title, slug: "/userspace" }}
        markdown={markdown}
        search={search}
      />
    );
  }
  return (
    <>
      <Head>
        <title>{data.title} • Userspace • developers.urbit.org</title>
        {Meta(data)}
      </Head>
      <div className="flex h-screen min-h-screen w-screen sidebar">
        <Sidebar search={search}>
          <RenderTree root="/userspace" posts={posts.children} />
        </Sidebar>
        <ContentArea
          breadcrumbs={breadcrumbs(posts, params.slug?.slice(0, -1) || "")}
          title={data.title}
          search={search}
          section="Userspace"
          params={params}
        >
          <div className="markdown technical">
            <Markdown.render content={JSON.parse(markdown)} />
          </div>
          <div className="flex justify-between mt-16">
            {previousPost === null ? (
              <div className={""} />
            ) : (
              <Pagination
                previous
                title="Previous Post"
                post={previousPost}
                className=""
                section={join("userspace", params.slug?.slice(0, -1).join("/"))}
              />
            )}
            {nextPost === null ? (
              <div className={""} />
            ) : (
              <Pagination
                next
                title="Next Post"
                post={nextPost}
                className=""
                section={join("userspace", params.slug?.slice(0, -1).join("/"))}
              />
            )}
          </div>
          <div className="flex justify-between items-center mt-16">
            <a
              className="font-semibold rounded-xl block p-2 text-wall-400 hover:text-green-400"
              target="_blank"
              href={`https://github.com/urbit/developers.urbit.org/blob/main/content/userspace/${params.slug?.join("/") || "_index"
                }.md`}
            >
              Edit this page on GitHub
            </a>
            <p className="font-semibold block p-2 text-wall-400">Last modified {data.lastModified}</p>
          </div>
        </ContentArea>
      </div>
    </>
  );
}

const breadcrumbs = (posts, paths) => {
  const results = [<Link href="/userspace">Userspace</Link>];
  let thisLink = "/userspace";
  for (const path of paths) {
    posts = posts.children[path];
    thisLink = join(thisLink, path);
    results.push(
      <span className="px-1">/</span>,
      <Link href={thisLink}>{posts.title}</Link>
    );
  }
  return results;
};

export async function getStaticProps({ params }) {
  let posts = userspaceTree;

  const { data, content } = getPage(
    join(process.cwd(), "content/userspace", params.slug?.join("/") || "/"), true
  );

  const previousPost =
    getPreviousPost(
      params.slug?.slice(-1).join("") || "userspace",
      ["title", "slug", "weight"],
      join("userspace", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const nextPost =
    getNextPost(
      params.slug?.slice(-1).join("") || "userspace",
      ["title", "slug", "weight"],
      join("userspace", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const markdown = JSON.stringify(Markdown.parse({ post: { content: String.raw`${content}` } }));

  return { props: { posts, data, markdown, params, previousPost, nextPost } };
}

export async function getStaticPaths() {
  const posts = userspaceTree;
  const slugs = [];

  const allHrefs = (thisLink, tree) => {
    slugs.push(thisLink, ...tree.pages.map((e) => join(thisLink, e.slug)));
    allHrefsChildren(thisLink, tree.children);
  };

  const allHrefsChildren = (thisLink, children) => {
    Object.entries(children).map(([childSlug, child]) => {
      allHrefs(join(thisLink, childSlug), child);
    });
  };

  allHrefs("/userspace", posts);
  return {
    paths: slugs,
    fallback: false,
  };
}
