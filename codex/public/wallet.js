import { session } from 'wix-storage';
import { local } from 'wix-storage';
import wixWindow from 'wix-window';
import wixUsers from 'wix-users';
import { loadEthers } from 'public/lib/ethers.min.js';
import { loadWeb3Modal } from 'public/lib/web3modal.js';
import {
  getNonce,
  verifySiwe,
  getWalletConfig
} from 'backend/auth.jsw';

const JWT_KEY = 'dikpik_jwt';
const ADDRESS_KEY = 'dikpik_wallet_address';

let ethersLib;
let web3ModalLib;
let walletProvider = null;
let currentAddress = null;
let currentChainId = null;
let supportedChainId = null;
let siweDomain = null;
let siweUri = null;

async function ensureLibs() {
  if (!ethersLib) {
    ethersLib = await loadEthers();
  }
  if (!web3ModalLib) {
    web3ModalLib = await loadWeb3Modal();
  }
  if (!supportedChainId || !siweDomain) {
    const cfg = await getWalletConfig();
    supportedChainId = cfg.chainId;
    siweDomain = cfg.domain;
    siweUri = cfg.uri;
  }
}

export async function connectWallet(memberId) {
  await ensureLibs();
  const injected = window.ethereum;
  if (injected) {
    walletProvider = new ethersLib.BrowserProvider(injected);
  } else {
    const modal = new web3ModalLib.Web3Modal({
      projectId: supportedChainId,
      standaloneChains: [`eip155:${supportedChainId}`]
    });
    const walletConnect = await modal.openModal();
    walletProvider = new ethersLib.BrowserProvider(walletConnect);
  }
  const signer = await walletProvider.getSigner();
  const network = await walletProvider.getNetwork();
  currentChainId = Number(network.chainId);
  if (currentChainId !== supportedChainId) {
    await switchChain(supportedChainId);
  }
  currentAddress = await signer.getAddress();
  local.setItem(ADDRESS_KEY, currentAddress);
  await authenticate(memberId);
  return currentAddress;
}

export function getCurrentAddress() {
  return currentAddress || local.getItem(ADDRESS_KEY);
}

export function getJwt() {
  return session.getItem(JWT_KEY) || null;
}

export function disconnectWallet() {
  currentAddress = null;
  walletProvider = null;
  session.removeItem(JWT_KEY);
  local.removeItem(ADDRESS_KEY);
}

export async function switchChain(chainId) {
  if (!window.ethereum) return;
  const hexChain = `0x${chainId.toString(16)}`;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChain }]
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexChain,
            rpcUrls: ['https://rpc.ankr.com/eth'],
            chainName: 'Configured Chain'
          }
        ]
      });
    } else {
      throw err;
    }
  }
}

async function authenticate(memberId) {
  const nonce = await getNonce(memberId);
  const message = buildSiweMessage(nonce);
  const signer = await walletProvider.getSigner();
  const signature = await signer.signMessage(message);
  const jwt = await verifySiwe({
    address: currentAddress,
    signature,
    nonce
  });
  session.setItem(JWT_KEY, jwt);
}

function buildSiweMessage(nonce) {
  const now = new Date().toISOString();
  return [
    `${siweDomain} wants you to sign in with your Ethereum account:`,
    `${currentAddress}`,
    '',
    'Sign-in with Ethereum to DIKPIK Bazaar.',
    '',
    `URI: ${siweUri}`,
    `Version: 1`,
    `Chain ID: ${supportedChainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${now}`
  ].join('\n');
}

export function shortAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export async function initWalletUI({
  connectButton,
  disconnectButton,
  addressText
}) {
  if (connectButton) {
    connectButton.onClick(async () => {
      try {
        await connectWallet(wixUsers.currentUser.id);
        if (addressText) addressText.text = shortAddress(getCurrentAddress());
      } catch (err) {
        showToast(err.message || 'Wallet connection failed');
      }
    });
  }
  if (disconnectButton) {
    disconnectButton.onClick(() => {
      disconnectWallet();
      if (addressText) addressText.text = 'Not connected';
    });
  }
  const saved = getCurrentAddress();
  if (saved && addressText) {
    addressText.text = shortAddress(saved);
  }
}

function showToast(message) {
  if (typeof wixWindow.openLightbox === 'function') {
    wixWindow.openLightbox('Toast', { message });
  } else {
    console.error(message);
  }
}
