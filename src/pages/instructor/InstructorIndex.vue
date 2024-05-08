<template>
  <InstructorTable
    @createInstructor="showCreateInstructor($event)"
    @deleteInstructor="showDeleteInstructor($event)"
    @updateInstructor="showUpdateInstructor($event)"
  />
  <CreateInstructor v-if="isCreate && !isDelete" :id="updateId" :show="isCreate" @onCancel="cancelCreateInstructor($event)" />
  <Delete
    v-if="isDelete"
    header="an Instructor"
    :show="isDelete"
    @confirmDelete="instructorConfirmDeletion($event)"
    @confirmDeleteCancel="instructorConfirmDeleteCancel($event)"
  />
</template>

<script setup>
import CreateInstructor from 'components/instructor/CreateInstructor'
import InstructorTable from 'components/instructor/InstructorTable'
import Delete from 'components/shared/Delete.vue'
import { useInstructorStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'

const instructorStore = useInstructorStore()

const isCreate = ref(false)
const isDelete = ref(false)
const updateId = ref('')
const title = ref('')
const instructorID = ref('')

const fetchlistInstructors = computed(() => instructorStore.fetchlistInstructors)
const searchByNameGetter = computed(() => instructorStore.searchByNameGetter)

onMounted(async () => {
  if (fetchlistInstructors.value.length === 0 && searchByNameGetter.value.length === 0) {
    instructorStore.fetchInstructors({ pagination: {}, reset: false })
  }
})

function showCreateInstructor(event) {
  const errorMsgs = {
    instructor_name: false,
    instructor_name_msg: '',
    about: false,
    about_msg: '',
    photo: false,
    photo_msg: '',
    photo_name: false,
    photo_name_msg: ''
  }
  instructorStore.errorMsgReset(errorMsgs)
  if (event.show) {
    if (isCreate.value) {
      isCreate.value = false
    } else {
      title.value = ''
      title.value = 'Create Instructor'
      isCreate.value = true
      updateId.value = ''
    }
  }
}
async function showUpdateInstructor(event) {
  const errorMsgs = {
    instructor_name: false,
    instructor_name_msg: '',
    about: false,
    about_msg: '',
    photo: false,
    photo_msg: '',
    photo_name: false,
    photo_name_msg: ''
  }
  instructorStore.errorMsgReset(errorMsgs)
  if (event.show) {
    if (isCreate.value) {
      isCreate.value = false
    } else {
      updateId.value = event.id
      title.value = ''
      title.value = 'Update Instructor'
      isCreate.value = true
    }
  }
}
function showDeleteInstructor(event) {
  if (event.show) {
    if (isDelete.value) {
      isDelete.value = false
    } else {
      isDelete.value = true
      instructorID.value = ''
      instructorID.value = event.id
    }
  }
}
function instructorConfirmDeletion(event) {
  if (event.show) {
    const data = { instructor_id: this.instructorID }
    instructorStore.deleteInstructor(data)
    isDelete.value = false
  }
}
function instructorConfirmDeleteCancel(event) {
  if (event.show) {
    isDelete.value = !isDelete.value
  }
}
function cancelCreateInstructor(event) {
  if (event.show) {
    isCreate.value = false
  }
}
</script>

<!-- <script>
import CreateInstructor from 'components/instructor/CreateInstructor'
import InstructorTable from 'components/instructor/InstructorTable'
import Delete from 'components/shared/Delete.vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'InstructorIndex',
  components: { InstructorTable, CreateInstructor, Delete },
  data() {
    return {
      isCreate: false,
      isDelete: false,
      updateId: '',
      instructorID: ''
    }
  },
  created() {
    if (this.fetchlistInstructors.length === 0 && this.searchByNameGetter.length === 0) {
      this.fetchInstructors({ pagination: {}, reset: false })
    }
  },
  computed: {
    ...mapState({
      fetchlistInstructors: (state) => state.instructor.listInstructors,
      searchByNameGetter: (state) => state.instructor.searchByName
    })
  },
  methods: {
    ...mapActions('instructor', ['fetchInstructors', 'fetchInstructor', 'deleteInstructor', 'errorMsgReset']),
    showCreateInstructor(event) {
      const errorMsgs = {
        instructor_name: false,
        instructor_name_msg: '',
        about: false,
        about_msg: '',
        photo: false,
        photo_msg: '',
        photo_name: false,
        photo_name_msg: ''
      }
      this.errorMsgReset(errorMsgs)
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.title = ''
          this.title = 'Create Instructor'
          this.isCreate = true
          this.updateId = ''
        }
      }
    },
    async showUpdateInstructor(event) {
      const errorMsgs = {
        instructor_name: false,
        instructor_name_msg: '',
        about: false,
        about_msg: '',
        photo: false,
        photo_msg: '',
        photo_name: false,
        photo_name_msg: ''
      }
      this.errorMsgReset(errorMsgs)
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.updateId = event.id
          this.title = ''
          this.title = 'Update Instructor'
          this.isCreate = true
        }
      }
    },
    showDeleteInstructor(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
        } else {
          this.isDelete = true
          this.instructorID = ''
          this.instructorID = event.id
        }
      }
    },
    instructorConfirmDeletion(event) {
      if (event.show) {
        const data = { instructor_id: this.instructorID }
        this.deleteInstructor(data)
        this.isDelete = false
      }
    },
    instructorConfirmDeleteCancel(event) {
      if (event.show) {
        this.isDelete = !this.isDelete
      }
    },
    cancelCreateInstructor(event) {
      if (event.show) {
        this.isCreate = false
      }
    }
  }
}
</script> -->
