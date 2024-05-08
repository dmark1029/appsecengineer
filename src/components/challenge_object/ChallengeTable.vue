<template>
  <Page
    :isCreateIcon="roleIsAdmin"
    isTable
    title="Challenge"
    v-model:search="search"
    @clearSearchData="clearSearchData"
    @createPage="createPage"
    @searchData="searchData"
  >
    <q-table
      class="q-table th.sortable sticky-header-table"
      :columns="columns"
      dark
      hide-bottom
      row-key="index"
      :rows="tableData"
      :rows-per-page-options="[0]"
      style="max-height: 70vh"
      :table-header-style="{ backgroundColor: '#191919' }"
      virtual-scroll
      :visible-columns="roleIsAdmin ? ['name', 'actions'] : ['name']"
      v-if="tableData.length > 0"
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <q-item>
            <q-item-section>
              <q-item-label class="portal_font_family portal_md portal_font_color">
                {{ props.row.name }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td class="q-gutter-x-sm" :props="props">
          <q-btn color="positive" flat icon="lightbulb_outline" round size="sm" @click="solutionPage(props.row.sk)">
            <q-tooltip>Solution</q-tooltip>
          </q-btn>
          <q-btn color="blue" flat icon="code" round size="sm" @click="vScriptPage(props.row.sk)">
            <q-tooltip>Validator Script</q-tooltip>
          </q-btn>
          <q-btn color="warning" flat icon="edit" round size="sm" @click="updatePage(props.row.id || props.row.sk)">
            <q-tooltip>Update</q-tooltip>
          </q-btn>
          <q-btn color="negative" flat icon="delete" round size="sm" @click="deletePage(props.row.id || props.row.sk)">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <h6 class="text-center" v-else>NO DATA</h6>
    <div class="text-center" v-if="Object.keys(challengePaginationKeyForward).length > 0">
      <q-btn
        icon="keyboard_arrow_right"
        label="Load More"
        style="border: 2px solid white; margin: 7px 0px"
        @click="loadMoreChallenges(challengePaginationKeyForward)"
      />
    </div>
  </Page>
</template>

<script>
import Page from 'components/shared/Page'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: { Page },
  props: {
    tableData: { required: false }
  },
  data: () => ({
    columns: [
      { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
      { name: 'actions', label: '', field: 'actions', sortable: false, align: 'right' }
    ],
    search: ''
  }),
  computed: {
    ...mapGetters('login', ['roleIsAdmin']),
    ...mapGetters('challenge', ['challengePaginationKeyForward'])
  },
  methods: {
    ...mapActions('challenge', ['fetchChallenges', 'searchByNameAction']),
    createPage(event) {
      if (event.show) {
        this.$emit('createPage', { show: true })
      }
    },
    solutionPage(id) {
      this.$emit('solutionPage', { show: true, id })
    },
    vScriptPage(id) {
      this.$emit('vScriptPage', { show: true, id })
    },
    updatePage(id) {
      this.$emit('updatePage', { show: true, id })
    },
    deletePage(id) {
      this.$emit('deletePage', { show: true, id })
    },
    loadMoreChallenges(pagination) {
      const data = {
        pagination: {},
        reset: false
      }
      if (Object.keys(pagination).length !== 0) {
        data.pagination = { last_value: pagination }
      }
      this.fetchChallenges(data)
    },
    searchData(event) {
      const data = {
        pagination: { query: event },
        reset: true
      }
      this.fetchChallenges(data)
    },
    clearSearchData() {
      const reset = ''
      this.searchByNameAction(reset)
      const data = {
        pagination: {},
        reset: true
      }
      this.fetchChallenges(data)
      this.search = ''
    }
  }
}
</script>

<style lang="sass">
.sticky-header-table
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th,
  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0
</style>
