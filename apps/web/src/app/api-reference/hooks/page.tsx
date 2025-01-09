import { Documentation } from '@/components/Documentation';
import content from './doc.md';
import { redirect } from 'next/navigation';

export default async function Index({params}: {params: {slug: string[]}}) {
  redirect("/api-reference/hooks/use-as-network-state");
}
