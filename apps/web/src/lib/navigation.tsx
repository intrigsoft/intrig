import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const navigation = [
  {
    title: 'Introduction',
    links: [
      { title: 'Getting started', href: '/' },
      // { title: 'Installation', href: '/docs/installation' },
    ],
  },
  {
    title: 'Core concepts',
    links: [
      { title: 'Intrig Ideology', href: '/core-concepts/ideology' },
      { title: 'State Management', href: '/core-concepts/state-management' },
      { title: 'CLI Usage', href: '/core-concepts/cli-usage'},
      { title: 'Patterns and Best Practices', href: '/core-concepts/patterns-and-best-practices' }
    ],
  }
]

interface NavigationCtx {
  navigation: typeof navigation
}

let Ctx = createContext<NavigationCtx>({
  navigation
})

export function NavigationProvider({children}: PropsWithChildren) {

  const [navigations, setNavigations] = useState<typeof navigation>([]);

  useEffect(() => {
    axios.get('/api/navigation/left')
      .then(resp => {
        console.log(resp.data);
        setNavigations(resp.data)
      })
  }, []);

  return <Ctx.Provider value={{
    navigation: [
      ...navigation,
      ...navigations,
    ]
  }}>
    {children}
  </Ctx.Provider>
}

export function getNavigation() {
  const ctx = useContext(Ctx);
  return ctx.navigation;
}
