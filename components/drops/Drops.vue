<template>
  <div>
    <div
      class="flex max-md:flex-col md:items-center justify-between mb-7 md:gap-8"
    >
      <h1 class="text-4xl font-semibold text-balance">
        <span class="block lg:inline mb-0 md:mr-3">{{ $i18n.t('drops.title') }},</span>
        <span class="inverse-text">{{ $i18n.t('drops.everyThursday') }}</span>
      </h1>

      <div
        class="max-md:pt-8 flex items-center flex-col md:flex-row gap-6 max-md:gap-4 md:justify-between flex-grow"
      >
        <NeoButton
          icon-left="plus"
          rounded
          variant="outlined-rounded"
          @click="isCreateEventModalActive = true"
        >
          {{ $t('drops.addToCal') }}
        </NeoButton>

        <nuxt-link
          class="flex-shrink-0"
          to="https://form.kodadot.xyz/drop-interest"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{{ $t('drops.createYourOwn') }}</span>
          <NeoIcon icon="arrow-up-right" />
        </nuxt-link>
      </div>
    </div>

    <DropsGrid
      :drops="currentDrops"
      :loaded="loaded"
      :default-skeleton-count="DEFAULT_SKELETON_COUNT"
      :async-skeleton-count="asyncSkeletonCountOf(currentDrops.length)"
      skeleton-key="current-drops-skeleton"
    />

    <DropsCalendar
      :drops="drops"
      :loaded="loaded"
      :default-skeleton-count="DEFAULT_SKELETON_COUNT"
    />

    <template v-if="!(loaded && pastDrops.length === 0)">
      <hr class="my-14">

      <h2 class="text-3xl font-semibold mb-7">
        {{ $i18n.t('drops.pastArtDrops') }}
      </h2>

      <DropsGrid
        :drops="pastDrops"
        :loaded="loaded"
        :default-skeleton-count="DEFAULT_SKELETON_COUNT"
        :async-skeleton-count="asyncSkeletonCountOf(pastDrops.length)"
        skeleton-key="skeleton"
      />
    </template>

    <DropsCreateCalendarEventModal
      v-model="isCreateEventModalActive"
      :title="$t('drops.kodadotWeeklyGenerativeDrop')"
    />
  </div>
</template>

<script lang="ts" setup>
import { NeoButton, NeoIcon } from '@kodadot1/brick'
import filter from 'lodash/filter'
import { DropStatus, useDrops } from './useDrops'
import { dropsVisible } from '@/utils/config/permission.config'

const DEFAULT_SKELETON_COUNT = 4
const CURRENT_DROP_STATUS = Object.values(DropStatus).filter(
  status => status !== DropStatus.MINTING_ENDED,
)

const { $i18n } = useNuxtApp()
const { urlPrefix } = usePrefix()
const { drops, loaded, count } = useDrops({
  active: [true],
  chain: [urlPrefix.value],
  limit: 100,
}, { async: true })

const isCreateEventModalActive = ref(false)

const currentDrops = computed(() =>
  filter(drops.value, drop => CURRENT_DROP_STATUS.includes(drop.status)),
)

const pastDrops = computed(() =>
  filter(drops.value, { status: DropStatus.MINTING_ENDED }),
)

const asyncSkeletonCountOf = (amount: number) => count.value ? Math.max(0, Math.round((count.value) / 2) - amount) : DEFAULT_SKELETON_COUNT

const checkRouteAvailability = () => {
  if (!dropsVisible(urlPrefix.value)) {
    navigateTo('/')
  }
}

watch(urlPrefix, () => checkRouteAvailability())

onBeforeMount(() => {
  checkRouteAvailability()
})
</script>
