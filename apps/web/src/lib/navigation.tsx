import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { usePathname } from 'next/navigation';

interface Navigation {
  title: string
  links: {
    title: string
    href: string
  }[]
}

export const docsNavigation: Navigation[] = [
  {
    title: "Introduction",
    links: [
      { title: "Getting started", href: "/docs/introduction/getting-started" },
      { title: "Overview", href: "/docs/introduction/overview" },
    ]
  },
  {
    title: "Core concepts",
    links: [
      { title: "Architecture Overview", href: "/docs/core-concepts/architecture-overview" },
      { title: "Key Terminology", href: "/docs/core-concepts/key-terminology" },
      { title: "How Intrig Enhances Development", href: "/docs/core-concepts/how-intrig-enhances-development" },
    ]
  },
  {
    title: "Features",
    links: [
      { title: "Generated Hooks", href: "/docs/features/generated-hooks" },
      { title: "Network State", href: "/docs/features/network-state" },
      { title: "Extended Hooks", href: "/docs/features/extended-hooks" },
      { title: "Storybook Support", href: "/docs/features/storybook-support" },
    ]
  },
  {
    title: "Advanced",
    links: [
      { title: "Request Interception", href: "/docs/advanced/request-interception" },
      { title: "Validations", href: "/docs/advanced/validations" },
    ]
  }
]

export const apiNavigation: Navigation[] = [
  {
    title: "Components",
    links: [
      { title: "<IntrigProvider>", href: "/api-reference/components/intrig-provider" },
      { title: "<IntrigProviderStub>", href: "/api-reference/components/intrig-provider-stub" },
    ]
  },
  {
    title: "Functions",
    links: [
      { title: "isInit", href: "/api-reference/functions/is-init" },
      { title: "init", href: "/api-reference/functions/init" },
      { title: "isPending", href: "/api-reference/functions/is-pending" },
      { title: "pending", href: "/api-reference/functions/pending" },
      { title: "isSuccess", href: "/api-reference/functions/is-success" },
      { title: "success", href: "/api-reference/functions/success" },
      { title: "isError", href: "/api-reference/functions/is-error" },
      { title: "error", href: "/api-reference/functions/error" },
      { title: "isValidationError", href: "/api-reference/functions/is-validation-error" },
      { title: "isSuccessfulDispatch", href: "/api-reference/functions/is-successful-dispatch" }
    ]
  },
  {
    title: "Hooks",
    links: [
      { title: "useAsNetworkState", href: "/api-reference/hooks/use-as-network-state" },
      { title: "useAsPromise", href: "/api-reference/hooks/use-as-promise" },
      { title: "useResolvedValue", href: "/api-reference/hooks/use-resolved-value" },
      { title: "useCachedValue", href: "/api-reference/hooks/use-cached-value" },

    ]
  }
]

interface NavigationCtx {
  navigation: Navigation[]
}

let Ctx = createContext<NavigationCtx>({
  navigation: docsNavigation
})

export function NavigationProvider({children}: PropsWithChildren) {

  let pathname = usePathname();

  const [sourcesNavigation, setSourcesNavigations] = useState<Navigation[]>([]);

  useEffect(() => {
    axios.get('/api/navigation/left')
      .then(resp => {
        setSourcesNavigations(resp.data)
      })
      .catch(err => {
        console.error(err)
      })
  }, []);

  const navigation = useMemo(() => {
    if (pathname.startsWith("/docs")) {
      return docsNavigation
    } else if (pathname.startsWith("/api-reference")) {
      return apiNavigation
    } else if (pathname.startsWith("/sources")) {
      return sourcesNavigation
    }
    return docsNavigation
  }, [sourcesNavigation, pathname]);

  return <Ctx.Provider value={{
    navigation: [
      ...navigation
    ]
  }}>
    {children}
  </Ctx.Provider>
}

export function getNavigation() {
  const ctx = useContext(Ctx);
  return ctx.navigation;
}

export function useNavigation() {
  return getNavigation();
}
