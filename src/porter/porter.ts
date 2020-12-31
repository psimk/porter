import meow from "meow";
import create from "../create/create";
import build from "../build/build";

const { input: CLI_INPUT, flags: CLI_FLAGS } = meow(
  `
  Usage:
    $ porter create <variant>   Creates a new porter project
	  $ porter build              Runs example config file to generate default results (will create a ./screenshot folder)

  Options:
    -c, --config                Pass configuration file location default is root

    -h, --help                  Display help
   	-v, --version               Display version

  Examples:
    $ porter create react -c ../porter.json
`,
  {
    flags: {
      help: { alias: "h" },
      version: { alias: "v" },
      config: { type: "string", alias: "c", default: "./porter.json" },
    },
  }
);

const { config } = CLI_FLAGS;
const [command] = CLI_INPUT;

switch (command) {
  case "create": {
    create();
    break;
  }
  case "build": {
    build({ configDir: config });
    break;
  }
  default: {
    console.log(`Please specify one of the following commands: create, build`);
    process.exit(0);
  }
}
