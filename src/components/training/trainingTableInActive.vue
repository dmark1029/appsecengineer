<template>
  <div v-if="fetchlistTrainingsInActive" class="row">
    <div v-for="data in fetchlistTrainingsInActive" class="col-lg-3 col-md-4 col-sm-6 col-xs-12" :key="data.id">
      <div class="q-pa-sm">
        <BoxView
          :expired="optionsFn(data.endDate)"
          :data="data"
          @copySignUpURL="copySignUpURL(data.id, data)"
          @updatePage="updateTraining(data.id)"
          @showDeleteTraining="deleteTraining(data.id)"
          @showUpdateCourse="updateTraining(data.id)"
        />
      </div>
    </div>
  </div>
  <div v-if="Object.keys(trainingPaginationKeyForwardInActive).length > 0" class="text-center">
    <q-btn
      class="q-mt-sm"
      icon="keyboard_arrow_right"
      label="Load More"
      style="border: 2px solid white"
      @click="loadMoreTrainings(trainingPaginationKeyForwardInActive)"
    />
  </div>
</template>

<script>
import BoxView from 'components/training/BoxFlashCard'
import { copyToClipboard } from 'quasar'
import { DateValidations, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'TrainingTable',
  emits: ['createTraining', 'updateTraining', 'deleteTraining'],
  components: { BoxView },
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
    ...mapActions('training', ['fetchTrainingsInActive', 'searchTraining', 'searchByNameAction']),
    createTraining(event) {
      if (event.show) {
        this.$emit('createTraining', { show: true })
      }
    },
    setPage(page) {},
    goToCoursePage(id) {
      this.$router.push(`/portal/subject/${urlSafeBase64Encode(id)}`)
    },
    updateTraining(id) {
      this.$emit('updateTraining', { show: true, id: id })
    },
    deleteTraining(id) {
      this.$emit('deleteTraining', { show: true, id: id })
    },
    optionsFn(date) {
      return date >= DateValidations(new Date()).replaceAll('/', '-')
    },
    copySignUpURL(id, rowData) {
      let urlPartner = `https://learning.appsecengineer.com/signup/training/${urlSafeBase64Encode(id)}/${urlSafeBase64Encode(rowData.name)}`
      if (window.location.origin === 'https://uat.admin.appsecengineer.com') {
        urlPartner = `https://uat.learning.appsecengineer.com/signup/training/${urlSafeBase64Encode(id)}/${urlSafeBase64Encode(
          rowData.name
        )}`
      } else if (window.location.origin === 'https://staging.admin.appsecengineer.com') {
        urlPartner = `https://staging.learning.appsecengineer.com/signup/training/${urlSafeBase64Encode(id)}/${urlSafeBase64Encode(
          rowData.name
        )}`
      } else if (window.location.origin !== 'https://admin.appsecengineer.com') {
        urlPartner = `https://uat.learning.appsecengineer.com/signup/training/${urlSafeBase64Encode(id)}/${urlSafeBase64Encode(
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
    loadMoreTrainings(pagination) {
      let data = {}
      if (Object.keys(pagination).length === 0) {
        data = {
          pagination: {},
          reset: false
        }
        this.fetchTrainingsInActive(data)
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
          this.searchTraining(data)
        } else {
          this.fetchTrainingsInActive(data)
        }
      }
    },
    async searchData() {
      if (this.searchByNameGetter === ' ' || this.searchByNameGetter === '') {
        const data = {
          pagination: {},
          reset: true
        }
        await this.fetchTrainingsInActive(data)
      } else {
        const data = {
          pagination: {
            pk: 'training',
            query: this.searchByNameGetter
          },
          reset: true
        }
        await this.searchTraining(data)
      }
    },
    clearSearchData() {
      const reset = ''
      this.searchByNameAction(reset)
      const data = {
        pagination: {},
        reset: true
      }
      this.fetchTrainingsInActive(data)
    }
  },
  computed: {
    searchByName: {
      get() {
        return this.$store.state.training.searchByName
      },
      set(value) {
        this.$store.commit('training/SEARCH_BY_NAME', value)
      }
    },
    ...mapGetters('training', {
      isLoading: 'isLoading',
      fetchlistTrainingsInActive: 'fetchlistTrainingsInActive',
      trainingPaginationKeyForwardInActive: 'trainingPaginationKeyForwardInActive',
      trainingPaginationKeyBackward: 'trainingPaginationKeyBackward',
      searchByNameGetter: 'searchByNameGetter',
      searchFireActive: 'searchFireActive'
    }),
    ...mapGetters('login', {
      roleIsAdmin: 'roleIsAdmin'
    }),
    pageCount() {
      return Math.ceil(this.fetchlistTrainingsInActive.length / 8)
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
