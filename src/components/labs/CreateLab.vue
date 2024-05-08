<template>
  <q-dialog v-model="dataShow" persistent transition-show="flip-up" transition-hide="flip-down">
    <q-card style="width: 720px; max-width: 90vw" dark>
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">
          <q-icon name="create" />
          {{ id ? 'Update Lab' : 'Create Lab' }}
          <hr />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-form greedy ref="formRef" @submit.prevent="finish()">
          <q-stepper active-color="white" alternative-labels animated dark done-color="positive" ref="stepper" v-model="step">
            <q-step :name="1" title="Basic Information" icon="article" :done="step > 1">
              <q-list class="row">
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput autofocus label="Name *" required :rules="minLength(2)" v-model="lab.name" />
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput
                      label="Approx Time (In Minutes) *"
                      :max="500"
                      :min="10"
                      required
                      :rules="[...min(10), ...max(500)]"
                      type="number"
                      v-model="lab.approxTime"
                    />
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput
                      label="Disk Size (10-30) *"
                      :max="30"
                      :min="10"
                      required
                      :rules="[...min(10), ...max(30)]"
                      type="number"
                      v-model="lab.disk_size"
                    />
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseSelect
                      :disabled="!instructionFolderList.length"
                      hint="Please select the folder, click on the side button and choose documentation"
                      label="Choose folder"
                      :options="instructionFolderList"
                      sendButton
                      v-model="lab.event"
                      @send="findDocumentationByEvent"
                    />
                  </q-item-section>
                </q-item>
                <q-item class="col-12" v-if="showDocs || (id ? singleLabInfo.documentations : showDocs)">
                  <q-item-section>
                    <BaseSelect
                      v-if="showDocs || (id ? singleLabInfo.documentations : showDocs)"
                      label="Documentations *"
                      multiple
                      :options="getInstructionsList"
                      :rules="required"
                      v-model="lab.documentation"
                    />
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput label="Description *" :rules="minLength(5)" type="textarea" v-model="lab.description" />
                  </q-item-section>
                </q-item>
              </q-list>
              <q-stepper-navigation class="row">
                <q-btn class="col-grow q-mr-sm" color="orange" label="Cancel" outline @click="cancelLabCreation()" />
                <q-btn
                  class="col-grow"
                  color="positive"
                  label="Next"
                  @click="$refs.formRef.validate().then((valid) => (valid ? (step = 2) : null))"
                />
              </q-stepper-navigation>
            </q-step>
            <q-step :name="2" title="Configuration" icon="build" :done="step > 2">
              <q-list class="row">
                <q-item class="col-12">
                  <q-item-section>
                    <BaseInput label="Search Image *" required :rules="required" sendButton v-model="lab.findImage" @send="findImage" />
                  </q-item-section>
                </q-item>
                <q-item v-if="showImages" class="col-12">
                  <q-item-section>
                    <BaseSelect label="Image Name *" :options="getChitImagesList" :rules="required" v-model="imageName" />
                  </q-item-section>
                </q-item>
                <q-item v-if="showImages" class="col-12">
                  <q-item-section>
                    <BaseSelect label="Configuration *" :options="labConfigOptions" :rules="required" v-model="lab.configuration" />
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <Metadata v-model="lab.metadata" />
                  </q-item-section>
                </q-item>
                <q-item class="col-12">
                  <q-item-section>
                    <BaseToggle label="Is Challenge Object" v-model="lab.is_challenge_object" />
                  </q-item-section>
                </q-item>
              </q-list>
              <q-stepper-navigation class="row">
                <q-btn class="col-grow" color="orange" label="Cancel" outline @click="cancelLabCreation()" />
                <q-btn class="col-grow q-mx-sm" color="orange" label="Back" @click="step = 1" />
                <q-btn class="col-grow" color="positive" label="Next" @click="step = 3" />
              </q-stepper-navigation>
            </q-step>
            <q-step :name="3" title="Cloud Configuration" caption="Optional" icon="cloud" :done="step > 3">
              <q-item class="col-12">
                <q-item-section>
                  <BaseToggle label="is Cloud" v-model="isCloud" />
                </q-item-section>
              </q-item>
              <q-item class="col-12" v-if="isCloud">
                <q-item-section>
                  <BaseSelect label="Cloud Type *" :options="listCloudTypes" :rules="required" v-model="cloudType" />
                </q-item-section>
              </q-item>
              <q-item class="col-12" v-if="isCloud && (cloudType ? cloudType.value === 'aws' : false)">
                <q-item-section>
                  <BaseSelect label="Select OU *" :options="listAWSOU" :rules="required" v-model="awsOuId" />
                </q-item-section>
              </q-item>
              <q-stepper-navigation class="row">
                <q-btn class="col-grow" color="orange" label="Cancel" outline @click="cancelLabCreation()" />
                <q-btn class="col-grow q-mx-sm" color="orange" label="Back" @click="step = 2" />
                <q-btn class="col-grow" color="positive" label="Next" @click="step = 4" />
              </q-stepper-navigation>
            </q-step>
            <q-step
              :name="4"
              title="Review"
              icon="list"
              :disable="(isCloud && !cloudType?.value) || (isCloud && cloudType?.value && cloudType.label === 'AWS' && !awsOuId)"
            >
              <TimeLine
                :cloudInfo="{ isCloud: isCloud, cloudType: cloudType, awsOuId: awsOuId }"
                :data="{ ...lab, ...{ imageName: imageName } }"
              />
              <q-stepper-navigation class="row">
                <q-btn class="col-grow" color="orange" label="Cancel" outline @click="cancelLabCreation()" />
                <q-btn class="col-grow q-mx-sm" color="orange" label="Back" @click="step = 3" />
                <q-btn class="col-grow" color="positive" label="Done" type="submit" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import TimeLine from 'components/lab/TimeLine.vue'
