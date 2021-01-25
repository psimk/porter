// register `ts-node` so that `.ts` files from other packages can be imported
require("ts-node").register({ project: require.resolve(`../tsconfig.tools.json`) });

import * as fs from "fs";
import kleur from "kleur";
import * as path from "path";
import type { CommanderStatic } from "commander";

type Program = CommanderStatic["program"];

const appDirectory = fs.realpathSync(process.cwd());
/**
 * will resolve the path relative to the user
 * @param relativePath - path relative to the user
 */
const resolveUser = (relativePath: string) => path.resolve(appDirectory, relativePath);

const isPorterDependency = (dependency: string) =>
  (dependency.startsWith("@porterts") || dependency.startsWith("porter")) &&
  (dependency.endsWith("skeleton") || dependency.endsWith("tools"));

// const parsePorterDependencyType = (dependency: string): "skeleton" | "tools" | null =>
//   isPorterDependency(dependency) ? (dependency.endsWith("skeleton") ? "skeleton" : "tools") : null;

type PackageJSON = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

interface PorterModule {
  name: string;
  decorate?: (program: Program, meta: { name: string }) => void;
}

async function getPorterModules(packageJsonPath: string): Promise<PorterModule[]> {
  const packageJson = (await import(packageJsonPath)) as PackageJSON;

  return Promise.all(
    Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
      .filter(isPorterDependency)
      .map((dependency) =>
        import(`${dependency}/porter.ts`)
          .then((module) => ({ ...module, name: dependency }))
          .catch(() => {
            console.log(
              `${kleur.cyan(`[${dependency}]`)} could not find ${kleur.yellow(`'porter.ts'`)}`
            );
            return { name: dependency };
          })
      )
  );
}

// TODO: update this module to use top-level async/await whenever it's a thing
export async function applyModules(program: Program) {
  const modules = await getPorterModules(resolveUser("package.json")).catch((error) => {
    console.log("An error occurred in retrieving the package.json");
    console.error(error);
    return [];
  });

  for (const { name, decorate } of modules) {
    if (decorate) {
      console.log(`${kleur.cyan(`[${name}]`)} decorating`);
      try {
        // decorate `program` with additional commands provided by the module
        decorate(program, { name });
      } catch (error) {
        console.log(`${kleur.cyan(`[${name}]`)} decorator threw an error`);
        console.error(error);
      }
    }
  }
}
