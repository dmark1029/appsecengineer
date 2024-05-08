<template>
  <div class="q-mb-sm q-pa-sm">
    <q-btn size="md" color="primary" @click="createPartner({ show: true })">Create</q-btn>
  </div>
  <div v-if="fetchlistPartners.length" class="row">
    <div v-for="data in fetchlistPartners" class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12" :key="data.id">
      <div class="q-pa-sm">
        <BoxView
          :data="data"
          :expired="optionsFn(data.endDate)"
          @copySignUpURL="copySignUpURL(data.id, data)"
          @deletePartner="deletePartner(data.id)"
          @updatePage="updatePartner(data.id)"
        />
      </div>
    </div>
  </div>
  <h3 v-else class="text-center">No Data</h3>
  <div class="text-center" v-if="Object.keys(partnerPaginationKeyForward).length > 0">
    <q-btn
      label="Load More"
      icon="keyboard_arrow_right"
      style="border: 2px solid white; margin: 7px 0px"
      @click="loadMorePartners(partnerPaginationKeyForward)"
    />
  </div>
</template>

<script>
import BoxView from 'components/partner/BoxFlashCard'
import { copyToClipboard } from 'quasar'
import { DateValidations, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PartnerTable',
  components: { BoxView },
  emits: ['createPartner', 'updatePartner', 'deletePartner'],
  data() {
    return {
      search: '',
      currentPage: 1,
      pagination: { sortBy: 'desc', descending: false, page: 1, rowsPerPage: 8 },
      columns: [
        { name: 'Name', label: 'Name', field: 'name', sortable: true, align: 'left' },
        { name: 'Action', label: 'Action', field: 'Action', sortable: false, align: 'right' }
      ]
    }
  },
  methods: {
    ...mapActions('partner', ['fetchPartners', 'searchPartner', 'searchByNameAction']),
    createPartner(event) {
      if (event.show) {
        this.$emit('createPartner', { show: true })
      }
    },
    updatePartner(id) {
      this.$emit('updatePartner', { show: true, id: id })
    },
    copySignUpURL(id, rowData) {
      let urlPartner = `https://learning.appsecengineer.com/signup/partner/${urlSafeBase64Encode(id)}/${urlSafeBase64Encode(rowData.name)}`
      if (window.location.origin === 'https://uat.admin.appsecengineer.com') {
        urlPartner = `https://uat.learning.appsecengineer.com/signup/partner/${urlSafeBase64Encode(id)}/${urlSafeBase64Encode(
          rowData.name
        )}`
      } else if (window.location.origin === 'https://staging.admin.appsecengineer.com') {
        urlPartner = `https://staging.learning.appsecengineer.com/signup/partner/${urlSafeBase64Encode(id)}/${urlSafeBase64Encode(
          rowData.name
        )}`
      } else if (window.location.origin !== 'https://admin.appsecengineer.com') {
        urlPartner = `https://uat.learning.appsecengineer.com/signup/partner/${urlSafeBase64Encode(id)}/${urlSafeBase64Encode(
          rowData.name
        )}`
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
    },
    deletePartner(id) {
      this.$emit('deletePartner', { show: true, id: id })
    },
    loadMorePartners(pagination) {
      let data = {}
      if (Object.keys(pagination).length === 0) {
        data = {
          pagination: {},
          reset: false
        }
        this.fetchPartners(data)
      } else {
        data = {
          pagination: {
            pagination: pagination
          },
          reset: false
        }
        if (this.searchByNameGetter && this.searchFireActive) {
          data.pagination.pk = 'instructor'
          data.pagination.query = this.searchByNameGetter
          this.searchPartner(data)
        } else {
          this.fetchPartners(data)
        }
      }
    },
    optionsFn(date) {
      return date >= DateValidations(new Date()).replaceAll('/', '-')
    },
    async searchData() {
      if (this.searchByNameGetter === ' ' || this.searchByNameGetter === '') {
        const data = {
          pagination: {},
          reset: true
        }
        await this.fetchPartners(data)
      } else {
        const data = {
          pagination: {
            pk: 'partner',
            query: this.searchByNameGetter
          },
          reset: true
        }
        await this.searchPartner(data)
      }
    },
    clearSearchData() {
      const reset = ''
      this.searchByNameAction(reset)
      const data = {
        pagination: {},
        reset: true
      }
      this.fetchPartners(data)
    }
  },
  computed: {
    searchByName: {
      get() {
        return this.$store.state.instructor.searchByName
      },
      set(value) {
        this.$store.commit('instructor/SEARCH_BY_NAME', value)
      }
    },
    ...mapGetters('partner', {
      fetchlistPartners: 'fetchlistPartners',
      partnerPaginationKeyForward: 'partnerPaginationKeyForward',
      searchByNameGetter: 'searchByNameGetter',
      searchFireActive: 'searchFireActive'
    })
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
