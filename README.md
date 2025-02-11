 <h2 align=center>🎭 Playwright cli-select</h2>
<p align="center">
</p>

<p align="center">
Playwright interactive cli prompts to select and run specs, tests or tags.
</p>

<img src="./assets/run-test.gif" alt="playwright-cli-select run demo" loop=infinite>

## Features

- ❓ New interactive CLI prompts to select and run specs, tests or tags
- 🎭 A new `playwright test` command to allow user to pass desired arguments

#### Table of Contents

- [Installation](#installation)
- [Run mode](#run-mode)
  - [Keyboard controls](#keyboard-controls)
- [Help mode](#help-mode)
- [Submit focused](#submit-focused)
- [Optional path to test list json](#optional-path-to-test-list-json)
- [Using a custom playwright config file](#using-a-custom-playwright-config-file)
- [Setting up a `npm` script](#setting-up-a-npm-script)
- [Contributions](#contributions)

---

## Installation

1. Install the following package:

```sh
npm install --save-dev playwright-cli-select
```

---

## Run mode

Run the following command:

```bash
npx playwright-cli-select run
```

If you want to skip straight to selecting specs, titles and/or tags:

```bash
npx playwright-cli-select run --specs
# skips straight to spec selection

npx playwright-cli-select run --titles
# skips to test title selection

npx playwright-cli-select run --tags
# skips to tag selection

npx playwright-cli-select run --titles --tags
# skips to test title selection, followed by tag selection
```

<img src="./assets/run-flags.gif" alt="playwright-cli-select run --specs --titles --tags demo" loop=infinite>

Any combination of `--specs`, `--titles` and/or `--tags` parameters is permitted.

You can also include more cli arguments similar to `npx playwright test`:

```bash
npx playwright-cli-select run --project=firefox --ui
# any selections will open in Playwright UI mode
```

### Keyboard controls

|              Keys              |             Action              |
| :----------------------------: | :-----------------------------: |
|         <kbd>Up</kbd>          | Move to selection above current |
|        <kbd>Down</kbd>         | Move to selection below current |
|         <kbd>Tab</kbd>         |         Select current          |
| <kbd>Ctrl</kbd> + <kbd>a</kbd> |           Select all            |
|      <kbd>Backspace</kbd>      |        Remove selection         |
|        <kbd>Enter</kbd>        |             Proceed             |
| <kbd>Ctrl</kbd> + <kbd>c</kbd> |              Exit               |

**Note**: You can also filter choices displayed in list by typing

---

## Help mode

To open the cli help menu, pass the `--help` flag:

```bash
npx playwright-cli-select run --help
```

<img src="./assets/run-help.gif" alt="playwright-cli-select help menu demo" loop=infinite>

---

## Submit focused

When no other options are already selected, automatically select the currently focused option with <kbd>Enter</kbd>.

To enable this feature, pass the following flag:

```bash
npx playwright-cli-select run --submit-focused
```

---

## Optional path to test list json

This package uses the `npx playwright test --list --reporter=json` command to gather information about Playwright tests.

If you prefer or already house the data from this command in a file, pass the path to the file via the `--json-data-path` parameter:

```bash
npx playwright-cli-select run --json-data-path data/sample-test-list.json
```

---

## Using a custom playwright config file

If you want to use a custom Playwright config, pass it via the `-c` or `--config` flag:

```bash
npx playwright-cli-select run --config playwright.staging.config.js

# Or

npx playwright-cli-select run -c playwright.dev.config.js
```

---

## Setting up a `npm` script

For convenience, you may desire to house the `npx` command within an npm script in your project's `package.json`, including any desired cli arguments:

```json
  "scripts": {
    "pw:select": "npx playwright-cli-select run --project=firefox"
  }
```

---

## Contributions

Feel free to open a pull request or drop any feature request or bug in the [issues](https://github.com/dennisbergevin/playwright-cli-select/issues).

Please see more details in the [contributing doc](./CONTRIBUTING.md).
