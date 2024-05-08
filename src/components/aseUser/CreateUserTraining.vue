<template>
  <q-dialog v-model="dataShow" persistent transition-show="flip-down" transition-hide="flip-down">
    <q-card style="width: 700px; max-width: 90vw" dark>
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">
          <q-icon name="create" />
          {{ id ? 'Update User' : 'Create User' }}
          <hr />
        </div>
      </q-card-section>
      <q-form greedy @submit="onSubmit()">
        <q-card-section class="q-pt-none">
          <q-list class="row">
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput autofocus label="First Name *" :maxlength="50" required :rules="shortName" v-model="user.first_name" />
                <p v-if="fetchErrorMsgsUser.first_name" class="text-caption text-negative">{{ fetchErrorMsgsUser.first_name_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput autofocus label="Last Name *" :maxlength="50" required :rules="shortName" v-model="user.last_name" />
                <p v-if="fetchErrorMsgsUser.last_name" class="text-caption text-negative">{{ fetchErrorMsgsUser.last_name_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-12">
              <q-item-section>
                <BaseInput label="Email *" required :rules="email" type="email" v-model="user.email" />
                <p v-if="fetchErrorMsgsUser.email" class="text-caption text-negative">{{ fetchErrorMsgsUser.email_msg }}</p>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions>
          <q-btn class="col-grow" color="orange" outline @click="onCancel()">Cancel</q-btn>
          <q-btn class="col-grow" color="positive" type="submit">Save</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import BaseInput from 'components/shared/BaseInput.vue'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { shortName, email } from 'src/utils/rules'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CreateBadge',
  components: { BaseInput },
  props: ['id', 'show'],
  data() {
    return {
      user: {
        first_name: '',
        last_name: '',
        email: ''
      },
      email,
      shortName,
      dataShow: this.show
    }
  },
  methods: {
    ...mapActions('training', ['createUser']),
    ...mapActions('users', {
      fetchTrainingList: 'fetchTrainingList'
    }),
    async onSubmit() {
      const data = {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        training_id: urlSafeBase64Decode(this.$route.params.eventId)
      }
      await this.createUser(data)
      if (this.fetchStatusOfApi) {
        await this.fetchTrainingList({
          pagination: {
            training_id: urlSafeBase64Decode(this.$route.params.eventId)
          },
          reset: true
        })
        this.onCancel()
      }
    },
    onCancel() {
      this.$emit('onCacel', { show: true })
    }
  },
  computed: {
    ...mapGetters('training', ['fetchStatusOfApi', 'fetchErrorMsgsUser'])
  }
}
</script>
