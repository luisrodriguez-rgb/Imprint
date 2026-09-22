import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Imprint — Personal AI Resource Ledger',
    description: 'Track your AI computational footprint (energy, water, carbon) with scientific transparency.',
    version: '0.1.0',
    permissions: ['storage', 'tabs'],
    host_permissions: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
    action: {
      default_title: 'Imprint — AI Resource Ledger',
    },
  },
});
