import { Wallet, LogOut, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  connected: boolean;
  publicKey: string | null;
  balance: string | null;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshBalance?: () => void;
}

export default function Navbar({
  connected,
  publicKey,
  balance,
  loading,
  onConnect,
  onDisconnect,
  onRefreshBalance,
}: NavbarProps) {
  const [copied, setCopied] = useState(false);

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyAddress = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">S</div>
        <div>
          <div className="navbar-title">StellarPay</div>
          <div className="navbar-subtitle">Testnet</div>
        </div>
      </div>

      <div className="navbar-right">
        {connected && publicKey ? (
          <>
            {balance !== null && (
              <div className="balance-chip" id="balance-display">
                <span className="xlm-amount">
                  {parseFloat(balance).toFixed(2)}
                </span>
                <span className="xlm-label">XLM</span>
                {onRefreshBalance && (
                  <button
                    className="btn btn-icon btn-ghost"
                    onClick={onRefreshBalance}
                    title="Refresh balance"
                    id="refresh-balance-btn"
                    style={{ padding: '4px', marginLeft: '2px' }}
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
            )}

            <div
              className="address-chip"
              onClick={copyAddress}
              title="Click to copy full address"
              id="address-display"
            >
              <span className="status-dot" />
              {truncateAddress(publicKey)}
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </div>

            <button
              className="btn btn-danger"
              onClick={onDisconnect}
              id="disconnect-btn"
            >
              <LogOut size={16} />
              Disconnect
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onConnect}
            disabled={loading}
            id="connect-wallet-btn"
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <Wallet size={16} />
            )}
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}
