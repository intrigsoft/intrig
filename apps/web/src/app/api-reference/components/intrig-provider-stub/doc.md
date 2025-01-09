---
title: "API Reference: IntrigProviderStub"
---

## Overview

The `IntrigProviderStub` is a React context provider specifically designed for testing and storybook development. It enables developers to mock network requests and state management by stubbing hooks and their behavior during component rendering.

---

## IntrigProviderStub

### Props

| Prop       | Type                        | Default | Description                                                                                              |
| ---------- | --------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `children` | `React.ReactNode`           | —       | The child components that will have access to the Intrig context.                                        |
| `configs`  | `DefaultConfigs`            | `{}`    | Optional configuration for the internal Axios instance, such as base URL, headers, and timeout settings. |
| `stubs`    | `(stub: StubType<any, any, any>) => void` | `() => {}` | Function to define stubs for mocking network requests and responses.                                     |

---

### Usage

#### Storybook Integration

The `IntrigProviderStub` is commonly used in storybook to mock API interactions for components.

##### Example

```tsx
const meta = {
  title: 'MyComponent',
  component: MyComponent,
  decorators: [
    (Story, { args }) => (
      <IntrigProviderStub stubs={args.stubs}>
        <Story />
      </IntrigProviderStub>
    ),
  ],
} satisfies Meta<WithStubSupport<React.ComponentProps<typeof MyComponent>>>;

export const Default: Story = {
  args: {
    stubs: (stub) => {
      stub(useGeneratedHook, async (params, body, dispatch) => {
        dispatch(init());
      });
    },
  },
};
```

