import { Documentation } from '@/components/Documentation';
import content from './doc.md';

export default async function Index({params}: {params: {slug: string[]}}) {

  return <Documentation content={content}/>;
}
