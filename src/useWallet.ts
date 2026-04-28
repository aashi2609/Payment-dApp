import { useState, useCallback, useEffect } from 'react';
import {
  isConnected,
  isAllowed,
  setAllowed,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api';
import { fetchBalance } from './stellar';

interface WalletState {
  publicKey: string | null;
  balance: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    balance: null,
    connected: false,
    loading: false,
    error: null,
  });

  const refreshBalance = useCallback(async (key: string) => {
    try {
      const bal = await fetchBalance(key);
      setState((prev) => ({ ...prev, balance: bal }));
    } catch {
      // silently fail on balance refresh
    }
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const hasFreighter = await isConnected();
      if (!hasFreighter) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Freighter wallet extension not found. Please install it from freighter.app',
        }));
        return;
      }

      let allowed = await isAllowed();
      if (!allowed) {
        allowed = await setAllowed();
      }

      if (!allowed) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Permission denied. Please allow this app in Freighter.',
        }));
        return;
      }

      const address = await getPublicKey();
      if (!address) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Could not retrieve wallet address.',
        }));
        return;
      }

      const bal = await fetchBalance(address);

      setState({
        publicKey: address,
        balance: bal,
        connected: true,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || 'Failed to connect wallet.',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      publicKey: null,
      balance: null,
      connected: false,
      loading: false,
      error: null,
    });
  }, []);

  const sign = useCallback(async (xdr: string): Promise<string> => {
    const signedTxXdr = await signTransaction(xdr, {
      networkPassphrase: 'Test SDF Network ; September 2015',
    });
    return signedTxXdr;
  }, []);

  // Auto-refresh balance every 15s when connected
  useEffect(() => {
    if (!state.connected || !state.publicKey) return;
    const interval = setInterval(() => refreshBalance(state.publicKey!), 15000);
    return () => clearInterval(interval);
  }, [state.connected, state.publicKey, refreshBalance]);

  return {
    ...state,
    connect,
    disconnect,
    sign,
    refreshBalance: state.publicKey
      ? () => refreshBalance(state.publicKey!)
      : undefined,
  };
}
