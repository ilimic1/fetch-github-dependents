#!/bin/env node

import { Command, InvalidArgumentError, Option } from "commander";
import { trimEnd } from "lodash-es";
import { version } from "../package.json";
import { getRepos, githubRepoSlugRegex, githubUserSlugRegex } from "./index.js";

const program = new Command();

program
  .name("github-dependents")
  .description("CLI to fetch GitHub dependents and sort by stars.")
  .version(version);

program
  .command("fetch", { isDefault: true })
  .description("Fetch dependents from GitHub")
  .argument(
    "<repo>",
    "repo url, eg. https://github.com/ilimic1/github-dependents",
    (value) => {
      const urlRegex =
        /^(?:https?\:\/\/)github.com\/[A-Za-z0-9-]+\/[A-Za-z0-9-]+\/?/i;

      if (urlRegex.test(value)) {
        return trimEnd(value, "/");
      }

      const [user, repo] = value.split("/");

      if (githubUserSlugRegex.test(user) && githubRepoSlugRegex.test(repo)) {
        return `https://github.com/${value}`;
      }

      throw new InvalidArgumentError(
        "Repo must be a valid HTTP GitHub repo URL or a user/repo string."
      );
    }
  )
  .option(
    "-m, --max <count>",
    "maximum number of repos to scan/return, eg. 300",
    (value) => {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        throw new InvalidArgumentError("Count must be a number.");
      }
      return parsedValue;
    }
  )
  .addOption(
    new Option("-s, --sort <direction>", "optionally sort by stars")
      .choices(["asc", "desc"])
      .default("desc")
  )
  .option("--no-sort", "disable default sorting by stars")
  .action(async (repo, options) => {
    console.log(`Fetching dependents for ${repo} ...`);

    const max = options.max ? parseInt(options.max) : undefined;

    let sort: undefined | "asc" | "desc";

    if (options.sort === "desc") {
      sort = "desc";
    } else if (options.sort === "asc") {
      sort = "asc";
    } else {
      // if --no-sort is passed sort will be false
      sort = undefined;
    }

    const { repos } = await getRepos({
      url: `${repo}/network/dependents`,
      reposToScan: max,
      sort,
    });

    repos.forEach((repo) => {
      console.log(`${repo.getUrl()} ${repo.stars}`);
    });
  });

program.parse();
