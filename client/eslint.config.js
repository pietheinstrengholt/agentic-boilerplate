import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from '@vue/eslint-config-typescript'

// Apply the same Vue and TypeScript rules to the entire small client.
export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...tseslint(),
  // Prettier owns template layout; keep ESLint focused on behavior and accessibility.
  {
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
    },
  },
  { ignores: ['dist', 'src/api/generated.ts'] },
]
