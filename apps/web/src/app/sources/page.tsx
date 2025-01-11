"use server"

import { Documentation } from '@/components/Documentation';
import { getConfig } from '@/services/configs';
import { camelCase, capitalCase } from 'change-case';

export default async function SourcesPage() {
  let intrigConfig = getConfig();


  let contents = `
---
title: Sources
---

Following sources are configured in the system.

{% quick-links %}
${intrigConfig.sources.map(source => `
  {% quick-link title="${capitalCase(source.id)}" icon="installation" href="/sources/${source.id}" description="${source.specUrl}" /%}
`)}
{% /quick-links %}
  `.trim()

  return <ul>
    <Documentation content={contents} />
  </ul>
}
