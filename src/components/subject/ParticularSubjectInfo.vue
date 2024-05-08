<template>
  <Page :isCreateIcon="roleIsAdmin" v-model:search="search" :title="title" @createPage="createPage($event)" :isTable="false">
    <div class="q-pa-md" v-if="roleIsAdmin">
      <q-btn color="white" icon="add" label="Menu" outline>
        <q-menu dark fit auto-close>
          <q-list>
            <q-item v-for="(action, index) in actionItems" clickable :key="index" v-ripple @click="actionItem(action.value)">
              <q-item-section>{{ action.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <q-list v-for="[key, value] in Object.entries(tableData)" :key="key" dark padding bordered class="rounded-borders">
      <q-expansion-item group="somegroup" :label="key.replace('vid', 'Video')" class="padding_7">
        <q-card class="bg-grey-9">
          <q-card-section>
            <SubjectCard
              v-for="(val, index) in value"
              :key="val.id"
              :roleIsAdmin="roleIsAdmin"
              :value="value[index]"
              @actionItemDelete="actionItemDelete(key, val.id)"
              @actionItemInfo="actionItemInfo(key, val.id)"
            >
              <template #action v-if="key === 'lab'">
                <div class="text-grey-6 q-gutter-xs">
                  <q-toggle
                    checked-icon="check"
                    color="green"
                    dark
                    dense
                    indeterminate-value="N/A"
                    label-color="white"
                    label="Is Active"
                    outlined
                    unchecked-icon="clear"
                    :model-value="val.is_active"
                    @update:model-value="changeLabStatus(val.id, $event)"
                  />
                  <q-btn class="gt-xs primary" size="12px" flat dense round icon="remove" @click="actionItemDetach(key, val.id)" />
                </div>
              </template>
            </SubjectCard>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </Page>
  <Delete
    v-if="isDelete"
    :header="typeO"
    :show="isDelete"
    @confirmDelete="confirmDeletion($event)"
    @confirmDeleteCancel="deleteCancel($event)"
  />
  <Detach
    v-if="isDetach"
    :header="typeO"
    :show="isDetach"
    @confirmDetach="confirmDetach($event)"
    @confirmDetachCancel="detachCancel($event)"
  />
</template>

<script>
import Delete from 'components/shared/Delete.vue'
import Detach from 'components/shared/Detach'
import Page from 'components/shared/coursePage'
import { mapGetters } from 'vuex'
import SubjectCard from './SubjectCard.vue'

export default {
  name: 'ParticularSubjectInfo',
  components: { Page, Delete, Detach, SubjectCard },
  emits: ['createPage', 'actionItem', 'actionItemCrud', 'actionItemDelete', 'actionItemDetachData', 'changeLabStatus'],
  props: {
    title: { type: String, default: 'Header' },
    tableData: { required: false }
  },
  data() {
    return {
      actionItems: [
        { label: 'Downloads', value: 'downloads', icon: 'delete' },
        { label: 'Lab', value: 'lab', icon: 'print' },
        { label: 'Media', value: 'createMedia', icon: 'format_size' },
        { label: 'Quiz', value: 'quiz', icon: 'print' },
        { label: 'Videos', value: 'vedios', icon: 'format_size' }
      ],
      isDelete: false,
      isDetach: false,
      saveTypeId: { type: '', id: '' },
      search: '',
      typeDetach: '',
      typeO: ''
    }
  },
  methods: {
    createPage(event) {
      if (event.show) {
        this.$emit('createPage', { show: true })
      }
    },
    actionItem(data) {
      this.$emit('actionItem', data)
    },
    actionItemInfo(type, id) {
      this.$emit('actionItemCrud', { type: type, id: id })
    },
    actionItemDelete(type, id) {
      this.typeO = type.replace('vid', 'Video').replace('download', 'Download')
      this.saveTypeId.type = type
      this.saveTypeId.id = id
      this.isDelete = true
    },
    actionItemDetach(type, id) {
      this.typeO = type.replace('vid', 'Video').replace('download', 'Download')
      this.saveTypeId.type = type
      this.saveTypeId.id = id
      this.isDetach = true
      this.typeDetach = null
    },
    confirmDeletion(event) {
      if (event.show) {
        this.$emit('actionItemDelete', this.saveTypeId)
      }
      this.isDelete = false
    },
    confirmDetach(event) {
      if (event.show) {
        this.$emit('actionItemDetachData', this.saveTypeId)
      } else {
        this.typeDetach = null
      }
      this.isDetach = false
    },
    changeLabStatus(id, toggleStatus) {
      this.$emit('changeLabStatus', { status: id, is_active: toggleStatus })
    },
    detachCancel(event) {
      if (event.show) {
        this.isDetach = !this.isDetach
        this.saveTypeId = this.isDetach ? {} : this.saveTypeId
      }
    },
    deleteCancel(event) {
      if (event.show) {
        this.isDelete = !this.isDelete
        this.saveTypeId = this.isDelete ? {} : this.saveTypeId
      }
    }
  },
  computed: {
    ...mapGetters('login', ['roleIsAdmin'])
  }
}
</script>
