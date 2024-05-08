<template>
  <q-list class="row">
    <q-item class="col-12">
      <q-item-section>
        <div class="flex items-end q-gutter-x-md">
          <span>Achievement Type:</span>
          <q-option-group v-model="achievementSelected" :options="achievementTypeOptions" color="white" dark dense inline />
        </div>
      </q-item-section>
    </q-item>
    <q-item class="col-12" v-show="achievementSelected">
      <q-item-section style="flex-direction: row">
        <BaseSelect
          class="col-grow"
          label="Select Delivery *"
          :loading="isLoading"
          :options="fetchDeliveryOptionsList.filter((option) => option.type === achievementSelected)"
          searchable
          :showMore="fetchDeliveryOptionsList.length < totalDeliveries"
          v-model="delivery_id"
          @loadMoreItems="loadMoreDeliveries"
          @popup-show="deliveryOptionsAction"
          @search="searchDelivery"
          @update:model-value="$emit('update:delivery_id', delivery_id)"
        />
      </q-item-section>
    </q-item>
    <q-item class="col-12" v-show="achievementSelected">
      <q-item-section style="flex-direction: row">
        <q-btn
          :disabled="delivery_id"
          :icon="achievementSelected && isCreateDelivery && !delivery_id ? 'expand_less' : 'expand_more'"
          label="Create Delivery"
          outline
          @click="onCreateDelivery"
        />
      </q-item-section>
    </q-item>
    <q-item class="col-12">
      <q-item-section>
        <q-form greedy ref="formRef" @submit="saveDelivery">
          <q-slide-transition>
            <q-stepper
              v-if="achievementSelected && isCreateDelivery && !delivery_id"
              active-color="white"
              alternative-labels
              animated
              dark
              done-color="positive"
              header-nav
              ref="stepper"
              v-model="step"
            >
              <q-step :name="1" title="Design" icon="brush" :done="step > 1" :header-nav="step > 1">
                <q-list class="row">
                  <q-item class="col-12">
                    <q-item-section>
                      <BaseSelect
                        label="Select Design *"
                        :loading="!fetchErrorMsgsDesigns.status"
                        :options="listDesignsOption"
                        :rules="[(val) => !!val || 'Please select a design or upload a file']"
                        :showMore="listDesignsOption.length < totalDesigns"
                        v-model="delivery.designId"
                        @loadMoreItems="loadMoreDesigns"
                        @popup-show="designOptionsAction"
                        @update:model-value="isAchievementActive()"
                      />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-12">
                    <q-item-section>
                      <BaseFile
                        accept=".png, image/png"
                        :disable="Boolean(delivery.designId)"
                        label="Upload Design File"
                        v-model="design_file"
                        @update:model-value="uploadFile"
                      />
                    </q-item-section>
                  </q-item>
                  <p class="q-mx-auto q-my-md text-caption text-warning">
                    Select a design or upload a file. If you upload a file, the design will be created automatically.
                  </p>
                </q-list>
                <p v-if="fetchErrorMsgs.step1" class="text-caption text-negative">{{ fetchErrorMsgs.step1_msg }}</p>
              </q-step>
              <q-step
                :name="2"
                title="Detail"
                icon="loupe"
                :done="step > 2"
                :header-nav="step > 2"
                :disable="!delivery.designId && !design_file"
              >
                <q-item class="col-12">
                  <q-item-section>
                    <BaseSelect
                      label="Select Detail *"
                      :loading="!fetchErrorMsgsDetails.status"
                      :options="listDetailsOption"
                      :rules="[(val) => !!val || 'Please select a detail or create one']"
                      :showMore="listDetailsOption.length < totalDetails"
                      v-model="delivery.detailId"
                      @loadMoreItems="loadMoreDetails"
                      @popup-show="detailOptionsAction"
                      @update:model-value="isAchievementActive()"
                    />
                  </q-item-section>
                </q-item>
                <q-btn
                  class="block q-mx-auto q-my-sm"
                  :disabled="Boolean(delivery.detailId)"
                  :icon="createDetails && !delivery.detailId ? 'expand_less' : 'expand_more'"
                  label="Create Details"
                  outline
                  @click="onCreateDetails"
                />
                <p v-if="fetchErrorMsgs.step2" class="text-caption text-negative">{{ fetchErrorMsgs.step2_msg }}</p>
                <q-slide-transition>
                  <q-list class="row" v-if="createDetails && !delivery.detailId">
                    <q-item class="col-12">
                      <q-item-section>
                        <BaseInput label="Title *" v-model="details.title" />
                        <p v-if="fetchErrorMsgs.title" class="text-caption text-negative">{{ fetchErrorMsgs.title_msg }}</p>
                      </q-item-section>
                    </q-item>
                    <q-item class="col-sm-4 col-xs-12">
                      <q-item-section>
                        <BaseInput label="Duration *" :min="1" type="number" v-model="details.duration" />
                        <p v-if="fetchErrorMsgs.duration" class="text-caption text-negative">{{ fetchErrorMsgs.duration_msg }}</p>
                      </q-item-section>
                    </q-item>
                    <q-item class="col-sm-4 col-xs-12">
                      <q-item-section>
                        <BaseSelect
                          label="Duration Type *"
                          :options="duration_type_options"
                          style="width: 100%"
                          v-model="details.duration_type"
                        />
                        <p v-if="fetchErrorMsgs.duration_type" class="text-caption text-negative">{{ fetchErrorMsgs.duration_type_msg }}</p>
                      </q-item-section>
                    </q-item>
                    <q-item class="col-sm-4 col-xs-12">
                      <q-item-section>
                        <BaseSelect label="Level *" :options="level_options" style="width: 100%" v-model="details.level" />
                        <p v-if="fetchErrorMsgs.level" class="text-caption text-negative">{{ fetchErrorMsgs.level_msg }}</p>
                      </q-item-section>
                    </q-item>
                    <q-item class="col-12">
                      <q-item-section>
                        <BaseEditor label="Description *" v-model="details.description" />
                        <p v-if="fetchErrorMsgs.description" class="text-caption text-negative">{{ fetchErrorMsgs.description_msg }}</p>
                      </q-item-section>
                    </q-item>
                    <q-item class="col-12" v-if="type === 'challenge'">
                      <q-item-section>
                        <BaseEditor label="Earning Criteria *" v-model="details.criteria" />
                        <p v-if="fetchErrorMsgs.criteria" class="text-caption text-negative">{{ fetchErrorMsgs.criteria_msg }}</p>
                      </q-item-section>
                    </q-item>
                    <q-item class="col-12">
                      <q-item-section>
                        <BaseInput
                          hint="Enter any search query and click send button. Eg: DevSecOps, Docker, AWS, etc..."
                          label="Search *"
                          sendButton
                          v-model="querySearch"
                          @send="searchQueryData"
                        />
                      </q-item-section>
                    </q-item>
                    <q-item class="col-12">
                      <q-item-section>
                        <BaseSelect
                          :disable="!queriedSkillsData.length"
                          label="Skills *"
                          multiple
                          :options="queriedSkillsData"
                          v-model="details.skills"
                        />
                        <p v-if="fetchErrorMsgs.skills" class="text-caption text-negative">{{ fetchErrorMsgs.skills_msg }}</p>
                      </q-item-section>
                    </q-item>
                    <q-btn
                      class="q-mx-auto q-my-sm"
                      color="positive"
                      :disable="
                        !details.title ||
                        !details.duration ||
                        !details.duration_type ||
                        !details.level ||
                        !details.description ||
                        !details.criteria ||
                        !details.skills.length
                      "
                      label="Save Details"
                      outline
                      @click="onSubmitDetails()"
                    />
                  </q-list>
                </q-slide-transition>
                <p class="q-mt-lg text-caption text-center text-warning">
                  {{
                    createDetails && !delivery.detailId
                      ? 'Click on Save Details button to save the details. Once saved, you can select it from the list.'
                      : 'Select a detail from the list or create a new one.'
                  }}
                </p>
              </q-step>
              <q-step
                :name="3"
                title="Others"
                icon="add"
                :done="step > 3"
                :header-nav="step > 3"
                :disable="(!delivery.designId && !design_file) || !delivery.detailId"
              >
                <q-list class="row">
                  <q-item class="col-12">
                    <q-item-section>
                      <BaseInput
                        label="Email From Name *"
                        required
                        v-model="delivery.emailFromName"
                        @update:model-value="isAchievementActive"
                      />
                      <p v-if="fetchErrorMsgs.emailFromName" class="text-caption text-negative">{{ fetchErrorMsgs.emailFromName_msg }}</p>
                    </q-item-section>
                  </q-item>
                  <q-item class="col-12">
                    <q-item-section>
                      <BaseInput
                        label="Mail subject *"
                        required
                        :rules="maxLength(200)"
                        v-model="delivery.mailSubject"
                        @update:model-value="isAchievementActive"
                      />
                      <p v-if="fetchErrorMsgs.mailSubject" class="text-caption text-negative">{{ fetchErrorMsgs.mailSubject_msg }}</p>
                    </q-item-section>
                  </q-item>
                  <q-item class="col-12">
                    <q-item-section>
                      <BaseSelect
                        label="Template *"
                        :loading="!fetchErrorMsgsTemplates.status"
                        :options="listTemplatesOption"
                        required
                        :rules="[(val) => !!val || 'Please select a template.']"
                        v-model="delivery.emailTemplateId"
                        @popup-show="templateOptionsAction"
                        @update:model-value="isAchievementActive"
                      />
                      <p v-if="fetchErrorMsgs.emailTemplateId" class="text-caption text-negative">
                        {{ fetchErrorMsgs.emailTemplateId_msg }}
                      </p>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-step>
              <template v-slot:navigation>
                <q-stepper-navigation class="text-right">
                  <q-btn v-if="step !== 1" class="q-mr-sm" color="orange" @click="$refs.stepper.previous()">Back</q-btn>
                  <q-btn
                    v-if="step !== 3"
                    color="positive"
                    :disable="(step === 1 && !delivery.designId) || (step === 2 && !delivery.detailId)"
                    @click="$refs.formRef.validate().then((valid) => (valid ? $refs.stepper.next() : null))"
                  >
                    Next
                  </q-btn>
                  <q-btn
                    v-if="step === 3"
                    color="positive"
                    :disable="!delivery.emailFromName || !delivery.mailSubject || !delivery.emailTemplateId"
                    type="submit"
                  >
                    Save
                  </q-btn>
                </q-stepper-navigation>
              </template>
            </q-stepper>
          </q-slide-transition>
        </q-form>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import BaseEditor from 'components/shared/BaseEditor.vue'
