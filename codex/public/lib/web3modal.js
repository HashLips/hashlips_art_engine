import { loadScript } from 'wix-window';

const WEB3MODAL_CDN =
  'https://unpkg.com/@web3modal/standalone@4.0.10/dist/index.umd.js';

let web3ModalPromise = null;

export function loadWeb3Modal() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is required.'));
  }
  if (window.Web3ModalStandalone) {
    return Promise.resolve(window.Web3ModalStandalone);
  }
  if (!web3ModalPromise) {
    web3ModalPromise = loadScript(WEB3MODAL_CDN).then(
      () => window.Web3ModalStandalone
    );
  }
  return web3ModalPromise;
}
