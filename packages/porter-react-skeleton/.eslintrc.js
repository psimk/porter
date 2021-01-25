module.exports = {
  extends: ['@mediamonks'],
  rules: {
    // no longer needed with the new JSX transform
    'react/react-in-jsx-scope': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { packageDir: '../../../node_modules/@porterts/react-skeleton' },
    ],
  },
};
