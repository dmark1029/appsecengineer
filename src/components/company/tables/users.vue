<template>
  <Page
    :isCreateIcon="true && roleIsAdmin"
    isTable
    title="Users List"
    v-model:search="searchByName"
    @createPage="createNewUser"
    @clearSearchData="clearSearchData"
    @searchData="searchData"
  >
    <q-table
      :columns="columns"
      dark
      hide-bottom
      row-key="email"
      :rows="rows"
      :rows-per-page-options="[0]"
      style="max-height: 50vh"
      virtual-scroll
      :visible-columns="roleIsAdmin ? ['Name', 'Email', 'Last Login', 'Update', 'isActive', 'Action'] : ['Name', 'Email', 'Last Login']"
    >
      <template v-slot:body-cell-isActive="props">
        <q-td :props="props" class="cursor_pointer">
          <BaseToggle v-model="props.row.isActive" @update:model-value="toggleDataActive(props.row.email, props.row.isActive)" />
        </q-td>
      </template>
      <template v-slot:body-cell-Action="props">
        <q-td :props="props">
          <BaseToggle v-model="props.row.isAdmin" @update:model-value="toggleData(props.row.email, props.row.isAdmin)" />
        </q-td>
      </template>
      <template v-slot:bottom-row>
        <q-tr v-if="Object.keys(usersCompanyPaginationKeyForward).length > 0">
          <q-td class="text-center" colspan="5">
            <q-separator dark />
            <q-btn
              label="Load More"
              icon="keyboard_arrow_right"
              style="border: 2px solid white; margin: 7px 0px"
              @click="loadMoreUsers(usersCompanyPaginationKeyForward)"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <div class="col-md-12 col-sm-12 col-xs-12">
      <div class="text-center" style="padding-top: 2%; padding-bottom: 2%" v-if="getCompanyUsersListGetter.length === 0">
        <p class="text-h4 text-weight-bold ase-roboto ase-black-light padding_12 text-center">No data</p>
      </div>
    </div>
  </Page>

  <CreateUser v-if="isCreate" :show="isCreate" @onCacel="cancelCreateUser($event)">{{ title }}</CreateUser>
</template>

<script>
import CreateUser from 'components/company/tables/CreateUser'
import BaseToggle from 'components/shared/BaseToggle.vue'
import Page from 'components/shared/Page'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CompanyUserTable',
  components: { CreateUser, Page, BaseToggle },
  data() {
    return {
      columns: [
        { name: 'Name', label: 'Name', field: 'first_name', sortable: true, align: 'left' },
        { name: 'Email', label: 'Email', field: 'email', sortable: true, align: 'left' },
        { name: 'Last Login', label: 'Last login', field: 'last_login', sortable: true, align: 'left' },
        { name: 'isActive', label: 'is Active', field: 'isActive', align: 'right' },
        { name: 'Action', label: 'Is Admin', field: 'Action', align: 'right' }
      ],
      rows: [],
      stateOfUser: false,
      isCreate: false
    }
  },
  async created() {
    this.uiSearchAction(true)
    const data = {
      pagination: {
        company_id: urlSafeBase64Decode(this.companyId)
      },
      reset: true
    }
    await this.fetchCompanyUsersList(data)
    this.rows = Array.from(this.getCompanyUsersListGetter, (item) => Object.assign({}, item))
  },
  props: {
    companyId: {
      required: false
    }
  },
  methods: {
    ...mapActions('companyusers', [
      'fetchCompanyUsersList',
      'searchCompanyUsers',
      'searchByNameAction',
      'uiSearchAction',
      'fetchToggleStatus',
      'fetchToggleStatusIsActive'
    ]),
    createNewUser(event) {
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.isCreate = true
          this.updateId = ''
        }
      }
    },
    cancelCreateUser(event) {
      if (event.show) {
        this.isCreate = false
      }
    },
    async loadMoreUsers(pagination) {
      const data = {
        pagination: {
          pagination: pagination
        },
        reset: false
      }

      if (this.searchByNameGetter && this.searchFireActive) {
        data.pagination.pk = 'users'
        data.pagination.query = this.searchByNameGetter
      } else {
        data.pagination.company_id = urlSafeBase64Decode(this.$route.params.companyid)
      }

      if (Object.keys(pagination).length === 0) {
        data.pagination.company_id = urlSafeBase64Decode(this.$route.params.companyid)
      }

      if (this.searchByNameGetter && this.searchFireActive) {
        this.searchCompanyUsers(data)
      } else {
        await this.fetchCompanyUsersList(data)
      }

      this.rows = Array.from(this.getCompanyUsersListGetter, (item) => ({ ...item }))
    },
    async searchData() {
      if (this.searchByNameGetter === ' ' || this.searchByNameGetter === '') {
        const data = {
          pagination: { company_id: urlSafeBase64Decode(this.$route.params.companyid) },
          reset: true
        }
        await this.fetchCompanyUsersList(data)
      } else {
        const data = {
          pagination: { pk: 'users', query: this.searchByNameGetter },
          reset: true
        }
        await this.searchCompanyUsers(data)
      }
    },
    clearSearchData() {
      const reset = ''
      this.searchByNameAction(reset)
      const data = {
        pagination: {
          company_id: urlSafeBase64Decode(this.$route.params.companyid)
        },
        reset: true
      }
      this.fetchCompanyUsersList(data)
    },
    updateNewUser(email) {},
    async toggleData(email, oldStatus) {
      let action_type = 'admin'
      if (oldStatus) {
        action_type = 'admin'
      }
      this.stateOfUser = !this.stateOfUser
      const data = {
        email: email,
        company_id: urlSafeBase64Decode(this.$route.params.companyid),
        action_type: action_type
      }
      await this.fetchToggleStatus(data)
    },
    async toggleDataActive(email, oldStatus) {
      let action_type = 'active'
      if (oldStatus) {
        action_type = 'active'
      }
      const data = {
        email: email,
        company_id: urlSafeBase64Decode(this.$route.params.companyid),
        action_type: action_type
      }
      await this.fetchToggleStatusIsActive(data)
    }
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
    ...mapGetters('companyusers', [
      'getCompanyUsersListGetter',
      'searchByNameGetter',
      'searchFireActive',
      'usersCompanyPaginationKeyForward'
    ]),
    ...mapGetters('login', ['roleIsAdmin'])
  }
}
</script>
