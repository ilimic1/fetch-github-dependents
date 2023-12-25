import axios from "axios";
import { load } from "cheerio";

class Repo {
  constructor(
    public readonly user: string,
    public readonly repo: string,
    public readonly stars: number
  ) {}

  public getUrl() {
    return `https://github.com/${this.user}/${this.repo}`;
  }
}

async function getRepos_(url: string, reposToScan?: number): Promise<Repo[]> {
  const repos: Repo[] = [];
  let repoCount: number = undefined;

  do {
    let data: string;

    try {
      const request = await axios.get(url, {});
      data = await request.data;
    } catch (error) {
      if (error.response) {
        console.log("Error response status", error.response.status);
      }
      console.log("Error", error.message);
      return repos;
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
        return repos;
      }
    }

    const nextLink = $(
      '.paginate-container .btn.BtnGroup-item:contains("Next")'
    ).eq(0);
    url = nextLink.length ? nextLink.attr("href") : null;
    console.log(`Went through ${repos.length}/${repoCount} repos...`);
  } while (url);

  return repos;
}

export async function getRepos(
  url: string,
  reposToScan: number = undefined,
  sort: undefined | "asc" | "desc"
): Promise<Repo[]> {
  const repos = await getRepos_(url, reposToScan);

  // todo: sort by name as tie braker
  if (sort === "desc") {
    repos.sort((a, b) => b.stars - a.stars);
  } else if (sort === "asc") {
    repos.sort((a, b) => a.stars - b.stars);
  }

  return repos;
}
