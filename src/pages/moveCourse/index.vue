<template>
  <div>
    <div>
      <div>
        <q-card dark>
          <br />
          <q-stepper
            active-color="orange"
            animated
            alternative-labels
            class="bg-grey-10"
            done-color="positive"
            dark
            icon="school"
            ref="stepper"
            v-model="moveStep"
          >
            <q-step :name="2" title="Learning paths" caption="" icon="add_road" :done="moveStep > 2">
              <q-card dark class="padding_7">
                <template>
                  <div class="row" v-for="[key, value] in Object.entries(verifyAllDataGetter.lps)" :key="key + 'value' + value.sk">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <div class="text-h6 shadow-5 q-pa-md text-center">{{ key.split('#')[1] }}</div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12">
                      <div class="q-ma-sm bg-grey-9 full-height">
                        <div class="text-subtitle1 bg-grey-9 shadow-1 q-pa-md text-center">Copy same learning path</div>
                        <q-card class="bg-grey-9 flex flex-center" flat>
                          <q-card-section>
                            <div>
                              <input :value="defaultSelectLps(key)" type="hidden" />
                              <q-btn dark @click="copyCourseLps(key)" :color="Object.keys(selectionLps).length > 0 ? 'primary' : 'green'">
                                {{ Object.keys(selectionLps).length > 0 ? 'Copy' : 'Copied' }}
                              </q-btn>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12">
                      <div class="q-ma-sm bg-grey-9 full-height">
                        <div class="text-subtitle1 shadow-1 q-pa-md text-center">Production Learning path</div>
                        <div v-for="val in value" :key="val.sk + 'INST_SUB'">
                          <q-card class="bg-grey-9" flat>
                            <q-list flat>
                              <q-item v-if="Object.keys(selectionLps).length > 0 && selectionLps[key].value === val.sk">
                                <q-item-section class="text-subtitle2">
                                  <div class="text-green text-subtitle2" v-if="selectionLps[key].value === val.sk">
                                    Selected Existing prod Learning path
                                  </div>
                                </q-item-section>
                              </q-item>
                              <q-item v-else>
                                <q-checkbox
                                  @input="checkedOrNot(key)"
                                  dark
                                  v-model="selectionLps[key]"
                                  :false-value="''"
                                  :true-value="{ value: val.sk, label: val.learning_path_name }"
                                  :label="val.learning_path_name"
                                />
                              </q-item>
                              <q-item>
                                <q-item-section class="text-subtitle2">Learning path: {{ val.learning_path_name }}</q-item-section>
                              </q-item>
                              <q-item>
                                <q-item-section class="text-subtitle2">Created on: {{ val.created_on }}</q-item-section>
                              </q-item>
                            </q-list>
                          </q-card>
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12">
                      <div class="q-ma-sm bg-grey-9 full-height">
                        <div class="text-subtitle1 bg-grey-9 shadow-1 q-pa-md text-center">Selected Learning path and Choose New</div>
                        <q-card class="bg-grey-9 flex flex-center" flat>
                          <q-card-section>
                            <div>
                              <SingleSelect v-model="selectionLps[key]" :options="learningPathOption" :title="'Learning Paths *'" />
                            </div>
                            <div>
                              <p class="q-pt-md">
                                <label v-if="key in selectionLps">
                                  <label class="text-green" v-if="selectionLps[key].label">
                                    Learning path: {{ selectionLps[key].label }}
                                  </label>
                                  <label v-else-if="selectionLps[key]">selected from production</label>
                                </label>
                                <label v-else-if="key in copyLps">Copied</label>
                              </p>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </div>
                </template>
              </q-card>
            </q-step>

            <q-step :name="3" title="Labs" icon="science">
              <q-card dark class="padding_7">
                <template>
                  <div
                    class="row padding_7"
                    v-for="[key, value] in Object.entries(verifyAllDataGetter.labs)"
                    :key="key + 'value' + value.sk"
                  >
                    <div class="col-lg-3 col-md-3 col-sm-3 col-xs-3 vt_center">
                      <div class="text-h6 padding_7">{{ key.split('#')[1] }}</div>
                    </div>
                    <div class="col-lg-9 col-md-9 col-sm-9 col-xs-9">
                      <div class="row">
                        <template>
                          <div
                            class="col-lg-6 col-md-6 col-sm-6 col-xs-6 bordered_class padding_7"
                            v-for="val in value"
                            :key="val.sk + 'LAB_SUB'"
                          >
                            <div>
                              <q-card
                                dark
                                v-bind:class="{ bordered_class_active: typeof selectionLab[key] === 'string' && selectionLab[key] }"
                              >
                                <q-list dark>
                                  <q-item>
                                    <input :value="defaultCheckbox(key, val.sk)" type="hidden" />
                                    <q-checkbox
                                      style="bordered: 1px solid #fff"
                                      @input="checkedOrNot(key)"
                                      dark
                                      v-model="selectionLab[key]"
                                      :value="selectionLab[key]"
                                      :false-value="''"
                                      :true-value="val.sk"
                                      :label="val.lab_name"
                                    />
                                  </q-item>
                                  <q-item>
                                    <q-item-section>Lab TTL: {{ val.lab_ttl }}</q-item-section>
                                  </q-item>
                                  <q-item>
                                    <q-item-section>Regions: {{ val.regions.toString() }}</q-item-section>
                                  </q-item>
                                  <q-item>
                                    <q-item-section>Configuration: {{ val.configuration }}</q-item-section>
                                  </q-item>
                                  <q-item>
                                    <q-item-section>Image id: {{ val.image_id }}</q-item-section>
                                  </q-item>
                                  <q-item>
                                    <q-item-section>SK: {{ val.sk }}</q-item-section>
                                  </q-item>
                                  <q-item>
                                    <q-item-section>Approx time: {{ val.approx_time }}</q-item-section>
                                  </q-item>
                                  <q-item>
                                    <q-item-section>Documentation: {{ val.documentation_filename }}</q-item-section>
                                  </q-item>
                                  <q-item>
                                    <q-item-section>Description: {{ val.description }}</q-item-section>
                                  </q-item>
                                  <q-item>
                                    <q-item-section>Created on: {{ val.created_on }}</q-item-section>
                                  </q-item>
                                </q-list>
                              </q-card>
                            </div>
                          </div>
                        </template>
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 bordered_class padding_7">
                          <br />
                          <input :value="defaultSelect(key)" type="hidden" />
                          <q-btn dark v-if="key in selectionLab ? selectionLab[key].label : false" @click="copyCourse(key)" outline>
                            Copy Existing
                          </q-btn>
                          <q-btn dark v-else @click="copyCourse(key)" :color="'green'" outline>Copied same lab</q-btn>
                          <br />
                          <br />
                          <br />
                          <SingleSelectLabFields
                            :disabled="false"
                            :searchFieldData="searchLabData"
                            :clearFun="clearTg"
                            v-model:selected="selectionLab[key]"
                            :title="'Select Existing Labs'"
                            :showMore="showMoreGetterLabs"
                            @loadMoreItems="loadMoreItemsLabs"
                            :loadingData="showMoreLoadingGetterLabs"
                            :disabledList="disabledLabsIds"
                            @resetData="resetDataLabsOptions"
                            @searchFilter="searchFilter"
                            :options="fetchListLabsOptions"
                          />
                          <div>
                            <br />
                            <br />
                            <p class="padding_7 portal_lg">
                              <label v-if="key in selectionLab">
                                <label v-if="selectionLab[key].label" class="portal_bold text-green">Selected from: Dropdown</label>
                                <label v-else-if="selectionLab[key]" class="portal_bold text-green">Selected from: checkBox</label>
                              </label>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-card>
            </q-step>

            <template v-slot:navigation>
              <q-stepper-navigation>
                <div class="text-right" align="right">
                  <div v-if="moveStep === 1 && verifyAllDataGetter.events.length > 0">
                    <q-btn class="text-capitalize bg-primary text-white" @click="goBackToCourses()">Previous</q-btn>
                    <q-btn class="text-capitalize bg-primary text-white" @click="nextStep()">Next</q-btn>
                  </div>
                  <div v-if="moveStep === 2">
                    <q-btn class="text-capitalize bg-primary text-white q-mr-sm" @click="goBackToCourses()">Courses</q-btn>
                    <q-btn
                      class="text-capitalize bg-primary text-white"
                      v-if="verifyAllDataGetter.events.length > 0"
                      @click="goBackToCourses()"
                    >
                      Previous
                    </q-btn>
                    <q-btn class="text-capitalize bg-primary text-white" @click="nextStep()">Next</q-btn>
                  </div>
                  <div v-if="moveStep === 3">
                    <q-btn class="text-capitalize bg-primary text-white q-mr-sm" @click="goBackToCourses()">Courses</q-btn>
                    <q-btn class="text-capitalize bg-primary text-white q-mr-sm" @click="goBackToCourses()">Previous</q-btn>
                    <q-btn class="text-capitalize bg-primary text-white q-mr-sm" @click="submitCourseDataToProd()">Submit</q-btn>
                  </div>
                </div>
              </q-stepper-navigation>
            </template>
          </q-stepper>
        </q-card>
      </div>
    </div>
  </div>
