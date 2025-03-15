"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface ReactCodeBuilderProps {
  children: string
  path: string
}

export default function ReactCodeBuilder({children}: ReactCodeBuilderProps) {

  const pathname = usePathname();

  return <Link href={`${pathname}/code-builder`}>
    {children}
  </Link>
}
