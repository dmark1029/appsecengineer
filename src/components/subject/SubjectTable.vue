<template>
  <div class="viewPages">
    <q-separator class="bg-primary" style="margin-top: 1%; margin-bottom: 1%" />
    <div class="q-gutter-md q-pb-md">
      <q-btn color="secondary" @click="createPage({ show: true })">Create</q-btn>
      <q-btn color="secondary" @click="publishCourseToPlan">Add Plans</q-btn>
      <q-btn color="secondary" @click="sendCertificate">Issue Certificate</q-btn>
    </div>
    <q-table
      :table-header-style="{ backgroundColor: '#191919' }"
      :rows="subjectsByEvent"
      :visible-columns="roleIsAdmin ? ['Name', 'Action'] : ['Name']"
      class="q-table th.sortable sticky-header-table"
      row-key="index"
      :columns="columns2"
      :rows-per-page-options="[0]"
      virtual-scroll
      style="max-height: 70vh"
      hide-bottom
      dark
    >
      <template v-slot:body-cell-Name="props">
        <q-td :props="props" v-if="props.row.id">
          <q-item style="max-width: 500px">
            <q-item-section>
              <q-item-label class="cursor-pointer" @click="subjectInfo(props.row.id, title, props.row.name)">
                {{ props.row.name }}
                <q-tooltip>View Info Of {{ props.row.name }}</q-tooltip>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>
      <template v-slot:body-cell-Action="props">
        <q-td :props="props" v-if="props.row.id">
          <q-btn round color="primary" icon="fas fa-sort" size="sm" @click="viewSortContents(props.row.id)" style="margin-right: 2%">
            <q-tooltip>Sort This Content</q-tooltip>
          </q-btn>
          <q-btn round color="primary" icon="edit" size="sm" @click="updatePage(props.row.id)" style="margin-right: 2%">
            <q-tooltip>Update</q-tooltip>
          </q-btn>
          <q-btn round color="primary" icon="delete" size="sm" @click="deletePage(props.row.id)">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <div v-if="Object.keys(subjectsPaginationKeyForward).length > 0" class="q-py-sm text-center">
      <q-btn class="bordered" label="Load More" icon="keyboard_arrow_right" @click="loadMoreSubjects(subjectsPaginationKeyForward)" />
    </div>
  </div>
</template>

<script>
import { urlSafeBase64Decode, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'subject-table',
  components: {},
  props: {
    title: { type: String, default: 'Header' },
    tableData: { required: false }
  },
  data() {
    return {
      columns2: [
        { name: 'Name', label: 'Name', field: 'name', sortable: true, align: 'left' },
        { name: 'Action', label: 'Action', field: 'Action', sortable: false, align: 'right' }
      ]
    }
  },
  methods: {
    ...mapActions('subject', ['fetchSubjectsByEvent', 'searchSubject']),
    ...mapActions('training', ['issueCertificate']),
    createPage(event) {
      if (event.show) {
        this.$emit('createPage', { show: true })
      }
    },
    publishCourseToPlan(event) {
      this.$emit('publishCourseToPlan', { show: true })
    },
    updatePage(id) {
      this.$emit('updatePage', { show: true, id: id })
    },
    deletePage(id) {
      this.$emit('deletePage', { show: true, id: id })
    },
    subjectInfo(id, courseName, name) {
      this.$emit('subjectInfo', {
        show: true,
        id: urlSafeBase64Encode(id),
        courseName: urlSafeBase64Encode(courseName),
        name: urlSafeBase64Encode(name)
      })
    },
    viewSortContents(id) {
      this.$emit('viewSortContents', { show: true, id: id })
    },
    loadMoreSubjects(pagination) {
      const data = {
        pagination: {
          event_id: urlSafeBase64Decode(this.$route.params.courseId),
          ...pagination
        },
        reset: false
      }
      if (this.searchByNameGetter && this.searchFireActive) {
        data.pagination.pk = 'subject'
        data.pagination.query = this.searchByNameGetter
        this.searchSubject(data)
      } else {
        this.fetchSubjectsByEvent(data)
      }
    },
    sendCertificate() {
      const data = { event_id: urlSafeBase64Decode(this.$route.params.courseId) }
      this.issueCertificate(data)
    }
  },
  computed: {
    ...mapGetters('subject', ['subjectsByEvent', 'subjectsPaginationKeyForward', 'searchByNameGetter', 'searchFireActive']),
    ...mapGetters('login', ['roleIsAdmin'])
  }
}
</script>
