module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@screens': './src/screens',
            '@components': './src/components',
            '@stores': './src/stores',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@types': './src/types',
            '@theme': './src/theme',
          },
        },
      ],
    ],
  };
};