import BaseFile from 'components/shared/BaseFile.vue'
import BaseInput from 'components/shared/BaseInput.vue'
import BaseSelect from 'components/shared/BaseSelect.vue'
import { useCourseStore, useDeliveryStore } from 'src/stores'
import { filteredItemBasedOnKey } from 'src/utils/reuseFunctions'
import { maxLength } from 'src/utils/rules'
import { computed, onMounted, ref, watch } from 'vue'

const courseStore = useCourseStore()
const deliveryStore = useDeliveryStore()

const emit = defineEmits(['isActive', 'update:achievementSelected', 'update:achievementType', 'update:data', 'update:delivery_id'])
const props = defineProps({
  achievementType: { type: String, default: 'None' },
  data: { type: Object },
  title: { type: String, default: '', required: true },
  type: { type: String, default: '', required: true }
})

const achievementSelected = ref('')
const achievementTypeOptions = ref([])
const createDetails = ref(false)
const delivery = ref({
  type: '',
  designId: '',
  detailId: '',
  emailFromName: 'AppSecEngineer',
  emailTemplateId: '',
  mailSubject: 'Congratulations! AppSecEngineer Issued A New'
})
const delivery_id = ref(null)
const design_file = ref(null)
const details = ref({
  title: props.title,
  duration: '',
  level: '',
  duration_type: null,
  description: '',
  criteria: `<p>The ${props.title} from the Learning Path has been created to test the user's knowledge of the concept. This is a ${props.type} challenge where the user needs to understand the vulnerable implementation and figure out how to fix it.</p><p>By completing this challenge successfully, the user has demonstrated skills and a deep understanding of the concept.</p>`,
  skills: []
})
const duration_type_options = ref([
  { label: 'Minute', value: 'Minute' },
  { label: 'Hour', value: 'Hour' },
  { label: 'Day', value: 'Day' },
  { label: 'Week', value: 'Week' },
  { label: 'Month', value: 'Month' },
  { label: 'Year', value: 'Year' }
])
const isCreateDelivery = ref(false)
const level_options = ref([
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
  { label: 'Experienced', value: 'Experienced' },
  { label: 'Professional', value: 'Professional' },
  { label: 'NA', value: 'NA' }
])
const queriedSkillsData = ref([])
const querySearch = ref('')
const searchDeliveryTerm = ref(undefined)
const step = ref(1)
const successResponseDesignId = ref('')
const successResponseDetailId = ref('')

