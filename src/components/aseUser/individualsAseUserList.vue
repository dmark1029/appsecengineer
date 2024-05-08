<template>
  <Page
    :isCreateIcon="false"
    :isTable="true"
    v-model:search="searchByName"
    title="ASE Users"
    @clearSearchData="clearSearchData"
    @createPage="createNewUser($event)"
    @searchData="searchData"
  >
    <div class="col-sm-6 text-right">
      <q-btn class="q-ma-sm" icon="download" label="Users Report" no-caps size="md" @click="$emit('downloadASECSVUsers')" />
    </div>
    <q-table
      class="q-table th.sortable sticky-header-table"
      :columns="columns"
      dark
      :rows="getASEUsersList"
      hide-bottom
      row-key="index"
      :rows-per-page-options="[0]"
      style="max-height: 70vh"
      :table-header-style="{ backgroundColor: '#191919' }"
      virtual-scroll
    >
      <template v-slot:body-cell-FirstName="props" class="q-table--horizontal-separator thead th">
        <q-td :props="props" class="cursor_pointer" @click="individualUser(props.row.email, props.row.first_name)">
          {{ props.row.first_name }}
          <q-tooltip>{{ props.row.first_name }}</q-tooltip>
        </q-td>
      </template>
      <template v-slot:body-cell-LastName="props" class="q-table--horizontal-separator thead th">
        <q-td :props="props" class="cursor_pointer" @click="individualUser(props.row.email, props.row.first_name)">
          {{ props.row.last_name }}
          <q-tooltip>{{ props.row.last_name }}</q-tooltip>
        </q-td>
      </template>
      <template v-slot:body-cell-Email="props" class="q-table--horizontal-separator thead th">
        <q-td :props="props" class="cursor_pointer" @click="individualUser(props.row.email, props.row.first_name)">
          {{ props.row.email }}
          <q-tooltip>{{ props.row.email }}</q-tooltip>
        </q-td>
      </template>
      <template v-slot:body-cell-Action="props" class="q-table--horizontal-separator thead th">
        <q-td :props="props">
          <q-btn round color="primary" icon="edit" size="sm" @click="updateUser(props.row)" style="margin-right: 2%">
            <q-tooltip>Update</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <div class="text-center" v-if="Object.keys(usersPaginationKeyForward).length > 0">
      <q-btn
        icon="keyboard_arrow_right"
        label="Load More"
        style="border: 2px solid white; margin: 7px 0px"
        @click="loadMoreUsers(usersPaginationKeyForward)"
      />
    </div>
  </Page>
</template>

<script>
import Page from 'src/components/shared/Page'
import { urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: { Page },
  data() {
    return {
      search: '',
      pagination: { sortBy: 'desc', descending: false, page: 1, rowsPerPage: 20 },
      columns: [
        { name: 'FirstName', label: 'First Name', field: 'first_name', sortable: true, align: 'left' },
        { name: 'LastName', label: 'Last Name', field: 'last_name', sortable: true, align: 'left' },
        { name: 'Email', label: 'Email', field: 'email', sortable: true, align: 'left' },
        { name: 'Subscription Type', label: 'Subscription Type', field: 'subscription_type', sortable: true, align: 'left' },
        { name: 'Start Date', label: 'Start Date', field: 'start_date', sortable: true, align: 'left' },
        { name: 'End Date', label: 'End Date', field: 'end_date', sortable: true, align: 'left' },
        { name: 'Action', label: 'Action', field: 'Action', sortable: false, align: 'right' }
      ]
    }
  },
  methods: {
    ...mapActions('users', ['fetchASEUsersList', 'searchASEUsers', 'searchByNameAction']),
    loadMoreUsers(pagination) {
      let data = {}
      if (Object.keys(pagination).length === 0) {
        data = {
          pagination: {}
        }
        this.fetchASEUsersList(data)
      } else {
        data = {
          pagination: {
            pagination: pagination
          },
          reset: false
        }
        if (this.searchByNameGetter && this.searchFireActive) {
          const data = {
            search_key: this.searchByNameGetter
          }
          this.searchASEUsers(data)
        } else {
          this.fetchASEUsersList(data)
        }
      }
    },
    updateUser(row) {
      this.$emit('updateASEUser', { show: true, row: row })
    },
    individualUser(email, name) {
      this.$router.push(`/portal/user-info/${urlSafeBase64Encode(email)}/${urlSafeBase64Encode(name)}/`)
    },
    async searchData() {
      if (this.searchByNameGetter === ' ' || this.searchByNameGetter === '') {
        const data = {
          pagination: {},
          reset: true
        }
        await this.fetchASEUsersList(data)
      } else {
        const data = {
          search_key: this.searchByNameGetter
        }
        await this.searchASEUsers(data)
      }
    },
    clearSearchData() {
      const reset = ''
      this.searchByNameAction(reset)
      const data = {
        pagination: {},
        reset: true
      }
      this.fetchASEUsersList(data)
    }
  },
  computed: {
    searchByName: {
      get() {
        return this.$store.state.users.searchByName
      },
      set(value) {
        this.$store.commit('users/SEARCH_BY_NAME', value)
      }
    },
    ...mapGetters('users', ['getASEUsersList', 'usersPaginationKeyForward', 'searchByNameGetter', 'searchFireActive'])
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
