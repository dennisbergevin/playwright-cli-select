#!/usr/bin/env node

const { execSync, spawn } = require("child_process");
const Fuse = require("fuse.js");
const pc = require("picocolors");
const { select } = require("inquirer-select-pro");

function iterateObject(obj, baseArr, continuedArr, tagArr, baseTagArr) {
  if (obj.specs) {
    obj.specs.forEach((spec) => {
      let newerarr = [...continuedArr, spec.title];
      tagArr.push(spec.tags);
      baseTagArr.push(tagArr);
      baseArr.push(newerarr);
    });
  }

  if (obj.suites) {
    obj.suites.forEach((suite) => {
      let evenNewerArr = [...continuedArr, suite.title];
      iterateObject(suite, baseArr, evenNewerArr, tagArr, baseTagArr);
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
  let getTestCommand = "npx playwright test --list --reporter=json";

  if (process.argv.includes("-c")) {
    const index = process.argv.indexOf("-c");
    getTestCommand += ` -c ${process.argv[index + 1]}`;
  }

  if (process.argv.includes("--config")) {
    const index = process.argv.indexOf("--config");
    getTestCommand += ` --config ${process.argv[index + 1]}`;
  }

  if (process.argv.includes("--project")) {
    const index = process.argv.indexOf("--project");
    getTestCommand += ` --project ${process.argv[index + 1]}`;
  }

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

  const alltests = execSync(getTestCommand, {
    encoding: "utf-8",
    stdio: "pipe",
  });

  const testJSON = JSON.parse(alltests);
  const baseArr = [];
  const baseTagArr = [];
  const tagArr = [];
  const fileArr = [];
  let grepString = "";

  testJSON.suites.forEach((suite) => {
    const singleTests = suite.specs;
    fileArr.push(suite.file);

    singleTests.forEach((test) => {
      let newarr = [suite.file, test.title];
      tagArr.push(test.tags);
      baseTagArr.push(tagArr);
      baseArr.push(newarr);
    });

    suite.suites.forEach((nextSuite) => {
      let newarr = [suite.file, nextSuite.title];
      baseArr.push(newarr);
      tagArr.push(nextSuite.tags);
      baseTagArr.push(tagArr);

      iterateObject(nextSuite, baseArr, newarr, tagArr, baseTagArr);
    });
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
      grepString += `${spec}|`;
    });
  }

  if (process.env.TEST_TITLES) {
    const tests = hasDuplicateArrays(baseArr, uniqueTestArray, false);

    if (tests.length > 0) {
      const testChoices = () => {
        let arr = [];
        tests.forEach((element) => {
          const choices = {
            name: element.flat().join(" › "),
            value: element.flat().join(" "),
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
        grepString += `${test}|`;
      });
    }
  }

  if (process.env.TEST_TAGS) {
    const tags = hasDuplicateArrays(flatTagArr, uniqueTagArray, true);

    if (tags.length > 0) {
      // sort the tags presented
      tags.sort();

      const separateStringJson = () => {
        let arr = [];
        tags.forEach((element) => {
          const choices = {
            name: element,
            value: element,
          };
          arr.push(choices);
        });
        return arr;
      };

      const selectedTags = await select({
        message: "Select tags to run:",
        multiple: true,
        clearInputWhenSelected: true,
        selectFocusedOnSubmit: process.env.SUBMIT_FOCUSED,
        required: true,
        options: (input = "") => {
          const tags = separateStringJson();

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
        grepString += `@${tag}|`;
      });
    }
  }

  const newGrepString = grepString.slice(0, -1);

  let args = process.argv.slice(2);
  // remove the 'run'
  args.shift();
  args.push("--grep");
  args.push(`"${newGrepString}"`);
  console.log(args);
  console.log();
  console.log(`npx playwright test --grep ${newGrepString}`);

  spawn("npx playwright test", args, {
    shell: true,
    stdio: "inherit",
  });
}

getTests();