const showDesignDataGetter = computed(() => courseStore.showDesignData)
const statusOfS3Getter = computed(() => courseStore.statusOfS3)
const deliverySuccessInfoGetter = computed(() => deliveryStore.deliverySuccessInfo)
const fetchDeliveryOptionsList = computed(() => deliveryStore.listOptionsDelivery)
const fetchDetailInfoGetter = computed(() => deliveryStore.detailInfo)
const fetchErrorMsgs = computed(() => deliveryStore.error_msgs)
const fetchErrorMsgsDesigns = computed(() => deliveryStore.error_msgs_designs)
const fetchErrorMsgsDetails = computed(() => deliveryStore.error_msgs_details)
const fetchErrorMsgsTemplates = computed(() => deliveryStore.error_msgs_templates)
const fetchStatusOfApi = computed(() => deliveryStore.statusOfApi)
const isLoading = computed(() => deliveryStore.loading)
const listDesignsOption = computed(() => (deliveryStore.listDesigns.length > 0 ? [...new Set(deliveryStore.listDesigns)] : []))
const listDetailSkillsOption = computed(() =>
  deliveryStore.listDetailSkills.length > 0 ? [...new Set(deliveryStore.listDetailSkills)] : []
)
const listDetailsOption = computed(() => (deliveryStore.listDetails.length > 0 ? [...new Set(deliveryStore.listDetails)] : []))
const listTemplatesOption = computed(() => (deliveryStore.listTemplates.length > 0 ? [...new Set(deliveryStore.listTemplates)] : []))
const totalDeliveries = computed(() => deliveryStore.totalDeliveries)
const totalDetails = computed(() => deliveryStore.totalDetails)
const totalDesigns = computed(() => deliveryStore.totalDesigns)

