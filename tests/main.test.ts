import { expect, test } from "vitest";
import {
  getRepos,
  githubRepoSlugRegex,
  githubUserSlugRegex,
} from "../src/index.js";

test(
  "Test a repo with no dependents",
  async () => {
    const repo = "https://github.com/ilimic1/fetch-github-dependents-test";
    const reposToScan = 100;
    const sort = "desc";

    // console.log(`Fetching dependents for ${repo} ...`);

    const { repos, count } = await getRepos(
      `${repo}/network/dependents`,
      reposToScan,
      sort
    );

    expect(count).toBe(0);
    expect(repos.length).toBe(0);
  },
  1 * 60 * 1000
);

test(
  "Test a repo with at least one known dependent",
  async () => {
    const repo = "https://github.com/ilimic1/fetch-github-dependents";
    const reposToScan = 100;
    const sort = "desc";

    // console.log(`Fetching dependents for ${repo} ...`);

    const { repos, count } = await getRepos(
      `${repo}/network/dependents`,
      reposToScan,
      sort
    );

    expect(count).toBeGreaterThanOrEqual(1);
    expect(repos.length).toBeGreaterThanOrEqual(1);

    const dependentRepo = repos.find(
      (repo) =>
        repo.getUrl() ===
        "https://github.com/ilimic1/fetch-github-dependents-test"
    );

    expect(dependentRepo).toBeDefined();
    expect(dependentRepo.user).toBe("ilimic1");
    expect(dependentRepo.repo).toBe("fetch-github-dependents-test");
    expect(dependentRepo.getUrl()).toBe(
      "https://github.com/ilimic1/fetch-github-dependents-test"
    );
    expect(dependentRepo.stars).toBeGreaterThanOrEqual(1);
  },
  1 * 60 * 1000
);

test(
  "Test should return no empty repos",
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
