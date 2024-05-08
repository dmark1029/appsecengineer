<template>
  <q-card class="q-px-lg q-py-md" flat dark>
    <q-card-section>
      <div class="text-subtitle1 ase-roboto text-weight-normal">Subject Order</div>
    </q-card-section>

    <q-card-section v-if="subjectsByEventOrder?.length > 0" style="max-height: 65vh; overflow: scroll">
      <draggable item-key="code" v-model="subjectsByEventOrder" @start="dragging = true" @end="dragging = false">
        <template #item="{ element }">
          <q-list bordered separator>
            <q-item class="bg-grey-10 q-my-xs" style="cursor: move" v-ripple>
              <q-item-section>{{ element.label }}</q-item-section>
            </q-item>
          </q-list>
        </template>
      </draggable>
    </q-card-section>

    <q-card-section v-if="!subjectsByEventOrder?.length">
      <div class="text-subtitle1 ase-roboto text-weight-normal">There are no subjects to sort.</div>
    </q-card-section>

    <q-card-actions>
      <q-btn class="col-grow" color="orange" outline @click="returnToCourses()">Cancel</q-btn>
      <q-btn v-if="subjectsByEventOrder?.length" class="col-grow" color="positive" @click="onSubmit()">Submit</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import draggable from 'vuedraggable'
import { mapActions } from 'vuex'

export default {
  name: 'ContentSortIndex',
  components: { draggable },
  data() {
    return {
      selectedData: null,
      dragging: false
    }
  },
  created() {
    this.fetchSubjectsByEventOrder({ event_id: urlSafeBase64Decode(this.$route.params.id) })
    this.selectedData = this.subjectsByEventOrder
  },
  watch: {
    subjectsByEventOrder: {
      handler() {
        this.selectedData = null
        this.selectedData = this.subjectsByEventOrder
      }
    }
  },
  methods: {
    ...mapActions('subject', ['fetchSubjectsByEventOrder', 'createSubjectOrder']),
    onSubmit() {
      const subjectData = this.selectedData.map((sub, i) => ({ id: sub.code, item_order: parseInt(i) }))
      this.createSubjectOrder({ subject_items: subjectData })
      this.$router.push('/portal/courses')
    },
    returnToCourses() {
      this.$router.push('/portal/courses')
    }
  },
  computed: {
    subjectsByEventOrder: {
      get() {
        return this.$store.state.subject.subjectsListOrder
      },
      set(value) {
        this.$store.commit('subject/LIST_SUBJECTS_ORDER', value)
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
