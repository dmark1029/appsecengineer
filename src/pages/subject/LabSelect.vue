<template>
  <div>
    <q-select
      filled
      use-input
      input-debounce="500"
      :options="options"
      @filter="filterFn"
      behavior="menu"
      v-model="model"
      color="white"
      dark
      :loading="loading"
      options-selected-class="text-orange"
      dense
      v-bind="$attrs"
      outlined
      :multiple="multiple"
      :label="label"
      :rules="rules"
      clearable
      @clear="removeEvent"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">No results</q-item-section>
        </q-item>
      </template>
      <template v-if="showMore" v-slot:after-options>
        <q-item>
          <q-item-section class="text-center" style="cursor: pointer" @click="$emit('loadMoreItems')">
            <label v-if="loading">...</label>
            <label v-else>
              <q-btn color="primary" label="Load more" size="sm" />
            </label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
export default {
  inheritAttrs: true,
  props: {
    options: Array,
    value: {
      type: [String, Object, Number, Array]
    },
    serverFiltering: {
      type: Boolean,
      default: false
    },
    filterCallBack: {
      type: Function
    },
    showMore: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    label: { required: false, type: String, default: 'Name' },
    rules: { required: false, type: Array },
    autofocus: { required: false, type: Boolean, default: false },
    avatar: { required: false, type: Boolean, default: false },
    clearable: { required: false, type: Boolean, default: true },
    disable: { required: false, type: Boolean, default: false },
    hideHint: { required: false, type: Boolean, default: false },
    hint: { required: false, type: String },
    newValueMode: { required: false, type: String },
    optionDisable: { required: false, type: Array },
    searchable: { required: false, type: Boolean, default: false },
    sendButton: { required: false, type: Boolean, default: false }
  },
  methods: {
    async filterFn(val, update, abort) {
      if (this.serverFiltering) {
        await this.filterCallBack(val)
        update(() => {})
      }
    },
    removeEvent(evt) {
      this.$emit('clear')
    }
  },
  computed: {
    model: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
