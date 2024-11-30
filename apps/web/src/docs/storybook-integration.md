# Intrig Storybook Integration & Stub Mechanism Documentation

## Introduction
The `IntrigProviderStub` is a powerful tool for simulating API behavior in your Storybook stories. It allows you to mock API calls independently of backend services, making it easier to test and develop React components in isolation. By using `IntrigProviderStub`, you can control the state of network requests to simulate various conditions, enabling a comprehensive and resilient UI testing process.

## Why Storybook Instead of Jest?

Storybook and Jest serve different but complementary purposes. While Jest is great for unit testing components in isolation, Storybook allows you to visually test components, giving you a real-time preview of how your components behave under different conditions. Storybook's interactive UI makes it easier for developers, designers, and stakeholders to **see and interact** with components, which can be invaluable for design validation and early feedback.

`Intrig` supports Storybook because of its emphasis on simplicity and transparency. By seeing the actual components in action, users can understand the real impact of different states (e.g., success, loading, error) without needing in-depth technical knowledge. This reduces the learning curve and lowers the knowledge cost, making the tool more accessible and effective for everyone involved in the development process.

## Overview of the Stub Mechanism
The stub mechanism in `intrig` provides a clean and reusable approach to mock API calls and their outcomes. This involves the following core elements:

1. **`StubType`**: Defines the type for stubbing hooks that interact with APIs. It allows you to specify a function that will be used to handle the request in place of the actual API call.

   ```typescript
   export interface StubType<P, B, T> {
     <P, B, T>(
       hook: IntrigHook<P, B, T>,
       fn: (
         params: P,
         body: B,
         dispatch: (state: NetworkState<T>) => void
       ) => Promise<void>
     ): void;
   }
   ```

  - **`P`**: Parameters for the hook.
  - **`B`**: Body of the request.
  - **`T`**: The expected response type.
  - The `dispatch` function allows you to control the state of the request, such as `init()`, `pending()`, `success()`, or `error()`.

2. **`WithStubSupport`**: A type utility that allows you to add stubs to any component.

   ```typescript
   export type WithStubSupport<T> = T & {
     stubs?: (stub: StubType<any, any, any>) => void;
   };
   ```

3. **`IntrigProviderStub`**: A React component that wraps children components and provides them with stubbed API responses. It accepts `stubs` and `configs` as props and uses the collected stubs to execute mock API calls.

   ```typescript
   export interface IntrigProviderStubProps {
     configs?: DefaultConfigs;
     stubs?: (stub: StubType<any, any, any>) => void;
     children: React.ReactNode;
   }
   ```

## Using the `IntrigProviderStub` in Storybook

To use the `IntrigProviderStub` in Storybook, you wrap the component in the `IntrigProviderStub` and define the stubs for the hooks used by the component.

Here is a typical example:

```tsx
import { Meta, StoryObj } from '@storybook/react';
import { IntrigProviderStub } from '@intrig/client-next';
import { useSampleHook } from '@intrig/client-next/src/backend/sampleController/useSampleHook';
import { SampleComponent } from '@/components/SampleComponent';
import { init, pending, success, error } from '@/core/utils/async';

const meta = {
  title: 'DataSync/CollectionInitPopup',
  component: SampleComponent,
  decorators: [
    (Story, { args }) => (
      <IntrigProviderStub stubs={args.stubs}>
        <div className="w-[300px]">
          <Story />
        </div>
      </IntrigProviderStub>
    ),
  ],
} satisfies Meta<WithStubSupport<React.ComponentProps<typeof SampleComponent>>>;

export default meta;

const mockData = {
  data: [
    {
      id: 'user',
      name: 'User 1',
      schemas: [{ name: 'User 1', address: 'Address 1' }],
    },
  ],
};

export const Default: StoryObj<typeof meta> = {
  args: {
    stubs: (stub) => {
      stub(useSampleHook, async (params, body, dispatch) => {
        dispatch(init());
      });
    },
  },
};

export const SuccessState: StoryObj<typeof meta> = {
  args: {
    stubs: (stub) => {
      stub(useSampleHook, async (params, body, dispatch) => {
        dispatch(success(mockData));
      });
    },
  },
};
```

### Steps for Story Creation
1. **Define a Story**: Use `Meta` to describe your component and set up a decorator that wraps the story in the `IntrigProviderStub`.
2. **Create Stubs**: Use the `stubs` function to define how each hook should behave for that particular story. This makes it easy to simulate different states, such as loading or success.
3. **Dispatch Network States**: Call `dispatch()` to set the state (`init()`, `pending()`, `success()`, `error()`). This will control the behavior of the hook as it would in real scenarios.

## Best Practices
1. **Modular Stubbing**: Keep the stubs modular and reusable. Define the stubs in a separate file if they are used across multiple stories.
2. **Realistic Mock Data**: Always use realistic mock data to ensure the stories reflect true component behavior.
3. **Comprehensive Coverage**: Create stories for all possible states—default, loading, success, error—to ensure full test coverage.

## Conclusion
The `IntrigProviderStub` provides an effective way to simulate API interactions within Storybook, allowing you to visualize your component's behavior under different conditions. By using `StubType`, `WithStubSupport`, and the `IntrigProviderStub` in your stories, you create a flexible environment that improves test coverage and UI reliability.

