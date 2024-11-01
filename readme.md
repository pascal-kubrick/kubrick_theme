# Vite starter theme for modern Drupal

This is a starter theme for Drupal 10.3+ that uses Vite.
It supports Sass and js asset bundling for Drupal Single Directory Components.

## Getting started

1. Install [drupal/vite](https://www.drupal.org/project/vite) and [drupal/twig_tweak](https://www.drupal.org/project/twig_tweak)
2. Clone repo in `web/themes/custom/PROJECT_NAME_theme`
3. Install dependencies using `bun install`
4. Optional - run `bun run prepare` to setup a precommit hook. This will automatically run the build step before committing changes. Skip this if you want to run the build step manually or during CI/CD.
5. Run `bun dev` to start the development server

## Adding new components

Run `drush sdc [component-name]` to generate a new component. This will create a new folder in the components directory with a twig file and optional css / js files. The Vite config will pick up the new component and modify the scaffoled files to work with Sass + Vite.

## Additional features

- Clears cache / theme registry when adding new twig files
- Reload page when a *.twig or *.theme file changes
- scss / js hot reloading
- Generates a ckeditor.css file
