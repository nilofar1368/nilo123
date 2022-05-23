// This migration transitions the by-address-keyed account data in the
// accounts slice to be keyed by account AND network chainID, as well as nested
// under an `evm` key.

import { ETHEREUM } from "../../constants"
import { normalizeEVMAddress } from "../../lib/utils"

type OldAccountState = {
  accountsData: {
    [address: string]: unknown
  }
  [others: string]: unknown
}
type NewAccountState = {
  accountsData: {
    evm: {
      [address: string]: {
        [chainID: string]: unknown
      }
    }
  }
  [others: string]: unknown
}

export default (
  prevState: Record<string, unknown>
): Record<string, unknown> => {
  const { accountsData: oldAccountsData, ...oldAccountState } =
    prevState.account as OldAccountState

  const newAccountState: NewAccountState = {
    ...oldAccountState,
    accountsData: {
      evm: Object.fromEntries(
        Object.entries(oldAccountsData).map(([address, data]) => [
          normalizeEVMAddress(address),
          { [ETHEREUM.chainID]: data },
        ])
      ),
    },
  }

  return {
    ...prevState,
    account: newAccountState,
  }
}
