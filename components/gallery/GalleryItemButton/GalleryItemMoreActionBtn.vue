<template>
  <div>
    <SigningModal
      :title="signingModalTitle"
      :is-loading="isLoading"
      :status="status"
      @try-again="burn"
    />

    <NeoDropdown
      position="bottom-left"
      :mobile-modal="false"
    >
      <template #trigger="{ active }">
        <NeoButton
          class="w-10 h-10"
          icon="ellipsis-vertical"
          :active="active"
        />
      </template>

      <NeoDropdownItem
        v-if="isDownloadEnabled"
        data-testid="gallery-item-more-dropdown-download"
        @click="downloadMedia"
      >
        Download
      </NeoDropdownItem>

      <template
        v-if="accountId === currentOwner && !hasOperationsDisabled(urlPrefix)"
      >
        <NeoDropdownItem @click="burn">
          Burn
        </NeoDropdownItem>
        <NeoDropdownItem
          v-if="price !== '0'"
          @click="unlist"
        >
          Delist
        </NeoDropdownItem>
      </template>
      <NeoDropdownItem disabled>
        Report
      </NeoDropdownItem>
    </NeoDropdown>
  </div>
</template>

<script setup lang="ts">
import { NeoButton, NeoDropdown, NeoDropdownItem } from '@kodadot1/brick'
import { Interaction } from '@kodadot1/minimark/v1'
import { downloadImage } from '@/utils/download'
import { sanitizeIpfsUrl, toOriginalContentUrl } from '@/utils/ipfs'
import { isMobileDevice } from '@/utils/extension'
import { hasOperationsDisabled } from '@/utils/prefix'

const { $i18n, $consola } = useNuxtApp()
const { toast } = useToast()
const { accountId } = useAuth()
const { transaction, isLoading, status } = useTransaction()
const { urlPrefix } = usePrefix()
const route = useRoute()

const props = defineProps<{
  mimeType?: string
  name?: string
  nftSn?: string
  collectionId?: string
  collectionName?: string
  imageUrl?: string
  currentOwner?: string
  price?: string
  imageData?: string
}>()

const action = ref('')
const signingModalTitle = computed(() => {
  return (
    {
      burn: $i18n.t('mint.nft.burning'),
      unlist: $i18n.t('mint.nft.delisting'),
    }[action.value] || ''
  )
})

const isDownloadEnabled = computed(() => {
  const mimeType = props.mimeType
  return ((
    (mimeType?.includes('image') || mimeType?.includes('text/html'))
    && props.imageUrl) || props.imageData
  )
})

const downloadMedia = async () => {
  let imageUrl = sanitizeIpfsUrl(props.imageUrl)

  if (!imageUrl) {
    return
  }

  if (props.imageData) {
    const blob = await $fetch<Blob>(props.imageData)
    imageUrl = URL.createObjectURL(blob)
  }
  else if (props.mimeType?.includes('image')) {
    imageUrl = toOriginalContentUrl(imageUrl)
  }

  if (isMobileDevice) {
    toast($i18n.t('toast.downloadOnMobile'))
    setTimeout(() => {
      window.open(imageUrl, '_blank')
    }, 2000)
    return
  }

  try {
    toast($i18n.t('toast.downloadImage'))
    downloadImage(imageUrl, `${props.collectionName}_${props.name}`)
  }
  catch (error) {
    $consola.warn('[ERR] unable to fetch image')
    toast($i18n.t('toast.downloadError'))
  }
}

const burn = () => {
  action.value = 'burn'
  transaction({
    interaction: Interaction.CONSUME,
    urlPrefix: urlPrefix.value,
    nftId: route.params.id as string,
    nftSn: props.nftSn!,
    collectionId: props.collectionId!,
    successMessage: $i18n.t('transaction.consume.success') as string,
    errorMessage: $i18n.t('transaction.consume.error') as string,
  })
}

const unlist = () => {
  action.value = 'unlist'
  transaction({
    interaction: Interaction.LIST,
    urlPrefix: urlPrefix.value,
    token: {
      nftId: route.params.id as string,
      price: '0',
    },
    successMessage: $i18n.t('transaction.unlist.success') as string,
    errorMessage: $i18n.t('transaction.unlist.error') as string,
  })
}
</script>
