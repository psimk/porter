import fs from "fs";

type Config = {
  entry?: string;
};

type Options = {
  configDir: string;
};

export default function build({ configDir }: Options) {
  let config: Config = (undefined as unknown) as Config;

  try {
    config = JSON.parse(fs.readFileSync(configDir, { encoding: "utf-8" }));
  } catch (error) {
    console.error(`Failed to parse the config file: ${configDir}. Is it properly formatted?`);
  }

  console.log(config);
  // TODO: create a webpack config and run it based on the passed config
}
