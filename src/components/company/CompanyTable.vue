<template>
  <section class="viewPages">
    <div class="row">
      <div class="col-6" style="padding: 1%">
        <q-btn size="md" color="primary" @click="createPage({ show: true })">Create</q-btn>
      </div>
      <div class="col-6" style="padding: 1%">
        <q-input
          bottom-slots
          class="q-ml-md float-right"
          dark
          dense
          label-color="white"
          outlined
          v-model="searchByName"
          @keydown.enter.prevent="searchData"
        >
          <template v-slot:append>
            <q-icon v-if="searchByName.length > 0" name="clear" class="cursor-pointer" @click="clearSearchData" />
            <q-btn round dense flat icon="search" @click="searchData" />
          </template>
        </q-input>
      </div>
    </div>

    <div v-if="companiesData" class="row">
      <div v-for="(data, index) in companiesData" class="col-lg-3 col-md-4 col-sm-6 col-xs-12" :key="index">
        <div class="q-pa-sm">
          <BoxView
            :data="data"
            :expired="optionsFn(data.endDate)"
            @copySignUpURL="copySignUpURL(data.id, data)"
            @showUpdateCourse="showUpdateCourse(data.id)"
            @updatePage="updatePage(data.id)"
            @viewCompanyInfo="viewCompanyInfo(data)"
          />
        </div>
      </div>
    </div>
    <p v-if="!isLoading && companiesData.length === 0" class="ase-black-light text-center text-h5 text-weight-bold">NO DATA</p>
    <div class="text-center" v-if="Object.keys(companyPaginationKeyForward).length > 0">
      <q-btn icon="chevron_right" label="Load More" style="border: 2px solid" @click="loadMoreCompany(companyPaginationKeyForward)" />
    </div>
  </section>
</template>

<script>
import BoxView from 'components/company/BoxFlashCard'
import { copyToClipboard } from 'quasar'
import { DateValidations, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: { BoxView },
  props: {
    title: { type: String, default: 'Header' },
    tableData: { required: false }
  },
  computed: {
    searchByName: {
      get() {
        return this.$store.state.company.searchByName
      },
      set(value) {
        this.$store.commit('company/SEARCH_BY_NAME', value)
      }
    },
    ...mapGetters('company', ['isLoading', 'companiesData', 'companyPaginationKeyForward', 'searchByNameGetter', 'searchFireActive'])
  },
  methods: {
    ...mapActions('company', ['fetchCompanies', 'searchCompanies', 'searchByNameAction']),
    createPage(event) {
      if (event.show) {
        this.$emit('createPage', { show: true })
      }
    },
    optionsFn(date) {
      return DateValidations(new Date()).replaceAll('/', '-') > date
    },
    updatePage(id) {
      this.$emit('updatePage', { show: true, id: id })
    },
    viewCompanyInfo(prop) {
      sessionStorage.setItem('companyInfo', JSON.stringify({}))
      this.$emit('viewCompanyInfo', { show: true, prop: prop })
    },
    loadMoreCompany(pagination) {
      const data = {
        pagination: {},
        reset: false
      }
      if (Object.keys(pagination).length === 0) {
        this.fetchCompanies(data)
      } else {
        data.pagination = { pagination: pagination }
        if (this.searchByNameGetter && this.searchFireActive) {
          data.pagination.query = this.searchByNameGetter
          this.searchCompanies(data)
        } else {
          data.pagination = { last_value: pagination }
          this.fetchCompanies(data)
        }
      }
    },
    async searchData() {
      const data = {
        pagination: {},
        reset: true
      }
      if (this.searchByNameGetter === ' ' || this.searchByNameGetter === '') {
        await this.fetchCompanies(data)
      } else {
        data.pagination = { query: this.searchByNameGetter }
        await this.searchCompanies(data)
      }
    },
    clearSearchData() {
      this.searchByNameAction('')
      this.fetchCompanies({ pagination: {}, reset: true })
    },

    copySignUpURL(id, rowData) {
      if (rowData.subscriptionType === 'Partner') {
        let urlPartner = `https://learning.appsecengineer.com/signup/partner/${urlSafeBase64Encode(id)}`
        if (window.location.origin === 'https://uat.admin.appsecengineer.com') {
          urlPartner = `https://uat.learning.appsecengineer.com/signup/partner/${urlSafeBase64Encode(id)}`
        } else if (window.location.origin === 'https://staging.admin.appsecengineer.com') {
          urlPartner = `https://staging.learning.appsecengineer.com/signup/partner/${urlSafeBase64Encode(id)}`
        } else if (window.location.origin !== 'https://admin.appsecengineer.com') {
          urlPartner = `https://uat.learning.appsecengineer.com/signup/partner/${urlSafeBase64Encode(id)}`
        }
        copyToClipboard(urlPartner)
          .then(() => {
            this.$q.notify({
              message: 'Successfully Copied',
              color: 'green',
              position: 'top'
            })
          })
          .catch(() => {
            this.$q.notify({
              message: 'Not able to copy',
              color: 'red',
              position: 'top'
            })
          })
      } else {
        let url = `https://learning.appsecengineer.com/signup/${urlSafeBase64Encode(id)}`
        if (window.location.origin === 'https://uat.admin.appsecengineer.com') {
          url = `https://uat.learning.appsecengineer.com/signup/${urlSafeBase64Encode(id)}`
        } else if (window.location.origin === 'https://staging.admin.appsecengineer.com') {
          url = `https://staging.learning.appsecengineer.com/signup/${urlSafeBase64Encode(id)}`
        } else if (window.location.origin !== 'https://admin.appsecengineer.com') {
          url = `https://uat.learning.appsecengineer.com/signup/${urlSafeBase64Encode(id)}`
        }
        copyToClipboard(url)
          .then(() => {
            this.$q.notify({
              message: 'Successfully Copied',
              color: 'green',
              position: 'top'
            })
          })
          .catch(() => {
            this.$q.notify({
              message: 'Not able to copy',
              color: 'red',
              position: 'top'
            })
          })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
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