onMounted(async () => {
  if (props.type === 'certification') {
    achievementTypeOptions.value = [{ label: 'Certificate', value: 'certificate' }]
    achievementSelected.value = 'certificate'
  }
  if (props.type === 'challenge') {
    achievementTypeOptions.value = [
      { label: 'Badge', value: 'badge' },
      { label: 'None', value: null }
    ]
    achievementSelected.value = 'badge'
  }
  if (props.type === 'course') {
    achievementTypeOptions.value = props.data.isEvent ? [{ label: 'None', value: null }] : [{ label: 'Badge', value: 'badge' }]
    achievementSelected.value = props.data.isEvent ? null : 'badge'
  }
  if (props.type === 'training') {
    achievementTypeOptions.value = [
      { label: 'Certificate', value: 'certificate' },
      { label: 'None', value: null }
    ]
    achievementSelected.value = 'certificate'
  }
  if (props.type === 'None') {
    achievementSelected.value = null
  }

  if (!fetchDeliveryOptionsList.value.length) {
    await loadMoreDeliveries({ length: 80, startIndex: 0 })
  }

  if (props.data.delivery_id) {
    delivery_id.value =
      fetchDeliveryOptionsList.value.find((delivery) => [props.data.delivery_id, props.data.delivery_id.value].includes(delivery.value)) ||
      props.data.delivery_id
  }

  if (props.data.delivery_id && props.type === 'challenge') {
    const delivery_id = props.data.delivery_id.value || props.data.delivery_id
    delivery_id.value = filteredItemBasedOnKey(delivery_id, fetchDeliveryOptionsList.value)
  }

  delivery.value.mailSubject = `Congratulations! AppSecEngineer Issued A New ${achievementSelected.value}`
})

watch(achievementSelected, (value) => {
  if (value) {
    delivery.value.mailSubject = `Congratulations! AppSecEngineer Issued A New ${value}`
    emit('update:achievementSelected', value)
  }
})