import BaseInput from 'components/shared/BaseInput.vue'
import BaseSelect from 'components/shared/BaseSelect.vue'
import BaseToggle from 'components/shared/BaseToggle.vue'
import Metadata from 'components/shared/Metadata.vue'
import { max, min, minLength, required } from 'src/utils/rules'
import { compareFunction } from 'src/utils/validateSeralizer'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CreateLab',
  props: ['id', 'show'],
  components: { TimeLine, BaseInput, BaseSelect, BaseToggle, Metadata },
  data() {
    return {
      awsOuId: null,
      cloudType: null,
      imageName: null,
      isCloud: false,
      lab: {
        name: '',
        approxTime: undefined,
        event: null,
        documentation: undefined,
        description: '',
        findImage: null,
        update_lab_id: null,
        region: null,
        configuration: 'e2-small',
        metadata: undefined,
        is_challenge_object: false,
        disk_size: 10
      },
      labConfigOptions: [
        { label: 'e2-small', value: 'e2-small' },
        { label: 'e2-medium', value: 'e2-medium' },
        { label: 'e2-standard-2', value: 'e2-standard-2' },
        { label: 'e2-standard-4', value: 'e2-standard-4' }
      ],
      listAWSOU: [],
      listCloudTypes: [
        { label: 'AWS', value: 'aws' },
        { label: 'Azure', value: 'azure' },
        { label: 'Kubernetes', value: 'kubernetes' },
        { label: 'GCP', value: 'gcp' },
        { label: 'Runtime', value: 'runtime' }
      ],
      showDocs: false,
      showImages: false,
      step: 1,
      max,
      min,
      minLength,
      required,
      dataShow: this.show
    }
  },
  async created() {
    if (!this.instructionFolderList.length) {
      await this.fetchInstructionDirectory()
    }

    if (!this.listOuIdInfoGetter.length) {
      await this.fetchOuIDList()
    }
    this.listAWSOU = this.listOuIdInfoGetter.map((data) => ({ label: data.name, value: data.sk }))

    if (this.id) {
      const listLab = this.fetchListLabs.find((lab) => lab.sk === this.id) || this.fetchListChallengeLabs.find((lab) => lab.sk === this.id)
      console.log(listLab)

      this.lab.name = listLab.name
      this.lab.approxTime = parseInt(listLab.approx_time)
      this.lab.disk_size = listLab.disk_size ? parseInt(listLab.disk_size) : 10
      const documentations = Array.isArray(listLab.documentations)
        ? listLab.documentations
        : [listLab.documentations || listLab.documentation_filename]
      this.lab.documentation = documentations.map((infoData) => ({ label: infoData, value: infoData }))
      this.lab.event = this.instructionFolderList.find((data) =>
        [this.lab.documentation[0]?.value?.split('/')[0], listLab.documentation_filename?.split('/')[0]].includes(data.value)
      )
      this.findDocumentationByEvent(this.lab.event)
      this.lab.description = listLab.description

      this.lab.findImage = listLab.image_id
      if (this.lab.findImage) {
        this.findImage({ show: true, name: listLab.image_id })
      }
      this.imageName = { label: listLab.image_id, value: listLab.image_id }
      this.lab.configuration = listLab.configuration
      this.lab.metadata = listLab.metadata
      this.lab.is_challenge_object = listLab.is_challenge_object || false

      this.isCloud = listLab.is_cloud || false
      this.cloudType = { label: listLab.cloud_type, value: listLab.cloud_type }
      this.awsOuId = this.listAWSOU?.find((data) => data.value === listLab.ou_id)
      this.lab.update_lab_id = listLab.id
    }
  },
  methods: {
    ...mapActions('labs', ['createLab', 'fetchChitImages', 'fetchInstructionsBySubject', 'fetchOuIDList', 'updateLab']),
    ...mapActions('course', ['fetchInstructionDirectory']),
    async findDocumentationByEvent(event) {
      if (event?.value) {
        this.showDocs = true
        await this.fetchInstructionsBySubject({ select: event.value })
      }
    },
    async finish() {
      const payload = {
        approx_time: parseInt(this.lab.approxTime),
        cloud_type: this.cloudType?.value,
        configuration: this.lab.configuration?.value || this.lab.configuration,
        description: this.lab.description,
        documentations: this.lab?.documentation?.map((lb) => lb?.value),
        image_id: this.imageName?.value || this.imageName,
        is_challenge_object: this.lab.is_challenge_object,
        is_cloud: this.isCloud,
        lab_id: this.lab.update_lab_id || this.labID,
        lab_name: this.lab.name,
        lab_ttl: parseInt(this.lab.approxTime * 60),
        disk_size: parseInt(this.lab.disk_size)
      }
      if (this.lab.metadata) {
        payload.metadata = this.lab.metadata
      }
      if (this.cloudType?.value === 'aws') {
        payload.ou_id = this.awsOuId?.value
      }
      if (this.id) {
        const listLab =
          this.fetchListLabs.find((lab) => lab.sk === this.id) || this.fetchListChallengeLabs.find((lab) => lab.sk === this.id)
        await this.updateLab(compareFunction('labsUpdate', payload, listLab))
      } else {
        await this.createLab(payload)
      }
      if (this.fetchStatusOfApi) {
        this.$emit('onCancel', { show: true })
      } else {
        this.$emit('onCancel', { show: false })
      }
    },
    cancelLabCreation() {
      this.createLabStatus = false
      this.$emit('onCancel', { show: true })
    },
    async findImage(event) {
      const searchRecord = this.lab.findImage || event.Name
      await this.fetchChitImages(searchRecord)
      if (this.getChitImageStatus && this.getChitImagesList.length > 0) {
        this.showImages = true
      } else {
        this.showImages = false
        if (this.lab.region) {
          this.lab.region = null
        }
        if (this.imageName) {
          this.imageName = ''
        }
      }
    }
  },
  computed: {
    ...mapGetters('labs', [
      'fetchListChallengeLabs',
      'fetchListLabs',
      'fetchStatusOfApi',
      'getChitImagesList',
      'getChitImageStatus',
      'getInstructionsList',
      'listOuIdInfoGetter',
      'singleLabInfo'
    ]),
    ...mapGetters('course', ['instructionFolderList'])
  }
}
</script>
