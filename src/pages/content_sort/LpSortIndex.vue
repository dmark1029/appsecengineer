<template>
  <div>
    <q-card class="q-px-lg q-py-md" flat dark>
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">Sorting: {{ lpName }}</div>
      </q-card-section>

      <q-card-section v-if="fetchLearningPathEvents?.length" style="max-height: 65vh; overflow: scroll">
        <draggable item-key="code" v-model="fetchLearningPathEvents" @start="dragging = true" @end="dragging = false">
          <template #item="{ element }">
            <q-list bordered separator>
              <q-item class="bg-grey-10 q-my-xs" style="cursor: move" v-ripple>
                <q-item-section>{{ element.name }}</q-item-section>
              </q-item>
            </q-list>
          </template>
        </draggable>
      </q-card-section>
      <q-card-section v-if="!fetchLearningPathEvents?.length">
        <div class="text-subtitle1 ase-roboto text-weight-normal">There are no content to sort</div>
      </q-card-section>

      <q-card-actions>
        <q-btn class="col-grow" color="orange" outline @click="$router.go(-1)">Cancel</q-btn>
        <q-btn v-if="fetchLearningPathEvents?.length" class="col-grow" color="positive" @click="onSubmit()">Submit</q-btn>
      </q-card-actions>
    </q-card>

    <q-dialog v-model="showDialogInformation" persistent>
      <q-card style="min-width: 450px" transition-show="flip-up" transition-hide="flip-down" dark>
        <q-card-section>
          <div class="portal_lg">Status order</div>
        </q-card-section>
        <q-separator />
        <br />
        <q-card-section class="q-pt-none">
          {{ fetchErrorMsgsOrder.order_msg }}
        </q-card-section>
        <q-card-section class="error_msg_color"></q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn color="primary" size="sm" label="Cancel" @click="confirmStatusCancel()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import draggable from 'vuedraggable'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'LpContentSortIndex',
  components: { draggable },
  data() {
    return {
      selectedData: null,
      dragging: false,
      showDialogInformation: false
    }
  },
  created() {
    this.lpId = urlSafeBase64Decode(this.$route.params.lpId)
    this.lpName = urlSafeBase64Decode(this.$route.params.lpName)
    this.fetchIndividualLearningPathEvents({ lp_id: this.lpId })
  },
  watch: {
    fetchLearningPathEvents: {
      handler() {
        this.selectedData = null
        this.selectedData = this.fetchLearningPathEvents
      }
    }
  },
  methods: {
    ...mapActions('learningPath', ['fetchIndividualLearningPathEvents', 'createEventsContentsOrder']),
    async onSubmit() {
      const eventsData = {}
      for (const [i, eve] of this.selectedData.entries()) {
        eventsData[eve.id] = parseInt(i)
      }
      await this.createEventsContentsOrder({ learning_path_id: this.lpId, order: eventsData })
      this.showDialogInformation = Boolean(this.fetchErrorMsgsOrder.status)

      if (!this.fetchErrorMsgsOrder.status) {
        await this.fetchIndividualLearningPathEvents({ lp_id: this.lpId })
      }
    },
    confirmStatusCancel() {
      this.showDialogInformation = false
    }
  },
  computed: {
    ...mapGetters('learningPath', ['fetchErrorMsgsOrder']),
    fetchLearningPathEvents: {
      get() {
        return this.$store.state.learningPath.learningPathEvents
      },
      set(value) {
        this.$store.commit('learningPath/LEARNING_PATH_EVENTS', value)
      }
    }
  }
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 5px;
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
