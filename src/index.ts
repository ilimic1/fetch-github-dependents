import axios from "axios";
import { load } from "cheerio";

export class Repo {
  constructor(
    public readonly user: string,
    public readonly repo: string,
    public readonly stars: number
  ) {}

  public getUrl() {
    return `https://github.com/${this.user}/${this.repo}`;
  }
}

export const githubUserSlugRegex = /^[A-Za-z0-9-]+$/i;
export const githubRepoSlugRegex = /^[A-Za-z0-9-_\.]+$/;

async function getData({
  url,
  reposToScan,
}: {
  url: string;
  reposToScan?: number;
}): Promise<{ repos: Repo[]; count?: number }> {
  const repos: Repo[] = [];
  let repoCount: number | undefined = undefined;
  let delay = 0;
  let nextUrl: string | undefined = url;

  do {
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = 0;

    let data: string;

    try {
      const request = await axios.get(url);
      data = await request.data;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 429
      ) {
        // if we get HTTP 429 Too Many Requests we should sleep for a while

        // console.log("error.response.status", error.response.status);
        // console.log("error.response.headers", error.response.headers);

        if (
          error.response.headers["retry-after"] &&
          /^[0-9]+$/.test(error.response.headers["retry-after"])
        ) {
          delay = Number(error.response.headers["retry-after"]) * 1000;
        } else {
          // default to 5 minutes
          delay = 5 * 60 * 1000;
        }

        console.log(
          `Got HTTP 429 Too Many Requests, sleeping for ${
            delay / 1000
          } seconds...`
        );

        continue;
      }

      console.log(
        "error.message",
        error instanceof Error ? error.message : error
      );

      return { repos, count: repoCount };
    }

    const $ = load(data);

    if (repoCount === undefined) {
      // string that we get is something like " 1,334,607 Repositories "
      repoCount = Number(
        $("svg.octicon-code-square")
          .parent()
          .text()
          .replace(/[^0-9]/g, "")
      );
    }

    const rows = $('[data-test-id="dg-repo-pkg-dependent"]');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const user = $(row)
        .find(
          'a[data-hovercard-type="user"],a[data-hovercard-type="organization"]'
        )
        .eq(0)
        .text();
      const repo = $(row)
        .find('a[data-hovercard-type="repository"]')
        .eq(0)
        .text();
      const stars = $(row).find("svg.octicon-star").parent().text();

      if (user === "" || repo === "") {
        console.error(
          `Failed to get user and/or repo for repo ${user}/${repo}.`
        );
      }

      repos.push(new Repo(user, repo, Number(stars)));

      if (reposToScan !== undefined && repos.length >= reposToScan) {
        console.log(`Went through ${repos.length}/${repoCount} repos...`);
        return { repos, count: repoCount };
      }
    }

    const nextLink = $(
      '.paginate-container .btn.BtnGroup-item:contains("Next")'
    ).eq(0);

    nextUrl = nextLink.length ? nextLink.attr("href") : undefined;
    console.log(`Went through ${repos.length}/${repoCount} repos...`);
  } while (nextUrl);

  return { repos, count: repoCount };
}

export async function getRepos({
  url,
  reposToScan,
  sort,
}: {
  url: string;
  reposToScan?: number;
  sort?: "asc" | "desc";
}): Promise<{ repos: Repo[]; count?: number }> {
  const { repos, count } = await getData({ url, reposToScan });

  // todo: sort by name as tie braker
  if (sort === "desc") {
    repos.sort((a, b) => b.stars - a.stars);
  } else if (sort === "asc") {
    repos.sort((a, b) => a.stars - b.stars);
  }

  return { repos, count };
}
