import { Interaction } from '@kodadot1/minimark/v1'
import consola from 'consola'
import { type Prefix } from '@kodadot1/static'
import {
  Collections,
  NFTs,
} from '../transaction/types'
import type {
  ActionBurnMultipleNFTs,
  ActionBuy,
  ActionConsume,
  ActionDeleteCollection,
  ActionList,
  ActionMintCollection,
  ActionMintDrop,
  ActionMintToken,
  ActionOffer,
  ActionSend,
  ActionSetCollectionMaxSupply,
  ActionWithdrawOffer,
  Actions } from '../transaction/types'
import { tokenIdToRoute } from '@/components/unique/utils'
import { warningMessage } from '@/utils/notification'
import { getPercentSupportFee } from '@/utils/support'

export function transactionOfferFactory(key: 'acceptOffer' | 'withdrawOffer') {
  return function (params: ActionWithdrawOffer, api, executeTransaction) {
    try {
      const { id, item } = tokenIdToRoute(params.nftId)
      const args = [id, item, params.maker]
      const cb = api.tx.marketplace[key]
      executeTransaction({
        cb,
        arg: args,
      })
    }
    catch (error) {
      warningMessage(error)
    }
  }
}

export const verifyRoyalty = (
  royalty?: Royalty,
): { isValid: boolean, normalizedRoyalty: Royalty } => {
  const normalizedRoyalty = {
    amount: Number(royalty?.amount ?? 0),
    address: royalty?.address ?? '',
  }

  return {
    isValid: isRoyaltyValid(normalizedRoyalty),
    normalizedRoyalty,
  }
}

export function isActionValid(action: Actions): boolean {
  const hasContent = <T>(v: T | T[]): boolean =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)

  const validityMap: Record<string, (action) => boolean> = {
    [Interaction.BUY]: (action: ActionBuy) => hasContent(action.nfts),
    [Interaction.LIST]: (action: ActionList) => hasContent(action.token),
    [Interaction.MINTNFT]: (action: ActionMintToken) =>
      hasContent(action.token),
    [Interaction.SEND]: (action: ActionSend) => Boolean(action.nftId),
    [Interaction.CONSUME]: (action: ActionConsume) => Boolean(action.nftId),
    [ShoppingActions.MAKE_OFFER]: (action: ActionOffer) =>
      hasContent(action.token),
    [ShoppingActions.WITHDRAW_OFFER]: (action: ActionWithdrawOffer) =>
      Boolean(action.nftId),
    [Interaction.MINT]: (action: ActionMintCollection) =>
      Boolean(action.collection),
    [Collections.DELETE]: (action: ActionDeleteCollection) =>
      Boolean(action.collectionId),
    [Collections.SET_MAX_SUPPLY]: (action: ActionSetCollectionMaxSupply) =>
      Boolean(action.collectionId),
    [NFTs.BURN_MULTIPLE]: (action: ActionBurnMultipleNFTs) =>
      hasContent(action.nftIds),
    [NFTs.MINT_DROP]: (action: ActionMintDrop) =>
      hasContent(action.collectionId),
  }

  const checker = validityMap[action.interaction]

  if (!checker) {
    consola.error(`Interaction not found: ${action.interaction}`)
    return false
  }

  return checker(action)
}

export function useBuySupportFee(
  prefix: ComputedRef<Prefix>,
  amount: ComputedRef<string | number>,
) {
  const { isRemark, isAssetHub } = useIsChain(prefix)

  const hasBuySupportFee = computed(
    () => isRemark.value || isAssetHub.value || false,
  )

  const supportFee = computed(() =>
    hasBuySupportFee.value ? getPercentSupportFee(amount.value) : 0,
  )

  return {
    hasBuySupportFee,
    supportFee,
  }
}
