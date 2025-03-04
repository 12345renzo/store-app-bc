const { execSync } = require('child_process');

execSync(
  'npx @puppeteer/browsers install chrome-headless-shell@latest --path /opt/render/.cache/puppeteer/chrome-headless-shell',
  {
    stdio: 'inherit',
  },
);
