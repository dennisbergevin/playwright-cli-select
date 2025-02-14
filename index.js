#!/usr/bin/env node

const { execSync, spawn } = require("child_process");
const Fuse = require("fuse.js");
const pc = require("picocolors");
const fs = require("fs");
const path = require("path");
const os = require("os");
const yarg = require("yargs");
const { select } = require("inquirer-select-pro");

function iterateObject(
  obj,
  baseArr,
  continuedArr,
  tagArr,
  baseTagArr,
  fileName
) {
  if (obj.specs) {
    obj.specs.forEach((spec) => {
      let newerarr = [...continuedArr, spec.title];
      const testObj = {
        title: newerarr,
        tags: spec.tags,
        line: `${fileName}:${spec.line}`,
      };
      tagArr.push(spec.tags);
      baseTagArr.push(tagArr);
      baseArr.push(testObj);
    });
  }

  if (obj.suites) {
    obj.suites.forEach((suite) => {
      let evenNewerArr = [...continuedArr, suite.title];
      const suiteObj = {
        title: evenNewerArr,
        line: `${fileName}:${suite.line}`,
      };
      baseArr.push(suiteObj);
      iterateObject(suite, baseArr, evenNewerArr, tagArr, baseTagArr, fileName);
    });
  }
}

// Used to remove a process argument before executing Cypress run
function findAndRemoveArgv(arg) {
  const argToRemove = arg;
  const index = process.argv.indexOf(argToRemove);
  if (index > -1) {
    process.argv.splice(index, 1); // Remove the argument
  }
}

