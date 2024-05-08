<template>
  <div>
    <div class="row">
      <div class="q-pa-xs col-12">
        <q-tabs active-color="white" align="justify" class="text-grey" dense indicator-color="white" v-model="tab">
          <q-tab name="crud" label="Subject CRUD" />
          <q-tab name="feedback" label="Feedback" />
          <q-tab name="statistics" label="Statistics" />
        </q-tabs>

        <q-separator />
        <q-tab-panels v-model="tab" animated @before-transition="changeTab">
          <q-tab-panel class="bg-primary text-white" dark name="crud">
            <template v-if="!isCreate">
              <SubjectTable
                :tableData="subjectsByEvent"
                :title="courseName"
                @createPage="showCreateSubject($event)"
                @deletePage="showSubjectDelete($event)"
                @publishCourseToPlan="publishCourseToPlan($event)"
                @subjectInfo="showSubjectInfo($event)"
                @updatePage="showUpdateSubject($event)"
                @viewSortContents="showSortContent($event)"
              />
            </template>
            <template v-if="isCreate">
              <CreateSubject :id="param" :subjectId="updateId" :title="'Create Subject'" @onCacel="cancelCreateSubject($event)" />
            </template>
            <Delete
              v-if="isDelete"
              header="a Subject"
              :show="isDelete"
              @confirmDelete="subjectConfirmDeletion($event)"
              @confirmDeleteCancel="subjectConfirmDeleteCancel($event)"
            />
          </q-tab-panel>
          <q-tab-panel class="bg-primary text-white" name="feedback">
            <FeedbackTable :coursename="courseName" />
          </q-tab-panel>
          <q-tab-panel class="bg-dark" dark name="statistics">
            <q-card dark>
              <div class="row">
                <div class="q-pa-xs col-4 padding_7">
                  <Statistics iconName="fas fa-users" title="Enrollments" :count="getCourseStatsInfo.no_of_enrollments || 0" />
                </div>
                <div class="q-pa-xs col-4">
                  <Statistics iconName="fas fa-video" title="Videos" :count="getCourseStatsInfo.no_of_videos || 0" />
                </div>
                <div class="q-pa-xs col-4">
                  <Statistics iconName="fas fa-flask" title="Labs" :count="getCourseStatsInfo.no_of_labs || 0" />
                </div>
                <div class="q-pa-xs col-4 padding_7">
                  <Statistics iconName="fas fa-question" title="Quiz" :count="getCourseStatsInfo.no_of_quiz || 0" />
                </div>
                <div class="q-pa-xs col-4">
                  <Statistics iconName="fas fa-photo-video" title="Media" :count="getCourseStatsInfo.no_of_medias || 0" />
                </div>
                <div class="q-pa-xs col-4">
                  <Statistics iconName="fas fa-download" title="Downloads" :count="getCourseStatsInfo.no_of_download || 0" />
                </div>
                <div class="q-pa-xs col-12">
                  <p class="text-subtitle1 text-weight-regular ase-roboto padding_7" style="line-height: 0px; padding-top: 2%">
                    Attached Plans
                  </p>
                  <CoursePlans v-if="getAttachedPlansToCourse?.length > 0" :data="getAttachedPlansToCourse" />
                </div>
                <div class="q-pa-xs col-12" v-if="getAttachedPlansToCourse?.length === 0">
                  <div class="text-center" style="padding-top: 2%; padding-bottom: 2%">
                    <p class="text-h4 text-weight-bold ase-roboto ase-black-light padding_12">No data</p>
                  </div>
                </div>
              </div>
            </q-card>
            <q-separator dark />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <q-dialog v-model="createSubjectStatus" persistent transition-show="flip-down" transition-hide="flip-up">
      <q-card class="bg-primary text-white" style="width: 500px; max-width: 80vw">
        <q-bar>
          <q-icon name="create" />
          <div>{{ titleName }} Subject</div>

          <q-space />

          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-form greedy @submit="onSubmitSubject()">
          <q-card-section>
            <q-list bordered class="row">
              <q-item class="col-12">
                <q-item-section>
                  <BaseInput autofocus :maxLength="150" required :rules="maxLength(150)" v-model="subject.subject_name" />
                  <p v-if="fetchErrorMsgs.subject_name" class="text-caption text-negative">{{ fetchErrorMsgs.subject_name_msg }}</p>
                </q-item-section>
              </q-item>
              <q-item class="col-12">
                <q-item-section>
                  <BaseInput label="Description" required :rules="minLength(2)" type="textarea" v-model="subject.description" />
                  <p v-if="fetchErrorMsgs.description" class="text-caption text-negative">{{ fetchErrorMsgs.description_msg }}</p>
                </q-item-section>
              </q-item>
              <q-item class="col-12">
                <q-item-section>
                  <BaseToggle label="Is Active" v-model="subject.is_active" />
                  <p v-if="fetchErrorMsgs.is_active" class="text-caption text-negative">{{ fetchErrorMsgs.is_active_msg }}</p>
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

    <Confirm
      v-if="isConfirm"
      header="add plans "
      :show="isConfirm"
      @confirmDelete="sendPlansConfirm($event)"
      @confirmDeleteCancel="confirmSendCancel($event)"
    />
    <q-dialog v-model="showDialogInformation" persistent>
      <q-card style="min-width: 500px" transition-show="flip-up" transition-hide="flip-down" dark>
        <q-card-section>
          <div class="text-subtitle1 ase-roboto text-weight-normal">
            <q-icon name="create" />
            Add to Plans
            <hr />
          </div>
        </q-card-section>
        <q-separator />

        <q-form greedy @submit="sendPlansConfirm">
          <q-card-section>
            <q-list class="row">
              <q-item class="col-12">
                <q-item-section>
                  <BaseSelect
                    label="Plan Type *"
                    multiple
                    :option-disable="getAttachedPlansToCourse.map((plan) => plan.plan_id) || []"
                    :options="fetchlistPlansMaps"
                    v-model="plan_ids"
                  />
                  <div v-if="fetchErrorMsgsPlans.plan_ids">
                    <p class="text-caption text-weight-normal error_msg ase-roboto none-spacing">{{ fetchErrorMsgsPlans.plan_ids_msg }}</p>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions>
            <q-btn class="col-grow" color="orange" outline label="Cancel" @click="confirmCancel()" />
            <q-btn class="col-grow" color="positive" :disable="!plan_ids?.length" label="Send" @click="sendPlans()" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import BaseInput from 'app/src/components/shared/BaseInput.vue'
