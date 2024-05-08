<template>
  <q-card class="q-px-lg q-py-md" flat dark>
    <q-card-section>
      <div class="text-subtitle1 ase-roboto text-weight-normal">Sorting {{ subjectContentHeader.name }} Subject Contents</div>
    </q-card-section>

    <q-card-section v-if="fetchSubjectContentsList?.length" style="max-height: 65vh; overflow: scroll">
      <draggable item-key="code" v-model="fetchSubjectContentsList" @start="dragging = true" @end="dragging = false">
        <template #item="{ element }">
          <q-list bordered separator>
            <q-item class="bg-grey-10 q-my-xs" style="cursor: move" v-ripple>
              <q-item-section side>
                <q-icon v-if="element.code.split('#')[3].split('_')[0] === 'lab'" name="fas fa-flask" size="14px" color="white" />
                <q-icon v-if="element.code.split('#')[3].split('_')[0] === 'vid'" color="white" name="fas fa-video" size="14px" />
                <q-icon v-if="element.code.split('#')[3].split('_')[0] === 'quiz'" color="white" name="fas fa-question" size="14px" />
                <q-icon v-if="element.code.split('#')[3].split('_')[0] === 'download'" color="white" name="fas fa-download" size="14px" />
                <q-icon v-if="element.code.split('#')[3].split('_')[0] === 'media'" color="white" name="fas fa-photo-video" size="14px" />
              </q-item-section>
              <q-item-section>
                {{ element.label }}
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </draggable>
    </q-card-section>

    <q-card-section v-if="!fetchSubjectContentsList?.length">
      <div class="text-subtitle1 ase-roboto text-weight-normal">There are no content to sort</div>
    </q-card-section>

    <q-card-actions>
      <q-btn class="col-grow" color="orange" outline @click="$router.go(-1)">Cancel</q-btn>
      <q-btn v-if="fetchSubjectContentsList?.length" class="col-grow" color="positive" @click="onSubmit(subjectContentHeader.id)">
        Submit
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
import { urlSafeBase64Decode, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import draggable from 'vuedraggable'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'SubjectContentSortIndex',
  components: { draggable },
  data() {
    return {
      selectedData: null,
      dragging: false
    }
  },
  created() {
    this.param = urlSafeBase64Decode(this.$route.params.courseId)
    this.subjectId = urlSafeBase64Decode(this.$route.params.subjectId)
    this.subjectContentsList({ event_id: this.param, subject_id: this.subjectId })
  },
  watch: {
    fetchSubjectContentsList: {
      handler() {
        this.selectedData = null
        this.selectedData = this.fetchSubjectContentsList
      }
    }
  },
  methods: {
    ...mapActions('subject', ['subjectContentsList', 'createSubjectContentsOrder']),
    async onSubmit(id) {
      const subjectData = this.selectedData.map((sub, i) => ({ id: sub.code, item_order: parseInt(i) }))

      await this.createSubjectContentsOrder({ subject_id: id, subject_items: subjectData })

      await this.subjectContentsList({ event_id: this.param, subject_id: this.subjectId })
    },
    returnToCourses() {
      this.$router.push(`/portal/subject/${urlSafeBase64Encode(this.param)}`)
    }
  },
  computed: {
    ...mapGetters('subject', ['subjectContentHeader']),
    fetchSubjectContentsList: {
      get() {
        return this.$store.state.subject.contentOptions
      },
      set(value) {
        this.$store.commit('subject/CONTENTS_OPTION', value)
      }
    }
  }
}
</script>
<style scoped>
::-webkit-scrollbar {
  width: 7px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 1px grey;
  border-radius: 12px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #ff754c;
  border-radius: 12px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #ff754c;
}
</style>
