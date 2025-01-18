'use client'

import { Disclosure } from "@headlessui/react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/16/solid";
import React, { FC } from "react";
import { SearchResult } from '@/services/flexIndex';
import { useRouter } from 'next/navigation';

interface TreeNode {
  id: string;
  name: string;
  url?: string;
  signature?: string;
  children?: TreeNode[];
}

interface TreeViewProps {
  nodes: TreeNode[];
}

function TreeNode({ node }: { node: TreeNode }) {
  const router = useRouter();

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (node.url) {
      router.push(node.url);
    }
  };

  return (
    <Disclosure defaultOpen>
      {({ open }) => (
        <>
          <div className="flex items-center space-x-2 py-1 px-2 rounded cursor-pointer">
            {node.children && node.children.length > 0 ? (
              <Disclosure.Button className="focus:outline-none">
                {open ? (
                  <ChevronDownIcon className="w-5 h-5 text-teal-300" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 text-teal-300" />
                )}
              </Disclosure.Button>
            ) : <span className="w-3 h-5"/>}
            <div onClick={handleLinkClick} className="text-slate-500 dark:text-slate-300 hover:text-teal-400 w-full flex justify-between items-center">
              {node.name} {node.children?.length == 0 && <span className={'opacity-50'}>{node.signature}</span>}
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <Disclosure.Panel className="ml-5 border-l border-teal-700 pl-2">
              {node.children.map((child) => (
                <TreeNode key={child.id} node={child} />
              ))}
            </Disclosure.Panel>
          )}
        </>
      )}
    </Disclosure>
  );
}

function TreeView({ nodes }: TreeViewProps) {
  return (
    <div className="w-full">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
}

export default TreeView;

export function buildHierarchy(results: SearchResult[], skipLevels: number = 0): TreeNode[] {
  const root: TreeNode = { id: "root", name: "Root", children: [] };

  results.forEach((result) => {
    const parts = result.url.split("/").filter(Boolean).slice(skipLevels);
    let currentNode = root;

    parts.forEach((part, index) => {
      let childNode = currentNode.children?.find((child) => child.name === part);
      if (!childNode) {
        childNode = {
          id: `${currentNode.id}/${part}`,
          name: part,
          signature: result.signature,
          children: [],
          url: index === parts.length - 1 ? result.url : undefined,
        };
        currentNode.children = currentNode.children || [];
        currentNode.children.push(childNode);
      }
      currentNode = childNode;
    });
  });

  return root.children || [];
}
