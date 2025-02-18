const { describe, it, expect } = require("@jest/globals");
const { render } = require("cli-testing-library");
const { resolve } = require("path");
require("cli-testing-library/extend-expect");
const data = require("./data/default.json");

describe("basic input prompt flows", () => {
  it("handles spec select", async () => {
    const { findByText, userEvent } = await render("cd ../../../ && node", [
      resolve(__dirname, "../index.js"),
      ["--submit-focused"],
      ["--json-data-path"],
      [resolve(__dirname, "./data/default.json")],
    ]);

    expect(
      await findByText(
        "Choose to filter by specs, specific test titles or tags"
      )
    ).toBeInTheConsole();

    expect(await findByText("Specs")).toBeInTheConsole();
    expect(await findByText("Test titles")).toBeInTheConsole();
    expect(await findByText("Tags")).toBeInTheConsole();

    userEvent.keyboard("[Enter]");

    expect(await findByText("Select specs to run")).toBeInTheConsole();
    expect(await findByText("firstDir/another.spec.js")).toBeInTheConsole();
    expect(await findByText("secondDir/example.spec.js")).toBeInTheConsole();

    userEvent.keyboard("[Enter]");

    expect(await findByText("Arguments:")).toBeInTheConsole();
  });

  it("handles test title select", async () => {
    const { findByText, userEvent } = await render("cd ../../../ && node", [
      resolve(__dirname, "../index.js"),
      ["--submit-focused"],
      ["--json-data-path"],
      [resolve(__dirname, "./data/default.json")],
    ]);

    expect(
      await findByText(
        "Choose to filter by specs, specific test titles or tags"
      )
    ).toBeInTheConsole();

    expect(await findByText("Specs")).toBeInTheConsole();
    expect(await findByText("Test titles")).toBeInTheConsole();
    expect(await findByText("Tags")).toBeInTheConsole();

    userEvent.keyboard("[ArrowDown]");
    userEvent.keyboard("[Enter]");

    expect(await findByText("Select tests to run")).toBeInTheConsole();
    expect(
      await findByText("firstDir/another.spec.js › New tests @new")
    ).toBeInTheConsole();

    userEvent.keyboard("[Enter]");
    expect(await findByText("Arguments")).toBeInTheConsole();
  });

  it("handles tag select", async () => {
    const { findByText, userEvent } = await render("cd ../../../ && node", [
      resolve(__dirname, "../index.js"),
      ["--submit-focused"],
      ["--json-data-path"],
      [resolve(__dirname, "./data/default.json")],
    ]);

    expect(
      await findByText(
        "Choose to filter by specs, specific test titles or tags"
      )
    ).toBeInTheConsole();

    expect(await findByText("Specs")).toBeInTheConsole();
    expect(await findByText("Test titles")).toBeInTheConsole();
    expect(await findByText("Tags")).toBeInTheConsole();

    userEvent.keyboard("[ArrowDown]");
    userEvent.keyboard("[ArrowDown]");
    userEvent.keyboard("[Enter]");

    expect(await findByText("Select tags to run")).toBeInTheConsole();
    expect(await findByText("deeply-nested")).toBeInTheConsole();

    userEvent.keyboard("[Enter]");
    expect(await findByText("Arguments:")).toBeInTheConsole();
  });

  it("--spec flag starts at spec selection", async () => {
    const { findByText, userEvent } = await render("cd ../../../ && node", [
      resolve(__dirname, "../index.js"),
      ["--submit-focused"],
      ["--json-data-path"],
      [resolve(__dirname, "./data/default.json")],
      ["--specs"],
    ]);

    expect(await findByText("Select specs to run")).toBeInTheConsole();
    expect(await findByText("firstDir/another.spec.js")).toBeInTheConsole();
  });

  it("--titles flag starts at test title selection", async () => {
    const { findByText, userEvent } = await render("cd ../../../ && node", [
      resolve(__dirname, "../index.js"),
      ["--submit-focused"],
      ["--json-data-path"],
      [resolve(__dirname, "./data/default.json")],
      ["--titles"],
    ]);

    expect(await findByText("Select tests to run")).toBeInTheConsole();
    expect(
      await findByText("firstDir/another.spec.js › New tests @new")
    ).toBeInTheConsole();
  });

  it("--tags flag starts at tag selection", async () => {
    const { findByText, userEvent } = await render("cd ../../../ && node", [
      resolve(__dirname, "../index.js"),
      ["--submit-focused"],
      ["--json-data-path"],
      [resolve(__dirname, "./data/default.json")],
      ["--tags"],
    ]);

    expect(await findByText("Select tags to run")).toBeInTheConsole();
    expect(await findByText("deeply-nested")).toBeInTheConsole();
  });
});

