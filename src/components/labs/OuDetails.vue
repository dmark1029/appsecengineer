<template>
  <section class="q-pa-md">
    <q-btn class="q-mb-md" color="primary" @click="openDialog()">Create</q-btn>
    <q-table
      :columns="columns"
      dark
      :rows="listOuIdInfoGetter"
      hide-bottom
      :loading="isLoading"
      row-key="name"
      :rows-per-page-options="[0]"
      :table-header-style="{ backgroundColor: '#191919' }"
      virtual-scroll
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <p class="q-mb-none">{{ props.row.name }}</p>
          <label class="text-caption text-grey">{{ props.row.sk }}</label>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td class="q-gutter-x-sm" :props="props">
          <q-btn color="warning" flat icon="edit" round size="sm" @click="openDialog(props.row.sk)">
            <q-tooltip>Update</q-tooltip>
          </q-btn>
          <q-btn color="negative" flat icon="delete" round size="sm" @click="openDeleteDialog(props.row.sk)">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog persistent v-model="isDialog" @hide="resetData">
      <q-card style="width: 600px; max-width: 90vw" transition-show="flip-up" transition-hide="flip-down" dark>
        <q-card-section>
          <div class="text-subtitle1 ase-roboto text-weight-normal">
            <q-icon name="create" />
            {{ isUpdate ? 'Update OU ID' : 'Create OU' }}
            <hr />
          </div>
        </q-card-section>
        <q-form greedy @submit.prevent="onSubmit()">
          <q-card-section class="q-gutter-y-md">
            <BaseInput
              autofocus
              :disable="isUpdate"
              label="ID *"
              :rules="[
                (val) => val.startsWith('ou-') || 'OU ID must start with \'ou-\'',
                (val) => isUpdate || listOuIdInfoGetter.every((item) => item.sk !== val) || 'OU ID already exists'
              ]"
              v-model="ouId"
            />
            <BaseInput
              label="Name *"
              :rules="[shortName, (val) => isUpdate || listOuIdInfoGetter.every((item) => item.name !== val) || 'OU Name already exists']"
              :maxlength="50"
              required
              v-model="name"
            />
          </q-card-section>
          <q-card-actions>
            <q-btn class="col-grow" color="orange" label="Cancel" outline v-close-popup />
            <q-btn class="col-grow" color="positive" type="submit">Submit</q-btn>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <Delete
      v-if="isDelete"
      :header="name"
      :show="isDelete"
      @confirmDelete="onSubmitDelete($event)"
      @confirmDeleteCancel="isDelete = false"
    />
  </section>
</template>

<script>
import BaseInput from 'components/shared/BaseInput.vue'
import Delete from 'components/shared/Delete.vue'
import { maxLength, min, minLength, required, shortName } from 'src/utils/rules'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'OuDetails',
  components: { BaseInput, Delete },
  data() {
    return {
      columns: [
        { name: 'name', label: 'Name + OU ID', field: 'name', sortable: true, align: 'left' },
        { name: 'actions', label: '', field: 'actions', sortable: false, align: 'right' }
      ],
      isDialog: false,
      isDelete: false,
      isUpdate: false,
      name: '',
      ouId: '',
      maxLength,
      min,
      minLength,
      required,
      shortName
    }
  },
  watch: {
    labsOrChallenges: {
      handler(value) {
        this.saveStateLabsOrChallenges(value)
        this.$emit('showDataBasedToggle', { type: value })
      }
    }
  },
  async created() {
    if (!this.listOuIdInfoGetter.length) {
      await this.fetchOuIDList()
    }

    this.$emit('showDataBasedToggle', { type: 'labsList' })
    this.$emit('showDataBasedToggle', { type: 'challengesList' })
    this.labsOrChallenges = this.getLabsOrChallenges
  },
  methods: {
    ...mapActions('labs', ['saveStateLabsOrChallenges', 'fetchOuIDList', 'SaveOuList', 'UpdateOuIDList', 'DeleteOuIDList']),
    openDialog(id) {
      if (id) {
        this.isUpdate = true
        this.ouId = id
        this.name = this.listOuIdInfoGetter.find((item) => item.sk === id).name
      }
      this.isDialog = true
    },
    resetData() {
      this.name = ''
      this.ouId = ''
      this.isUpdate = false
    },
    openDeleteDialog(id) {
      this.ouId = id
      this.name = this.listOuIdInfoGetter.find((item) => item.sk === id).name
      this.isDelete = true
    },
    async onSubmit() {
      const data = {
        ou_id: this.ouId,
        name: this.name
      }
      if (this.isUpdate) {
        await this.UpdateOuIDList(data)
      } else {
        await this.SaveOuList(data)
      }
      this.isDialog = false
      this.isUpdate = false
      await this.fetchOuIDList()
    },
    async onSubmitDelete() {
      const status = await this.DeleteOuIDList(this.ouId)
      if (status.Success || status.success) {
        await this.fetchOuIDList()
        this.isDelete = false
      }
    }
  },
  computed: {
    ...mapGetters('labs', ['isLoading', 'getLabsOrChallenges', 'listOuIdInfoGetter'])
  }
}
</script>
