<template>
  <Page
    v-model:search="searchByName"
    :title="'Users'"
    @clearSearchData="clearSearchData"
    @searchData="searchData"
    :isCreateIcon="roleIsAdmin"
    :isTable="true"
  >
    <q-table
      :rows="getCompanyAdminUsersListGetter"
      :visible-columns="roleIsAdmin ? ['Name', 'Email', 'Action'] : ['Name', 'Email']"
      :columns="columns"
      row-key="index"
      :rows-per-page-options="[0]"
      virtual-scroll
      style="max-height: 70vh"
      hide-bottom
      dark
    >
      <template v-slot:body-cell-Action="props">
        <q-td :props="props">
          <q-btn round color="primary" icon="delete" size="sm" @click="deleteNewUser(props.row.email)">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <div class="col-md-12 col-sm-12 col-xs-12">
      <div class="text-center" style="padding-top: 2%; padding-bottom: 2%" v-if="getCompanyAdminUsersListGetter.length === 0">
        <p class="text-h4 text-weight-bold ase-roboto ase-black-light padding_12 text-center">No data</p>
      </div>
    </div>
    <div v-if="!adminUsersCompanyPaginationKeyForward.pk" class="text-center">
      <q-btn
        label="Load More"
        icon="keyboard_arrow_right"
        style="border: 2px solid white; margin: 7px 0px 7px 0px"
        @click="loadMoreInstructorsPath(adminUsersCompanyPaginationKeyForward)"
      />
    </div>
  </Page>
</template>

<script>
import Page from 'components/shared/Page'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'CompanyUserTable',
  components: { Page },
  data() {
    return {
      columns: [
        {
          name: 'Name',
          label: 'Name',
          field: 'first_name',
          sortable: true,
          align: 'left'
        },
        {
          name: 'Email',
          label: 'Email',
          field: 'email',
          sortable: true,
          align: 'left'
        },
        {
          name: 'Action',
          label: 'Action',
          field: 'Action',
          sortable: false,
          align: 'center'
        }
      ]
    }
  },
  created() {
    if (this.getCompanyAdminUsersListGetter.length === 0 && this.searchByNameGetter.length === 0 && !this.searchFireActive) {
      const data = {
        pagination: {},
        reset: false
      }
      this.fetchCompanyUsersList(data)
    }
  },
  methods: {
    ...mapActions('companyusers', ['fetchCompanyUsersList', 'searchCompanyUsers', 'searchByNameAction']),
    loadMoreUsers(pagination) {
      let data = {}
      if (Object.keys(pagination).length === 0) {
        data = {
          pagination: {},
          reset: false
        }
        this.fetchCompanyUsersList(data)
      } else {
        data = {
          pagination: {
            pagination: pagination
          },
          reset: false
        }
        if (this.searchByNameGetter && this.searchFireActive) {
          data.pagination.pk = 'users'
          data.pagination.query = this.searchByNameGetter
          this.searchCompanyUsers(data)
        } else {
          this.fetchCompanyUsersList(data)
        }
      }
    },
    async searchData() {
      if (this.searchByNameGetter === ' ' || this.searchByNameGetter === '') {
        const data = {
          pagination: {},
          reset: true
        }
        await this.fetchCompanyUsersList(data)
      } else {
        const data = {
          pagination: {
            pk: 'users',
            query: this.searchByNameGetter
          },
          reset: true
        }
        await this.searchCompanyUsers(data)
      }
    },
    clearSearchData() {
      const reset = ''
      this.searchByNameAction(reset)
      const data = {
        pagination: {},
        reset: true
      }
      this.fetchCompanyUsersList(data)
    },
    deleteNewUser(id) {}
  },
  computed: {
    searchByName: {
      get() {
        return this.$store.state.companyusers.searchByName
      },
      set(value) {
        this.$store.commit('companyusers/SEARCH_BY_NAME', value)
      }
    },
    ...mapGetters('companyusers', {
      isLoading: 'isLoading',
      getCompanyAdminUsersListGetter: 'getCompanyAdminUsersListGetter',
      searchByNameGetter: 'searchByNameGetter',
      searchFireActive: 'searchFireActive',
      adminUsersCompanyPaginationKeyForward: 'adminUsersCompanyPaginationKeyForward'
    }),
    ...mapGetters('login', {
      roleIsAdmin: 'roleIsAdmin'
    })
  }
}
</script>