describe("handles prompt searching", () => {
  it("handles searching", async () => {
    const { findByText, userEvent } = await render("cd ../../../ && node", [
      resolve(__dirname, "../index.js"),
      ["--submit-focused"],
      ["--json-data-path"],
      [resolve(__dirname, "./data/default.json")],
    ]);

    expect(
      await findByText(
        "Choose to filter by specs, specific test titles or tags"
      )
    ).toBeInTheConsole();

    expect(await findByText("Specs")).toBeInTheConsole();
    expect(await findByText("Test titles")).toBeInTheConsole();
    expect(await findByText("Tags")).toBeInTheConsole();

    userEvent.keyboard("[Enter]");

    expect(await findByText("Select specs to run")).toBeInTheConsole();
    expect(await findByText("firstDir/another.spec.js")).toBeInTheConsole();
    expect(await findByText("secondDir/example.spec.js")).toBeInTheConsole();

    await userEvent.keyboard("firstDir[Enter]", { delay: 300 });

    expect(await findByText("firstDir/another.spec.js")).toBeInTheConsole();

    expect(await findByText("Arguments:")).toBeInTheConsole();
  });
});

describe("accepts custom config", () => {
  it("specs: passing --config reads testDir", async () => {
    const { findByText, queryByText, userEvent } = await render(
      "cd ../../../ && node",
      [
        resolve(__dirname, "../index.js"),
        ["--submit-focused"],
        ["--config"],
        ["playwright.dev.config.js"],
        ["--json-data-path"],
        [resolve(__dirname, "./data/custom.json")],
      ]
    );

    expect(
      await findByText(
        "Choose to filter by specs, specific test titles or tags"
      )
    ).toBeInTheConsole();

    expect(await findByText("Specs")).toBeInTheConsole();
    expect(await findByText("Test titles")).toBeInTheConsole();
    expect(await findByText("Tags")).toBeInTheConsole();

    userEvent.keyboard("[Enter]");

    expect(await findByText("Select specs to run")).toBeInTheConsole();
    expect(await findByText("example.spec.js")).toBeInTheConsole();
    expect(await queryByText("another.spec.js")).not.toBeInTheConsole();

    userEvent.keyboard("[Enter]");

    expect(await findByText("Arguments:")).toBeInTheConsole();
  });

  it("titles: passing --config reads testDir", async () => {
    const { findByText, queryByText, userEvent } = await render(
      "cd ../../../ && node",
      [
        resolve(__dirname, "../index.js"),
        ["--submit-focused"],
        ["--config"],
        ["playwright.dev.config.js"],
        ["--json-data-path"],
        [resolve(__dirname, "./data/custom.json")],
      ]
    );

    expect(
      await findByText(
        "Choose to filter by specs, specific test titles or tags"
      )
    ).toBeInTheConsole();

    expect(await findByText("Specs")).toBeInTheConsole();
    expect(await findByText("Test titles")).toBeInTheConsole();
    expect(await findByText("Tags")).toBeInTheConsole();

    userEvent.keyboard("[ArrowDown]");
    userEvent.keyboard("[Enter]");

    expect(await findByText("Select tests to run")).toBeInTheConsole();
    expect(
      await findByText("example.spec.js › outside test")
    ).toBeInTheConsole();

    expect(await queryByText("another.spec.js")).not.toBeInTheConsole();

    userEvent.keyboard("[Enter]");

    expect(await findByText("Arguments:")).toBeInTheConsole();
  });

  it("tags: passing --config reads testDir", async () => {
    const { findByText, queryByText, userEvent } = await render(
      "cd ../../../ && node",
      [
        resolve(__dirname, "../index.js"),
        ["--submit-focused"],
        ["--config"],
        ["playwright.dev.config.js"],
        ["--json-data-path"],
        [resolve(__dirname, "./data/custom.json")],
      ]
    );

    expect(
      await findByText(
        "Choose to filter by specs, specific test titles or tags"
      )
    ).toBeInTheConsole();

    expect(await findByText("Specs")).toBeInTheConsole();
    expect(await findByText("Test titles")).toBeInTheConsole();
    expect(await findByText("Tags")).toBeInTheConsole();

    userEvent.keyboard("[ArrowDown]");
    userEvent.keyboard("[ArrowDown]");
    userEvent.keyboard("[Enter]");

    expect(await findByText("Select tags to run")).toBeInTheConsole();
    expect(await findByText("nested")).toBeInTheConsole();

    expect(await queryByText("deeply-nested")).not.toBeInTheConsole();

    userEvent.keyboard("[Enter]");

    expect(await findByText("Arguments:")).toBeInTheConsole();
  });
});
