<template>
  <ParticularSubjectInfo
    :tableData="fetchFilterDetailedSubjectGetter"
    :title="title"
    @actionItem="actionItem"
    @actionItemCrud="actionItemCrud"
    @actionItemDelete="actionItemDelete"
    @actionItemDetachData="actionItemDetach"
    @changeLabStatus="changeLabStatus"
    @createPage="showDialogData($event)"
  />
  <q-separator dark />
  <q-dialog v-model="bar2" persistent transition-show="flip-down" transition-hide="flip-up">
    <q-card class="bg-primary text-white" style="width: 600px; max-width: 80vw">
      <q-bar>
        <q-icon name="style" />
        <div>Action Items</div>

        <q-space />

        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section>
        <q-list>
          <q-item
            clickable
            v-ripple
            style="border: 1px solid white"
            @click="actionItem(action.value)"
            v-for="(action, index) in actionItems"
            :key="index"
          >
            <q-item-section>{{ action.label }}</q-item-section>
            <q-item-section avatar>
              <q-icon color="secondary" :name="action.icon" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="createMediaStatus" v-if="createMediaStatus" persistent transition-show="flip-down" transition-hide="flip-up">
    <q-card class="bg-primary text-white" style="width: 500px; max-width: 80vw">
      <q-bar>
        <q-icon name="create" />
        <div>{{ typeOfValue }} Media</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>
      <q-list bordered>
        <q-form greedy @submit="onSubmitMedia()">
          <q-card-section>
            <q-list class="row">
              <q-item class="col-12">
                <q-item-section>
                  <BaseInput autofocus :maxlength="150" required :rules="maxLength(150)" v-model="media.name" />
                  <p v-if="fetchErrorMsgsMedia.media_name" class="text-caption text-negative">
                    {{ fetchErrorMsgsMedia.media_name_msg }}
                  </p>
                </q-item-section>
              </q-item>
              <q-item class="col-12">
                <q-item-section>
                  <BaseInput label="Duration (In Seconds)" required type="number" v-model="media.duration" />
                  <p v-if="fetchErrorMsgsMedia.media_ttl" class="text-caption text-negative">{{ fetchErrorMsgsMedia.media_ttl_msg }}</p>
                </q-item-section>
              </q-item>
              <q-item class="col-12">
                <q-item-section>
                  <BaseInput label="URL" required type="textarea" v-model="media.url" />
                  <p v-if="fetchErrorMsgsMedia.media_url" class="text-caption text-negative">{{ fetchErrorMsgsMedia.media_url_msg }}</p>
                </q-item-section>
              </q-item>
              <q-item class="col-12">
                <q-item-section>
                  <BaseToggle label="Is Active" v-model="media.is_active" />
                  <p v-if="media.is_active === 'N/A'" class="text-caption text-negative">Please select Is Active toggle field</p>
                  <p v-if="fetchErrorMsgsMedia.is_active" class="text-caption text-negative">{{ fetchErrorMsgsMedia.is_active_msg }}</p>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions>
            <q-btn class="col-grow" color="orange" outline v-close-popup>Cancel</q-btn>
            <q-btn class="col-grow" color="positive" type="submit">Save</q-btn>
          </q-card-actions>
        </q-form>
      </q-list>
    </q-card>
  </q-dialog>

  <q-dialog v-model="createVedioStatus" v-if="createVedioStatus" persistent transition-show="flip-down" transition-hide="flip-up">
    <q-card class="bg-primary text-white" style="width: 600px; max-width: 80vw">
      <q-bar>
        <q-icon name="create" />
        <div>{{ typeOfValue }} Video</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>
      <q-form greedy @submit="onSubmitVideo()">
        <q-card-section class="q-px-xl">
          <q-video v-if="singleVideoInfo.vimeo_url && typeOfValue === 'Update'" :ratio="16 / 9" :src="singleVideoInfo.vimeo_url" />
        </q-card-section>
        <q-card-section>
          <q-list class="row">
            <q-item class="col-12">
              <q-item-section>
                <BaseInput autofocus :maxlength="150" required :rules="maxLength(150)" v-model="video.name" />
                <p v-if="fetchErrorMsgsVideo.vid_name" class="text-caption text-negative">{{ fetchErrorMsgsVideo.vid_name_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-12 q-mb-md">
              <q-item-section class="items-center">
                <BaseToggle label="Is Live" v-model="video.is_live" />
              </q-item-section>
              <q-item-section class="items-center">
                <BaseToggle label="Is Free" v-model="video.is_free" />
              </q-item-section>
              <q-item-section class="items-center">
                <BaseToggle label="Is Active" v-model="video.is_active" />
              </q-item-section>
            </q-item>
            <q-item v-if="fetchErrorMsgsVideo.is_active || fetchErrorMsgsVideo.is_free" class="col-12">
              <q-item-section>
                <p v-if="fetchErrorMsgsVideo.is_active" class="text-caption text-negative">{{ fetchErrorMsgsVideo.is_active_msg }}</p>
                <p v-if="fetchErrorMsgsVideo.is_free" class="text-caption text-negative">{{ fetchErrorMsgsVideo.is_free_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item v-if="video.is_live" class="col-12">
              <q-item-section class="col-8">
                <BaseInput
                  label="Live URL"
                  prefix="https://vimeo.com/event/"
                  required
                  :rules="[(val) => /^\d+$/.test(val) || 'Please enter a valid Live ID']"
                  suffix="/embed"
                  v-model="video.live_id"
                />
              </q-item-section>
              <q-item-section class="col-4">
                <BaseInput hint="In minutes" label="Duration estimate" required type="number" v-model="video.live_duration" />
              </q-item-section>
            </q-item>
            <q-item v-else class="col-12">
              <q-item-section>
                <BaseSelect
                  label="Folder"
                  :options="listVimeoFolders"
                  sendButton
                  :showMore="this.loadPage < this.totalPage"
                  v-model="video.folder"
                  @send="findVideosByFolder($event)"
                  @loadMoreItems="loadMoreDetails"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="showURL" class="col-12">
              <q-item-section>
                <BaseSelect
                  label="Video Name"
                  :loading="showMoreLoadingGetter"
                  :options="listVimeoVideos"
                  :showMore="showMoreGetter"
                  v-model="vid_data"
                  @loadMoreItems="loadMoreItems"
                />
                <p v-if="fetchErrorMsgsVideo.vid_url" class="text-caption text-negative">{{ fetchErrorMsgsVideo.vid_url_msg }}</p>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions>
          <q-btn class="col-grow" color="orange" outline v-close-popup>Cancel</q-btn>
          <q-btn class="col-grow" color="positive" type="submit">{{ typeOfValue }}</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="downloadSubjectStatus" v-if="downloadSubjectStatus" persistent transition-show="flip-down" transition-hide="flip-up">
    <q-card class="bg-primary text-white" style="width: 500px; max-width: 80vw">
      <q-bar>
        <q-icon name="create" />
        <div>{{ typeOfValue }} Download</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>
      <q-form greedy @submit="onSubmitDownload()">
        <q-card-section class="row">
          <q-list class="row">
            <q-item class="col-12">
              <q-item-section>
                <BaseInput autofocus :maxlength="250" required :rules="maxLength(150)" v-model="download.name" />
                <p v-if="fetchErrorMsgsDownload.download_name" class="text-caption text-negative">
                  {{ fetchErrorMsgsDownload.download_name_msg }}
                </p>
              </q-item-section>
            </q-item>
            <q-item class="col-12">
              <q-item-section>
                <BaseInput label="URL" :maxlength="550" required type="textarea" v-model="download.url" />
                <p v-if="fetchErrorMsgsDownload.download_url" class="text-caption text-negative">
                  {{ fetchErrorMsgsDownload.download_url_msg }}
                </p>
              </q-item-section>
            </q-item>
            <q-item class="col-12">
              <q-item-section>
                <BaseToggle label="Is Active" v-model="download.is_active" />
                <p v-if="download.is_active === 'N/A'" class="text-caption text-negative">Please select Is Active toggle field</p>
                <p v-if="fetchErrorMsgsDownload.is_active" class="text-caption text-negative">
                  {{ fetchErrorMsgsDownload.is_active_msg }}
                </p>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions>
          <q-btn class="col-grow" color="orange" outline v-close-popup>Cancel</q-btn>
          <q-btn class="col-grow" color="positive" type="submit">Save</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="quizSubjectStatus" persistent transition-show="flip-down" transition-hide="flip-up">
    <q-card class="bg-primary text-white text-center" style="width: 900px; max-width: 90vw">
      <q-bar>
        <q-icon name="create" />
        <div>{{ typeOfValue }} Quiz</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>
      <BaseToggle label="Custom Challenge" v-model="isAiChallenge" class="q-mt-md" />
      <q-form greedy @submit="onSubmitQuiz()">
        <q-card-section v-if="!isAiChallenge">
          <q-list class="row">
            <q-item class="col-12">
              <q-item-section>
                <BaseInput autofocus :maxlength="150" required :rules="maxLength(150)" v-model="quiz.name" />
                <p v-if="fetchErrorMsgsQuiz.quiz_name" class="text-caption text-negative">{{ fetchErrorMsgsQuiz.quiz_name_msg }}</p>
                <p v-if="fetchErrorMsgsQuiz.quiz_ttl" class="text-caption text-negative">{{ fetchErrorMsgsQuiz.quiz_ttl_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-12">
              <q-item-section>
                <BaseInput label="URL" required type="textarea" v-model="quiz.url" />
                <p v-if="fetchErrorMsgsQuiz.quiz_url" class="text-caption text-negative">{{ fetchErrorMsgsQuiz.quiz_url_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-12 justify-between">
              <q-item-section>
                <BaseToggle label="Is Active" v-model="quiz.is_active" />
                <p v-if="quiz.is_active === 'N/A'" class="text-caption text-negative">Please select Is Active toggle field</p>
                <p v-if="fetchErrorMsgsQuiz.is_active" class="text-caption text-negative">{{ fetchErrorMsgsQuiz.is_active_msg }}</p>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions v-if="!isAiChallenge">
          <q-btn class="col-grow" color="orange" outline v-close-popup>Cancel</q-btn>
          <q-btn class="col-grow" color="positive" type="submit">Save</q-btn>
        </q-card-actions>

        <q-card v-if="isAiChallenge" class="bg-primary text-white text-center">
          <q-card-section>
            <q-list>
              <q-item class="flex column">
                <q-item-section>
                  <div class="flex justify-around">
                    <BaseSelect label="Language" :options="languages" v-model="selectedLanguage" />
                    <BaseInput label="Framework" v-model="selectedFramework" />
                    <BaseSelect label="Difficulty" :options="difficultyOptions" v-model="selectedDifficulty" />
                    <div class="flex q-mb-md q-pb-xs">
                      <q-btn no-caps @click="filterChallenges" color="positive" class="col-grow q-mr-sm">Apply</q-btn>
                      <q-btn no-caps @click="clearFilterChallenges" color="orange" class="col-grow">Clear</q-btn>
                    </div>
                  </div>
                </q-item-section>
                <q-item-section>
                  <BaseSelect label="List of challenges *" class="q-mx-sm" :options="filteredChallenges" v-model="selectedChallenges" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions>
            <q-btn class="col-grow" color="orange" outline v-close-popup>Cancel</q-btn>
            <q-btn class="col-grow" color="positive" type="submit">{{ typeOfValue }}</q-btn>
          </q-card-actions>
        </q-card>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="createLabStatusAttach" v-if="createLabStatusAttach" persistent transition-show="flip-down" transition-hide="flip-up">
    <q-card class="bg-primary text-white" style="width: 500px; max-width: 80vw">
      <q-bar>
        <q-icon name="create" />
        <div>Attach</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section>
        <q-form greedy @submit="onSubmitLabAttach()">
          <q-card-section class="q-pa-sm">
            <q-list class="row">
              <q-item class="col-12">
                <q-item-section>
                  <BaseSelect
                    label="Select Lab/Challenge"
                    :options="[
                      { value: 'Lab', label: 'Lab' },
                      { value: 'Challenge', label: 'Challenge' }
                    ]"
                    v-model="isChallenge"
                  />
                </q-item-section>
              </q-item>
              <q-item v-if="isChallenge" class="col-12">
                <q-item-section>
                  <BaseSelect
                    :label="isChallenge.label === 'Lab' ? 'List Labs *' : 'List Challenges Labs *'"
                    :loading="showMoreLoadingGetterLabs"
                    :options="fetchListLabsOptions"
                    searchable
                    :showMore="showMoreGetterLabs"
                    v-model="labs_data_select"
                    @clear="resetFilter"
                    @loadMoreItems="loadMoreItemsLabs"
                    @popup-show="checkValue"
                    @search="searchFilter"
                  />
                </q-item-section>
              </q-item>
              <q-item class="col-12">
                <q-item-section>
                  <BaseToggle label="Is Active" v-model="labs_is_active" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions v-if="labs_data_select && isChallenge.label">
            <q-btn class="col-grow" color="orange" outline v-close-popup>Cancel</q-btn>
            <q-btn class="col-grow" color="positive" type="submit">Attach</q-btn>
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import BaseInput from 'components/shared/BaseInput.vue'
import BaseSelect from 'components/shared/BaseSelect.vue'
import BaseToggle from 'components/shared/BaseToggle.vue'
import ParticularSubjectInfo from 'components/subject/ParticularSubjectInfo'
import { useAiChallengesStore } from 'src/stores/aiChallenges'
import { urlSafeBase64Decode, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { maxLength, required, url } from 'src/utils/rules'
import { ref } from 'vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'SubjectDetailedInfo',
  components: { BaseInput, BaseSelect, BaseToggle, ParticularSubjectInfo },
  data() {
    return {
      actionItems: [
        { label: 'Create Media', value: 'createMedia', icon: 'format_size' },
        { label: 'Videos', value: 'vedios', icon: 'format_size' },
        { label: 'Downloads', value: 'downloads', icon: 'delete' },
        { label: 'Quiz', value: 'quiz', icon: 'print' },
        { label: 'Lab', value: 'lab', icon: 'print' }
      ],
      languages: ref(['Java', 'Python', 'Javascript', 'C#', 'Ruby', 'Go', 'Kubernetes YAML', 'Terraform']),
      difficultyOptions: ['Basic', 'Intermediate', 'Advanced'],
      awsOuId: '',
      bar2: false,
      cloudType: '',
      customChallenge: false,
      createLabStatus: false,
      createLabStatusAttach: false,
      createMediaStatus: false,
      createVedioStatus: false,
      download: { name: '', url: '', id: '', is_active: true },
      downloadSubjectStatus: false,
      imageName: '',
      isChallenge: '',
      isAiChallenge: false,
      isCloud: false,
      lab: { update_lab_id: null, region: null, approxTime: 0, labTime: 0, configuration: 'e2-small', documentation: [] },
      labs_data_select: null,
      labs_is_active: true,
      media: { name: '', url: '', duration: '', size: '', id: '', is_active: true },
      quiz: { name: '', url: '', duration: '', id: '', is_active: true },
      aiquiz: { name: '', duration: '', id: '', quiz_type: 'aiquiz' },
      // quizSubjectStatus: false,
      saveFolderId: '',
      searchLabData: '',
      showImages: false,
      showURL: false,
      subject: { subject_name: '', description: '', event_id: urlSafeBase64Decode(this.$route.params.courseId) },
      typeOfValue: 'Create',
      vid_data: '',
      video: { name: '', id: '', is_free: false, is_active: true, is_live: false, live_id: '', live_duration: 0 },
      maxLength,
      required,
      url,
      selectedChallenges: ref([])
    }
  },
  setup() {
    const aiChallenges = useAiChallengesStore()

    const selectedLanguage = ref(null)
    const selectedFramework = ref(null)
    const selectedDifficulty = ref(null)
    const filteredChallenges = ref([])
    const showChallenge = ref(false)
    const quizSubjectStatus = ref(false)

    async function filterChallenges() {
      const payload = {
        language: selectedLanguage.value,
        framework: selectedFramework.value,
        difficulty: selectedDifficulty.value
      }

      await aiChallenges.filterAiChallenges(payload)
      filteredChallenges.value = aiChallenges.filteredChallenges
    }

    function clearFilterChallenges() {
      selectedLanguage.value = null
      selectedFramework.value = null
      selectedDifficulty.value = null
      filteredChallenges.value = []
    }

    return {
      filterChallenges,
      clearFilterChallenges,
      selectedLanguage,
      selectedFramework,
      selectedDifficulty,
      filteredChallenges,
      showChallenge,
      quizSubjectStatus
    }
  },
  created() {
    this.title = `${urlSafeBase64Decode(this.$route.params.courseName)} / ${urlSafeBase64Decode(this.$route.params.subjectName)}`
    const data = {
      subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
      event_id: urlSafeBase64Decode(this.$route.params.courseId)
    }
    this.filterActionItem(data)
    this.disableLabsWithSameId({ event_id: urlSafeBase64Decode(this.$route.params.courseId) })
  },
  watch: {
    imageName: {
      handler() {
        if (this.imageName) {
          this.lab.imageName = this.imageName
          this.fetchChitImageConfig(this.imageName.value)
        }
      }
    },
    isChallenge: {
      handler() {
        this.resetLabsList()
        this.labs_data_select = null
      }
    },
    getChitImageConfig: {
      handler() {
        if (this.getChitImageConfig) {
          if (this.singleLabInfo.configuration) {
            this.lab.configuration = this.singleLabInfo.configuration
          } else {
            this.lab.configuration = this.getChitImageConfig
          }
        }
      }
    },
    getLabID: {
      handler() {
        this.labID = this.getLabID
      }
    }
  },
  methods: {
    ...mapActions('media', ['createNewMedia', 'fetchMediaById', 'updateMedia', 'errorMsgResetMedia']),
    ...mapActions('subject', ['fetchFilteredDetailedSubjectInformation', 'deleteGeneric', 'resetDataSubjectLab']),
    ...mapActions('video', [
      'createNewVideo',
      'errorMsgResetVideo',
      'fetchVideoById',
      'fetchVideosByFolder',
      'fetchVideosByFolderPaginations',
      'fetchVimeoFolders',
      'updateVideo'
    ]),
    ...mapActions('labs', [
      'attachLabToSubject',
      'detachLabToSubject',
      'disableLabsWithSameId',
      'fetchLabs',
      'fetchSearchLabs',
      'resetLabsList'
    ]),
    ...mapActions('download', ['createDownload', 'updateDownload', 'fetchDownloadById', 'errorMsgResetDownload']),
    ...mapActions('quiz', ['createNewQuiz', 'updateQuiz', 'fetchQuizById', 'errorMsgResetQuiz']),
    ...mapActions('lab', [
      'fetchChitImages',
      'fetchChitImageConfig',
      'createMetaData',
      'actionChangeLabStatus',
      'fetchLab',
      'updatingLab',
      'updateLabMetaInfo'
    ]),
    ...mapMutations('video', ['SET_PAGE']),
    ...mapMutations('video', ['CLEAR_VIMEO_FOLDERS']),
    resetFilter() {
      this.resetLabsList()
      const data = { pagination: {}, reset: true }
      if (this.isChallenge.value !== 'Lab') {
        data.pagination = { type: 'challenge' }
      }
      this.fetchLabs(data)
    },
    checkValue() {
      if (!this.fetchListLabsOptions.length) {
        this.resetFilter()
      }
    },
    async searchFilter(event) {
      if (event) {
        this.searchLabData = event
        const data = {
          pagination: {
            pk: 'lab',
            query: event
          },
          reset: true
        }
        if (this.isChallenge.value === 'Challenge') {
          data.pagination.pk = 'challenge'
        }
        await this.fetchSearchLabs(data)
      } else {
        this.callLabsChallenges()
      }
    },
    callLabsChallenges() {
      this.labs_data_select = null
      this.resetLabsList()
      const data = { pagination: {}, reset: true }
      if (this.isChallenge.value !== 'Lab') {
        data.pagination = { type: 'challenge' }
      }
      this.fetchLabs(data)
    },
    showDialogData(event) {
      if (event.show) {
        this.lab = { update_lab_id: null, region: null, approxTime: 0, labTime: 0, configuration: '' }
        this.resetData()
        this.bar2 = true
      } else {
        this.bar2 = false
      }
    },
    async actionItem(data) {
      this.typeOfValue = 'Create'
      this.resetData()
      this.bar2 = false
      if (data === 'createMedia') {
        this.media = { name: '', url: '', duration: '', size: '', id: '', is_active: true }
        this.errorMsgResetMedia({
          status: true,
          media_name: false,
          media_name_msg: '',
          media_url: false,
          media_url_msg: '',
          media_ttl: false,
          media_ttl_msg: '',
          embed_size: false,
          embed_size_msg: '',
          subject_id: false,
          subject_id_msg: '',
          event_id: false,
          event_id_msg: '',
          is_active: false,
          is_active_msg: ''
        })
        this.createMediaStatus = true
      } else if (data === 'vedios') {
        this.video = {
          name: '',
          id: '',
          is_free: false,
          is_active: true,
          is_live: false,
          vid_url: '',
          vid_ttl: ''
        }
        this.errorMsgResetVideo({
          status: true,
          vid_name: false,
          vid_name_msg: '',
          vid_ttl: false,
          vid_ttl_msg: '',
          vid_url: false,
          vid_url_msg: '',
          subject_id: false,
          subject_id_msg: '',
          event_id: false,
          event_id_msg: '',
          is_active: false,
          is_active_msg: ''
        })
        this.showURL = false
        this.SET_PAGE(1)
        this.CLEAR_VIMEO_FOLDERS()
        this.fetchVimeoFolders()
        this.createVedioStatus = true
      } else if (data === 'downloads') {
        this.download = { name: '', url: '', id: '', is_active: true }
        this.errorMsgResetDownload({
          status: true,
          download_name: false,
          download_name_msg: '',
          download_url: false,
          download_url_msg: '',
          logo_name: false,
          logo_name_msg: '',
          subject_id: false,
          subject_id_msg: '',
          event_id: false,
          event_id_msg: '',
          is_active: false,
          is_active_msg: ''
        })
        this.downloadSubjectStatus = true
      } else if (data === 'quiz') {
        this.errorMsgResetQuiz({
          status: true,
          quiz_name: false,
          quiz_name_msg: '',
          quiz_url: false,
          quiz_url_msg: '',
          quiz_ttl: false,
          quiz_ttl_msg: '',
          subject_id: false,
          subject_id_msg: '',
          event_id: false,
          event_id_msg: '',
          is_active: false,
          is_active_msg: ''
        })
        this.quizSubjectStatus = true
      } else if (data === 'lab') {
        this.isChallenge = null
        this.labs_data_select = null
        this.resetLabsList()
        this.createLabStatusAttach = true
      } else if (data === 'custom_challenge') {
        // this.customChallenge = true
        this.showChallenge = true
      }
    },
    async resetDataLabsOptions(event) {
      this.searchLabData = ''
      if (event) {
        this.labs_data_select = null
        this.searchLabData = ''
        if (this.isChallenge.value === 'Lab') {
          const data = {
            pagination: {},
            reset: true
          }
          this.fetchLabs(data)
        } else {
          const data = {
            pagination: { type: 'challenge' },
            reset: true
          }
          this.fetchLabs(data)
        }
      }
    },
    resetData() {
      this.createMediaStatus = false
      this.createVedioStatus = false
      this.quizSubjectStatus = false
      this.downloadSubjectStatus = false
      this.createLabStatus = false
      this.createMediaStatus = false
      this.createVedioStatus = false
      this.quizSubjectStatus = false
      this.downloadSubjectStatus = false
      this.createLabStatus = false
    },
    async onSubmitMedia() {
      const data = {
        media_name: this.media.name,
        media_url: urlSafeBase64Encode(this.media.url),
        media_ttl: parseInt(this.media.duration * 60),
        subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
        event_id: urlSafeBase64Decode(this.$route.params.courseId),
        is_active: this.media.is_active
      }

      if (this.media.id) {
        data.media_id = this.media.id
        this.updateMedia(data)
      } else {
        await this.createNewMedia(data)
      }

      this.createMediaStatus = !this.fetchErrorMsgsMedia.status
      this.media = { name: '', url: '', duration: '', size: '', id: '', is_active: true }

      setTimeout(() => {
        const dataFilter = {
          subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
          event_id: urlSafeBase64Decode(this.$route.params.courseId)
        }
        this.filterActionItem(dataFilter)
      }, 2000)
    },
    async onSubmitVideo() {
      const data = {
        vid_name: this.video.name,
        subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
        event_id: urlSafeBase64Decode(this.$route.params.courseId),
        is_free: this.video.is_free,
        is_live: this.video.is_live,
        is_active: this.video.is_active,
        vid_url: this.vid_data?.value ? urlSafeBase64Encode(this.vid_data.value) : undefined,
        vid_ttl: this.vid_data?.ttl ? this.vid_data?.ttl : undefined
      }

      if (this.video.is_live) {
        data.vid_url = urlSafeBase64Encode('https://vimeo.com/event/' + this.video.live_id + '/embed')
        data.vid_ttl = parseInt(this.video.live_duration)
      }

      if (this.video.id) {
        data.vid_id = this.video.id
        this.updateVideo(data)
      } else {
        await this.createNewVideo(data)
        this.video = { name: '', id: '', is_free: false, is_active: true }
      }

      this.createVedioStatus = !this.fetchErrorMsgsVideo.status

      setTimeout(() => {
        const dataFilter = {
          subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
          event_id: urlSafeBase64Decode(this.$route.params.courseId)
        }
        this.filterActionItem(dataFilter)
      }, 2000)
    },
    async onSubmitDownload() {
      const data = {
        download_name: this.download.name,
        download_url: urlSafeBase64Encode(this.download.url),
        subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
        event_id: urlSafeBase64Decode(this.$route.params.courseId),
        is_active: this.download.is_active
      }
      if (this.download.id) {
        data.download_id = this.download.id
        this.updateDownload(data)
      } else {
        await this.createDownload(data)
        if (this.statusOfAPIDownload) {
          this.download = { name: '', url: '', id: '', is_active: true }
        }
      }

      if (this.fetchErrorMsgsDownload.status) {
        this.downloadSubjectStatus = false
      } else {
        if (this.statusOfAPIDownload) {
          this.download = { name: '', url: '', id: '', is_active: true }
        }
        this.downloadSubjectStatus = true
      }

      setTimeout(() => {
        const dataFilter = {
          subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
          event_id: urlSafeBase64Decode(this.$route.params.courseId)
        }
        this.filterActionItem(dataFilter)
      }, 2000)
    },
    async onSubmitQuiz() {
      const data = {
        subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
        event_id: urlSafeBase64Decode(this.$route.params.courseId)
      }
      if (this.isAiChallenge) {
        data.quiz_name = 'AI Quiz: ' + this.selectedChallenges.name
        data.quiz_id = this.selectedChallenges._key
        data.quiz_type = 'aiquiz'
      } else {
        data.quiz_name = this.quiz.name
        data.quiz_url = urlSafeBase64Encode(this.quiz.url)
        data.is_active = this.quiz.is_active
      }

      if (this.quiz.id) {
        data.quiz_id = this.quiz.id
        await this.updateQuiz(data)
      } else if (this.aiquiz.id) {
        data.quiz_id = this.aiquiz.id
        await this.updateQuiz(data)
      } else {
        await this.createNewQuiz(data)
      }

      this.quiz = { name: '', url: '', duration: '', id: '', is_active: true }
      this.aiquiz = { name: '', duration: '', id: '', quiz_type: 'aiquiz' }

      if (this.fetchErrorMsgsQuiz.status) {
        this.quizSubjectStatus = false
      } else {
        this.download = { name: '', url: '', id: '', is_active: true }
        this.quizSubjectStatus = true
      }

      setTimeout(() => {
        const dataFilter = {
          subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
          event_id: urlSafeBase64Decode(this.$route.params.courseId)
        }
        this.filterActionItem(dataFilter)
      }, 2000)
    },
    findVideosByFolder(event) {
      this.vid_data = ''
      if (event.show) {
        const data = {
          folder_id: event.value
        }
        this.saveFolderId = data
        this.fetchVideosByFolder(data)
        this.showURL = true
      }
    },
    async loadMoreItems() {
      await this.fetchVideosByFolderPaginations(this.saveFolderId)
    },
    async loadMoreItemsLabs() {
      let data = {}
      if (this.fetchLoadMoreTypeLabGetter === 'lab') {
        data = {
          pagination: {
            pagination: this.labPaginationKeyForwardLabs
          },
          reset: false
        }
        if (this.isChallenge === 'Challenge') {
          data.pagination.type = 'challenge'
        }
        await this.fetchLabs(data)
      } else if (this.fetchLoadMoreTypeLabGetter === 'search') {
        data = {
          pagination: {
            pk: 'lab',
            pagination: this.labPaginationKeyForwardLabs,
            query: this.searchLabData
          },
          reset: false
        }
        if (this.isChallenge === 'Challenge') {
          data.pagination.type = 'challenge'
        }
        await this.fetchSearchLabs(data)
      }
    },
    async onSubmitLabAttach() {
      await this.attachLabToSubject({
        lab_id: this.labs_data_select?.value || this.labs_data_select,
        subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
        is_active: this.labs_is_active
      })
      setTimeout(() => {
        const dataFilter = {
          subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
          event_id: urlSafeBase64Decode(this.$route.params.courseId)
        }
        this.filterActionItem(dataFilter)
        this.disableLabsWithSameId({ event_id: urlSafeBase64Decode(this.$route.params.courseId) })
        this.labs_data_select = null
      }, 2000)
      this.createLabStatusAttach = false
    },
    async findImage(event) {
      if (event.show) {
        this.showImages = !this.showImages
      }
      const searchRecord = this.lab.findImage ? this.lab.findImage : event.name
      await this.fetchChitImages(searchRecord)
    },
    async changeLabStatus(info) {
      const attachdata = { subject_id: urlSafeBase64Decode(this.$route.params.subjectId), lab_id: info.status }
      await this.actionChangeLabStatus(attachdata)

      const searchIndex = this.fetchFilterDetailedSubjectGetter.lab.map((e) => e.id).indexOf(info.status)
      this.resetDataSubjectLab({ index: searchIndex, status: info.is_active })
    },
    transition(from, to) {
      if (from === 1) {
        const basic = {
          lab_name: this.lab.name,
          approx_time: parseInt(this.lab.approxTime),
          description: this.lab.description,
          documentations: this.lab?.documentation?.map((lb) => lb.value)
        }
        if (this.lab.update_lab_id) {
          basic.lab_id = this.lab.update_lab_id
          this.updateLabMetaInfo(basic)
        } else {
          this.createMetaData(basic)
        }
      } else {
        this.currentStep = to
      }
    },
    async filterActionItem(payload) {
      await this.fetchFilteredDetailedSubjectInformation(payload)
    },
    async actionItemDelete(event) {
      const data = {
        subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
        event_id: urlSafeBase64Decode(this.$route.params.courseId)
      }
      if (event.type === 'download') {
        data.download_id = event.id
      } else if (event.type === 'vid') {
        data.vid_id = event.id
      } else if (event.type === 'media') {
        data.media_id = event.id
      } else if (event.type === 'quiz') {
        data.quiz_id = event.id
      } else if (event.type === 'lab') {
        data.lab_id = event.id
      } else if (event.type === 'aiquiz') {
        data.quiz_id = event.id
      }
      const url = event.type + '/delete'
      await this.deleteGeneric({ data: data, url: url })
      this.lab = { update_lab_id: null, region: null, approxTime: 0, labTime: 0, configuration: '' }

      const dataFilter = {
        subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
        event_id: urlSafeBase64Decode(this.$route.params.courseId)
      }
      this.filterActionItem(dataFilter)
    },
    async actionItemDetach(event) {
      const data = {
        lab_id: event.id,
        subject_id: urlSafeBase64Decode(this.$route.params.subjectId)
      }
      await this.detachLabToSubject(data)
      await this.disableLabsWithSameId({ event_id: urlSafeBase64Decode(this.$route.params.courseId) })
      setTimeout(() => {
        const dataFilter = {
          subject_id: urlSafeBase64Decode(this.$route.params.subjectId),
          event_id: urlSafeBase64Decode(this.$route.params.courseId)
        }
        this.filterActionItem(dataFilter)
      }, 2000)
    },
    async actionItemCrud(event) {
      this.typeOfValue = 'Update'
      if (event.type === 'download') {
        this.errorMsgResetDownload({
          status: true,
          download_name: false,
          download_name_msg: '',
          download_url: false,
          download_url_msg: '',
          logo_name: false,
          logo_name_msg: '',
          subject_id: false,
          subject_id_msg: '',
          event_id: false,
          event_id_msg: '',
          is_active: false,
          is_active_msg: ''
        })
        const data = {
          download_id: event.id
        }
        await this.fetchDownloadById(data)
        this.download.name = this.singleDownloadInfo.download_name
        this.download.url = this.singleDownloadInfo.download_url
        this.download.is_active = this.singleDownloadInfo.is_active
        this.download.id = this.singleDownloadInfo.download_id
        this.downloadSubjectStatus = true
      } else if (event.type === 'vid') {
        this.errorMsgResetVideo({
          status: true,
          vid_name: false,
          vid_name_msg: '',
          vid_ttl: false,
          vid_ttl_msg: '',
          vid_url: false,
          vid_url_msg: '',
          subject_id: false,
          subject_id_msg: '',
          event_id: false,
          event_id_msg: '',
          is_active: false,
          is_active_msg: ''
        })
        const data = {
          vid_id: event.id
        }
        await this.fetchVideoById(data)
        this.fetchVimeoFolders()
        this.createVedioStatus = true
        this.video.name = this.singleVideoInfo.vid_name
        this.video.id = this.singleVideoInfo.vid_id
        this.video.is_free = this.singleVideoInfo.is_free || false
        this.video.is_active = this.singleVideoInfo.is_active
        this.video.is_live = this.singleVideoInfo.is_live
        this.video.vid_url = this.singleVideoInfo.vid_url
        this.video.vid_ttl = this.singleVideoInfo.vid_ttl / 60
        if (this.video.is_live) {
          this.video.live_id = this.singleVideoInfo.vid_url.match(/\/(\d+)\//)[1] // Take the number between the slashes
          this.video.live_duration = this.singleVideoInfo.vid_ttl / 60
        }
      } else if (event.type === 'media') {
        const data = {
          media_id: event.id
        }
        await this.fetchMediaById(data)
        this.media.name = this.singleMediaInfo.media_name
        this.media.url = this.singleMediaInfo.media_url
        this.media.duration = this.singleMediaInfo.media_ttl / 60
        this.media.size = this.singleMediaInfo.embed_size
        this.media.id = this.singleMediaInfo.media_id
        this.media.is_active = this.singleMediaInfo.is_active

        this.createMediaStatus = true
        this.errorMsgResetMedia({
          status: true,
          media_name: false,
          media_name_msg: '',
          media_url: false,
          media_url_msg: '',
          media_ttl: false,
          media_ttl_msg: '',
          embed_size: false,
          embed_size_msg: '',
          subject_id: false,
          subject_id_msg: '',
          event_id: false,
          event_id_msg: '',
          is_active: false,
          is_active_msg: ''
        })
      } else if (event.type === 'quiz') {
        const data = { quiz_id: event.id }
        await this.fetchQuizById(data)
        this.quiz.name = this.singleQuizInfo.quiz_name
        this.quiz.url = this.singleQuizInfo.quiz_url
        this.quiz.duration = this.singleQuizInfo.quiz_ttl / 60
        this.quiz.id = this.singleQuizInfo.sk
        this.quiz.is_active = this.singleQuizInfo.is_active
        this.quizSubjectStatus = true

        this.aiquiz.name = this.singleQuizInfo.quiz_name
        this.aiquiz.id = this.singleQuizInfo.quiz_id
        this.aiquiz.quiz_type = this.singleQuizInfo.quiz_type

        this.errorMsgResetQuiz({
          status: true,
          quiz_name: false,
          quiz_name_msg: '',
          quiz_url: false,
          quiz_url_msg: '',
          quiz_ttl: false,
          quiz_ttl_msg: '',
          subject_id: false,
          subject_id_msg: '',
          event_id: false,
          event_id_msg: '',
          is_active: false,
          is_active_msg: ''
        })
      } else if (event.type === 'lab') {
        const data = { lab_id: event.id }
        await this.fetchLab(data)
        await this.updatingLab(this.single_lab_data)
        this.lab.name = await this.singleLabInfo.name
        this.lab.approxTime = parseInt(this.singleLabInfo.approxTime)
        this.lab.description = await this.singleLabInfo.description
        this.lab.findImage = await this.singleLabInfo.imageId
        this.lab.update_lab_id = await this.singleLabInfo.id
        this.lab.region = this.singleLabInfo.regions.map((reg) => ({ label: reg, value: reg }))
        this.imageName = { label: this.singleLabInfo.imageId, value: this.singleLabInfo.imageId }

        this.isCloud = this.singleLabInfo.is_cloud
        this.cloudType = { label: this.singleLabInfo.cloud_type, value: this.singleLabInfo.cloud_type }
        this.lab.labTime = (await this.singleLabInfo.labTtl) / 60
        this.lab.configuration = await this.singleLabInfo.configuration
        if (this.singleLabInfo.documentations.length > 0) {
          const docinfo = []
          this.getInstructionsList.forEach((instr) => {
            this.singleLabInfo.documentations.forEach((selectedFile) => {
              if (instr.value === selectedFile) {
                docinfo.push({ label: instr.label, value: instr.value })
              }
            })
          })
          this.lab.documentation = docinfo
        }
        this.createLabStatus = true
      }
    },
    async loadMoreDetails() {
      // Load more folders
      this.SET_PAGE(this.loadPage + 1)
      await this.fetchVimeoFolders()
    }
  },
  computed: {
    ...mapGetters('subject', ['fetchFilterDetailedSubjectGetter']),
    ...mapGetters('media', {
      fetchErrorMsgsMedia: 'fetchErrorMsgs',
      singleMediaInfo: 'singleMediaInfo'
    }),
    ...mapGetters('quiz', {
      fetchErrorMsgsQuiz: 'fetchErrorMsgs',
      singleQuizInfo: 'singleQuizInfo'
    }),
    ...mapGetters('download', {
      fetchErrorMsgsDownload: 'fetchErrorMsgs',
      singleDownloadInfo: 'singleDownloadInfo',
      statusOfAPIDownload: 'statusOfAPI'
    }),
    ...mapGetters('video', {
      fetchErrorMsgsVideo: 'fetchErrorMsgs',
      listVimeoFolders: 'listVimeoFolders',
      listVimeoVideos: 'listVimeoVideos',
      showMoreGetter: 'showMoreGetter',
      showMoreLoadingGetter: 'showMoreLoadingGetter',
      singleVideoInfo: 'singleVideoInfo'
    }),
    ...mapGetters('labs', {
      fetchListLabsOptions: 'fetchListLabsOptions',
      fetchLoadMoreTypeLabGetter: 'fetchLoadMoreTypeLabGetter',
      labPaginationKeyForwardLabs: 'labPaginationKeyForward',
      showMoreGetterLabs: 'showMoreGetterLabs',
      showMoreLoadingGetterLabs: 'showMoreLoadingGetterLabs'
    }),
    ...mapGetters('lab', {
      getChitImageConfig: 'getChitImageConfig',
      getInstructionsList: 'getInstructionsList',
      getLabID: 'getLabID',
      single_lab_data: 'singleLabInfo',
      singleLabInfo: 'singleLabInfo'
    }),
    ...mapState('video', ['loadPage']),
    ...mapState('video', ['totalPage'])
  }
}
</script>
