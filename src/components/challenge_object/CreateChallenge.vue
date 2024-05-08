<template>
  <q-dialog v-model="dataShow" persistent transition-show="flip-down" transition-hide="flip-down">
    <q-card style="width: 800px; max-width: 90vw" dark>
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">
          <q-icon name="create" />
          {{ id ? 'Update Challenge' : 'Create Challenge' }}
          <hr />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-form greedy ref="formRef" @submit="onSubmit()">
          <q-stepper active-color="white" alternative-labels animated dark done-color="positive" header-nav ref="stepper" v-model="step">
            <q-step :name="1" title="Challenge Info" icon="article" :done="step > 1" :header-nav="step > 1">
              <q-list class="row">
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput
                      label="Challenge Name *"
                      required
                      :maxlength="100"
                      :rules="[...minLength(2), ...maxLength(100)]"
                      v-model="challenge.name"
                    />
                    <p v-if="fetchErrorMsgs.name" class="text-caption text-negative">{{ fetchErrorMsgs.name_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput label="Description *" required :rules="minLength(2)" type="textarea" v-model="challenge.description" />
                    <p v-if="fetchErrorMsgs.description" class="text-caption text-negative">{{ fetchErrorMsgs.description_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-md-6 col-sm-12">
                  <q-item-section>
                    <BaseInput label="Score *" required :rules="[...min(1), ...max(100)]" type="number" v-model="challenge.score" />
                    <p v-if="fetchErrorMsgs.score" class="text-caption text-negative">{{ fetchErrorMsgs.score_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-md-6 col-sm-12">
                  <q-item-section>
                    <BaseSelect label="Proficiency" :options="proficiency_options" v-model="challenge.proficiency" />
                    <p v-if="fetchErrorMsgs.proficiency" class="text-caption text-negative">{{ fetchErrorMsgs.proficiency_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-md-6 col-sm-12">
                  <q-item-section>
                    <BaseSelect label="Career" multiple :options="career_options" v-model="challenge.career" />
                    <p v-if="fetchErrorMsgs.nature" class="text-caption text-negative">{{ fetchErrorMsgs.nature_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-md-6 col-sm-12">
                  <q-item-section>
                    <BaseSelect label="Nature *" :options="nature_options" :rules="required" v-model="challenge.nature" />
                    <p v-if="fetchErrorMsgs.nature" class="text-caption text-negative">{{ fetchErrorMsgs.nature_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseSelect label="Learning Path *" :rules="required" :options="learningPathOptions" v-model="challenge.learningPath" />
                  </q-item-section>
                </q-item>
                <q-item class="col-md-6 col-sm-12">
                  <q-item-section>
                    <BaseSelect
                      label="Validation Type *"
                      :options="validation_options"
                      :rules="required"
                      v-model="challenge.validation_type"
                    />
                    <p v-if="fetchErrorMsgs.validation_type" class="text-caption text-negative">{{ fetchErrorMsgs.validation_type_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-md-6 col-sm-12">
                  <q-item-section>
                    <BaseSelect
                      :label="'List Labs *'"
                      :options="fetchListLabsOptions"
                      :rules="required"
                      :showMore="Object.keys(labsPaginationKeyForward).length > 0"
                      v-model="challenge.lab_id"
                      @loadMoreItems="loadMoreChallengeLabs"
                    />
                    <p v-if="fetchErrorMsgs.lab_id" class="text-caption text-negative">{{ fetchErrorMsgs.lab_id_msg }}</p>
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseSelect label="Tags *" multiple newValueMode="add-unique" :rules="required" v-model="challenge.tags" />
                    <p v-if="fetchErrorMsgs.tags" class="text-caption text-negative">{{ fetchErrorMsgs.tags_msg }}</p>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-step>
            <q-step
              :name="2"
              title="Metadata"
              icon="code"
              :done="step > 2"
              :header-nav="step > 2"
              :disable="
                !id ||
                !challenge.name ||
                !challenge.description ||
                !challenge.lab_id ||
                !challenge.nature ||
                !challenge.validation_type ||
                !challenge.score ||
                !challenge.tags?.length
              "
            >
              <q-list class="row">
                <q-item class="col-12">
                  <q-item-section>
                    <Metadata v-model="challenge.metadata" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-step>
            <q-step
              :name="3"
              title="Hints List"
              icon="format_list_bulleted"
              :done="step > 3"
              :header-nav="step > 3"
              :disable="
                !challenge.name ||
                !challenge.description ||
                !challenge.lab_id ||
                !challenge.nature ||
                !challenge.validation_type ||
                !challenge.score ||
                !challenge.tags?.length
              "
            >
              <q-list class="row">
                <q-item class="col-12">
                  <q-item-section>
                    <Carousel v-model="challenge.hints" />
                    <p v-if="fetchErrorMsgs.hints" class="text-caption text-negative">{{ fetchErrorMsgs.hints_msg }}</p>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-step>
            <q-step
              :name="4"
              title="Achievement"
              icon="emoji_events"
              :done="step > 4"
              :header-nav="step > 4"
              :disable="
                !challenge.name ||
                !challenge.description ||
                !challenge.lab_id ||
                !challenge.nature ||
                !challenge.validation_type ||
                !challenge.score ||
                !challenge.tags?.length ||
                !challenge.hints?.length
              "
            >
              <Achievement
                v-model:achievementType="achievementType"
                :data="challenge"
                :title="challenge.name"
                type="challenge"
                @update:achievementSelected="addAchievementType"
                @update:delivery_id="addDeliveryID"
              />
            </q-step>
            <template v-slot:navigation>
              <q-stepper-navigation class="row">
                <q-btn class="col-grow q-mr-sm" color="orange" outline @click="onCancel()">Cancel</q-btn>
                <q-btn v-if="step !== 1" class="col-grow q-mr-sm" color="orange" @click="$refs.stepper.previous()">Back</q-btn>
                <q-btn
                  v-if="step !== 4"
                  class="col-grow q-mr-sm"
                  color="positive"
                  :disabled="step === 3 && !challenge.hints.length"
                  @click="$refs.formRef.validate().then((valid) => (valid ? $refs.stepper.next() : null))"
                >
                  Next
                </q-btn>
                <q-btn
                  v-if="step === 4"
                  class="col-grow"
                  color="positive"
                  :disable="achievementType !== 'None' && achievementType && !challenge.delivery_id"
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
import Achievement from 'components/shared/Achievement'
import BaseInput from 'components/shared/BaseInput.vue'
import BaseSelect from 'components/shared/BaseSelect.vue'
import Carousel from 'components/shared/Carousel.vue'
import Metadata from 'components/shared/Metadata.vue'
import { max, maxLength, min, minLength, required } from 'src/utils/rules'
import { compareFunction } from 'src/utils/validateSeralizer'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'CreateChallenge',
  components: { Achievement, BaseInput, BaseSelect, Carousel, Metadata },
  props: ['id', 'show'],
  data: () => ({
    achievementType: undefined,
    challenge: {
      delivery_id: '',
      description: '',
      event: '',
      hints: [],
      lab_id: undefined,
      learningPath: undefined,
      metadata: undefined,
      name: '',
      nature: '',
      proficiency: '',
      career: [],
      score: 0,
      tags: undefined,
      validation_type: ''
    },
    labs_data_select: [],
    nature_options: [
      { label: 'Offensive', value: 'Offensive' },
      { label: 'Defensive', value: 'Defensive' },
      { label: 'Callback', value: 'Callback' }
    ],
    proficiency_options: [
      { label: 'Beginner', value: 'Beginner' },
      { label: 'Intermediate', value: 'Intermediate' },
      { label: 'Advanced', value: 'Advanced' }
    ],
    career_options: [
      { label: 'Cloud Engineer', value: 'Cloud Engineer' },
      { label: 'Cloud Operations', value: 'Cloud Operations' },
      { label: 'DevOps Engineer', value: 'DevOps Engineer' },
      { label: 'Pentester', value: 'Pentester' },
      { label: 'Security Architect', value: 'Security Architect' },
      { label: 'Security Champion', value: 'Security Champion' },
      { label: 'Security Engineer', value: 'Security Engineer' }
    ],
    searchLabData: '',
    showDocs: false,
    step: 1,
    validation_options: [
      { label: 'Any', value: 'Any' },
      { label: 'All', value: 'All' }
    ],
    max,
    maxLength,
    min,
    minLength,
    required,
    dataShow: true
  }),
  watch: {
    'challenge.hints': {
      handler() {
        const errMsgs = {}
        errMsgs.hints = false
        errMsgs.hints_msg = ''
        this.errorMsgReset(errMsgs)
      }
    }
  },
  async created() {
    this.resetValidation()

    if (!this.fetchListLabsOptions.length) {
      await this.fetchLabs({ pagination: {}, reset: true })
    }

    if (!this.learningPathOptions?.length) {
      await this.fetchLearningPathOptions()
    }

    if (this.id) {
      const challenge = this.fetchListChallenges.find((challenge) => challenge.sk === this.id)

      this.achievementType = challenge.achievement_type
      this.challenge.career = challenge.career?.map((c) => ({ label: c, value: c }))
      this.challenge.delivery_id = challenge.delivery_id
      this.challenge.description = challenge.description
      this.challenge.hints = challenge.hints
      this.challenge.lab_id =
        this.fetchListLabsOptions.find((lab) => [challenge.lab_id.value, challenge.lab_id].includes(lab.value)) || challenge.lab_id
      this.challenge.learningPath = this.learningPathOptions.find((lp) => lp.value === challenge.learning_path_id)
      this.challenge.metadata = challenge.metadata
      this.challenge.name = challenge.name
      this.challenge.nature = challenge.nature
      this.challenge.proficiency = challenge.proficiency || challenge.difficulty
      this.challenge.score = challenge.score
      this.challenge.tags = challenge.tags
      this.challenge.validation_type = challenge.validation_type
    }
  },
  methods: {
    ...mapActions('challenge', ['createChallenge', 'errorMsgReset', 'fetchLabs', 'updateChallenge']),
    ...mapActions('learningPath', ['fetchLearningPathOptions']),
    async searchFilter(event) {
      if (event.data) {
        this.searchLabData = event.data
        const data = {
          pagination: {
            pk: 'lab',
            query: event.data
          },
          reset: true
        }
        await this.fetchSearchLabs(data)
        if (this.fetchListLabsOptions.length === 0) {
          const data = {
            pagination: {},
            reset: true
          }
          await this.fetchLabs(data)
        }
      }
    },
    addDeliveryID(event) {
      this.challenge.delivery_id = event || undefined
    },
    async loadMoreChallengeLabs() {
      if (this.fetchLoadMoreTypeLabGetter === 'lab') {
        const data = {
          pagination: { last_value: this.labsPaginationKeyForward },
          reset: false
        }
        await this.fetchLabs(data)
      } else if (this.fetchLoadMoreTypeLabGetter === 'search') {
        const dataLab = {
          pagination: {
            pk: 'lab',
            pagination: this.labsPaginationKeyForward,
            query: this.searchLabData
          },
          reset: false
        }
        await this.fetchSearchLabs(dataLab)
      }
    },
    async resetDataLabsOptions(event) {
      this.searchLabData = ''
      if (event) {
        this.labs_data_select = null
        this.searchLabData = ''
        if (event.reset && this.fetchLoadMoreTypeLabGetter === 'search') {
          const data = {
            pagination: {},
            reset: true,
            resetType: 'challenge'
          }
          await this.fetchLabs(data)
        }
      }
    },
    resetValidation() {
      const errorMsgs = {
        status: true,
        name: false,
        name_msg: '',
        description: false,
        description_msg: '',
        lab_id: false,
        lab_id_msg: '',
        nature: false,
        nature_msg: '',
        validation_type: false,
        validation_type_msg: '',
        hints: false,
        hints_msg: '',
        tags: false,
        tags_msg: '',
        score: false,
        score_msg: ''
      }
      this.errorMsgReset(errorMsgs)
    },
    addAchievementType(achievementType) {
      this.achievementType = achievementType
    },
    async onSubmit() {
      const data = {
        description: this.challenge.description,
        hints: this.challenge.hints,
        lab_id: this.challenge.lab_id?.value || this.challenge.lab_id,
        learning_path_id: this.challenge.learningPath.value,
        name: this.challenge.name,
        nature: this.challenge.nature?.value || this.challenge.nature,
        proficiency: this.challenge.proficiency?.value || this.challenge.proficiency,
        career: this.challenge?.career?.map((c) => c.value) ?? [],
        score: parseInt(this.challenge.score),
        tags: this.challenge.tags,
        validation_type: this.challenge.validation_type?.value || this.challenge.validation_type
      }
      if (this.achievementType) {
        data.achievement_type = this.achievementType
        data.delivery_id = this.challenge.delivery_id?.value || this.challenge.delivery_id
      }
      if (this.challenge.metadata) {
        data.metadata = this.challenge.metadata
      }
      if (this.id) {
        data.challenge_id = this.id
        const challenge = this.fetchListChallenges.find((challenge) => challenge.sk === this.id)
        await this.updateChallenge(compareFunction('challenge', data, challenge))
      } else {
        await this.createChallenge(data)
      }
      if (this.fetchStatusOfApi) {
        this.challenge = {
          status: true,
          name: false,
          name_msg: '',
          description: false,
          description_msg: '',
          lab_id: false,
          lab_id_msg: '',
          nature: false,
          nature_msg: '',
          validation_type: false,
          validation_type_msg: '',
          hints: false,
          hints_msg: '',
          tags: false,
          tags_msg: '',
          score: false,
          score_msg: '',
          event: '',
          delivery_id: ''
        }
        this.onCancel()
      }
    },
    onCancel() {
      this.$emit('onCancel', { show: true })
      this.challenge = {}
    }
  },
  computed: {
    ...mapState('learningPath', {
      learningPathOptions: (state) => state.learningPathOptions
    }),
    ...mapGetters('challenge', [
      'fetchErrorMsgs',
      'fetchStatusOfApi',
      'fetchListChallenges',
      'fetchListLabsOptions',
      'labsPaginationKeyForward'
    ]),
    ...mapGetters('labs', ['fetchLoadMoreTypeLabGetter'])
  }
}
</script>
