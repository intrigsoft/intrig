"use client"

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/catalyst/dropdown';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {ChevronDownIcon} from '@heroicons/react/24/outline'

interface AppInfo {
  name: string
  path: string
  match: string
}

const APP_MAPPING: AppInfo[] = [
  {
    name: 'Docs',
    path: '/docs/introduction/getting-started',
    match: '/docs/'
  },
  {
    name: 'API',
    path: '/api-reference/',
    match: '/api-reference'
  },
  {
    name: 'Explore',
    path: '/sources/',
    match: '/sources'
  }
]

export default function AppSelector() {
  let pathname = usePathname();

  const label = useMemo(() => {
    return APP_MAPPING.find(({ match }) => pathname.startsWith(match))?.name ?? APP_MAPPING[0].name;
  }, [pathname]);

  return <div className={""}>
    <Dropdown>
      <DropdownButton outline className={'outline-none'}>
        {label} <ChevronDownIcon/>
      </DropdownButton>
      <DropdownMenu className={'z-[1000]'}>
        {APP_MAPPING.map(({ name, path, match }) => (<DropdownItem href={path}>{name}</DropdownItem>))}
      </DropdownMenu>
    </Dropdown>
  </div>
}
