<template>
  <q-dialog v-model="dataShow" persistent>
    <q-card transition-show="flip-up" transition-hide="flip-down" dark style="width: 750px; max-width: 90vw">
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">
          <q-icon name="create" />
          {{ id ? 'Update Company' : 'Create Company' }}
          <hr />
        </div>
      </q-card-section>
      <q-card-section>
        <q-form greedy ref="formRef" @submit.prevent="onSubmit">
          <q-stepper active-color="white" alternative-labels animated dark done-color="positive" header-nav ref="stepper" v-model="step">
            <q-step :name="1" title="Company Details" icon="settings" :done="step > 1" :header-nav="step > 1">
              <q-list class="row">
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput
                      autofocus
                      label="Company Name *"
                      :maxlength="150"
                      required
                      :rules="[...minLength(2), ...maxLength(150)]"
                      v-model="company.name"
                    />
                    <p v-if="fetchErrorMsgs.company_name" class="text-caption text-negative">{{ fetchErrorMsgs.company_name_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseSelect label="Plan Type *" :options="fetchlistPlans" :rules="required" v-model="company.plans" />
                    <p v-if="fetchErrorMsgs?.plan" class="text-caption text-negative">{{ fetchErrorMsgs.plan_msg }}</p>
                    <p
                      v-if="id"
                      class="text-caption text-center text-warning"
                      v-show="![companyFromServer?.plan, companyFromServer?.plans?.[0]].includes(company.plans?.value)"
                    >
                      Note: if plans were changed, please manually update plans in chargebee
                    </p>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseInput label="Nº Users *" required :rules="[...number, ...min(1)]" v-model="company.numUsers" />
                    <p v-if="fetchErrorMsgs.num_users" class="text-caption text-negative">{{ fetchErrorMsgs.num_users_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseSelect
                      label="Subscription Type *"
                      :options="subcriptionTypeOptions"
                      :rules="required"
                      v-model="company.subscription"
                    />
                    <p v-if="fetchErrorMsgs.subscription" class="text-caption text-negative">{{ fetchErrorMsgs.subscription_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseInput
                      clearable
                      label="Start Date *"
                      :options="(date) => date >= todayDate() && (company.endDate ? date < company.endDate : true)"
                      required
                      :rules="date"
                      type="date"
                      v-model="company.startDate"
                    />
                    <p v-if="fetchErrorMsgs.start_date" class="text-caption text-negative">{{ fetchErrorMsgs.start_date_msg }}</p>
                    <label
                      v-if="id && company.startDate !== companyFromServer?.start_date?.replace(/-/g, '/')"
                      class="text-caption text-warning"
                    >
                      Changing this won't modify subscription start date
                    </label>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseInput
                      clearable
                      label="End Date *"
                      :options="(date) => (company.startDate ? date > company.startDate : true)"
                      required
                      :rules="date"
                      type="date"
                      v-model="company.endDate"
                    />
                    <p v-if="fetchErrorMsgs.end_date" class="text-caption text-negative">{{ fetchErrorMsgs.end_date_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseInput
                      :label="
                        company.subscription === 'Enterprise-Trial' || company.subscription?.value === 'Enterprise-Trial'
                          ? 'Monthly mins *'
                          : 'Monthly mins'
                      "
                      :required="company.subscription?.value === 'Enterprise-Trial' || company.subscription === 'Enterprise-Trial'"
                      :rules="
                        this.company.subscription?.value === 'Enterprise-Trial' || this.company.subscription === 'Enterprise-Trial'
                          ? [...number, ...min(1)]
                          : []
                      "
                      type="number"
                      v-model="company.monthly_minutes"
                    />
                    <p v-if="fetchErrorMsgs.monthly_minutes" class="text-caption text-negative">{{ fetchErrorMsgs.monthly_minutes_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseSelect
                      :clearable="false"
                      label="Domains"
                      hide-hint
                      :hint="domainValidation.hint ? domainValidation.hintLabel : ''"
                      multiple
                      newValueMode="add-unique"
                      v-model="company.domains"
                    />
                    <p v-if="fetchErrorMsgs.domains" class="text-caption text-negative">{{ fetchErrorMsgs.domains_msg }}</p>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-step>
            <q-step
              :name="2"
              title="Super User"
              icon="verified_user"
              :done="step > 2"
              :header-nav="step > 2"
              :disable="
                !(
                  company.name &&
                  (id ? company.plans : true) &&
                  (!company.subscription ||
                    (company.subscription?.value !== 'Enterprise-Trial' && company.subscription !== 'Enterprise-Trial') ||
                    parseInt(company.monthly_minutes)) &&
                  company.startDate &&
                  company.endDate &&
                  company.endDate >= company.startDate
                )
              "
            >
              <q-list v-if="!id" class="row">
                <q-item class="col-6">
                  <q-item-section>
                    <BaseInput autofocus label="First Name *" required :rules="shortName" v-model="company.first_name" />
                    <p v-if="fetchErrorMsgs.first_name" class="text-caption text-negative">{{ fetchErrorMsgs.first_name_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-6">
                  <q-item-section>
                    <BaseInput label="Last Name *" required :rules="shortName" v-model="company.last_name" />
                    <p v-if="fetchErrorMsgs.last_name" class="text-caption text-negative">{{ fetchErrorMsgs.last_name_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput label="Parent Email *" required :rules="email" v-model="company.parent" />
                    <p v-if="fetchErrorMsgs.parent" class="text-caption text-negative">{{ fetchErrorMsgs.parent_msg }}</p>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-list v-else-if="id && companyFromServer?.parent && !showChangeParent" class="row">
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput label="Parent Email *" readonly v-model="company.parent" />
                    <p v-if="fetchErrorMsgs.parent" class="text-caption text-negative">{{ fetchErrorMsgs.parent_msg }}</p>
                    <q-icon class="cursor-pointer" name="edit" @click="updateChange()">
                      <q-tooltip>Update</q-tooltip>
                    </q-icon>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-list
                v-else-if="id && !companyFromServer?.parent && !companyFromServer?.first_name && !companyFromServer?.last_name"
                class="row"
              >
                <q-item class="col-6">
                  <q-item-section>
                    <BaseInput autofocus label="First Name *" required :rules="shortName" v-model="company.first_name" />
                    <p v-if="fetchErrorMsgs.first_name" class="text-caption text-negative">{{ fetchErrorMsgs.first_name_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-6">
                  <q-item-section>
                    <BaseInput label="Last Name *" required :rules="shortName" v-model="company.last_name" />
                    <p v-if="fetchErrorMsgs.last_name" class="text-caption text-negative">{{ fetchErrorMsgs.last_name_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput label="Parent Email *" required :rules="email" v-model="company.parent" />
                    <p v-if="fetchErrorMsgs.parent" class="text-caption text-negative">{{ fetchErrorMsgs.parent_msg }}</p>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-list v-else-if="id && showChangeParent" class="row">
                <q-item class="col-6">
                  <q-item-section>
                    <BaseInput autofocus label="First Name *" required :rules="shortName" v-model="company.first_name" />
                    <p v-if="fetchErrorMsgs.first_name" class="text-caption text-negative">{{ fetchErrorMsgs.first_name_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-6">
                  <q-item-section>
                    <BaseInput label="Last Name *" required :rules="shortName" v-model="company.last_name" />
                    <p v-if="fetchErrorMsgs.last_name" class="text-caption text-negative">{{ fetchErrorMsgs.last_name_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput label="Parent Email *" required :rules="email" v-model="company.parent" />
                    <p v-if="fetchErrorMsgs.parent" class="text-caption text-negative">{{ fetchErrorMsgs.parent_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-icon name="undo" @click="undoChange()" class="cursor-pointer">
                  <q-tooltip>Undo</q-tooltip>
                </q-icon>
              </q-list>
            </q-step>
            <template v-slot:navigation>
              <q-stepper-navigation class="row">
                <q-btn class="col-grow q-mr-sm" color="orange" outline @click="onCancel()">Cancel</q-btn>
                <q-btn v-if="step > 1" @click="$refs.stepper.previous()" class="col-grow q-mr-sm" color="orange" label="Back" />
                <q-btn
                  v-if="step === 1"
                  class="col-grow"
                  color="positive"
                  label="Next"
                  @click="$refs.formRef.validate().then((valid) => (valid ? $refs.stepper.next() : null))"
                />
                <q-btn v-if="step === 2" class="col-grow" color="positive" :disable="!company.parent" type="submit">Save</q-btn>
              </q-stepper-navigation>
            </template>
          </q-stepper>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import BaseInput from 'components/shared/BaseInput.vue'
import BaseSelect from 'components/shared/BaseSelect.vue'
import { todayDate } from 'src/utils/reuseFunctions'
import { date, email, maxLength, min, minLength, number, required, shortName } from 'src/utils/rules'
import { compareFunction } from 'src/utils/validateSeralizer'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CreateCompany',
  components: { BaseInput, BaseSelect },
  props: ['id', 'show'],
  data() {
    return {
      step: 1,
      showDialog: false,
      company: {
        name: '',
        plans: undefined,
        email: '',
        parent: '',
        first_name: '',
        last_name: '',
        numUsers: 0,
        minutesPerUser: 0,
        monthly_minutes: undefined,
        startDate: '',
        endDate: '',
        domains: null,
        isPayment: false,
        isEvent: false,
        subscription: undefined
      },
      companyFromServer: {},
      showChangeParent: false,
      domainValidation: { hint: 'true', hintLabel: 'Optional' },
      subcriptionTypeOptions: [
        { value: 'Enterprise', label: 'Enterprise' },
        { value: 'Enterprise-Trial', label: 'Enterprise-Trial' }
      ],
      date,
      email,
      min,
      minLength,
      maxLength,
      number,
      required,
      shortName,
      todayDate,
      dataShow: this.show
    }
  },
  async created() {
    if (!this.fetchlistPlans?.length) {
      await this.fetchPlanOptions({})
    }
    if (this.id) {
      const company = this.companiesData.find((company) => company.id === this.id)
      this.companyFromServer = { ...company }

      this.company.name = company.company_name
      this.company.startDate = company.start_date?.replace(/-/g, '/')
      this.company.endDate = company.end_date?.replace(/-/g, '/')
      this.company.domains = company.domains
      this.company.plans = this.fetchlistPlans.find((plan) => [company.plan, company.plans?.[0]].includes(plan.value))
      this.company.numUsers = company.num_users
      this.company.isPayment = company.payment_complete
      this.company.minutesPerUser = company.minutes_per_user
      this.company.first_name = company.first_name
      this.company.last_name = company.last_name
      this.company.parent = company.parent
      this.company.subscription = company.subscription
      this.company.monthly_minutes = company.monthly_minutes
    }
  },
  methods: {
    ...mapActions('company', ['createCompany', 'fetchPlanOptions', 'updateCompanyInfo']),
    async onSubmit() {
      if (this.company.endDate <= this.company.startDate) {
        this.$q.notify({ message: 'End date should be greater than start date', color: 'negative', position: 'top', timeout: 2000 })
        return
      }
      const data = {
        company_name: this.company.name,
        first_name: this.company.first_name,
        last_name: this.company.last_name,
        parent: this.company.parent,
        num_users: parseInt(this.company.numUsers),
        start_date: this.company.startDate.replace(/\//g, '-'),
        end_date: this.company.endDate.replace(/\//g, '-'),
        subscription: this.company.subscription?.value || this.company.subscription,
        plan: this.company.plans?.value || this.company.plans
      }
      if (this.company.domains) {
        data.domains = this.company.domains
      }
      if (this.company.monthly_minutes > 0) {
        data.monthly_minutes = parseInt(this.company.monthly_minutes)
      }
      if (this.id) {
        data.type = 'object'
        data.company_id = this.id
        const company = this.companiesData.find((company) => company.id === this.id)
        await this.updateCompanyInfo(compareFunction('company', data, company))
      } else {
        await this.createCompany(data)
      }
      if (this.fetchStatusOfApiCompany) {
        this.company = {
          name: '',
          parent: '',
          first_name: '',
          last_name: '',
          numUsers: 0,
          minutesPerUser: 0,
          monthly_minutes: undefined,
          startDate: '',
          endDate: '',
          domains: null,
          isPayment: false,
          isEvent: false,
          subscription: ''
        }
        this.showChangeParent = false
        if (this.errorMessageDialogGetter.status) {
          this.$emit('openWarning', { show: true, dialog: true })
          this.showDialog = true
        }
        this.onCancel()
      }
    },
    updateChange() {
      this.showChangeParent = true
      this.company.first_name = ''
      this.company.last_name = ''
      this.company.parent = ''
    },
    undoChange() {
      this.showChangeParent = false
      this.company.first_name = companyFromServer.first_name
      this.company.last_name = companyFromServer.last_name
      this.company.parent = companyFromServer.parent
    },
    onCancel() {
      this.$emit('onCacel', { show: true })
      this.company = {}
    }
  },
  computed: {
    ...mapGetters('course', ['coursesOption']),
    ...mapGetters('company', ['companiesData', 'errorMessageDialogGetter', 'fetchErrorMsgs', 'fetchlistPlans', 'fetchStatusOfApiCompany'])
  }
}
</script>
