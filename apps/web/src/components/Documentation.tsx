import React, { PropsWithChildren } from 'react';
import Markdoc, { Config, nodes as defaultNodes, Tag } from '@markdoc/markdoc';
import * as fs from 'fs';
import * as path from 'path';
import { slugifyWithCounter } from '@sindresorhus/slugify';
import yaml from 'js-yaml';

import { DocsLayout } from '@/components/DocsLayout';
import { Fence } from '@/components/Fence';
import { Callout } from '@/components/Callout';
import { QuickLink, QuickLinks } from '@/components/QuickLinks';
import { Badge } from '@/catalyst/badge';
import { Link } from '@/catalyst/link';
import { TabbedFence } from '@/components/TabbedFence';

let documentSlugifyMap = new Map()
const config: Config = {
  nodes: {
    document: {
      ...defaultNodes.document,
      render: DocsLayout,
      transform(node, config) {
        documentSlugifyMap.set(config, slugifyWithCounter())

        return new Tag(
          this.render,
          {
            frontmatter: yaml.load(node.attributes.frontmatter),
            nodes: node.children,
          },
          node.transformChildren(config),
        )
      }
    },
    heading: {
      ...defaultNodes.heading,
      transform(node, config) {
        let slugify = documentSlugifyMap.get(config)
        let attributes = node.transformAttributes(config)
        let children = node.transformChildren(config)
        let text = children.filter((child) => typeof child === 'string').join(' ')
        let id = attributes.id ?? slugify(text)

        return new Tag(
          `h${node.attributes.level}`,
          { ...attributes, id },
          children,
        )
      },
    },
    th: {
      ...defaultNodes.th,
      attributes: {
        ...defaultNodes.th.attributes,
        scope: {
          type: String,
          default: 'col',
        },
      },
    },
    fence: {
      render: Fence,
      attributes: {
        language: {
          type: String,
        },
      },
    },
    image: {
      ...defaultNodes.image,
      transform(node, config) {

        let src = node.attributes.src;

        if (typeof window === 'undefined') {
          // Check if the src is a local file path or an external URL
          if (!src.startsWith('http://') && !src.startsWith('https://')) {
            // Resolve the path relative to the markdown file
            const resolvedPath = path.resolve(path.dirname(config.variables?._filePath ?? ''), src);
            const fileContent = fs.readFileSync(resolvedPath);
            src = `data:image/*;base64,${fileContent.toString('base64')}`;
          }
        } else {
          throw new Error('File system access is not available in the browser environment.');
        }

        return new Tag('img', { src, alt: node.attributes.alt || '' }, []);
      },
    }
  },
  tags: {
    callout: {
      attributes: {
        title: { type: String },
        type: {
          type: String,
          default: 'note',
          matches: ['note', 'warning'],
          errorLevel: 'critical',
        },
      },
      render: Callout,
    },
    figure: {
      selfClosing: true,
      attributes: {
        src: { type: String },
        alt: { type: String },
        caption: { type: String },
      },
      render: ({ src, alt = '', caption }) => (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} />
          <figcaption>{caption}</figcaption>
        </figure>
      ),
    },
    'quick-links': {
      render: QuickLinks,
    },
    'quick-link': {
      selfClosing: true,
      render: QuickLink,
      attributes: {
        title: { type: String },
        description: { type: String },
        icon: { type: String },
        href: { type: String },
      },
    },
    badge: {
      render: Badge
    },
    markdown: {
      render: Markdown
    },
    link: {
      attributes: {
        href: { type: String }
      },
      render: Link
    },
    tabbedFence: {
      attributes: {
        language: { type: String }
      },
      render: TabbedFence
    }
  }
}

function Markdown({children}: PropsWithChildren<any>) {
  const ast = Markdoc.parse(children.props.children);
  const content = Markdoc.transform(ast);
  return Markdoc.renderers.react(content, React, {});
}

export function Documentation({ filePath, variables = {} }: { filePath: string, variables?: Record<string, any> }) {

  let _config: Config = {
    ...config,
    variables: {
      ...variables,
      _filePath: filePath
    }
  }

  const source = fs.readFileSync(path.join(filePath), 'utf8');
  const ast = Markdoc.parse(source);
  const content = Markdoc.transform(ast, _config);
  return Markdoc.renderers.react(content, React, {});
}
