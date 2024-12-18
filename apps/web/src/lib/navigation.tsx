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
      // { title: 'Intrig Ideology', href: '/core-concepts/ideology' },
      { title: 'Introduction to Intrig', href: '/core-concepts/introduction-to-intrig' },
      { title: 'Core Technologies', href: '/core-concepts/core-technologies' },
      { title: 'Intrig Generated Code', href: '/core-concepts/intrig-generated-code' },
      { title: 'Generated Documentation', href: '/core-concepts/generated-documentation' },
      { title: 'State Management', href: '/core-concepts/state-management' },
      { title: 'Utility Functions', href: '/core-concepts/utility-functions' },
      { title: 'Storybook Integration', href: '/core-concepts/storybook-integration' },
      { title: 'CLI Usage', href: '/core-concepts/cli-usage'},
      // { title: 'Patterns and Best Practices', href: '/core-concepts/patterns-and-best-practices' }
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
