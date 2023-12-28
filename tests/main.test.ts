import { expect, test } from "vitest";
import {
  getRepos,
  githubRepoSlugRegex,
  githubUserSlugRegex,
} from "../src/index.js";

test(
  "@ilimic/fetch-github-dependents should return no empty repos",
  async () => {
    const repo = "https://github.com/cheeriojs/cheerio";
    const reposToScan = 2000;
    const sort = "desc";

    // console.log(`Fetching dependents for ${repo} ...`);

    const { repos, count } = await getRepos(
      `${repo}/network/dependents`,
      reposToScan,
      sort
    );

    expect(count).toBeGreaterThan(0);
    expect(repos.length).toBe(reposToScan);

    repos.forEach((repo) => {
      expect(repo.user).not.toBe("");
      expect(repo.user).toMatch(githubUserSlugRegex);
      expect(repo.repo).not.toBe("");
      expect(repo.repo).toMatch(githubRepoSlugRegex);
    });
  },
  5 * 60 * 1000
);
