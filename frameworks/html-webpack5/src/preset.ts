import type { StorybookConfig } from '@storybook/core-common';

export const addons: StorybookConfig['addons'] = [
  '@storybook/preset-html-webpack',
  '@storybook/html',
];

export const core = async (config: StorybookConfig['core']) => {
  return {
    ...config,
    builder: require.resolve('@storybook/builder-webpack5'),
  };
};
