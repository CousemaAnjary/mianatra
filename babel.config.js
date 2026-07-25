module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo'], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      // Drizzle : permet d'importer les fichiers .sql directement en JS
      ['inline-import', { extensions: ['.sql'] }],
      // doit rester en dernier (règle de react-native-worklets/reanimated)
      'react-native-worklets/plugin',
    ],
  };
};