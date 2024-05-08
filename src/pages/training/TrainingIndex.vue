<template>
  <q-tabs active-color="white" align="justify" class="text-grey" dense indicator-color="white" v-model="tab" @click="tabInfo">
    <q-tab name="activeTrainings" label="Active" />
    <q-tab name="inActiveTrainings" label="Expired" />
  </q-tabs>
  <q-separator dark />
  <q-tab-panels v-model="tab" animated>
    <q-tab-panel class="bg-dark text-white" dark name="activeTrainings">
      <TrainingTable @createTraining="showCreateTraining" @deleteTraining="showDeleteTraining" @updateTraining="showUpdateTraining" />
    </q-tab-panel>
    <q-tab-panel class="bg-dark text-white" dark name="inActiveTrainings">
      <TrainingTableInActive
        @createTraining="showCreateTraining"
        @deleteTraining="showDeleteTraining"
        @updateTraining="showUpdateTraining"
      />
    </q-tab-panel>
  </q-tab-panels>

  <CreateTraining
    v-if="isCreate && !isDelete"
    :id="updateId"
    v-model:name="typeCreate"
    :show="isCreate"
    @onCacel="cancelCreateTraining($event)"
  />
  <Delete
    v-if="isDelete"
    :show="isDelete"
    :header="'a Training'"
    @confirmDelete="trainingConfirmDeletion($event)"
    @confirmDeleteCancel="trainingConfirmDeleteCancel($event)"
  />
</template>

<script>
import Delete from 'components/shared/Delete.vue'
import CreateTraining from 'components/training/createTraining'
import TrainingTable from 'components/training/trainingTable'
import TrainingTableInActive from 'components/training/trainingTableInActive'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PartnerIndex',
  components: { TrainingTable, TrainingTableInActive, CreateTraining, Delete },
  data() {
    return {
      tab: 'activeTrainings',
      isCreate: false,
      isDelete: false,
      updateId: '',
      typeCreate: '',
      trainingID: ''
    }
  },
  created() {
    if (this.fetchlistTrainings.length === 0 && this.searchByNameGetter.length === 0) {
      const data = {
        pagination: {},
        reset: true
      }
      this.fetchTrainings(data)
    }
    if (this.plansOptionsGetter.length === 0) {
      this.fetchplansOptions({})
    }
  },
  computed: {
    ...mapGetters('training', {
      fetchlistTrainings: 'fetchlistTrainings',
      fetchlistTrainingsInActive: 'fetchlistTrainingsInActive',
      searchByNameGetter: 'searchByNameGetter',
      plansOptionsGetter: 'plansOptionsGetter'
    })
  },
  methods: {
    ...mapActions('training', [
      'fetchTrainingsInActive',
      'fetchTrainings',
      'fetchTraining',
      'deleteTraining',
      'searchTraining',
      'errorMsgReset',
      'fetchplansOptions'
    ]),
    showCreateTraining(event) {
      const errorMsgs = {
        partner_name: false,
        partner_name_msg: '',
        plans: false,
        plans_msg: '',
        start_date: false,
        start_date_msg: '',
        end_date: false,
        end_date_msg: '',
        num_users: false,
        num_users_msg: '',
        domains: false,
        domains_msg: '',
        minutes_per_user: false,
        minutes_per_user_msg: ''
      }
      this.errorMsgReset(errorMsgs)
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.title = ''
          this.title = 'Create Training'
          this.isCreate = true
          this.updateId = ''
        }
      }
    },
    async showUpdateTraining(event) {
      const errorMsgs = {
        training_name: false,
        training_name_msg: '',
        plans: false,
        plans_msg: '',
        start_date: false,
        start_date_msg: '',
        end_date: false,
        end_date_msg: '',
        num_users: false,
        num_users_msg: '',
        minutes_per_user: false,
        minutes_per_user_msg: '',
        domains: false,
        domains_msg: ''
      }
      this.errorMsgReset(errorMsgs)
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.updateId = event.id
          const data = {
            training_id: event.id
          }
          await this.fetchTraining(data)
          this.title = ''
          this.title = 'Update Training'
          this.isCreate = true
        }
      }
    },
    showDeleteTraining(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
        } else {
          this.isDelete = true
          this.trainingID = ''
          this.trainingID = event.id
        }
      }
    },
    tabInfo() {
      if (this.tab === 'inActiveTrainings') {
        if (this.fetchlistTrainingsInActive.length === 0) {
          const data = {
            pagination: {},
            reset: false
          }
          this.fetchTrainingsInActive(data)
        }
      }
    },
    trainingConfirmDeletion(event) {
      if (event.show) {
        const data = {
          training_id: this.trainingID
        }
        this.deleteTraining(data)
        this.isDelete = false
      }
    },
    trainingConfirmDeleteCancel(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
        } else {
          this.isDelete = true
        }
      }
    },
    cancelCreateTraining(event) {
      if (event.show) {
        this.isCreate = false
      }
    }
  }
}
</script>
