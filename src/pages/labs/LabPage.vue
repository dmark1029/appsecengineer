<template>
  <LabTable @createNewlab="showCreateLab" @deleteLab="showDeleteLab" @updateLab="showUpdateLab" />
  <CreateLab v-if="isCreate && !isDelete" :id="updateId" v-model:name="typeCreate" :show="isCreate" @onCancel="cancelCreateLab" />
  <Delete
    v-if="isDelete"
    header="this Lab"
    :show="isDelete"
    @confirmDelete="labConfirmDeletion"
    @confirmDeleteCancel="labConfirmDeleteCancel"
  />
</template>

<script>
import CreateLab from 'components/labs/CreateLab'
import LabTable from 'components/labs/LabTable'
import Delete from 'components/shared/Delete.vue'
import { mapActions } from 'vuex'

export default {
  name: 'LabPage',
  components: { LabTable, CreateLab, Delete },
  data() {
    return {
      isCreate: false,
      isDelete: false,
      labIdField: '',
      updateId: '',
      typeCreate: ''
    }
  },
  methods: {
    ...mapActions('labs', ['deleteLab', 'errorMsgReset']),
    showCreateLab(event) {
      this.errorMsgReset({
        badge_name: false,
        badge_name_msg: '',
        about: false,
        about_msg: '',
        logo: false,
        logo_msg: '',
        skills: false,
        skills_msg: ''
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
    async showUpdateLab(event) {
      this.errorMsgReset({
        badge_name: false,
        badge_name_msg: '',
        about: false,
        about_msg: '',
        logo: false,
        logo_msg: '',
        skills: false,
        skills_msg: ''
      })
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.updateId = event.id
          this.isCreate = true
        }
      }
    },
    showDeleteLab(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
        } else {
          this.isDelete = true
          this.labIdField = ''
          this.labIdField = event.id
        }
      }
    },
    labConfirmDeletion(event) {
      if (event.show) {
        const data = {
          lab_id: this.labIdField
        }
        this.deleteLab(data)
        this.labIdField = ''
        this.isDelete = false
      }
    },
    labConfirmDeleteCancel(event) {
      if (event.show) {
        this.isDelete = !this.isDelete
      }
    },
    cancelCreateLab(event) {
      if (event.show) {
        this.isCreate = false
      }
    }
  }
}
</script>
