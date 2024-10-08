<template>
  <DropsBasicDropCard
    :loading="!(drop.collection && !isLoadingMeta && !collectionOwnersLoading)"
    :card-is="externalUrl ? 'a' : NuxtLink"
    :to="!emitOnClick ? to : undefined"
    :name="drop.collection.name"
    :image="image"
    :show-time-tag="Boolean(drop.dropStartTime || ended)"
    :owner-addresses="ownerAddresses"
    :drop-creator="drop.creator"
    :drop-start-time="drop.dropStartTime"
    :drop-status="drop.status"
    :drop-max="drop.max || FALLBACK_DROP_COLLECTION_MAX"
    :drop-prefix="drop.chain"
    :drop-price="drop.price"
    :minted="drop.minted"
    @click="click"
  />
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue'
import type { Prefix } from '@kodadot1/static'
import type { Drop } from './useDrops'
import { DropStatus } from './useDrops'
import { processSingleMetadata } from '@/utils/cachingStrategy'
import { sanitizeIpfsUrl } from '@/utils/ipfs'
import { FALLBACK_DROP_COLLECTION_MAX } from '@/utils/drop'
import type { Metadata } from '@/components/rmrk/service/scheme'
import { useCollectionActivity } from '@/composables/collectionActivity/useCollectionActivity'

const NuxtLink = resolveComponent('NuxtLink')

const emit = defineEmits(['click'])
const props = defineProps<{
  drop: Drop
  dropUrl?: string
  emitOnClick?: boolean
}>()

const isLoadingMeta = ref(false)
const image = ref('')
const externalUrl = ref()

const dropPrefix = computed(() => props.drop.chain as Prefix)
const ended = computed(() => props.drop.status === DropStatus.MINTING_ENDED)
const to = computed(() => `/${dropPrefix.value}/drops/${props.drop.alias}`)

const { owners, loading: collectionOwnersLoading } = useCollectionActivity({
  collectionId: computed(() => props.drop?.collection.collection),
  prefix: dropPrefix.value,
})
const ownerAddresses = computed(() => Object.keys(owners.value || {}))

const click = () => {
  emit('click', {
    path: to.value,
    drop: props.drop,
  })
}

onMounted(async () => {
  if (!props.drop?.collection) {
    return
  }

  const dropCardImage = props.drop.banner || props.drop.image

  if (dropCardImage) {
    image.value = sanitizeIpfsUrl(dropCardImage)
    return
  }

  isLoadingMeta.value = true
  const metadata = (await processSingleMetadata(
    props.drop.collection.metadata,
  )) as Metadata
  image.value = sanitizeIpfsUrl(
    metadata.image || metadata.thumbnailUri || metadata.mediaUri || '',
  )
  externalUrl.value = metadata.external_url?.match('kodadot')
    ? ''
    : metadata.external_url
  isLoadingMeta.value = false
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/abstracts/variables';
.is-ellipsis {
  @include mobile {
    white-space: unset;
  }
}
</style>
