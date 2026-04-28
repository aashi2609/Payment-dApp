import { CheckCircle, XCircle, Loader, ExternalLink } from 'lucide-react';

export type TxState =
  | { status: 'idle' }
  | { status: 'signing' }
  | { status: 'submitting' }
  | { status: 'success'; hash: string }
  | { status: 'error'; message: string };

interface TransactionStatusProps {
  txState: TxState;
}

export default function TransactionStatus({ txState }: TransactionStatusProps) {
  if (txState.status === 'idle') return null;

  const config = {
    signing: {
      className: 'pending',
      icon: <Loader size={20} className="tx-status-icon" style={{ animation: 'spin-slow 1s linear infinite' }} />,
      title: 'Awaiting Signature',
      message: 'Please sign the transaction in your Freighter wallet...',
    },
    submitting: {
      className: 'pending',
      icon: <Loader size={20} className="tx-status-icon" style={{ animation: 'spin-slow 1s linear infinite' }} />,
      title: 'Submitting Transaction',
      message: 'Broadcasting to the Stellar testnet...',
    },
    success: {
      className: 'success',
      icon: <CheckCircle size={20} className="tx-status-icon" />,
      title: 'Transaction Successful!',
      message: '',
    },
    error: {
      className: 'error',
      icon: <XCircle size={20} className="tx-status-icon" />,
      title: 'Transaction Failed',
      message: '',
    },
  };

  const c = config[txState.status];

  return (
    <div className={`tx-status ${c.className}`} id="transaction-status">
      {c.icon}
      <div className="tx-status-content">
        <div className="tx-status-title">{c.title}</div>
        {txState.status === 'success' && (
          <div className="tx-status-message">
            Hash:{' '}
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txState.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-hash-link"
              id="tx-hash-link"
            >
              {txState.hash.slice(0, 16)}...{txState.hash.slice(-8)}
              <ExternalLink size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
            </a>
          </div>
        )}
        {txState.status === 'error' && (
          <div className="tx-status-message">{txState.message}</div>
        )}
        {c.message && txState.status !== 'success' && txState.status !== 'error' && (
          <div className="tx-status-message">{c.message}</div>
        )}
      </div>
    </div>
  );
}
