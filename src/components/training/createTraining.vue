<template>
  <q-dialog v-model="dataShow" persistent transition-show="flip-down" transition-hide="flip-down">
    <q-card style="min-width: 750px" dark>
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">
          <q-icon name="create" />
          {{ id ? 'Update Events' : 'Create Events' }}
          <hr />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-form greedy ref="formRef" @submit="onSubmit()">
          <q-stepper active-color="white" alternative-labels animated dark done-color="positive" header-nav ref="stepper" v-model="step">
            <q-step :name="1" title="Training Info" icon="article" :done="step > 1" :header-nav="step > 1">
              <q-list class="row">
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput
                      autofocus
                      label="Name *"
                      :maxlength="150"
                      required
                      :rules="[maxLength(150), ...minLength(2)]"
                      v-model="training.training_name"
                    />
                    <p v-if="fetchErrorMsgs.training_name" class="text-caption text-negative">{{ fetchErrorMsgs.training_name_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseSelect label="Plan Type *" :options="plansOptionsGetter" :rules="required" v-model="training.plan" />
                    <p v-if="fetchErrorMsgs.plan" class="text-caption text-negative">{{ fetchErrorMsgs.plan_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseInput
                      :disable="Boolean(id)"
                      hint="Start date can't be changed after creation"
                      label="Start Date *"
                      :options="(date) => date >= todayDate() && (training.end_date ? date < training.end_date : true)"
                      required
                      :rules="required"
                      type="date"
                      v-model="training.start_date"
                    />
                    <p v-if="fetchErrorMsgs.start_date" class="text-caption text-negative">{{ fetchErrorMsgs.start_date_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseInput
                      :disable="Boolean(id)"
                      label="End Date *"
                      :options="(date) => date > training.start_date"
                      required
                      :rules="required"
                      type="date"
                      v-model="training.end_date"
                    />
                    <p v-if="fetchErrorMsgs.end_date" class="text-caption text-negative">{{ fetchErrorMsgs.end_date_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseInput label="Nº Users *" required :rules="min(0)" type="number" v-model="training.num_users" />
                    <p v-if="fetchErrorMsgs.num_users" class="text-caption text-negative">{{ fetchErrorMsgs.num_users_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-sm-6 col-xs-12">
                  <q-item-section>
                    <BaseSelect label="Domains" multiple new-value-mode="add-unique" v-model="training.domains" />
                    <p v-if="fetchErrorMsgs.domains" class="text-caption text-negative">{{ fetchErrorMsgs.domains_msg }}</p>
                  </q-item-section>
                </q-item>
                <p class="text-caption text-warning q-mb-none q-mx-md">
                  Note: You cannot change start date and end date once after the event is created. Please choose carefully.
                </p>
              </q-list>
            </q-step>
            <q-step
              :name="2"
              title="Achievement"
              icon="emoji_events"
              :done="step > 2"
              :header-nav="step > 2"
              :disable="!training.training_name || !training.plan || !training.start_date || !training.end_date || !training.num_users"
            >
              <Achievement
                :data="training"
                :title="training.training_name"
                type="training"
                v-model:achievementType="achievementType"
                @update:achievementSelected="addAchievementType"
                @update:delivery_id="addDeliveryID"
              />
            </q-step>
            <template v-slot:navigation>
              <q-stepper-navigation class="row">
                <q-btn v-if="step === 1" class="col-grow q-mr-sm" color="orange" outline @click="onCancel">Cancel</q-btn>
                <q-btn v-if="step !== 1" class="col-grow q-mr-sm" color="orange" @click="$refs.stepper.previous()">Back</q-btn>
                <q-btn
                  v-if="step !== 2"
                  class="col-grow q-mr-sm"
                  color="positive"
                  @click="$refs.formRef.validate().then((valid) => (valid ? $refs.stepper.next() : null))"
                >
                  Next
                </q-btn>
                <q-btn
                  v-if="step === 2"
                  class="col-grow"
                  color="positive"
                  :disable="achievementType !== 'None' && achievementType && !training.delivery_id"
                  @click="onSubmit()"
                >
                  Done
                </q-btn>
              </q-stepper-navigation>
            </template>
          </q-stepper>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import Achievement from 'components/shared/Achievement.vue'
import BaseInput from 'components/shared/BaseInput.vue'
import BaseSelect from 'components/shared/BaseSelect.vue'
import { todayDate } from 'src/utils/reuseFunctions'
import { maxLength, min, minLength, required } from 'src/utils/rules'
import { compareFunction } from 'src/utils/validateSeralizer'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CreateTraining',
  components: { BaseInput, BaseSelect, Achievement },
  props: ['id', 'show'],
  data() {
    return {
      achievementType: 'None',
      training: {
        training_name: '',
        plan: null,
        start_date: '',
        end_date: '',
        num_users: undefined,
        domains: null,
        delivery_id: undefined
      },
      dataShow: this.show,
      step: 1,
      maxLength,
      minLength,
      todayDate,
      required,
      min
    }
  },
  async created() {
    if (this.id) {
      this.training.training_name = this.singleTrainingInfo.training_name
      this.training.start_date = this.singleTrainingInfo.start_date.replace(/-/g, '/')
      this.training.end_date = this.singleTrainingInfo.end_date.replace(/-/g, '/')
      this.training.domains = this.singleTrainingInfo.domains
      this.training.num_users = this.singleTrainingInfo.num_users
      this.training.plan = this.plansOptionsGetter.find((plan) => plan.value === this.singleTrainingInfo.plan)
      if (this.singleTrainingInfo.delivery_id) {
        this.training.delivery_id = this.singleTrainingInfo.delivery_id
        this.achievementType = 'certificate'
      }
    }
  },
  methods: {
    ...mapActions('training', ['createTraining', 'updateTraining']),
    addAchievementType(achievementType) {
      this.achievementType = achievementType
    },
    addDeliveryID(event) {
      this.training.delivery_id = event || undefined
    },
    async onSubmit() {
      const data = {
        num_users: parseInt(this.training.num_users),
        training_name: this.training.training_name
      }
      if (this.training.domains && this.training.domains?.length > 0) {
        data.domains = this.training.domains
      }
      if (this.achievementType && this.training.delivery_id) {
        data.delivery_id = this.training.delivery_id?.value || this.training.delivery_id
      }
      if (this.id) {
        data.training_id = this.id
        await this.updateTraining(compareFunction('training', data, this.singleTrainingInfo))
      } else {
        data.plan = this.training.plan.value
        data.start_date = this.training.start_date.replace(/\//g, '-')
        data.end_date = this.training.end_date.replace(/\//g, '-')
        await this.createTraining(data)
      }
      if (this.fetchStatusOfApi) {
        this.training = {
          training_name: '',
          plan: null,
          start_date: '',
          end_date: '',
          num_users: 0,
          domains: null
        }
        this.onCancel()
      }
    },
    onCancel() {
      this.$emit('onCacel', { show: true })
    }
  },
  computed: {
    ...mapGetters('training', ['fetchErrorMsgs', 'singleTrainingInfo', 'fetchStatusOfApi', 'plansOptionsGetter'])
  }
}
</script>