</template>
<script>
import SingleSelect from 'components/shared/SingleSelect'
import SingleSelectLabFields from 'components/shared/SingleSelectLabFields'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'FreeUsers',
  components: { SingleSelectLabFields, SingleSelect },
  data() {
    return {
      clearTg: false,
      moveStep: 1,
      copyLabs: {},
      tempSelectLab: {},
      copyLps: {},
      selectionLab: {},
      selectionLps: {},
      learningPathsSelect: null,
      labs_data_select: null,
      searchLabData: '',
      lps: {
        'learning_path_a101bb8c-3519-4b34-a10c-4e5f636fd565#Kubernetes Security': [
          {
            learning_path_name: 'Kubernetes Security',
            sk: 'learning_path_a101bb8c-3519-4b34-a10c-4e5f636fd565',
            pk: 'learning_path',
            created_on: '2020-12-22T11:19:29.038083'
          }
        ]
      },
      labs: {
        'lab_40026717-a4c4-456f-b257-7cc94d5eb0d1#AWS IAM Access Analzyer': [
          {
            lab_ttl: 5400,
            regions: ['us-central1-a'],
            documentations: ['AWS-S3/S3-Create-Insecure-Bucket.md'],
            configuration: 'e2-small',
            image_id: 'aws-iam-analyzer',
            approx_time: 90,
            documentation_filename: 'AWS-S3/S3-Create-Insecure-Bucket.md',
            search_name: 'aws iam access analzyer',
            lab_name: 'AWS IAM Access Analzyer',
            event_id: 'event_9d8d23b7-f08a-4f87-a7b7-cbcad825f36b',
            sk: 'lab_40026717-a4c4-456f-b257-7cc94d5eb0d1',
            pk: 'lab',
            subject_id: 'subject_c5b9ea84-3197-4a79-a2de-e59f258e8625',
            description: 'AWS IAM Access Analzyer',
            created_on: '2022-01-31T05:28:58.521743'
          }
        ],
        'lab_03be6e8e-ad88-45e3-81f9-c77450a48b03#Vault-Dynamic-Baremetal': [
          {
            lab_ttl: 5400,
            regions: ['us-central1-a'],
            configuration: 'e2-small',
            image_id: 'vault-dynamic-secrets',
            approx_time: 90,
            documentation_filename: 'Kubernetes-Security-Masterclass/Vault-Dynamic-Secrets-BareMetal.md',
            search_name: 'vault-dynamic-baremetal',
            lab_name: 'Vault-Dynamic-Baremetal',
            event_id: 'event_6f6c9636-6ddb-49f5-a386-98c70bf734f7',
            sk: 'lab_03be6e8e-ad88-45e3-81f9-c77450a48b03',
            pk: 'lab',
            subject_id: 'subject_fcc62651-c4a8-4b3d-810a-803f69713816',
            description: 'dsadas',
            created_on: '2022-01-31T05:28:58.697047'
          }
        ],
        'lab_2009d2ad-1b1e-4ed5-859b-9049ca6a73ac#Lab: Kubernetes Cluster Overview': [
          {
            lab_ttl: 1800,
            regions: ['us-central1-b'],
            configuration: 'e2-small',
            image_id: 'kubernetes',
            approx_time: 30,
            documentation_filename: 'Kubernetes-101/K8s-Hands-On.md',
            search_name: 'lab: kubernetes cluster overview',
            lab_name: 'Lab: Kubernetes Cluster Overview',
            event_id: 'event_0a84e806-4926-4c92-a5a2-290f8d885982',
            sk: 'lab_2009d2ad-1b1e-4ed5-859b-9049ca6a73ac',
            description: 'Kubernetes Cluster Overview',
            pk: 'lab',
            subject_id: 'subject_b4a4c940-ead5-472d-84ae-35019fecda33',
            created_on: '2020-12-22T12:25:01.429198'
          }
        ],
        'lab_90f4be70-1237-41f8-a3b4-4778caf9f56b#Test 1232 tttttt': [
          {
            lab_ttl: 720,
            regions: ['us-central1-a'],
            documentations: ['Kubernetes-101/K8s-Hands-On.md'],
            configuration: 'e2-small',
            image_id: 'kubernetes-dns-spoofing',
            approx_time: 12,
            documentation_filename: 'Kubernetes-101/K8s-Hands-On.md',
            search_name: 'test 1232 tttttt',
            is_cloud: false,
            lab_name: 'Test 1232 tttttt',
            event_id: 'event_0a84e806-4926-4c92-a5a2-290f8d885982',
            sk: 'lab_90f4be70-1237-41f8-a3b4-4778caf9f56b',
            pk: 'lab',
            subject_id: 'subject_b4a4c940-ead5-472d-84ae-35019fecda33',
            description: 'ss',
            created_on: '2022-01-31T05:28:58.891243'
          }
        ],
        'lab_cb8435bc-1b10-4db0-b99a-1d30c4dffedc#mino': [
          {
            lab_ttl: 6000,
            regions: ['us-central1-a'],
            configuration: 'e2-small',
            image_id: 'opa-gatekeeper',
            approx_time: 10,
            documentation_filename: 'Kubernetes-101/K8s-Hands-On.md',
            search_name: 'mino',
            lab_name: 'mino',
            event_id: 'event_0a84e806-4926-4c92-a5a2-290f8d885982',
            sk: 'lab_cb8435bc-1b10-4db0-b99a-1d30c4dffedc',
            pk: 'lab',
            subject_id: 'subject_b4a4c940-ead5-472d-84ae-35019fecda33',
            description: 'zxc',
            created_on: '2022-01-31T05:28:59.018950'
          }
        ],
        'lab_072118ec-6b4e-4863-a177-45e34fcac3b0#basic-crd': [
          {
            lab_ttl: 4020,
            regions: ['us-central1-a'],
            documentations: ['Kubernetes-Security-Masterclass/basic-cr.md'],
            configuration: 'e2-small',
            image_id: 'crd',
            approx_time: 90,
            search_name: 'basic-crd',
            lab_name: 'basic-crd',
            event_id: 'event_6f6c9636-6ddb-49f5-a386-98c70bf734f7',
            sk: 'lab_072118ec-6b4e-4863-a177-45e34fcac3b0',
            pk: 'lab',
            subject_id: 'subject_fcc62651-c4a8-4b3d-810a-803f69713816',
            description: 'dasd',
            created_on: '2022-01-31T05:28:59.194890'
          }
        ],
        'lab_0786c380-8adf-4eb5-9c61-f060497bbcee#Lab: Implementing AWS Secrets and Encryption with a real-world app': [
          {
            lab_ttl: 1800,
            regions: ['us-central1-a'],
            documentations: ['AWS-Secrets/ASE-Pro-AWS-Secrets-and-Encryption.md', 'AWS-Secrets/AWS-Secrets-and-Encryption.md'],
            configuration: 'e2-small',
            image_id: 'aws-secrets',
            approx_time: 30,
            documentation_filename: 'AWS-Secrets/AWS-Secrets-and-Encryption.md',
            search_name: 'lab: implementing aws secrets and encryption with a real-world app',
            is_cloud: true,
            ou_id: 'ou-6yoy-28tzxie8',
            lab_name: 'Lab: Implementing AWS Secrets and Encryption with a real-world app',
            event_id: 'event_efbff7d5-8619-419d-a091-4bd223c7a1bd',
            sk: 'lab_001ef61a-1576-48bf-a6d6-cf026f2e92d2',
            description: 'Lab: Implementing AWS Secrets and Encryption with a real-world app',
            pk: 'lab',
            subject_id: 'subject_568c3707-b236-414c-bf80-4e8c2f4f991a',
            cloud_type: 'aws',
            created_on: '2021-01-07T07:55:12.580273'
          }
        ],
        'lab_2446b69b-0ff6-432b-8597-9446b8c578d3#Kube-audit': [
          {
            lab_ttl: 5400,
            regions: ['us-central1-a'],
            documentations: ['Kubernetes-Security-Masterclass/argo-lab.md'],
            configuration: 'e2-standard-2',
            image_id: 'kube-audit',
            approx_time: 90,
            search_name: 'kube-audit',
            lab_name: 'Kube-audit',
            event_id: 'event_6f6c9636-6ddb-49f5-a386-98c70bf734f7',
            sk: 'lab_2446b69b-0ff6-432b-8597-9446b8c578d3',
            pk: 'lab',
            subject_id: 'subject_fcc62651-c4a8-4b3d-810a-803f69713816',
            description: 'dsd',
            created_on: '2022-01-31T05:28:59.456616'
          }
        ]
      }
    }
  },
  async created() {
    const dataVerify = {
      event_id: urlSafeBase64Decode(this.$route.params.courseId)
    }
    await this.moveCourseToProdVerify(dataVerify)
    await this.resetToLab('lab')
    const data = {
      pagination: {},
      reset: true
    }
    await this.fetchLabs(data)
    if (this.learningPathOption.length === 0) {
      this.fetchLearningPathOptions()
    }
    if (this.verifyAllDataGetter.events.length === 0) {
      this.nextStep()
    }
    this.selectionLab = this.selectedGetter
  },
  methods: {
    async defaultSelect(key) {
      this.copyLabs[key] = key
    },
    defaultCheckbox(key, value) {
      this.tempSelectLab[key] = value
    },
    async defaultSelectLps(key) {
      this.copyLps[key] = key
    },
    async submitCourseDataToProd() {
      const labJson = {}
      Object.entries(this.selectionLab).forEach(([key, value]) => {
        const keyId = key.split('#')
        if (typeof value === 'object') {
          if (value.value) {
            labJson[keyId[0]] = value.value
          }
        } else {
          if (value) {
            labJson[keyId[0]] = value
          }
        }
      })
      Object.entries(this.copyLabs).forEach(([key, value]) => {
        const keyId = key.split('#')
        if (!(keyId[0] in labJson)) {
          labJson[keyId[0]] = 'COPY'
        }
      })

      const lpsJson = {}
      Object.entries(this.selectionLps).forEach(([key, value]) => {
        const keyId = key.split('#')
        if (typeof value === 'object') {
          if (value.value) {
            lpsJson[keyId[0]] = value.value
          }
        } else {
          if (value) {
            lpsJson[keyId[0]] = value
          }
        }
      })
      Object.entries(this.copyLps).forEach(([key, value]) => {
        const keyId = key.split('#')
        if (!(keyId[0] in lpsJson)) {
          lpsJson[keyId[0]] = 'COPY'
        }
      })
      const data = {
        event_id: urlSafeBase64Decode(this.$route.params.courseId),
        lps: lpsJson,
        labs: labJson
      }
      await this.moveCourseToProdSubmit(data)
    },
    async copyCourseLps(key) {
      this.copyLps[key] = key
      this.selectionLps[key] = null
      if (key in this.selectionLps) {
        delete this.selectionLps[key]
      }
    },
    async copyCourse(key) {
      this.copyLabs[key] = key
      this.selectionLab[key] = null
      if (key in this.selectionLab) {
        delete this.selectionLab[key]
      }
    },
    checkedOrNot(key) {},
    async goBackToCourses() {
      if (this.moveStep === 1) {
        this.$router.push('/portal/courses')
      } else if (this.moveStep === 2) {
        if (this.learningPathOption.length === 0) {
          this.fetchLearningPathOptions()
        }
        this.moveStep = this.moveStep - 1
      } else {
        await this.resetToLab('lab')
        const data = {
          pagination: {},
          reset: true
        }
        await this.fetchLabs(data)
        this.moveStep = this.moveStep - 1
      }
    },
    nextStep() {
      this.$refs.stepper.next()
    },
    async resetDataLabsOptions(event) {
      this.searchLabData = ''
      if (event) {
        this.labs_data_select = null
        this.searchLabData = ''
        if (event) {
          if (event.reset && this.fetchLoadMoreTypeLabGetter === 'search') {
            const data = {
              pagination: {},
              reset: true
            }
            await this.fetchLabs(data)
          }
        } else if (event) {
          if (event.reset && this.fetchLoadMoreTypeLabGetter === 'lab') {
            const data = {
              pagination: {},
              reset: true
            }
            await this.fetchLabs(data)
          }
        }
      }
    },
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
      }
    },
    async loadMoreItemsLabs(event) {
      if (this.fetchLoadMoreTypeLabGetter === 'lab') {
        const data = {
          pagination: {
            last_value: this.labPaginationKeyForwardLabs
          },
          reset: false
        }
        await this.fetchLabs(data)
      } else if (this.fetchLoadMoreTypeLabGetter === 'search') {
        const dataLab = {
          pagination: {
            pk: 'lab',
            pagination: this.labPaginationKeyForwardLabs,
            query: this.searchLabData
          },
          reset: false
        }
        await this.fetchSearchLabs(dataLab)
      }
    },
    ...mapActions('course', ['moveCourseToProdVerify', 'moveCourseToProdSubmit']),
    ...mapActions('learningPath', ['fetchLearningPathOptions']),
    ...mapActions('labs', ['fetchLabs', 'fetchSearchLabs', 'resetToLab'])
  },
  computed: {
    disabledLabsIds: function () {
      return Object.entries(this.selectionLab).map(([key, value]) => {
        return typeof value === 'object' ? value.value : value
      })
    },
    selectedGetter: function () {
      return Object.entries(this.verifyAllDataGetter.labs).reduce((acc, [key, value]) => {
        acc[key] = value[0].sk
        return acc
      }, {})
    },
    ...mapGetters('course', {
      verifyAllDataGetter: 'verifyAllDataGetter'
    }),
    ...mapGetters('learningPath', {
      learningPathOption: 'learningPathOption'
    }),
    ...mapGetters('labs', {
      showMoreGetterLabs: 'showMoreGetterLabs',
      labPaginationKeyForwardLabs: 'labPaginationKeyForward',
      fetchListLabsOptions: 'fetchListLabsOptions',
      showMoreLoadingGetterLabs: 'showMoreLoadingGetterLabs',
      fetchLoadMoreTypeLabGetter: 'fetchLoadMoreTypeLabGetter'
    })
  }
}
</script>

<style scoped>
.bordered_class {
  border: 0.5px solid rgb(182, 178, 178);
  border-radius: 0px;
}
.bordered_class_active {
  border: 0.5px solid rgb(182, 178, 178);
  background: #000;
  color: #fff;
}
.vt_center {
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
}
</style>
