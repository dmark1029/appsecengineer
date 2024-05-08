<template>
  <q-list bordered class="rounded-borders" v-bind:key="modelValue.id">
    <slot>
      <q-item class="bg-grey-10" clickable v-ripple>
        <q-item-section top>
          <q-item-label class="q-mt-sm portal_word_wrap">
            {{ modelValue.name }}
            <q-tooltip>{{ modelValue.name }}</q-tooltip>
          </q-item-label>
        </q-item-section>
        <slot name="action">
          <q-item-section top side v-if="roleIsAdmin">
            <div class="text-grey-6 q-gutter-xs">
              <q-btn class="gt-xs primary" size="12px" flat dense round icon="edit" @click="$emit('actionItemInfo')" />
              <q-btn class="gt-xs primary" size="12px" flat dense round icon="delete" @click="$emit('actionItemDelete')" />
            </div>
          </q-item-section>
        </slot>
      </q-item>
    </slot>
  </q-list>
</template>

<script>
export default {
  props: {
    roleIsAdmin: { type: Boolean, default: false },
    value: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    modelValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('value', value)
      }
    }
  }
}
</script>
