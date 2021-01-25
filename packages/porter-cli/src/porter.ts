import { program } from "commander";

// version
program
  .version(`porter ${require(`../package.json`).version}`)
  .usage(`<command> [options]`)
  .option("-d, --debug", "enable debug mode");

// new
program
  .command(`new <skeleton-repository> <app-name>`)
  .description(`initialize a new porter project`)
  .action((...args) => require("./newProject").newProject(...args));

// TODO: update this module to use top-level async/await whenever it's a thing

const lastArgument = process.argv[process.argv.length - 1];
// if the last argument is once of the above commands
// then we can skip applying the modules
if (lastArgument.includes("porter-cli") || process.argv.includes("new")) {
  // parse arguments
  program.parse(process.argv);
} else {
  (async () => {
    // will apply porter modules, if there are any
    await require("./applyModules").applyModules(program);

    // parse arguments
    program.parse(process.argv);
  })();
}
