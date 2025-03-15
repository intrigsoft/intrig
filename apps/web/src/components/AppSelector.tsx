"use client"

import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/catalyst/dropdown';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {ChevronDownIcon} from '@heroicons/react/24/outline'
import { BookOpenIcon, PaperClipIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid'

interface AppInfo {
  name: string
  path: string
  match: string
  icon?: React.ReactNode
}

const APP_MAPPING: AppInfo[] = [
  {
    name: 'Docs',
    path: '/docs/introduction/getting-started',
    match: '/docs/',
    icon: <BookOpenIcon/>
  },
  {
    name: 'API',
    path: '/api-reference/',
    match: '/api-reference',
    icon: <PaperClipIcon/>
  },
  {
    name: 'Explore',
    path: '/sources/',
    match: '/sources',
    icon: <PaperAirplaneIcon/>
  }
]

export default function AppSelector() {
  const pathname = usePathname();

  const appInfo = useMemo(() => {
    return APP_MAPPING.find(({ match }) => pathname.startsWith(match)) ?? APP_MAPPING[0];
  }, [pathname]);

  return <div className={""}>
    <Dropdown>
      <DropdownButton outline className={'outline-none '}>
        {appInfo.icon} {appInfo.name} <ChevronDownIcon/>
      </DropdownButton>
      <DropdownMenu className={'z-[1000] bg-slate-300 dark:bg-slate-700/50'}>
        {APP_MAPPING.map(({ name, path, match, icon }) => (<DropdownItem href={path} className={' hover:bg-primary-800 hover:dark:bg-primary-600 data-[focus]:bg-primary-800'}>{icon} {name}</DropdownItem>))}
      </DropdownMenu>
    </Dropdown>
  </div>
}
