import * as fs from "fs";
import * as path from "path";
import webpack from "webpack";
import devServer from "./devServer";
import type { Command } from "commander";

const appDirectory = fs.realpathSync(process.cwd());
/**
 * will resolve the path relative to the user
 * @param relativePath - path relative to the user
 */
const resolveUser = (relativePath: string) => path.resolve(appDirectory, relativePath);

async function importWebpackConfig(fallbackPorterDependency: string) {
  return import(resolveUser("./webpack.config.ts"))
    .catch(() => {
      console.log(`Unable to import local 'webpack.config.ts'`);

      return import(`${fallbackPorterDependency}/webpack.config.ts`).catch(() => {
        console.log(`Unable to import 'webpack.config.ts' of '${fallbackPorterDependency}'`);
        return { default: {} };
      });
    })
    .then(({ default: d }) => d);
}

export function decorate(program: Command, { name }: { name: string }) {
  // dev
  program
    .command(`dev`)
    .description(`start the development server`)
    .action(async () => {
      process.env.WEBPACK_MODE ??= "development";

      const config = await importWebpackConfig(name);

      devServer(webpack(config));
    });

  // build
  program
    .command(`build [config path]`)
    .description(`build the project`)
    .action(async () => {
      process.env.WEBPACK_MODE ??= "production";

      const config = await importWebpackConfig(name);

      new Promise<string | undefined>((resolve, reject) =>
        webpack(config, (error, stats) => {
          if (error) {
            return reject(error);
          }

          if (stats?.hasErrors()) {
            return reject(stats.toJson()?.errors);
          }

          return resolve(stats?.toString());
        })
      )
        .then(() => {
          console.log(`Finished bundling`);
        })
        .catch((error) => {
          console.error(`Bundling failed`);
          console.error(error);
        });
    });
}
