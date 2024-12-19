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
import { CodeViewer, DataTypeViewer } from '@/components/DataTypeViewer';
import { HierarchyView } from '@/components/HierarchyView';
import { ReactClientComponentEditor } from '@/components/ReactClientComponentEditor';

let documentSlugifyMap = new Map()
const config: Config = {
  nodes: {
    document: {
      ...defaultNodes.document,
      render: DocsLayout as any,
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
      render: Fence as any,
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

        // if (typeof window === 'undefined') {
        //   // Check if the src is a local file path or an external URL
        //   if (!src.startsWith('http://') && !src.startsWith('https://')) {
        //     console.log(node, config)
        //     // Resolve the path relative to the markdown file
        //     // const resolvedPath = path.resolve(path.dirname(config.variables?._filePath ?? ''), src);
        //     // const fileContent = fs.readFileSync(resolvedPath);
        //     // src = `data:image/*;base64,${fileContent.toString('base64')}`;
        //   }
        // } else {
        //   throw new Error('File system access is not available in the browser environment.');
        // }

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
      render: Callout as any,
    },
    figure: {
      selfClosing: true,
      attributes: {
        src: { type: String },
        alt: { type: String },
        caption: { type: String },
      },
      render: (({ src, alt = '', caption }: {src: string, alt: string, caption: string}) => (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} />
          <figcaption>{caption}</figcaption>
        </figure>
      )) as any,
    },
    'quick-links': {
      render: QuickLinks as any,
    },
    'quick-link': {
      selfClosing: true,
      render: QuickLink as any,
      attributes: {
        title: { type: String },
        description: { type: String },
        icon: { type: String },
        href: { type: String },
      },
    },
    badge: {
      render: Badge as any
    },
    markdown: {
      render: Markdown as any
    },
    link: {
      attributes: {
        href: { type: String }
      },
      render: Link as any
    },
    // tabbedFence: {
    //   attributes: {
    //     language: { type: String }
    //   },
    //   render: TabbedFence as any
    // },
    dataType: {
      attributes: {
        type: { type: String }
      },
      render: DataTypeViewer as any
    },
    code: {
      attributes: {
        path: { type: String }
      },
      render: CodeViewer as any
    },
    hierarchy: {
      attributes: {
        filter: { type: String }
      },
      render: HierarchyView as any
    },
    codeBuilder: {
      attributes: {
        data: { type: 'Object' }
      },
      render: ReactClientComponentEditor as any
    }
  }
}

function Markdown({children}: PropsWithChildren<any>) {
  const ast = Markdoc.parse(children.props.children);
  const content = Markdoc.transform(ast);
  return Markdoc.renderers.react(content, React, {});
}

export interface DocumentationProps {
  filePath: string,
  content?: string,
  variables?: Record<string, any>
}

export function Documentation({ filePath, content: defaultContent, variables = {} }: DocumentationProps) {

  let _config: Config = {
    ...config,
    variables: {
      ...variables,
      _filePath: filePath
    }
  }

  const source = defaultContent ?? fs.readFileSync(path.join(filePath), 'utf8');
  const ast = Markdoc.parse(source);
  const content = Markdoc.transform(ast, _config);
  return Markdoc.renderers.react(content, React, {});
}
