# @ilimic/fetch-github-dependents

Fetches dependents of a GitHub repository from the dependency graph page, eg. https://github.com/cheeriojs/cheerio/network/dependents

Run `npx @ilimic/fetch-github-dependents https://github.com/cheeriojs/cheerio -m 100`

or

Run `npx @ilimic/fetch-github-dependents cheeriojs/cheerio -m 100`

The above command will fetch the first 100 dependents of the `cheeriojs/cheerio` repository and sort them by the number of stars.

Use `npx @ilimic/fetch-github-dependents --help` for more information.
