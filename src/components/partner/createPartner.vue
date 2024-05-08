<template>
  <q-dialog v-model="dataShow" persistent transition-show="flip-down" transition-hide="flip-down">
    <q-card style="width: 750px; max-width: 90vw" dark>
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">
          <q-icon name="create" />
          {{ id ? 'Update Partner' : 'Create Partner' }}
          <hr />
        </div>
      </q-card-section>
      <q-form greedy ref="formRef" @submit="onSubmit">
        <q-card-section class="q-pt-none">
          <q-list class="row">
            <q-item class="col-12">
              <q-item-section>
                <BaseInput autofocus label="Name *" required v-model="partner.partner_name" />
                <p v-if="fetchErrorMsgs.partner_name" class="text-caption text-negative">{{ fetchErrorMsgs.partner_name_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-12">
              <q-item-section>
                <BaseSelect label="Plan Type *" multiple :options="plansOptionsGetter" :rules="required" v-model="partner.plans" />
                <p v-if="fetchErrorMsgs.plans" class="text-caption text-negative">{{ fetchErrorMsgs.plans_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput
                  clearable
                  :disable="Boolean(this.id)"
                  label="Start Date *"
                  :options="(date) => date >= todayDate() && (partner.end_date ? date < partner.end_date : true)"
                  required
                  :rules="date"
                  type="date"
                  v-model="partner.start_date"
                />
                <p v-if="fetchErrorMsgs.start_date" class="text-caption text-negative">{{ fetchErrorMsgs.start_date_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput
                  clearable
                  label="End Date *"
                  :options="(date) => (partner.start_date ? date > partner.start_date : true)"
                  required
                  :rules="date"
                  type="date"
                  v-model="partner.end_date"
                />
                <p v-if="fetchErrorMsgs.end_date" class="text-caption text-negative">{{ fetchErrorMsgs.end_date_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput label="Nº Users *" required :rules="[...number, ...min(1)]" type="number" v-model="partner.num_users" />
                <p v-if="fetchErrorMsgs.num_users" class="text-caption text-negative">{{ fetchErrorMsgs.num_users_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseSelect
                  :clearable="false"
                  hide-hint
                  hint="Click Enter ↵ to add"
                  label="Domains *"
                  multiple
                  new-value-mode="add-unique"
                  :rules="required"
                  v-model="partner.domains"
                />
                <p v-if="fetchErrorMsgs.domains" class="text-caption text-negative">{{ fetchErrorMsgs.domains_msg }}</p>
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
import BaseSelect from 'components/shared/BaseSelect.vue'
import { todayDate } from 'src/utils/reuseFunctions'
import { date, min, number, required } from 'src/utils/rules'
import { compareFunction } from 'src/utils/validateSeralizer'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CreatePartner',
  components: { BaseInput, BaseSelect },
  props: ['id', 'show'],
  data() {
    return {
      partner: {
        partner_name: '',
        plans: null,
        start_date: '',
        end_date: '',
        num_users: undefined,
        domains: null
      },
      date,
      min,
      number,
      required,
      todayDate,
      dataShow: this.show
    }
  },
  async created() {
    if (this.id) {
      this.partner.partner_name = this.singlepartnerInfo.partner_name
      this.partner.start_date = this.singlepartnerInfo.start_date.replace(/-/g, '/')
      this.partner.end_date = this.singlepartnerInfo.end_date.replace(/-/g, '/')
      this.partner.domains = this.singlepartnerInfo.domains
      this.partner.num_users = this.singlepartnerInfo.num_users
      this.partner.plans = this.plansOptionsGetter.filter((plan) => this.singlepartnerInfo.plans.includes(plan.value))
    }
  },
  methods: {
    ...mapActions('partner', ['createPartner', 'updatePartner']),
    async onSubmit() {
      const data = {
        partner_name: this.partner.partner_name,
        start_date: this.partner.start_date.replace(/\//g, '-'),
        end_date: this.partner.end_date.replace(/\//g, '-'),
        num_users: this.partner.num_users,
        domains: this.partner.domains
      }
      if (this.partner.plans && this.partner.plans.length > 0) {
        data.plans = this.partner.plans.map((plan) => plan.value)
      }
      if (this.id) {
        data.partner_id = this.id
        await this.updatePartner(compareFunction('partner', data, this.singlepartnerInfo))
      } else {
        await this.createPartner(data)
      }
      if (this.fetchStatusOfApi) {
        this.partner = {
          partner_name: '',
          plans: null,
          start_date: '',
          end_date: '',
          num_users: 0,
          domains: null
        }
        this.onCancel()
      }
    },
    onCancel() {
      this.$emit('onCancel', { show: true })
    }
  },
  computed: {
    ...mapGetters('partner', ['fetchErrorMsgs', 'singlepartnerInfo', 'fetchStatusOfApi', 'plansOptionsGetter'])
  }
}
</script>
