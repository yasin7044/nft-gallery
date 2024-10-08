<template>
  <div class="h-full flex flex-col justify-end">
    <div
      :class="{ 'border-t': filteredMenus.length }"
      class="wallet-asset-container flex flex-col"
      data-testid="sidebar-wallet-container"
    >
      <div>
        <a
          v-for="menu in filteredMenus"
          :key="menu.label"
          v-safe-href="menu.to"
          class="wallet-asset-menu"
        >
          <span>{{ menu.label }}</span>
          <NeoIcon
            icon="angle-right"
            size="medium"
            class="text-k-grey"
          />
        </a>
      </div>
      <div class="wallet-asset-footer flex py-5 text-xs text-k-grey">
        <!-- light/dark mode -->
        <ColorModeSwitch />

        <!-- language -->
        <div
          data-testid="sidebar-language"
          class="language-selector"
        >
          <NeoDropdown
            position="top-left"
            aria-role="menu"
            mobile-modal
          >
            <template #trigger>
              <div class="flex items-center">
                <NeoIcon
                  icon="globe"
                  size="medium"
                />
                <span class="is-hidden-mobile ml-1">
                  {{ $t('profileMenu.language') }}
                </span>
              </div>
            </template>

            <NeoDropdownItem
              v-for="lang in langsFlags"
              :key="lang.value"
              aria-role="listitem"
              :data-testid="`sidebar-language-${lang.value}`"
              :value="lang.value"
              :class="{ 'is-active': $i18n.locale === lang.value }"
              @click="setUserLocale(lang.value)"
            >
              <span>{{ lang.flag }} {{ lang.label }}</span>
            </NeoDropdownItem>
          </NeoDropdown>
        </div>

        <!-- settings -->
        <nuxt-link
          to="/settings"
          class="text-k-grey items-center"
          data-testid="sidebar-link-settings"
          @click="closeModal"
        >
          <NeoIcon
            icon="gear"
            size="medium"
          />
          <span class="is-hidden-mobile">{{ $t('settings') }}</span>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NeoDropdown, NeoDropdownItem, NeoIcon } from '@kodadot1/brick'
import type { Prefix } from '@kodadot1/static'
import { langsFlags, setUserLocale } from '@/utils/config/i18n'
import { transferVisible, teleportVisible, migrateVisible } from '@/utils/config/permission.config'

const { urlPrefix } = usePrefix()
// const { isAssetHub } = useIsChain(urlPrefix)
const { neoModal } = useProgrammatic()

const menus = ref<{ label: string, to: string, check: (v: Prefix) => boolean }[]>([
  {
    label: 'Transfer',
    to: `/${urlPrefix.value}/transfer`,
    check: transferVisible,
  },
  {
    label: 'Teleport Bridge',
    to: `/${urlPrefix.value}/teleport`,
    check: teleportVisible,
  },
  {
    label: 'Migrate',
    to: '/migrate',
    check: migrateVisible,
  },
])

// TODO: enable when asset hub offers are ready
// watchEffect(() => {
//   if (isAssetHub.value) {
//     menus.value.push({
//       label: 'Incoming Offers',
//       to: `/${urlPrefix.value}/incomingoffers`,
//     })

//     menus.value.push({
//       label: 'Assets',
//       to: `/${urlPrefix.value}/assets`,
//     })
//   }
// })

const filteredMenus = computed(() =>
  menus.value.filter(menu => menu.check(urlPrefix.value)),
)

const closeModal = () => {
  neoModal.closeAll()
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/abstracts/variables';

.wallet-asset-menu {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  @apply border-b border-k-grey;

  &:last-child {
    @apply border-b-0;
  }
}

.wallet-asset-footer {
  border-top: 1px solid grey;
  justify-content: space-between;
  @include mobile {
    justify-content: center;
    .language-selector {
      margin: 0 2rem;
    }
  }

  & > * {
    @apply cursor-pointer flex gap-1;

    &:hover {
      @include ktheme() {
        color: theme('text-color');
      }
    }
  }

  @include tablet {
    // manually center dropdown menu, because no props "postition" to center it
    :deep(.o-drop__menu) {
      transform: translateX(50px);
    }
  }
}
</style>
