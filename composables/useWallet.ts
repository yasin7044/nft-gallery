import { useDisconnect } from '@wagmi/vue'

const KEYS_TO_REMOVE = ['wallet']

const isWalletModalOpen = ref(false)

export default function () {
  const { disconnect: disconnectWeb3Modal } = useDisconnect()
  const shoppingCartStore = useShoppingCartStore()
  const walletStore = useWalletStore()
  const identityStore = useIdentityStore()

  const logout = async () => {
    const isEvm = walletStore.getIsEvm

    identityStore.resetAuth()
    sessionStorage.clear()
    // don't use localStorage.clear(), web3modal uses localstorage to save data
    // there's no way to regerate those values unless hard reload is made
    KEYS_TO_REMOVE.forEach(store => localStorage.removeItem(store))
    shoppingCartStore.clear()

    walletStore.setDisconnecting(true)
    walletStore.clear()

    if (isEvm) {
      try {
        await disconnectWeb3Modal()
      }
      catch (error) {
        console.warn('[WEB3MODAL::CONNECTION] Failed disconnecting', error)
      }
    }

    walletStore.setDisconnecting(false)
  }

  return {
    logout,
    isWalletModalOpen,
  }
}
