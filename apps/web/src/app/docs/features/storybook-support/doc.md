---
title: Storybook Support
---

## Why Storybook is a Great Tool for Component Testing

Storybook allows developers to visually isolate and test UI components in a dedicated environment. It supports rapid prototyping by enabling the creation of components with different states and props, all while maintaining an interactive interface. This makes it a valuable tool for enhancing development speed, improving collaboration, and serving as a living documentation for UI components.

## Limitation of Storybook on Backend Integrations

Storybook is mostly focused on visual testing of UI components. Backend integration is not a part of its core functionality, as Storybook is designed to focus on visual testing and UI isolation. By avoiding backend integration, Storybook ensures that developers can test components independently of external systems, reducing complexity and improving test reliability. This design philosophy encourages clean separation of concerns, where UI logic is decoupled from backend dependencies, making components more modular and easier to maintain. This separation ensures that the visual layer remains independent, but it creates challenges when attempting to simulate real-world scenarios involving backend data or states within Storybook.

## How Intrig Provides a Stubbing Mechanism to Overcome Limitations

Intrig complements Storybook by providing a stubbing mechanism that allows developers to mock backend hooks using `IntrigProviderStub`. This is achieved by passing a `stubs` prop, which defines how the hooks behave for different scenarios, such as loading or success states. Unlike other mocking tools, this approach ensures tighter integration with the component lifecycle and enhances type safety by leveraging TypeScript type definitions, making it both robust and developer-friendly.

## Step-by-Step Guide to Using IntrigProviderStub

### 1. Import the Provider and Type Classes

Start by importing the required classes from `@intrig/next`:

```typescript
import { IntrigProviderStub, WithStubSupport } from '@intrig/next';
```

### 2. Configure Meta to Decorate the Story

Use `IntrigProviderStub` as a decorator in your Storybook meta configuration to wrap the component and inject stubs.

```typescript
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
```

### 3. Write Stories

Define stories by providing stubs to simulate different backend states:

#### Default Story

```typescript
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

#### Loading State Story

```typescript
export const LoadingData: Story = {
  ...Default,
  args: {
    ...Default.args,
    stubs: (stub) => {
      stub(useGeneratedHook, async (params, body, dispatch) => {
        dispatch(pending());
      });
    },
  },
};
```

### Benefits

- **Isolated Testing**: Developers can test components independently of backend dependencies.
- **Simulating Scenarios**: Easily mimic various states, such as loading, success, or error.
- **Type Safety**: With `StubType` and `WithStubSupport`, ensure accurate and consistent stubs.
- **Ease of Integration**: Works seamlessly with existing Storybook workflows.

