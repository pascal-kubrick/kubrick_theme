import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import liveReload from "vite-plugin-live-reload";
import sassGlobImports from "vite-plugin-sass-glob-import";
import glob from "fast-glob";
import postcssPresetEnv from "postcss-preset-env";
import postcssPrefixwrap from "postcss-prefixwrap";
import postcssCustomMedia from "postcss-custom-media";
import { watchAndRun } from "vite-plugin-watch-and-run";
import strip from "@rollup/plugin-strip";

const drushPath = "../../../../vendor/bin/drush";

// Resolve dirs.
const pwd = resolve(__dirname, ".");

// Auto determine theme path.
const [themePath] = pwd.match(/\/themes\/[^\/]+\/[^\/]+/i) || [];

// Auto determine site url. Change to a hardcoded value if needed.
const siteUrl = `http://${pwd
  .match(/\/Sites\/[^\/]+/i)[0]
  .split("/")
  .pop()}.test`;
const baseUrl = themePath;

export default ({ mode }) => {
  const config = {
    plugins: [
      // allow for multiple entrypoints

      // allow for sass globbing
      sassGlobImports(),
      // removes console.log's from production
      ...(process.env.NODE_ENV === "production"
        ? [
            strip({
              include: "**/*.(js)",
              exclude: "node_modules/**",
            }),
          ]
        : []),

      ...(process.env.NODE_ENV === "development"
        ? [
            {
              name: "console-log-on-dev",
              apply: "serve", // This plugin will only take effect during 'vite serve'
              configureServer(server) {
                server.httpServer?.once("listening", () => {
                  // print a message w/ the site url when the server is ready
                  // use timeout so this shows up after Vite's own message.
                  setTimeout(() => {
                    const message = `Access your dev site at:`;
                    console.log(
                      `  \x1b[32m➜  ${message} \x1b[0m \x1b[36m${siteUrl}\x1b[0m`
                    );
                  }, 0);
                });
              },
            },
          ]
        : []),

      // reload when twig files change
      liveReload(__dirname + "/**/*.(php|theme|module|twig)"),

      // watch twig files and run drush cc theme-registry
      watchAndRun([
        {
          name: "New Twig templates.",
          watchKind: ["add", "unlink"],
          watch: resolve("templates/**/*.twig"),
          run: `${drushPath} cc theme-registry`,
        },
        {
          name: "SDC added or updated.",
          watchKind: ["add", "unlink", "change"],
          watch: resolve("components/**/*.component.yml"),
          run: `${drushPath} cr`,
        },
        {
          name: "CSS or JS added to SDC.",
          watchKind: ["add"],
          watch: [
            resolve("components/**/*.css"),
            resolve("components/**/*.scss"),
            resolve("components/**/*.js"),
          ],
          run: `bun dev-scripts/sdc-scaffold.js;`,
        },
        {
          name: "new SCSS file added to src/scss/components.",
          watchKind: ["add"],
          watch: resolve("src/scss/components/**/*.scss"),
          // touch main.scss to force the new file to be picked up
          run: "touch src/scss/main.scss",
        },
      ]),
    ],

    base: mode === "development" ? "/" : baseUrl + "/dist/",

    build: {
      outDir: "dist",
      manifest: true,
      rollupOptions: {
        input: glob.sync([
          "src/scss/main.scss",
          "src/scss/ckeditor.scss",
          "src/js/*.js",
          "components/**/*.js",
          "components/**/*.scss",
        ]),
        output: {
          assetFileNames: (assetInfo) => {
            // dont hash the ckeditor css
            if (assetInfo.name.match(/ckeditor\.css/)) {
              return `assets/ckeditor.css`;
            }

            return `assets/[name].[hash].[ext]`;
          },
        },
      },
    },
    js: {
      minify: true,
      target: "es2018",
    },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          // make the custom media queries available to all scss files
          additionalData: `@use "/src/scss/base/_breakpoints";`,
        },
      },
      postcss: {
        plugins: [
          postcssCustomMedia(),
          postcssPresetEnv({
            stage: 0,
            features: {
              "nesting-rules": true,
              "custom-properties": false,
              "cascade-layers": false,
            },
          }),
          postcssPrefixwrap(".ck-content", {
            whitelist: ["ckeditor.scss"],
            ignoredSelectors: [/^\\.ck-(.+)$/],
          }),
        ],
      },
    },

    server: {
      https: false,
      host: true,
      origin: "http://localhost:5173",
      port: 5173,
    },
  };

  return defineConfig(config);
};
