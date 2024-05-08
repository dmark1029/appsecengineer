<template>
  <div v-if="fetchlistInActivePartners" class="row">
    <div v-for="data in fetchlistInActivePartners" class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12" :key="data.id">
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
  <div class="text-center" v-if="Object.keys(partnerPaginationKeyInActiveForward).length > 0">
    <q-btn
      icon="keyboard_arrow_right"
      label="Load More"
      style="border: 2px solid white; margin: 7px 0px"
      @click="loadMorePartners(partnerPaginationKeyInActiveForward)"
    />
  </div>
</template>

<script>
import BoxView from 'components/partner/BoxFlashCard'
import { copyToClipboard } from 'quasar'
import { DateValidations, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'partnerTableInActive',
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
    ...mapActions('partner', ['fetchInActivePartners', 'searchPartnerInActive', 'searchByNameAction']),
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
      const data = {
        pagination: {},
        reset: false
      }
      if (Object.keys(pagination).length === 0) {
        this.fetchInActivePartners(data)
      } else {
        data.pagination = {
          pagination: pagination
        }
        if (this.searchByNameGetter && this.searchFireActive) {
          data.pagination.pk = 'instructor'
          data.pagination.query = this.searchByNameGetter
          this.searchPartnerInActive(data)
        } else {
          this.fetchInActivePartners(data)
        }
      }
    },
    optionsFn(date) {
      return date >= DateValidations(new Date()).replaceAll('/', '-')
    },
    async searchData() {
      const data = {
        pagination: {},
        reset: true
      }
      if (this.searchByNameGetter === ' ' || this.searchByNameGetter === '') {
        await this.fetchInActivePartners(data)
      } else {
        data.pagination = { pk: 'partner', query: this.searchByNameGetter }
        await this.searchPartnerInActive(data)
      }
    }
  },
  computed: {
    ...mapGetters('partner', {
      fetchlistInActivePartners: 'fetchlistInActivePartners',
      partnerPaginationKeyInActiveForward: 'partnerPaginationKeyInActiveForward',
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