function isAchievementActive() {
  const isActive = Boolean(
    (['badge', 'certificate'].includes(achievementSelected.value) && !delivery_id.value && !isCreateDelivery.value) ||
      (isCreateDelivery.value &&
        (!delivery.value.designId || !design_file.value) &&
        !delivery.value.detailId &&
        (!delivery.value.mailSubject || !delivery.value.emailFromName || !delivery.value.emailTemplateId))
  )
  emit('isActive', isActive)
}
async function loadMoreDeliveries() {
  await deliveryStore.fetchDeliveries({
    pagination: { length: 80, search_term: searchDeliveryTerm.value, startIndex: fetchDeliveryOptionsList.value.length }
  })
  delivery_id.value =
    fetchDeliveryOptionsList.value.find((delivery) => [props.data.delivery_id, props.data.delivery_id?.value].includes(delivery?.value)) ||
    props.data.delivery_id
}
async function deliveryOptionsAction() {
  if (!fetchDeliveryOptionsList.value.length) {
    await deliveryStore.fetchDeliveries({ pagination: { length: 80 } })
  }
}
async function searchDelivery(query) {
  searchDeliveryTerm.value = query
  await deliveryStore.fetchDeliveries({
    pagination: { length: 80, search_term: query },
    reset: true
  })
}
function onCreateDelivery() {
  isCreateDelivery.value = !isCreateDelivery.value

  if (listDesignsOption.value.length === 0) {
    deliveryStore.fetchlistDesigns({ type: achievementSelected.value })
  }
  if (listDetailsOption.value.length === 0) {
    deliveryStore.fetchlistDetails()
  }
  isAchievementActive()
}
async function loadMoreDesigns() {
  await deliveryStore.fetchlistDesigns({ length: 80, startIndex: listDesignsOption.value.length, type: achievementSelected.value })
}
function designOptionsAction() {
  if (listDesignsOption.value.length === 0) {
    deliveryStore.fetchlistDesigns({ type: achievementSelected.value })
  }
}
async function uploadFile(file) {
  successResponseDesignId.value = ''
  await deliveryStore.fetchDesigns()

  const customFields = Object.assign({}, showDesignDataGetter.value.fields)

  if (showDesignDataGetter.value.url && showDesignDataGetter.value.fields.key) {
    customFields['Content-Type'] = file.type
    const form = {}
    Object.entries(customFields).forEach(([field, value]) => (form[field] = value))
    form['Content-Type'] = file.type
    form.file = file

    const signedUrl = showDesignDataGetter.value.url
    await courseStore.S3UploadFile({ signedUrl, form })

    if (statusOfS3Getter.value === 204) {
      const signedUrlData = showDesignDataGetter.value.url + showDesignDataGetter.value.fields.key
      await courseStore
        .uploadCreateDesign({ title: props.title, url: signedUrlData })
        .then((res) => {
          delivery.value.designId = res.data.data
          successResponseDesignId.value = res.data.data
          isAchievementActive()
        })
        .catch((err) => console.error(err))
    }
  }
}
function onCreateDetails() {
  createDetails.value = !createDetails.value
  const errMsgs = {}
  errMsgs.detailId = false
  errMsgs.step2_msg = ''
  deliveryStore.errorMsgReset(errMsgs)
}
async function loadMoreDetails() {
  await deliveryStore.fetchlistDetails({ length: 80, startIndex: listDetailsOption.value.length })
}
async function detailOptionsAction() {
  if (listDetailsOption.value.length === 0) {
    await deliveryStore.fetchlistDetails()
  }
}
async function searchQueryData() {
  await deliveryStore.fetchDetailSkills({
    query: querySearch.value,
    startIndex: 0,
    length: 2000
  })
  queriedSkillsData.value = listDetailSkillsOption.value.map((skillData) => ({
    label: skillData.title,
    value: skillData.skillId,
    languageCode: skillData.languageCode
  }))
}
async function onSubmitDetails() {
  const data = {
    title: details.value.title,
    duration: parseInt(details.value.duration),
    level: details.value.level,
    duration_type: details.value.duration_type.value,
    description: details.value.description,
    earningCriteriaHTML: details.value.criteria.replace(/(\n+)/, '<br />'),
    type: ['certification', 'training'].includes(props.type) ? 'challenge' : props.type,
    skills: details.value.skills
  }

  if (props.type === 'course') {
    delete data.earningCriteriaHTML
  }

  if (details.value.skills.length > 0) {
    data.skills = details.value.skills.map((skill) => ({
      title: skill.label,
      skillId: skill.value,
      languageCode: skill.languageCode
    }))
  }

  await deliveryStore.addDetail(data).then(() => {
    delivery.value.detailId = listDetailsOption.value[0]
  })

  if (fetchDetailInfoGetter.value.data) {
    successResponseDetailId.value = fetchDetailInfoGetter.value.data.id
    delivery.value.detailId = successResponseDetailId.value
  }
}
async function templateOptionsAction() {
  await deliveryStore.errorMsgResetTemplates({ status: false })
  if (listTemplatesOption.value.length === 0) {
    await deliveryStore.fetchlistTemplates()
  } else {
    await deliveryStore.errorMsgResetTemplates({ status: true })
  }
}
async function saveDelivery() {
  const data = {
    title: props.title,
    _type: achievementSelected.value,
    mailSubject: delivery.value.mailSubject,
    emailFromName: delivery.value.emailFromName
  }
  data.detailId = delivery.value.detailId
  data.emailTemplateId = delivery.value.emailTemplateId

  await deliveryStore.createDelivery(data)
  if (fetchStatusOfApi.value) {
    delivery_id.value = { label: deliverySuccessInfoGetter.value.data.title, value: deliverySuccessInfoGetter.value.data.id }
    emit('update:delivery_id', delivery_id.value)
    isCreateDelivery.value = false
  }
}
</script>
<!-- <script>
import BaseEditor from 'components/shared/BaseEditor.vue'
import BaseFile from 'components/shared/BaseFile.vue'
import BaseInput from 'components/shared/BaseInput.vue'
import BaseSelect from 'components/shared/BaseSelect.vue'
import { filteredItemBasedOnKey, todayDate } from 'src/utils/reuseFunctions'
import { date, maxLength, required } from 'src/utils/rules'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Achievement',
  components: { BaseEditor, BaseFile, BaseInput, BaseSelect },
  emits: ['isActive', 'update:achievementSelected', 'update:achievementType', 'update:data', 'update:delivery_id'],
  props: {
    achievementType: { type: String, default: 'None' },
    data: { type: Object },
    title: { type: String, default: '', required: true },
    type: { type: String, default: '', required: true }
  },
  data() {
    return {
      achievementSelected: this.achievementType,
      achievementTypeOptions: [],
      createDetails: false,
      delivery: {
        type: '',
        designId: '',
        detailId: '',
        emailFromName: 'AppSecEngineer',
        emailTemplateId: '',
        mailSubject: 'Congratulations! AppSecEngineer Issued A New'
      },
      delivery_id: null,
      design_file: null,
      details: {
        title: this.title,
        duration: '',
        level: '',
        duration_type: null,
        description: '',
        criteria: `<p>The ${this.title} from the Learning Path has been created to test the user's knowledge of the concept. This is a ${this.type} challenge where the user needs to understand the vulnerable implementation and figure out how to fix it.</p><p>By completing this challenge successfully, the user has demonstrated skills and a deep understanding of the concept.</p>`,
        skills: []
      },
      duration_type_options: [
        { label: 'Minute', value: 'Minute' },
        { label: 'Hour', value: 'Hour' },
        { label: 'Day', value: 'Day' },
        { label: 'Week', value: 'Week' },
        { label: 'Month', value: 'Month' },
        { label: 'Year', value: 'Year' }
      ],
      isCreateDelivery: false,
      level_options: [
        { label: 'Beginner', value: 'Beginner' },
        { label: 'Intermediate', value: 'Intermediate' },
        { label: 'Advanced', value: 'Advanced' },
        { label: 'Experienced', value: 'Experienced' },
        { label: 'Professional', value: 'Professional' },
        { label: 'NA', value: 'NA' }
      ],
      queriedSkillsData: [],
      querySearch: '',
      searchDeliveryTerm: undefined,
      step: 1,
      successResponseDesignId: '',
      successResponseDetailId: '',
      date,
      maxLength,
      required,
      todayDate
    }
  },
  watch: {
    achievementSelected: {
      handler(val) {
        this.delivery.mailSubject = `Congratulations! AppSecEngineer Issued A New ${val}`
        this.$emit('update:achievementSelected', val)
      }
    }
  },
  async created() {
    if (this.type === 'certification') {
      this.achievementTypeOptions = [{ label: 'Certificate', value: 'certificate' }]
      this.achievementSelected = 'certificate'
    }
    if (this.type === 'challenge') {
      this.achievementTypeOptions = [
        { label: 'Badge', value: 'badge' },
        { label: 'None', value: null }
      ]
      this.achievementSelected = 'badge'
    }
    if (this.type === 'course') {
      this.achievementTypeOptions = this.data.isEvent ? [{ label: 'None', value: null }] : [{ label: 'Badge', value: 'badge' }]
      this.achievementSelected = this.data.isEvent ? null : 'badge'
    }
    if (this.type === 'training') {
      this.achievementTypeOptions = [
        { label: 'Certificate', value: 'certificate' },
        { label: 'None', value: null }
      ]
      this.achievementSelected = 'certificate'
    }
    if (this.type === 'None') {
      this.achievementSelected = null
    }

    if (!this.fetchDeliveryOptionsList.length) {
      await this.loadMoreDeliveries({ length: 80, startIndex: 0 })
    }

    if (this.data.delivery_id) {
      this.delivery_id =
        this.fetchDeliveryOptionsList.find((delivery) => [this.data.delivery_id, this.data.delivery_id.value].includes(delivery.value)) ||
        this.data.delivery_id
    }

    if (this.data.delivery_id && this.type === 'challenge') {
      const delivery_id = this.data.delivery_id.value || this.data.delivery_id
      this.delivery_id = filteredItemBasedOnKey(delivery_id, this.fetchDeliveryOptionsList)
    }

    this.delivery.mailSubject = `Congratulations! AppSecEngineer Issued A New ${this.achievementSelected}`
  },
  methods: {
    ...mapActions('course', ['fetchDesigns', 'S3UploadFile', 'uploadCreateDesign']),
    ...mapActions('delivery', [
      'addDetail',
      'createDelivery',
      'errorMsgReset',
      'errorMsgResetTemplates',
      'fetchDeliveries',
      'fetchDetailSkills',
      'fetchlistDesigns',
      'fetchlistDetails',
      'fetchlistTemplates'
    ]),
    isAchievementActive() {
      const isActive = Boolean(
        (['badge', 'certificate'].includes(this.achievementSelected) && !this.delivery_id && !this.isCreateDelivery) ||
          (this.isCreateDelivery &&
            (!this.delivery.designId || !this.design_file) &&
            !this.delivery.detailId &&
            (!this.delivery.mailSubject || !this.delivery.emailFromName || !this.delivery.emailTemplateId))
      )
      this.$emit('isActive', isActive)
    },
    async loadMoreDeliveries() {
      await this.fetchDeliveries({
        pagination: { length: 80, search_term: this.searchDeliveryTerm, startIndex: this.fetchDeliveryOptionsList.length }
      })
      this.delivery_id =
        this.fetchDeliveryOptionsList.find((delivery) => [this.data.delivery_id, this.data.delivery_id?.value].includes(delivery?.value)) ||
        this.data.delivery_id
    },
    async deliveryOptionsAction() {
      if (!this.fetchDeliveryOptionsList.length) {
        await this.fetchDeliveries({ pagination: { length: 80 } })
      }
    },
    async searchDelivery(query) {
      this.searchDeliveryTerm = query
      await this.fetchDeliveries({
        pagination: { length: 80, search_term: query },
        reset: true
      })
    },
    onCreateDelivery() {
      this.isCreateDelivery = !this.isCreateDelivery

      if (this.listDesignsOption.length === 0) {
        this.fetchlistDesigns({ type: this.achievementSelected })
      }
      if (this.listDetailsOption.length === 0) {
        this.fetchlistDetails()
      }

      this.isAchievementActive()
    },
    async loadMoreDesigns() {
      await this.fetchlistDesigns({ length: 80, startIndex: this.listDesignsOption.length, type: this.achievementSelected })
    },
    designOptionsAction() {
      if (this.listDesignsOption.length === 0) {
        this.fetchlistDesigns({ type: this.achievementSelected })
      }
    },
    async uploadFile(file) {
      this.successResponseDesignId = ''
      await this.fetchDesigns()

      const customFields = Object.assign({}, this.showDesignDataGetter.fields)

      if (this.showDesignDataGetter.url && this.showDesignDataGetter.fields.key) {
        customFields['Content-Type'] = file.type
        const form = {}
        Object.entries(customFields).forEach(([field, value]) => (form[field] = value))
        form['Content-Type'] = file.type
        form.file = file

        const signedUrl = this.showDesignDataGetter.url
        await this.S3UploadFile({ signedUrl, form })

        if (this.statusOfS3Getter === 204) {
          const signedUrlData = this.showDesignDataGetter.url + this.showDesignDataGetter.fields.key
          await this.uploadCreateDesign({ title: this.title, url: signedUrlData })
            .then((res) => {
              this.delivery.designId = res.data.data
              this.successResponseDesignId = res.data.data
              this.isAchievementActive()
            })
            .catch((err) => console.error(err))
        }
      }
    },
    onCreateDetails() {
      this.createDetails = !this.createDetails
      const errMsgs = {}
      errMsgs.detailId = false
      errMsgs.step2_msg = ''
      this.errorMsgReset(errMsgs)
    },
    async loadMoreDetails() {
      await this.fetchlistDetails({ length: 80, startIndex: this.listDetailsOption.length })
    },
    async detailOptionsAction() {
      if (this.listDetailsOption.length === 0) {
        await this.fetchlistDetails()
      }
    },
    async searchQueryData() {
      await this.fetchDetailSkills({
        query: this.querySearch,
        startIndex: 0,
        length: 2000
      })
      this.queriedSkillsData = this.listDetailSkillsOption.map((skillData) => ({
        label: skillData.title,
        value: skillData.skillId,
        languageCode: skillData.languageCode
      }))
    },
    async onSubmitDetails() {
      const data = {
        title: this.details.title,
        duration: parseInt(this.details.duration),
        level: this.details.level.value,
        duration_type: this.details.duration_type.value,
        description: this.details.description,
        earningCriteriaHTML: this.details.criteria.replace(/(\n+)/, '<br />'),
        type: ['certification', 'training'].includes(this.type) ? 'challenge' : this.type,
        skills: this.details.skills
      }

      if (this.type === 'course') {
        delete data.earningCriteriaHTML
      }

      if (this.details.skills.length > 0) {
        data.skills = this.details.skills.map((skill) => ({
          title: skill.label,
          skillId: skill.value,
          languageCode: skill.languageCode
        }))
      }

      await this.addDetail(data).then(() => {
        this.delivery.detailId = this.listDetailsOption[0]
      })

      if (this.fetchDetailInfoGetter.data) {
        this.successResponseDetailId = this.fetchDetailInfoGetter.data.id
        this.delivery.detailId = this.successResponseDetailId
      }
    },
    async templateOptionsAction() {
      await this.errorMsgResetTemplates({ status: false })
      if (this.listTemplatesOption.length === 0) {
        await this.fetchlistTemplates()
      } else {
        await this.errorMsgResetTemplates({ status: true })
      }
    },
    async saveDelivery() {
      const data = {
        title: this.title,
        _type: this.achievementSelected,
        mailSubject: this.delivery.mailSubject,
        emailFromName: this.delivery.emailFromName
      }
      data.designId = this.delivery.designId?.value || this.delivery.designId
      data.detailId = this.delivery.detailId?.value || this.delivery.detailId
      data.emailTemplateId = this.delivery.emailTemplateId?.value || this.delivery.emailTemplateId

      await this.createDelivery(data)
      console.log(this.deliverySuccessInfoGetter)
      if (this.fetchStatusOfApi) {
        this.delivery_id = { label: this.deliverySuccessInfoGetter.data.title, value: this.deliverySuccessInfoGetter.data.id }
        this.$emit('update:delivery_id', this.delivery_id)
        this.isCreateDelivery = false
      }
    }
  },
  computed: {
    ...mapGetters('course', ['showDesignDataGetter', 'statusOfS3Getter']),
    ...mapGetters('delivery', [
      'deliverySuccessInfoGetter',
      'fetchDeliveryOptionsList',
      'fetchDetailInfoGetter',
      'fetchErrorMsgs',
      'fetchErrorMsgsDesigns',
      'fetchErrorMsgsDetails',
      'fetchErrorMsgsTemplates',
      'fetchStatusOfApi',
      'isLoading',
      'listDesignsOption',
      'listDetailSkillsOption',
      'listDetailsOption',
      'listTemplatesOption',
      'totalDeliveries',
      'totalDetails',
      'totalDesigns'
    ])
  }
}
</script> -->
