import { Zap, ArrowRight, Shield } from 'lucide-react';
import Navbar from './Navbar';
import PaymentForm from './PaymentForm';
import { useWallet } from './useWallet';

export default function App() {
  const wallet = useWallet();

  return (
    <>
      <Navbar
        connected={wallet.connected}
        publicKey={wallet.publicKey}
        balance={wallet.balance}
        loading={wallet.loading}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        onRefreshBalance={wallet.refreshBalance}
      />

      {!wallet.connected ? (
        <section className="hero" id="hero-section">
          <div className="hero-badge">
            <Zap size={14} />
            Stellar Testnet
          </div>
          <h1>Send XLM Payments<br />in Seconds</h1>
          <p>
            Connect your Freighter wallet to send XLM on the Stellar testnet.
            Fast, free, and built for developers.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={wallet.connect}
              disabled={wallet.loading}
              id="hero-connect-btn"
            >
              {wallet.loading ? (
                <span className="spinner" />
              ) : (
                <ArrowRight size={18} />
              )}
              {wallet.loading ? 'Connecting...' : 'Get Started'}
            </button>
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-lg"
              id="install-freighter-btn"
            >
              <Shield size={18} />
              Install Freighter
            </a>
          </div>

          {wallet.error && (
            <div
              className="tx-status error"
              style={{ maxWidth: 480, marginTop: 24 }}
              id="connection-error"
            >
              <div className="tx-status-content">
                <div className="tx-status-title">Connection Error</div>
                <div className="tx-status-message">{wallet.error}</div>
              </div>
            </div>
          )}
        </section>
      ) : (
        <main className="main-content" id="main-content">
          {/* Stats */}
          <div className="stats-row" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card">
              <div className="stat-label">Balance</div>
              <div className="stat-value green" id="stat-balance">
                {wallet.balance
                  ? `${parseFloat(wallet.balance).toFixed(2)} XLM`
                  : '—'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Network</div>
              <div className="stat-value">Testnet</div>
            </div>
          </div>

          <PaymentForm
            publicKey={wallet.publicKey!}
            sign={wallet.sign}
            onTxComplete={wallet.refreshBalance}
          />
        </main>
      )}

    </>
  );
}
