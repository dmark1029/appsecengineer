<template>
  <section>
    <TrainingUsers
      v-if="!isCreate && !isDelete"
      :data="getTrainingUsersList"
      @createUser="showCreateUser"
      @issueCertificate="sendCertificateFn"
      @removeUser="showDeleteUser"
    />
    <create-user v-if="isCreate && !isDelete" :id="updateId" :show="isCreate" @onCacel="cancelCreateUser($event)">
      {{ title }}
    </create-user>
    <Delete
      v-if="isDelete"
      :header="'a user from event'"
      :show="isDelete"
      @confirmDelete="userConfirmDeletion($event)"
      @confirmDeleteCancel="userConfirmDeleteCancel($event)"
    />
  </section>
</template>

<script>
import CreateUser from 'components/aseUser/CreateUserTraining'
import TrainingUsers from 'components/aseUser/usersListTraining'
import Delete from 'components/shared/Delete.vue'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CompanyCoursesTable',
  components: { TrainingUsers, CreateUser, Delete },
  data() {
    return {
      isCreate: false,
      isDelete: false,
      updateId: '',
      userID: '',
      title: 'Create Users'
    }
  },
  created() {
    this.fetchTrainingList({
      pagination: {
        training_id: urlSafeBase64Decode(this.$route.params.eventId)
      },
      reset: true
    })
  },
  methods: {
    ...mapActions('users', ['fetchTrainingList']),
    ...mapActions('training', ['sendCertificate', 'errorMsgResetUser', 'createUser', 'removeStatusUserTraining']),
    loadMoreCourses(pagination) {
      const data = { pagination: {}, reset: false }

      if (Object.keys(pagination).length > 0) {
        data.pagination.pagination = pagination

        if (this.searchByNameGetter && this.searchFireActive) {
          data.pagination.pk = 'users'
          data.pagination.query = this.searchByNameGetter
          this.searchCompanyCourses(data)
          return
        }
      }

      this.fetchCompanyCoursesList(data)
    },
    showCreateUser(event) {
      this.errorMsgResetUser({
        email: false,
        email_msg: '',
        first_name: false,
        first_name_msg: '',
        last_name: false,
        last_name_msg: ''
      })
      this.isCreate = event.show ? !this.isCreate : this.isCreate
      this.updateId = ''
    },
    showDeleteUser(event) {
      if (event.show) {
        this.isDelete = !this.isDelete
        this.userID = this.isDelete ? event.info.email : ''
      }
    },
    async userConfirmDeletion(event) {
      if (!event.show) return
      const data = {
        training_id: urlSafeBase64Decode(this.$route.params.eventId),
        email: this.userID
      }
      await this.removeStatusUserTraining(data)
      if (this.fetchStatusOfApi) {
        await this.fetchTrainingList({
          pagination: {
            training_id: urlSafeBase64Decode(this.$route.params.eventId)
          },
          reset: true
        })
      }
      this.isDelete = false
    },
    userConfirmDeleteCancel(event) {
      if (event.show) {
        this.isDelete = !this.isDelete
      }
    },
    cancelCreateUser(event) {
      if (event.show) {
        this.isCreate = false
      }
    },
    sendCertificateFn() {
      const data = {
        training_id: urlSafeBase64Decode(this.$route.params.eventId)
      }
      this.sendCertificate(data)
    }
  },
  computed: {
    ...mapGetters('users', ['getTrainingUsersList']),
    ...mapGetters('training', ['fetchStatusOfApi']),
    ...mapGetters('login', ['roleIsAdmin'])
  }
}
</script>
