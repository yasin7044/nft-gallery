<template>
  <div class="flex justify-end gallery-item-offer">
    <NeoButton
      :label="$t('transaction.offer')"
      variant="k-blue"
      size="large"
      class="w-[calc(10rem+55px)]"
      @click="openOfferModal"
    />
    <MakeOffer />
  </div>
</template>

<script setup lang="ts">
import { NeoButton } from '@kodadot1/brick'
import type { NFT } from '@/components/rmrk/service/scheme'
import { nftToOfferItem } from '@/components/common/shoppingCart/utils'
import { usePreferencesStore } from '@/stores/preferences'
import { useMakingOfferStore } from '@/stores/makeOffer'
import MakeOffer from '@/components/offer/MakeOffer.vue'

const props = defineProps<{
  nft: NFT
}>()

const preferencesStore = usePreferencesStore()
const makeOfferStore = useMakingOfferStore()

const openOfferModal = () => {
  makeOfferStore.clear()
  const item = nftToOfferItem(props.nft)
  makeOfferStore.setItem(item)

  preferencesStore.setMakeOfferModalOpen(true)
}

useModalIsOpenTracker({
  isOpen: computed(() => preferencesStore.makeOfferModalOpen),
  onChange: () => makeOfferStore.clear(),
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/abstracts/variables';

.gallery-item-offer {
  button {
    font-size: 1rem;
    height: 3.375rem;
  }
}

@include until-widescreen {
  .gallery-item-offer {
    width: 100%;
    margin-top: 1rem !important;
    button {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
