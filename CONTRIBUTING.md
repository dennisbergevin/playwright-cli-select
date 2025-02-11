# Contributing

Thanks for being willing to contribute!

**Working on your first Pull Request?** You can learn more from [Your First Pull Request on GitHub](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)

## Project setup

1. Fork and clone the repo
2. Run `npm install` to install dependencies
3. Create a branch for your PR with `git checkout -b pr/your-branch-name`

> Tip: Keep your `main` branch pointing at the original repository and make
> pull requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream https://github.com/dennisbergevin/playwright-cli-select
> git fetch upstream
> git branch --set-upstream-to=upstream/main main
> ```
>
> This will add the original repository as a "remote" called "upstream," Then
> fetch the git information from that remote, then set your local `main`
> branch to use the upstream main branch whenever you run `git pull`. Then you
> can make all of your pull request branches based on this `main` branch.
> Whenever you want to update your version of `main`, do a regular `git pull`.

## Committing and Pushing changes

1. Run Jest tests via the `npm test` command

2. Run `npx playwright-cli-select run` to inspect behavior before you commit your changes

## Help needed

Please checkout the [the open issues](https://github.com/dennisbergevin/playwright-cli-select/issues)

Also, please watch the repo and respond to questions/bug reports/feature
requests! Thanks!