import BaseSelect from 'app/src/components/shared/BaseSelect.vue'
import BaseToggle from 'app/src/components/shared/BaseToggle.vue'
import Statistics from 'components/company/Statistics'
import CoursePlans from 'components/course/CoursePlans'
import FeedbackTable from 'components/feedback/FeedbackTable'
import Confirm from 'components/shared/ConfirmationWindow'
import Delete from 'components/shared/Delete.vue'
import CreateSubject from 'components/subject/CreateSubject'
import SubjectTable from 'components/subject/SubjectTable'
import { urlSafeBase64Decode, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { maxLength, minLength, required } from 'src/utils/rules'
import { compareFunction } from 'src/utils/validateSeralizer'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'SubjectIndex',
  components: { BaseInput, BaseSelect, BaseToggle, Confirm, CoursePlans, CreateSubject, Delete, FeedbackTable, Statistics, SubjectTable },
  created() {
    this.courseName = urlSafeBase64Decode(this.$route.params.courseName)
    this.uiSearchAction(false)
    const data = {
      pagination: {
        event_id: urlSafeBase64Decode(this.$route.params.courseId)
      },
      reset: true
    }
    this.fetchSubjectsByEvent(data)
  },
  data() {
    return {
      tab: 'crud',
      isCreate: false,
      updateId: '',
      isDelete: false,
      subjectId: '',
      subject: {
        subject_name: '',
        description: '',
        is_active: false,
        event_id: urlSafeBase64Decode(this.$route.params.courseId)
      },
      createSubjectStatus: false,
      titleName: 'Create',
      isConfirm: false,
      plan_ids: null,
      showDialogInformation: false,
      maxLength,
      minLength,
      required
    }
  },
  methods: {
    ...mapActions('subject', [
      'createSubject',
      'deleteSubject',
      'errorMsgReset',
      'fetchSubject',
      'fetchSubjectsByEvent',
      'uiSearchAction',
      'updateSubject'
    ]),
    ...mapActions('course', ['addPlansToUnpublishedCourses', 'courseStatsData', 'attachedPlansToCourses']),
    ...mapActions('map', ['fetchMaps']),
    showCreateSubject(event) {
      this.subjectId = ''
      this.updateId = ''
      this.errorMsgReset({
        status: true,
        description: false,
        description_msg: '',
        subject_name: false,
        subject_name_msg: '',
        is_active: false,
        is_active_msg: ''
      })
      if (event.show) {
        this.subject = {
          subject_name: '',
          description: '',
          event_id: urlSafeBase64Decode(this.$route.params.courseId)
        }
        this.titleName = 'Create'
        this.createSubjectStatus = true
      }
    },
    async publishCourseToPlan() {
      await this.attachedPlansToCourses({ event_id: urlSafeBase64Decode(this.$route.params.courseId) })
      await this.fetchMaps({ pagination: {}, reset: true })

      this.plan_ids = null
      this.showDialogInformation = true
    },
    cancelCreateSubject(event) {
      if (event.show) {
        this.isCreate = !this.isCreate
      }
    },
    async showUpdateSubject(event) {
      this.errorMsgReset({
        status: true,
        description: false,
        description_msg: '',
        subject_name: false,
        subject_name_msg: '',
        is_active: false,
        is_active_msg: ''
      })
      if (event.show) {
        this.titleName = 'Update'

        this.updateId = ''
        this.updateId = event.id
        this.title = ''
        this.title = 'Update Subject'
        await this.fetchSubject({ subject_id: event.id })
        this.subjectId = event.id
        this.subject = {
          subject_name: this.singleSubjectInfo.name,
          description: this.singleSubjectInfo.description,
          event_id: urlSafeBase64Decode(this.$route.params.courseId),
          is_active: this.singleSubjectInfo.is_active,
          subject_id: event.id
        }
        this.createSubjectStatus = true
      }
    },
    changeTab(newTab, _oldTab) {
      if (newTab === 'statistics') {
        this.courseStatsData({ event_id: urlSafeBase64Decode(this.$route.params.courseId) })
        this.attachedPlansToCourses({ event_id: urlSafeBase64Decode(this.$route.params.courseId) })
      }
    },
    showSubjectDelete(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
        } else {
          this.isDelete = true
          this.subjectId = ''
          this.subjectId = event.id
        }
      }
    },
    subjectConfirmDeletion(event) {
      if (event.show) {
        const data = {
          subject_id: this.subjectId,
          event_id: urlSafeBase64Decode(this.$route.params.courseId)
        }
        this.deleteSubject(data)
        this.subjectId = ''
        this.isDelete = false
      }
    },
    subjectConfirmDeleteCancel(event) {
      if (event.show) {
        if (this.isDelete) {
          this.subjectId = ''
          this.isDelete = false
        } else {
          this.isDelete = true
        }
      }
    },
    showSubjectInfo(event) {
      if (event.show) {
        this.$router.push(
          `/portal/subject-detailed-information/${event.id}/${this.$route.params.courseId}/${event.courseName}/${event.name}`
        )
      }
    },
    showSortContent(event) {
      if (event.show) {
        this.$router.push(`/portal/sort/${urlSafeBase64Encode(event.id)}/${this.$route.params.courseId}`)
      }
    },
    async onSubmitSubject() {
      const dataSubjectUpdate = {
        subject_name: this.subject.subject_name,
        description: this.subject.description,
        is_active: this.subject.is_active
      }
      if (this.subjectId) {
        if (
          this.singleSubjectInfo.name === dataSubjectUpdate.subject_name &&
          this.singleSubjectInfo.description === dataSubjectUpdate.description &&
          this.singleSubjectInfo.is_active === dataSubjectUpdate.is_active
        ) {
          this.$q.notify({ type: 'positive', position: 'top', progress: true, message: 'You have updated successfully' })
        } else {
          this.subject.subject_id = this.subjectId
          await this.updateSubject(compareFunction('subject', this.subject, this.singleSubjectInfo))
          if (this.fetchErrorMsgs.status) {
            this.subject = {
              subject_name: '',
              description: '',
              event_id: urlSafeBase64Decode(this.$route.params.courseId)
            }
            this.subjectId = ''
            this.createSubjectStatus = false
          } else {
            this.subject = {
              subject_name: dataSubjectUpdate.subject_name,
              description: dataSubjectUpdate.description,
              is_active: dataSubjectUpdate.is_active,
              event_id: urlSafeBase64Decode(this.$route.params.courseId)
            }
            this.createSubjectStatus = true
          }
        }
      } else {
        await this.createSubject(this.subject)
      }
      if (this.fetchErrorMsgs.status) {
        this.subject = {
          subject_name: '',
          description: '',
          event_id: urlSafeBase64Decode(this.$route.params.courseId)
        }
        this.subjectId = ''
        this.createSubjectStatus = false
      } else {
        this.createSubjectStatus = true
      }
    },
    sendPlans() {
      this.showDialogInformation = false
      this.isConfirm = true
    },
    async sendPlansConfirm() {
      const data = {
        plans: [],
        event_id: urlSafeBase64Decode(this.$route.params.courseId)
      }
      for (const plan of this.plan_ids) {
        data.plans.push(plan.value)
      }
      await this.addPlansToUnpublishedCourses(data)
      if (this.fetchErrorMsgsPlans.status) {
        this.plan_ids = null
        this.showDialogInformation = false
        this.isConfirm = false
      }
    },
    confirmSendCancel() {
      this.isConfirm = false
      this.showDialogInformation = true
    },
    confirmCancel() {
      this.showDialogInformation = false
    }
  },
  computed: {
    ...mapGetters('subject', ['subjectsByEvent', 'singleSubjectInfo', 'searchByNameGetter', 'fetchErrorMsgs']),
    ...mapGetters('map', ['fetchlistPlansMaps', 'searchByNameGetter']),
    ...mapGetters('course', ['searchByNameGetter', 'fetchErrorMsgsPlans', 'getCourseStatsInfo', 'getAttachedPlansToCourse'])
  }
}
</script>
