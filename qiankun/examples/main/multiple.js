import { loadMicroApp } from '../../dist/qiankun.esm-browser.js';

let app;

function mount() {
  app = loadMicroApp(
    { name: 'react16', entry: '//localhost:7100', container: '#react16' },
    { sandbox: { experimentalStyleIsolation: true } },
  );
}

function unmount() {
  app.unmount();
}

document.querySelector('#mount').addEventListener('click', mount);
document.querySelector('#unmount').addEventListener('click', unmount);

loadMicroApp({ name: 'vue3', entry: '//localhost:7105', container: '#vue3' });
