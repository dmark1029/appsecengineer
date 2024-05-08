<template>
  <section class="viewPages">
    <q-input
      bottom-slots
      class="q-ml-auto"
      dark
      dense
      label-color="white"
      outlined
      style="width: 30%"
      v-model="searchByNameInActive"
      @keydown.enter.prevent="searchData"
    >
      <template v-slot:append>
        <q-icon v-if="searchByNameInActive.length > 0" name="clear" class="cursor-pointer" @click="clearSearchData" />
        <q-btn round dense flat icon="search" @click="searchData" />
      </template>
    </q-input>
    <div v-if="companiesDataInActive" class="row">
      <div v-for="(data, index) in companiesDataInActive" class="col-lg-3 col-md-4 col-sm-6 col-xs-12" :key="index">
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
    <p v-if="!isLoading && companiesDataInActive.length === 0" class="ase-black-light text-center text-h5 text-weight-bold">NO DATA</p>
    <div v-if="Object.keys(companyPaginationKeyInActiveForward).length > 0" class="text-center">
      <q-btn
        icon="chevron_right"
        label="Load More"
        style="border: 2px solid"
        @click="loadMoreCompany(companyPaginationKeyInActiveForward)"
      />
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
    searchByNameInActive: {
      get() {
        return this.$store.state.company.searchByNameInActive
      },
      set(value) {
        this.$store.commit('company/SEARCH_BY_NAME_INACTIVE', value)
      }
    },
    ...mapGetters('company', [
      'isLoading',
      'companiesDataInActive',
      'companyPaginationKeyInActiveForward',
      'searchByNameInActiveGetter',
      'searchFireActive'
    ])
  },
  methods: {
    ...mapActions('company', ['fetchInActiveCompanies', 'searchInActiveCompanies', 'searchByNameInActiveAction']),
    optionsFn(date) {
      return DateValidations(new Date()).replaceAll('/', '-') > date
    },
    updatePage(id) {
      this.$emit('updatePage', { show: true, id: id })
    },
    viewCompany(id) {
      sessionStorage.setItem('companyInfo', JSON.stringify({}))
      this.$emit('viewCompany', { show: true, id: urlSafeBase64Encode(id) })
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
        this.fetchInActiveCompanies(data)
      } else {
        data.pagination = { pagination: pagination }
        if (this.searchByNameInActiveGetter && this.searchFireActive) {
          data.pagination.query = this.searchByNameInActiveGetter
          this.searchInActiveCompanies(data)
        } else {
          data.pagination = { last_value: pagination }
          this.fetchInActiveCompanies(data)
        }
      }
    },
    async searchData() {
      const data = {
        pagination: {},
        reset: true
      }
      if (this.searchByNameInActiveGetter === ' ' || this.searchByNameInActiveGetter === '') {
        await this.fetchInActiveCompanies(data)
      } else {
        data.pagination = { query: this.searchByNameInActiveGetter }
        await this.searchInActiveCompanies(data)
      }
    },
    clearSearchData() {
      this.searchByNameInActiveAction('')
      const data = {
        pagination: {},
        reset: true
      }
      this.fetchInActiveCompanies(data)
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
