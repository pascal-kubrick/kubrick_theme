import glob from "fast-glob";
import fs from "fs";
import YAML from "yaml";

// create an array of all the *.component.yml in /components

const ymlPaths = glob.sync("components/**/*.component.yml");

// loop over each yml file, and add vite config if needed
for (const ymlPath of ymlPaths) {
  const yml = YAML.parse(fs.readFileSync(ymlPath, "utf8"));
  let hasChanged = false;
  if (!yml.libraryOverrides?.vite) {
    yml.libraryOverrides = {};
    yml.libraryOverrides.vite = true;

    hasChanged = true;
  }

  // if theres a .css file, rename it to .scss
  const cssPath = ymlPath.replace(".component.yml", ".css");
  if (fs.existsSync(cssPath)) {
    fs.renameSync(cssPath, cssPath.replace(".css", ".scss"));
  }

  // if there's a .scss file, add it to the libraryOverrides
  const scssPath = ymlPath.replace(".component.yml", ".scss");
  if (fs.existsSync(scssPath)) {
    const cssComponent = {};
    cssComponent[scssPath.split("/").pop()] = {};
    yml.libraryOverrides.css = {
      component: cssComponent,
    };

    hasChanged = true;
  }

  // if there's a .js file, add it to the libraryOverrides
  // add type=module attribute to the script tag so it loads after the global libraries
  let jsPath = ymlPath.replace(".component.yml", ".js");
  let jsComponentPath = jsPath.replace(".js", ".component.js");

  // add .component suffix because Vite cant handle entry points with same base name
  if (fs.existsSync(jsPath) && !fs.existsSync(jsComponentPath)) {
    fs.renameSync(jsPath, jsPath.replace(".js", ".component.js"));
  }

  if (fs.existsSync(jsComponentPath)) {
    const jsComponent = {};
    jsComponent[jsComponentPath.split("/").pop()] = {
      minified: true,
      preprocess: false,
      attributes: { type: "module" },
    };
    yml.libraryOverrides.js = jsComponent;

    hasChanged = true;
  }

  if (hasChanged) {
    fs.writeFileSync(ymlPath, YAML.stringify(yml));
  }
}
