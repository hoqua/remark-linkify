# remark-linkify

[![NPM version](https://img.shields.io/npm/v/remark-linkify)](https://www.npmjs.com/package/remark-linkify)
[![Downloads](https://img.shields.io/npm/dm/remark-linkify)](https://www.npmjs.com/package/remark-linkify)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/remark-linkify)](https://bundlephobia.com/package/remark-linkify)
[![Build Status](https://img.shields.io/github/actions/workflow/status/hoqua/remark-linkify/ci.yml?branch=main)](https://github.com/hoqua/remark-linkify/actions/workflows/ci.yml)
[![Coverage Status](coverage/coverage.svg)](./coverage/coverage-summary.json)
[![License](https://img.shields.io/npm/l/remark-linkify)](LICENSE)

A [remark](https://github.com/remarkjs/remark) plugin to automatically detect URLs and email addresses in text and turn them into Markdown links.

## Features

*   Automatically converts URLs (like `http://example.com`) and emails (`user@example.com`) into links.
*   Uses the robust `linkify-it` library for accurate detection.
*   Integrates seamlessly with the `remark`/`unified` ecosystem.
*   Avoids linkifying text within existing links or code blocks (by default behavior of `unist-util-visit`).
*   Supports ESM and CJS.

## Installation

```bash
pnpm add remark-linkify
```
```bash
yarn add remark-linkify
```
```bash
npm install remark-linkify
```

## Usage

### With `remark`

```javascript
import { remark } from 'remark';
import remarkLinkify from 'remark-linkify'; // Note: Default export

const markdownInput = `
Visit example.com or contact user@example.com.
Also check https://another.example.org.
`;

async function processMarkdown() {
  const file = await remark()
    .use(remarkLinkify)
    .process(markdownInput);

  console.log(String(file));
  /*
  Output:
  Visit [example.com](http://example.com) or contact [user@example.com](mailto:user@example.com).
  Also check [https://another.example.org](https://another.example.org).
  */
}

processMarkdown();
```

### With `react-markdown`

```jsx
import ReactMarkdown from 'react-markdown';
import remarkLinkify from 'remark-linkify';
import remarkGfm from 'remark-gfm'; // Example other plugin

const markdown = "Go to example.com or email info@example.com.";

function MyComponent() {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkLinkify]}
    >
      {markdown}
    </ReactMarkdown>
  );
}

export default MyComponent;
```

## API

This plugin currently does not accept any options.

```typescript
import type { Transformer } from 'unified';
import type { Root } from 'mdast';

/**
 * A remark plugin to automatically detect URLs and email addresses in text 
 * and turn them into Markdown links.
 */
declare function remarkLinkify(): Transformer<Root, Root>;

export default remarkLinkify;
```

## License

[MIT](LICENSE)
