import { useState } from 'react';
import { Send, Droplets } from 'lucide-react';
import { buildPaymentTransaction, submitTransaction, fundWithFriendbot } from './stellar';
import TransactionStatus, { TxState } from './TransactionStatus';

interface PaymentFormProps {
  publicKey: string;
  sign: (xdr: string) => Promise<string>;
  onTxComplete?: () => void;
}

export default function PaymentForm({ publicKey, sign, onTxComplete }: PaymentFormProps) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState<TxState>({ status: 'idle' });
  const [sending, setSending] = useState(false);
  const [fundingBot, setFundingBot] = useState(false);

  const isValidAddress = destination.length === 56 && destination.startsWith('G');
  const isValidAmount = parseFloat(amount) > 0;
  const canSend = isValidAddress && isValidAmount && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);

    try {
      setTxState({ status: 'signing' });
      const xdr = await buildPaymentTransaction(publicKey, destination, amount);
      const signedXdr = await sign(xdr);

      setTxState({ status: 'submitting' });
      const result = await submitTransaction(signedXdr);
      const hash = (result as any).hash || (result as any).id || 'unknown';

      setTxState({ status: 'success', hash });
      setDestination('');
      setAmount('');
      onTxComplete?.();
    } catch (err: any) {
      const msg = err?.message || 'Transaction failed. Please try again.';
      setTxState({ status: 'error', message: msg });
    } finally {
      setSending(false);
    }
  };

  const handleFundbot = async () => {
    setFundingBot(true);
    const ok = await fundWithFriendbot(publicKey);
    if (ok) {
      setTxState({ status: 'success', hash: 'Friendbot funding — check your balance!' });
      onTxComplete?.();
    } else {
      setTxState({ status: 'error', message: 'Friendbot funding failed. Account may already be funded or rate-limited.' });
    }
    setFundingBot(false);
  };

  return (
    <div className="connected-layout">
      {/* Faucet */}
      <div className="faucet-section" id="faucet-section">
        <div className="faucet-info">
          <strong>Need testnet XLM?</strong><br />
          Fund your wallet with Friendbot
        </div>
        <button
          className="btn btn-faucet"
          onClick={handleFundbot}
          disabled={fundingBot}
          id="fund-btn"
        >
          {fundingBot ? <span className="spinner" /> : <Droplets size={16} />}
          {fundingBot ? 'Funding...' : 'Fund Wallet'}
        </button>
      </div>

      {/* Payment Form */}
      <div className="card" id="payment-card">
        <div className="card-header">
          <div className="card-header-icon">
            <Send size={20} />
          </div>
          <div>
            <h2>Send Payment</h2>
            <p>Transfer XLM on Stellar Testnet</p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="destination-input">
            Destination Address
          </label>
          <input
            id="destination-input"
            className="form-input"
            type="text"
            placeholder="G..."
            value={destination}
            onChange={(e) => setDestination(e.target.value.trim())}
            disabled={sending}
            spellCheck={false}
            autoComplete="off"
          />
          {destination && !isValidAddress && (
            <div className="form-hint" style={{ color: 'var(--accent-red)' }}>
              Must be a 56-character Stellar public key starting with G
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="amount-input">
            Amount (XLM)
          </label>
          <div className="form-row">
            <input
              id="amount-input"
              className="form-input"
              type="number"
              placeholder="0.00"
              min="0.0000001"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={sending}
            />
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSend}
              disabled={!canSend}
              id="send-btn"
            >
              {sending ? <span className="spinner" /> : <Send size={18} />}
              {sending ? 'Sending...' : 'Send XLM'}
            </button>
          </div>
        </div>

        <TransactionStatus txState={txState} />
      </div>
    </div>
  );
}