async function getTests() {
  if (process.argv.includes("--submit-focused")) {
    findAndRemoveArgv("--submit-focused");
    process.env.SUBMIT_FOCUSED = true;
  }

  if (process.argv.includes("--titles")) {
    findAndRemoveArgv("--titles");
    process.env.TEST_TITLES = true;
  }

  if (process.argv.includes("--specs")) {
    findAndRemoveArgv("--specs");
    process.env.TEST_SPECS = true;
  }

  if (process.argv.includes("--tags")) {
    findAndRemoveArgv("--tags");
    process.env.TEST_TAGS = true;
  }

  if (process.argv.includes("--json-data-path")) {
    const index = process.argv.indexOf("--json-data-path");
    process.env.JSON_TEST_DATA = await fs.promises.readFile(
      `${process.argv[index + 1]}`,
      "utf8"
    );
    findAndRemoveArgv(process.argv[index + 1]);
    findAndRemoveArgv("--json-data-path");
  }

  process.argv.forEach((arg, index) => {
    if (arg.includes("--reporter=")) {
      process.env.TEST_REPORTER_TYPE = process.argv[index];
      findAndRemoveArgv(process.argv[index]);
    }
  });

  // collect all arguments passed to command
  // remove the 'run'
  if (process.argv.includes("--reporter")) {
    const index = process.argv.indexOf("--reporter");
    process.env.TEST_REPORTER_TYPE = `--reporter ${process.argv[index + 1]}`;
    findAndRemoveArgv(process.argv[index + 1]);
    findAndRemoveArgv("--reporter");
  }

  let args = process.argv.slice(2);
  args.shift();
  console.log(args);

  // add arguments to test list command
  let getTestCommand = `npx playwright test --list --reporter=json ${args.join(" ").toString()}`;

  if (!process.env.JSON_TEST_DATA) {
    try {
      process.env.JSON_TEST_DATA = execSync(getTestCommand, {
        encoding: "utf-8",
        stdio: "pipe",
      });
    } catch (e) {
      if (e.stdout.includes("Error: No tests found")) {
        console.log("\n");
        console.log(pc.redBright(pc.bold("Error: No tests found")));
        process.exit();
      } else {
        console.log(e);
        process.exit();
      }
    }
  }

  const testJSON = JSON.parse(process.env.JSON_TEST_DATA);
  const baseArr = [];
  const baseTagArr = [];
  const tagArr = [];
  let fileArr = [];
  let newarr = [];
  let grepString = "";

  testJSON.suites.forEach((suite) => {
    const singleTests = suite.specs;
    const fileName = suite.file;
    fileArr.push(fileName);

    singleTests.forEach((test) => {
      newarr = [suite.file, test.title];
      const testObj = {
        title: newarr,
        tags: test.tags,
        line: `${suite.file}:${test.line}`,
      };
      baseArr.push(testObj);
      tagArr.push(test.tags);
      baseTagArr.push(tagArr);
    });

    if (suite.suites) {
      suite.suites.forEach((nextSuite) => {
        newarr = [suite.file, nextSuite.title];
        const suiteObj = {
          title: newarr,
          line: `${suite.file}:${nextSuite.line}`,
        };
        baseArr.push(suiteObj);
        tagArr.push(nextSuite.tags);
        baseTagArr.push(tagArr);

        iterateObject(nextSuite, baseArr, newarr, tagArr, baseTagArr, fileName);
      });
    }
  });
  const flatTagArr = baseTagArr.flat();
  const uniqueTestArray = [];
  const uniqueTagArray = [];
  function hasDuplicateArrays(arr, newArr, isTag) {
    const seen = new Set();
    const array = isTag ? arr.flat() : arr;
    for (const subArray of array) {
      if (isTag) {
        const stringified = JSON.stringify(subArray);
        if (
          !seen.has(stringified) &&
          stringified !== undefined &&
          stringified !== "" &&
          stringified !== "[]"
        ) {
          newArr.push(subArray);
        }
        seen.add(stringified);
      } else {
        const stringified = JSON.stringify(subArray);
        if (!seen.has(stringified)) {
          newArr.push(subArray);
        }
        seen.add(stringified);
      }
    }
    return newArr;
  }

  // Playwright-cli-select title
  console.log("\n");
  console.log(pc.bold(`🎭 Playwright-cli-select `));
  console.log("\n");

  try {
    // help menu options
    yarg
      .completion("--specs", false)
      .option("specs", {
        desc: "Skips to spec selection prompt",
        type: "boolean",
      })
      .example("npx playwright-cli-select run --specs");

    yarg
      .completion("--titles", false)
      .option("titles", {
        desc: "Skips to test title selection prompt",
        type: "boolean",
      })
      .example("npx playwright-cli-select run --titles");

    yarg
      .completion("--tags", false)
      .option("tags", {
        desc: "Skips to tag selection prompt",
        type: "boolean",
      })
      .example("npx playwright-cli-select run --tags");

    yarg
      .completion("--json-data-path", false)
      .option("json-data-path", {
        desc: "Optional path of file housing output of \n`npx playwright test --list --reporter=json`",
        type: "string",
      })
      .example(
        "npx playwright-cli-select run --json-data-path data/sample-test-list.json"
      );

    yarg
      .completion("--submit-focused", false)
      .option("submit-focused", {
        desc: "Selects and submits focused item using enter",
        type: "boolean",
      })
      .example("npx playwright-cli-select run --submit-focused");

    yarg
      .scriptName("npx playwright-cli-select run")
      .usage(
        "\nInteractive cli prompts to select Playwright specs, tests or tags run\n"
      )
      .usage("$0 [args]")
      .example("npx playwright-cli-select run --project=firefox")
      .help().argv;

    if (
      !process.env.TEST_TITLES &&
      !process.env.TEST_SPECS &&
      !process.env.TEST_TAGS
    ) {
      const specAndTestPrompt = await select({
        message: "Choose to filter by specs, specific test titles or tags: ",
        multiple: true,
        clearInputWhenSelected: true,
        selectFocusedOnSubmit: process.env.SUBMIT_FOCUSED,
        canToggleAll: true,
        options: [
          {
            name: "Specs",
            value: "Specs",
          },
          {
            name: "Test titles",
            value: "Test titles",
          },
          {
            name: "Tags",
            value: "Tags",
          },
        ],
        required: true,
      });
      if (specAndTestPrompt.includes("Specs")) {
        process.env.TEST_SPECS = true;
      }
      if (specAndTestPrompt.includes("Test titles")) {
        process.env.TEST_TITLES = true;
      }
      if (specAndTestPrompt.includes("Tags")) {
        process.env.TEST_TAGS = true;
      }
    }

    if (process.env.TEST_SPECS) {
      if (fileArr.length > 0) {
        function specsChoices() {
          let arr = [];
          fileArr.forEach((element) => {
            const spec = {
              name: element,
              value: element,
            };
            arr.push(spec);
          });
          return arr;
        }

        const specSelections = await select({
          message: "Select specs to run:",
          multiple: true,
          required: true,
          clearInputWhenSelected: true,
          selectFocusedOnSubmit: process.env.SUBMIT_FOCUSED,
          canToggleAll: true,
          options: (input = "") => {
            const specs = specsChoices();

            const fuse = new Fuse(specs, {
              keys: ["value"],
            });

            if (!input) return specs;
            if (fuse) {
              const result = fuse.search(input).map(({ item }) => item);
              return result;
            }
            return [];
          },
        });
        specSelections.forEach((spec) => {
          grepString += `${spec} `;
        });
      }
    }

    if (process.env.TEST_TITLES) {
      const uniqueArray = [
        ...new Set(baseArr.map((obj) => JSON.stringify(obj))),
      ].map((str) => JSON.parse(str));

      if (uniqueArray.length > 0) {
        const testChoices = () => {
          let arr = [];
          uniqueArray.forEach((element) => {
            const choices = {
              name: element.title.join(" › "),
              value: element.line,
            };
            arr.push(choices);
          });
          return arr;
        };
        const selectedTests = await select({
          message: "Select tests to run:",
          multiple: true,
          clearInputWhenSelected: true,
          selectFocusedOnSubmit: process.env.SUBMIT_FOCUSED,
          required: true,
          options: (input = "") => {
            const tests = testChoices();

            const fuse = new Fuse(tests, {
              keys: ["name"],
              ignoreLocation: true,
            });

            if (!input) return tests;
            if (fuse) {
              const result = fuse.search(input).map(({ item }) => item);
              return result;
            }
            return [];
          },
        });
        selectedTests.forEach((test) => {
          grepString += `${test} `;
        });
      }
    }

    if (process.env.TEST_TAGS) {
      const tags = hasDuplicateArrays(flatTagArr, uniqueTagArray, true);
      const uniqueArray = [
        ...new Set(baseArr.map((obj) => JSON.stringify(obj))),
      ].map((str) => JSON.parse(str));
      const tagArr = [];

      tags.forEach((tag) => {
        const testLines = [];
        uniqueArray.forEach((obj) => {
          if (obj.tags?.includes(tag)) {
            testLines.push(obj.line);
          }
        });
        tagArr.push({
          name: tag,
          value: testLines.join(" "),
        });
      });
      if (tags.length > 0) {
        // sort the tags presented
        tagArr.sort();

        const selectedTags = await select({
          message: "Select tags to run:",
          multiple: true,
          clearInputWhenSelected: true,
          selectFocusedOnSubmit: process.env.SUBMIT_FOCUSED,
          required: true,
          options: (input = "") => {
            const tags = tagArr;

            const fuse = new Fuse(tags, {
              keys: ["name"],
            });

            if (!input) return tags;
            if (fuse) {
              const result = fuse.search(input).map(({ item }) => item);
              return result;
            }
            return [];
          },
        });
        selectedTags.forEach((tag) => {
          grepString += `${tag} `;
        });
      }
    }
  } catch (e) {
    // if user closes prompt send a error message instead of inquirer.js error
    if (e.message.includes("User force closed the prompt")) {
      console.log("\n");
      console.log(pc.redBright(pc.bold("The prompt was closed")));
      process.exit();
    } else {
      console.log(e);
      process.exit();
    }
  }

  // remove the last " " from the grep string
  const newGrepString = grepString.slice(0, -1);
  args.unshift(`${newGrepString}`);
  args.push(process.env.TEST_REPORTER_TYPE);
  console.log();
  console.log("Arguments: ");
  console.log();
  console.log(args);
  console.log();

  spawn("npx playwright test", args, {
    shell: true,
    stdio: "inherit",
  });
}

getTests();
