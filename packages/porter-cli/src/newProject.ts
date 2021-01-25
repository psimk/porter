import https from "https";
import path from "path";
import fs from "fs";
import tar from "tar";
import mkdirp from "mkdirp";
import url from "url";
import validatePackageName from "validate-npm-package-name";
import kleur from "kleur";

function validateProjectName(projectName: string) {
  const { validForNewPackages, errors, warnings } = validatePackageName(projectName);
  if (!validForNewPackages) {
    throw [...(errors ?? []), ...(warnings ?? [])];
  }
}

async function download(url: string, filePath: string) {
  await new Promise((resolve, reject) =>
    https
      .get(url, (response) => {
        const { statusCode: code = 400, statusMessage: message, headers } = response;

        if (code >= 400)
          // handle errors
          return reject({ code, message });
        else if (code >= 300)
          // handle redirects
          return download(headers.location!, filePath).then(resolve);

        // pipe response into storage and then resolve
        response.pipe(fs.createWriteStream(filePath)).on("finish", resolve).on("error", reject);
      })
      .on("error", reject)
  );
}
export async function newProject(skeleton: string, projectPath: string) {
  // this will make sure that the path doesn't contain any useless jargon
  projectPath = path.normalize(projectPath);

  // the downloaded tar files path

  console.log("normalized path:", projectPath);

  const projectName = path.basename(projectPath);

  console.log("project name:", projectName);

  // validate project name
  try {
    validateProjectName(projectName);
  } catch (error) {
    console.error(kleur.red(`${kleur.green(`"${projectName}"`)} is not a valid NPM package name:`));
    console.log();
    Array.from(error).forEach((error) => console.error(kleur.red(`- ${error}\n`)));

    process.exit(1);
  }

  // the downloaded tar files path
  const tarPath = `${projectPath}.tar.gz`;

  console.log("tar path", tarPath);

  try {
    // create the project's directory
    mkdirp.sync(path.dirname(projectPath));

    // download the skeleton
    await download("https://github.com/vutran/zel/archive/v0.1.0.tar.gz", tarPath);
    console.log("done fetching", skeleton, "with", tarPath);
  } catch (error) {
    // delete the created directory
    fs.unlinkSync(projectPath);

    console.error("error fetching", skeleton);
    console.error(error);

    process.exit(1);
  }

  console.log("extracting", skeleton);

  const target = path.join(process.cwd(), projectPath);

  if (!fs.existsSync(target)) {
    mkdirp.sync(target);
  }

  try {
    await tar.extract({ file: tarPath, cwd: target, strip: 1 });
    console.log("done extracting", skeleton, "to", target);
  } catch (error) {
    console.error("failed extracting", skeleton);
    console.error(error);

    process.exit(1);
  }
}
