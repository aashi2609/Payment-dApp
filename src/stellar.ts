import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

const server = new StellarSdk.Horizon.Server(HORIZON_URL);

export async function fetchBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find(
      (b: StellarSdk.Horizon.HorizonApi.BalanceLine) =>
        b.asset_type === 'native'
    );
    return native ? native.balance : '0';
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return '0';
    }
    throw err;
  }
}

export async function buildPaymentTransaction(
  senderPublicKey: string,
  destinationPublicKey: string,
  amount: string
): Promise<string> {
  const account = await server.loadAccount(senderPublicKey);
  const fee = await server.fetchBaseFee();

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: fee.toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount,
      })
    )
    .setTimeout(30)
    .build();

  return transaction.toXDR();
}

export async function submitTransaction(signedXdr: string) {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );
  const result = await server.submitTransaction(
    transaction as StellarSdk.Transaction
  );
  return result;
}

export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    return response.ok;
  } catch {
    return false;
  }
}

export { NETWORK_PASSPHRASE };
