<template>
  <q-dialog v-model="dataShow" persistent transition-show="flip-down" transition-hide="flip-down">
    <q-card style="width: 700px; max-width: 90vw" dark>
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">
          <q-icon name="create" />
          Create User
          <hr />
        </div>
      </q-card-section>
      <q-form greedy @submit="onSubmit()">
        <q-card-section>
          <q-list class="row">
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput autofocus label="First Name *" :maxlength="50" required :rules="shortName" v-model="user.first_name" />
                <p v-if="fetchErrorMsgs.first_name" class="text-caption text-negative">{{ fetchErrorMsgs.first_name_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput label="Last Name *" :maxlength="50" required :rules="shortName" v-model="user.last_name" />
                <p v-if="fetchErrorMsgs.last_name" class="text-caption text-negative">{{ fetchErrorMsgs.last_name_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-12">
              <q-item-section>
                <BaseInput label="Email *" required :rules="email" type="email" v-model="user.email" />
                <p v-if="fetchErrorMsgs.email" class="text-caption text-negative">{{ fetchErrorMsgs.email_msg }}</p>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn class="text-capitalize bg-primary text-white" @click="onCancel()">Cancel</q-btn>
          <q-btn class="text-capitalize bg-primary text-white" type="submit">Save</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import BaseInput from 'components/shared/BaseInput.vue'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { email, shortName } from 'src/utils/rules'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CreateCompanyUsers',
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
    ...mapActions('companyusers', ['createCompanyAdminUser']),
    async onSubmit() {
      const data = {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        company_id: urlSafeBase64Decode(this.$route.params.companyid)
      }
      await this.createCompanyAdminUser(data)
      if (this.fetchStatusOfApi) {
        this.onCancel()
      }
    },
    onCancel() {
      this.$emit('onCacel', { show: true })
    }
  },
  computed: {
    ...mapGetters('companyusers', ['fetchErrorMsgs', 'fetchStatusOfApi'])
  }
}
</script>
