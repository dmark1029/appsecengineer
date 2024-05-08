<template>
  <div>
    <UserTable v-if="!isCreate && !isDelete" @createNewUser="showCreateUser($event)" @deleteNewUser="showDeleteUser($event)" />
    <CreateUser v-if="isCreate && !isDelete" :id="updateId" :show="isCreate" @onCancel="cancelCreateUser($event)">
      {{ title }}
    </CreateUser>
    <Delete
      v-if="isDelete"
      :show="isDelete"
      :header="'a User'"
      @confirmDelete="userConfirmDeletion($event)"
      @confirmDeleteCancel="userConfirmDeleteCancel($event)"
    />
  </div>
</template>

<script>
import CreateUser from 'components/setting/CreateUser'
import UserTable from 'components/setting/UserTable'
import Delete from 'components/shared/Delete.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'SettingsPage',
  components: { CreateUser, UserTable, Delete },
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
    this.uiSearchAction(true)
    if (this.getUsersList.length === 0 && this.searchByNameGetter.length === 0) {
      const data = {
        pagination: {},
        reset: false
      }
      this.fetchUsersList(data)
    }
  },
  methods: {
    ...mapActions('users', ['fetchUsersList', 'deleteUser', 'uiSearchAction', 'errorMsgReset']),
    showCreateUser(event) {
      this.errorMsgReset({
        email: false,
        email_msg: '',
        first_name: false,
        first_name_msg: '',
        last_name: false,
        last_name_msg: '',
        role: false,
        role_msg: ''
      })
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.isCreate = true
          this.updateId = ''
        }
      }
    },
    showDeleteUser(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
        } else {
          this.isDelete = true
          this.userID = ''
          this.userID = event.id
        }
      }
    },
    async userConfirmDeletion(event) {
      if (event.show) {
        const data = { email: this.userID }
        await this.deleteUser(data)
        this.isDelete = false
      }
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
    }
  },
  computed: {
    ...mapGetters('users', ['getUsersList', 'searchByNameGetter'])
  }
}
</script>
