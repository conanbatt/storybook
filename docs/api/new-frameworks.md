---
title: 'Frameworks'
---

Storybook is architected to support diverse web frameworks, including React, Vue, Angular, Web Components, Svelte, and over a dozen others. This guide helps you get started on adding new framework support for Storybook.

## Scaffolding a new framework

The first thing to do is to scaffold your framework support in its own repo.

We recommend adopting the same project structure as the Storybook monorepo. That structure contains the framework package (`app/<framework>`) and an example app (`examples/<framework>-kitchen-sink`) as well as other associated documentation and configuration as needed.

It may seem like a little more hierarchy than what’s necessary. But because the structure mirrors the way Storybook’s monorepo is structured, you can reuse Storybook’s tooling. It also makes it easier to move the framework into the Storybook monorepo later if that is desirable.

We recommend using `@storybook/html` as a starter framework since it’s the simplest and contains no framework-specific peculiarities. There is a boilerplate to get you started [here](https://github.com/CodeByAlex/storybook-framework-boilerplate).

## Framework architecture

Supporting a new framework in Storybook typically consists of two main aspects:

1. Configuring the server. In Storybook, the server is the node process that runs when you run `start-storybook` or `build-storybook`. Configuring the server typically means configuring babel and webpack in framework-specific ways.

2. Configuring the client. The client is the code that runs in the browser, and configuring it, means providing a framework-specific story rendering function.

## Configuring the server

Storybook has the concept of [presets](../addons/writing-presets.md), which are typically babel/webpack configurations for file loading. If your framework has its own file format (e.g., “.vue”), you might need to transform them into JavaScript files at load time. If you assume every user of your framework needs this, you should add it to the framework. So far, every framework added to Storybook has done it because Storybook’s core configuration is extremely minimal.

### Package structure

It's helpful to understand Storybook's package structure before adding a framework preset. Each framework typically exposes two executables in its `package.json`:

```json
{
  "bin": {
    "start-storybook": "./bin/index.js",
    "build-storybook": "./bin/build.js"
  }
}
```

These scripts pass an `options` object to `@storybook/core/server`, a library that abstracts all of Storybook’s framework-independent code.

For example, here’s the boilerplate to start the dev server in `start-storybook`:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-start-dev-server.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Thus the essence of adding framework presets is just filling in that options object.

### Server options

As described above, the server `options` object does the heavy lifting of configuring the server.

Let’s look at the `@storybook/vue`’s options definition:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-server-options.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

The value of the `framework` option (i.e., ‘vue’) is something that gets passed to addons and allows them to do specific tasks related to your framework.

The essence of this file is the framework presets, and these are standard [Storybook presets](../addons/writing-presets.md) -- you can look at framework packages in the Storybook monorepo (e.g. [React](https://github.com/storybookjs/storybook/blob/next/app/react/src/server/options.ts), [Vue](https://github.com/storybookjs/storybook/blob/next/app/vue/src/server/options.ts), [Web Components](https://github.com/storybookjs/storybook/blob/next/app/web-components/src/server/options.ts)) to see examples of framework-specific customizations.

While developing your custom framework, not maintained by Storybook, you can specify the path to the location file with the `frameworkPath` key:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-server-framework-options.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

You can add a relative path to `frameworkPath`. Don't forget that they resolve from the Storybook configuration directory (i.e., `.storybook`) by default.

Make sure the `frameworkPath` ends up at the `dist/client/index.js` file within your framework app.

## Configuring the client

To configure the client, you must provide a framework-specific render function. Before diving into the details, it’s essential to understand how user-written stories relate to what renders on the screen.

### Renderable objects

Storybook stories are ES6 objects that return a “renderable object.”

Consider the following React story:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'react/button-story-with-sample.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

In this case, the renderable object is the React element, `<Button .../>`.

In most other frameworks, the renderable object is actually a plain JavaScript object.

Consider the following hypothetical example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/button-story-hypothetical-example.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

The design of this “renderable object” is framework-specific and should ideally match the idioms of that framework.

### Render function

The framework's render function is the entity responsible for converting the renderable object into DOM nodes. It is typically of the form:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-framework-render-function.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

### Package structure

On the client side, the key file is [`src/client/preview.js`](../configure/overview.md#configure-story-rendering):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-client-preview.ts.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

The globals file typically sets up a single global variable that client-side code (such as addon-provided decorators) can refer to if needed to understand which framework it's running in:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-client-globals-example-file.ts.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

The `start` function abstracts all of Storybook’s framework-independent client-side (browser) code, and it takes the render function we defined above. For examples of render functions, see [React](https://github.com/storybookjs/storybook/blob/next/app/react/src/client/preview/render.tsx), [Vue](https://github.com/storybookjs/storybook/blob/next/app/vue/src/client/preview/render.ts), [Angular](https://github.com/storybookjs/storybook/blob/next/app/angular/src/client/preview/render.ts), and [Web Components](https://github.com/storybookjs/storybook/blob/next/app/web-components/src/client/preview/render.ts) in the Storybook monorepo.
