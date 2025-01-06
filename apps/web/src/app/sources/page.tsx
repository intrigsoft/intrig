"use client"

import { useNavigation } from '@/lib/navigation';
import Link from 'next/link'

export const dynamic = 'force-dynamic';

export default function SourcesPage() {

  let navigation = useNavigation();

  return <ul>
    {navigation[0]?.links?.map(link => <li key={link.href} className="mb-2">
      <Link href={link.href}>{link.title}</Link>
    </li>)}
  </ul>
}
