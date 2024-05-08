<template>
  <div class="q-mb-sm q-pa-sm">
    <q-btn color="primary" @click="createTraining({ show: true })">Create</q-btn>
  </div>
  <div v-if="fetchlistTrainings" class="row">
    <div v-for="data in fetchlistTrainings" class="col-lg-3 col-md-4 col-sm-6 col-xs-12" :key="data.id">
      <div class="q-pa-sm">
        <BoxView
          :data="data"
          :expired="optionsFn(data.endDate)"
          @copySignUpURL="copySignUpURL(data.id, data)"
          @updatePage="updateTraining(data.id)"
          @showUpdateCourse="updateTraining(data.id)"
          @showDeleteTraining="deleteTraining(data.id)"
        />
      </div>
    </div>
  </div>
  <div v-if="Object.keys(trainingPaginationKeyForward).length > 0" class="text-center">
    <q-btn
      icon="keyboard_arrow_right"
      label="Load More"
      style="border: 2px solid white"
      @click="loadMoreTrainings(trainingPaginationKeyForward)"
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
      pagination: { sortBy: 'desc', descending: false, page: 1, rowsPerPage: 8 }
    }
  },
  methods: {
    ...mapActions('training', ['fetchTrainings', 'searchTraining', 'searchByNameAction']),
    createTraining(event) {
      if (event.show) {
        this.$emit('createTraining', { show: true })
      }
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
        .then(() => this.$q.notify({ message: 'Successfully Copied', color: 'green', position: 'top' }))
        .catch(() => this.$q.notify({ message: 'Not able to copy', color: 'red', position: 'top' }))
    },
    loadMoreTrainings(pagination) {
      let data = {}
      if (Object.keys(pagination).length === 0) {
        data = {
          last_value: {},
          reset: false
        }
        this.fetchTrainings(data)
      } else {
        data = {
          pagination: {
            last_value: pagination
          },
          reset: false
        }
        if (this.searchByNameGetter && this.searchFireActive) {
          data.pagination.pk = 'instructor'
          data.pagination.query = this.searchByNameGetter
          this.searchTraining(data)
        } else {
          this.fetchTrainings(data)
        }
      }
    }
  },
  computed: {
    ...mapGetters('training', ['fetchlistTrainings', 'trainingPaginationKeyForward', 'searchByNameGetter', 'searchFireActive'])
  }
}
</script>
