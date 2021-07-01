module.exports = {
  "extends": "airbnb",
  "rules": {
    "no-underscore-dangle": [2, { "allowAfterThis": true }],
    "class-methods-use-this": 0,
    "strict": 0,
    "max-len": 0,
    "new-cap": ["error", { "newIsCapExceptionPattern": "^errors\.." }],
    "curly": 0,
    "padded-blocks": 0,
    'jsx-a11y/href-no-hash': 0,
  },
  "env": {
    "browser": true,
    "node": true
  }
};
