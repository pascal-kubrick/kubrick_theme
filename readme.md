# Vite Starter Theme for Modern Drupal

This is a starter theme for Drupal 10.3+ that uses Vite. It supports Sass and JavaScript asset bundling for Drupal Single Directory Components.

## Getting Started

1. Install [drupal/vite](https://www.drupal.org/project/vite) and [drupal/twig_tweak](https://www.drupal.org/project/twig_tweak).
2. Clone the repository into `web/themes/custom/PROJECT_NAME_theme`.
3. Install dependencies using `bun install`.
4. (Optional) Run `bun run prepare` to set up a pre-commit hook. This will automatically run the build step before committing changes. Skip this if you want to run the build step manually or during CI/CD.
5. Run `bun dev` to start the development server.

## Adding New Components

Run `drush generate sdc` to scaffold a new component. The Vite configuration will pick up the generated files and modify them to work with Sass and Vite.

## Additional Features

-  Clears cache/theme registry when adding new Twig files.
-  Reloads the page when a *.twig or *.theme file changes.
-  SCSS/JS hot reloading.
-  Generates a `ckeditor.css` file.
