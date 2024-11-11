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

export function getNavigation() {
  return [
    ...navigation
  ];
}
