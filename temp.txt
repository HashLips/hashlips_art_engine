import { initWalletUI, getJwt } from 'public/wallet.js';
import { placeBid } from 'backend/bids.jsw';

const TREE_SECTION = '#treeSection';
const BAZAAR_SECTION = '#bazaarSection';

const TAB_TREE = '#tabTree';
const TAB_BAZAAR = '#tabBazaar';

const CONNECT_BUTTON = '#connectWalletButton';
const DISCONNECT_BUTTON = '#disconnectWalletButton';
const ADDRESS_LABEL = '#walletAddressText';

const BID_BUTTON = '#bidButton';
const BID_VALUE = '#bidValue';
const AUCTION_DATASET = '#auctionDataset';
const TOAST_LABEL = '#toastText';

const CONTROLS = [CONNECT_BUTTON, DISCONNECT_BUTTON, ADDRESS_LABEL];

$w.onReady(() => {
  expandControls();
  bindTabs();
  initWalletUI({
    connectButton: $w(CONNECT_BUTTON),
    disconnectButton: $w(DISCONNECT_BUTTON),
    addressText: $w(ADDRESS_LABEL)
  });

  if ($w(BID_BUTTON)) {
    $w(BID_BUTTON).onClick(handleBid);
  }
});

function expandControls() {
  CONTROLS.forEach((selector) => {
    const el = $w(selector);
    if (el && typeof el.expand === 'function') {
      el.expand();
    }
  });
}

function bindTabs() {
  if ($w(TAB_TREE)) {
    $w(TAB_TREE).onClick(() => {
      showTree();
    });
  }
  if ($w(TAB_BAZAAR)) {
    $w(TAB_BAZAAR).onClick(() => {
      showBazaar();
    });
  }
}

function showTree() {
  if ($w(TREE_SECTION)) $w(TREE_SECTION).expand();
  if ($w(BAZAAR_SECTION)) $w(BAZAAR_SECTION).collapse();
}

function showBazaar() {
  if ($w(TREE_SECTION)) $w(TREE_SECTION).collapse();
  if ($w(BAZAAR_SECTION)) $w(BAZAAR_SECTION).expand();
  expandControls();
}

async function handleBid() {
  const amount = Number($w(BID_VALUE).value);
  const current = $w(AUCTION_DATASET)?.getCurrentItem();
  const auctionId = current?._id;
  if (!auctionId) {
    showToast('Select an auction first.');
    return;
  }

  try {
    const jwt = getJwt();
    if (!jwt) {
      showToast('Connect your wallet first.');
      return;
    }
    const result = await placeBid({ auctionId, amount, jwt });
    showToast(`Bid placed: ${result.highBidAmount}`);
  } catch (err) {
    showToast(err.message || 'Bid failed');
  }
}

function showToast(message) {
  if ($w(TOAST_LABEL)) {
    $w(TOAST_LABEL).text = message;
  } else {
    console.log(message);
  }
}
