<template>
  <q-dialog v-model="dataShow" persistent transition-show="flip-down" transition-hide="flip-down">
    <q-card style="min-width: 700px" dark>
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">
          <q-icon name="code" />
          Validator Script List
          <hr />
        </div>
      </q-card-section>
      <q-btn color="primary" class="q-ml-md" label="CREATE" @click="onCreate()" />
      <q-card-section>
        <q-table
          :columns="columns"
          dark
          :rows="listValidatorScripts"
          flat
          hide-bottom
          row-key="name"
          v-if="listValidatorScripts.length > 0"
        >
          <template v-slot:body-cell-Date="props" class="q-table--horizontal-separator thead th">
            <q-td :props="props">
              {{ new Date(props.row.created_on).toLocaleString() }}
            </q-td>
          </template>
          <template v-slot:body-cell-Action="props" class="q-table--horizontal-separator thead th">
            <q-td :props="props">
              <q-btn round color="primary" class="q-mr-sm" icon="edit" size="sm" @click="onUpdate(props.row)">
                <q-tooltip>Update</q-tooltip>
              </q-btn>
              <q-btn round color="primary" icon="delete" size="sm" @click="onRemove(props.row)">
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
              <Delete
                v-if="isDelete"
                :header="'this Validator Script'"
                :show="isDelete"
                @confirmDelete="challengeConfirmDeletion($event)"
                @confirmDeleteCancel="challengeConfirmDeleteCancel($event)"
              />
            </q-td>
          </template>
        </q-table>
        <h6 class="text-center" v-else>NO DATA</h6>
      </q-card-section>
      <q-card-actions>
        <q-btn class="col-grow" color="orange" outline @click="onCancel()">Cancel</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import Delete from 'components/shared/Delete.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'ValidatorScriptList',
  components: { Delete },
  props: ['id', 'show'],
  data: () => ({
    isDelete: false,
    columns: [
      { name: 'Name', label: 'Name', field: 'script_name', sortable: true, align: 'left' },
      { name: 'Date', label: 'Date', field: 'created_on', sortable: true, align: 'left' },
      { name: 'Action', label: 'Action', field: 'Action', sortable: false, align: 'right' }
    ],
    validatorScriptId: '',
    dataShow: true
  }),
  created() {
    this.fetchListValidatorScripts({ challenge_id: this.id })
  },
  methods: {
    ...mapActions('challenge', ['fetchListValidatorScripts', 'removeValidatorScript']),
    onCreate() {
      this.$emit('onCreate', { show: true })
    },
    onUpdate(row) {
      this.$emit('onUpdate', row)
    },
    onRemove(row) {
      this.isDelete = true
      this.validatorScriptId = row.sk
    },
    onCancel() {
      this.$emit('onCancel', { show: true })
      this.challenge = {}
    },
    challengeConfirmDeletion(event) {
      if (event.show) {
        this.removeValidatorScript({ challenge_id: this.id, script_id: this.validatorScriptId })
        this.validatorScriptId = ''
        this.isDelete = false
      }
    },
    challengeConfirmDeleteCancel(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
          return
        }
        this.isDelete = true
      }
    }
  },
  computed: {
    ...mapGetters('challenge', ['listValidatorScripts'])
  }
}
</script>
