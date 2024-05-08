<template>
  <Page
    :isCreateIcon="roleIsAdmin"
    isTable
    v-model:search="searchByName"
    title="Settings"
    @createPage="createNewUser($event)"
    @clearSearchData="clearSearchData"
    @searchData="searchData"
  >
    <q-table
      class="q-table th.sortable sticky-header-table"
      :columns="columns"
      :rows="getUsersList"
      dark
      hide-bottom
      row-key="index"
      :rows-per-page-options="[0]"
      style="max-height: 70vh"
      :table-header-style="{ backgroundColor: '#191919' }"
      virtual-scroll
      :visible-columns="roleIsAdmin ? ['name', 'email', 'type', 'actions'] : ['name', 'email', 'type']"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">{{ props.row.first_name }}</q-td>
          <q-td key="email" :props="props">{{ props.row.email }}</q-td>
          <q-td key="type" :props="props">
            <label v-if="props.row.role.value">{{ props.row.role.value }}</label>
            <label v-else style="cursor: pointer">{{ props.row.role }}</label>
            <q-popup-edit
              v-if="props.row.email !== fetchUserInfo.email"
              color="white"
              dark
              :disable="fetchUserInfo.role !== 'Admin'"
              lazy-rule
              v-model="props.row.role"
            >
              <BaseSelect
                class="q-pa-xs"
                label="User Role *"
                :options="userTypeOptions"
                :model-value="props.row.role"
                @update:model-value="save_data(props.row, $event)"
              />
            </q-popup-edit>
          </q-td>
          <q-td key="actions" :props="props">
            <q-btn
              v-if="props.row.email !== fetchUserInfo.email"
              color="negative"
              flat
              icon="delete"
              round
              size="sm"
              @click="deleteNewUser(props.row.email)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <div v-if="Object.keys(usersPaginationKeyForward).length > 0" class="text-center">
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
import BaseSelect from 'components/shared/BaseSelect.vue'
import Page from 'components/shared/Page'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'UserTable',
  components: { BaseSelect, Page },
  data() {
    return {
      search: '',
      userTypeOptions: [
        { value: 'Admin', label: 'Admin' },
        { value: 'Analyst', label: 'Analyst' },
        { value: 'Creator', label: 'Creator' }
      ],
      pagination: { sortBy: 'desc', descending: false, page: 1, rowsPerPage: 8 },
      columns: [
        { name: 'name', label: 'Name', field: 'first_name', sortable: true, align: 'left' },
        { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
        { name: 'type', label: 'Role', field: 'role', sortable: true, align: 'left' },
        { name: 'actions', label: '', field: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  methods: {
    ...mapActions('users', ['fetchUsersList', 'searchUsers', 'searchByNameAction', 'updateUserType']),
    save_data(row, data) {
      const formData = {
        email: row.email,
        role: data.value
      }
      this.updateUserType(formData)
    },
    createNewUser(event) {
      if (event.show) {
        this.$emit('createNewUser', { show: true })
      }
    },
    loadMoreUsers(pagination) {
      const data = {
        pagination: pagination && { pagination },
        reset: false
      }

      if (this.searchByNameGetter && this.searchFireActive) {
        data.pagination.pk = 'users'
        data.pagination.query = this.searchByNameGetter
        this.searchUsers(data)
      } else {
        this.fetchUsersList(data)
      }
    },
    async searchData() {
      const data = {
        pagination: {},
        reset: true
      }

      if (this.searchByNameGetter && this.searchByNameGetter.trim() !== '') {
        data.pagination.pk = 'users'
        data.pagination.query = this.searchByNameGetter
        await this.searchUsers(data)
      } else {
        await this.fetchUsersList(data)
      }
    },
    clearSearchData() {
      const reset = ''
      this.searchByNameAction(reset)
      const data = {
        pagination: {},
        reset: true
      }
      this.fetchUsersList(data)
    },
    deleteNewUser(id) {
      this.$emit('deleteNewUser', { show: true, id: id })
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
    ...mapGetters('users', ['getUsersList', 'searchByNameGetter', 'searchFireActive', 'usersPaginationKeyForward']),
    ...mapGetters('login', ['roleIsAdmin', 'fetchUserInfo'])
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
