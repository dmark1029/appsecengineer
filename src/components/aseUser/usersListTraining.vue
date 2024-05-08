<template>
  <div>
    <div class="flex justify-between q-pa-md">
      <q-btn size="md" color="primary" @click="$emit('createUser', { show: true })">Create</q-btn>
      <q-btn v-if="singleTrainingInfo.delivery_id" size="md" color="primary" @click="$emit('issueCertificate')">Issue Certificate</q-btn>
    </div>
    <div class="row">
      <div class="q-pa-md full-width text-white">
        <q-list dark bordered separator class="bg-primary">
          <q-item>
            <q-item-section avatar class="white text-subtitle2 ase-roboto">#</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto">Name</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto">Email</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto" align="right">Action</q-item-section>
          </q-item>
          <q-item v-for="(info, index) of data" :key="'companyUSERR' + info.name + '' + index + info.email">
            <q-item-section avatar class="white text-subtitle2 ase-roboto">{{ index + 1 }}</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto">{{ info.name }}</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto">{{ info.email }}</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto" align="right">
              <div>
                <q-btn color="dark" icon="delete" size="sm" @click="removeUser(info)" align="right">
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="col-md-12 col-sm-12 col-xs-12">
        <div class="text-center" style="padding-top: 2%; padding-bottom: 2%" v-if="data.length === 0">
          <p class="text-h4 text-weight-bold ase-roboto ase-black-light padding_12 text-center">No Data</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { urlSafeBase64Decode } from 'app/src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'userListTrainingDetails',
  props: ['id', 'show', 'data'],
  async created() {
    await this.fetchTraining({ training_id: urlSafeBase64Decode(this.$route.params.eventId) })
  },
  methods: {
    ...mapActions('training', ['fetchTraining']),
    removeUser(info) {
      this.$emit('removeUser', { show: true, info: info })
    }
  },
  computed: {
    ...mapGetters('training', ['singleTrainingInfo'])
  }
}
</script>
