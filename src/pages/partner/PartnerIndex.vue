<template>
  <q-tabs active-color="white" align="justify" class="text-grey" dense indicator-color="white" v-model="tab" @click="tabInfo">
    <q-tab name="activePartners" label="Active" />
    <q-tab name="inActivePartners" label="Expired" />
  </q-tabs>
  <q-separator dark />
  <q-tab-panels animated v-model="tab">
    <q-tab-panel class="bg-dark text-white" dark name="activePartners">
      <PartnerTable
        v-if="!isCreate && !isDelete"
        @createPartner="showCreatePartner($event)"
        @deletePartner="showDeletePartner($event)"
        @updatePartner="showUpdatePartner($event)"
      />
    </q-tab-panel>
    <q-tab-panel class="bg-dark text-white" dark name="inActivePartners">
      <InActivePartnerTable
        @createPartner="showCreatePartner($event)"
        @deletePartner="showDeletePartner($event)"
        @updatePartner="showUpdatePartner($event)"
      />
    </q-tab-panel>
  </q-tab-panels>

  <CreatePartner
    v-if="isCreate && !isDelete"
    :id="updateId"
    v-model:name="typeCreate"
    :show="isCreate"
    @onCancel="cancelCreatePartner($event)"
  />
  <Delete
    v-if="isDelete"
    :show="isDelete"
    :header="'an Partner'"
    @confirmDelete="partnerConfirmDeletion($event)"
    @confirmDeleteCancel="partnerConfirmDeleteCancel($event)"
  />
</template>

<script>
import CreatePartner from 'components/partner/createPartner'
import PartnerTable from 'components/partner/partnerTable'
import InActivePartnerTable from 'components/partner/partnerTableInActive'
import Delete from 'components/shared/Delete.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PartnerIndex',
  components: { CreatePartner, PartnerTable, InActivePartnerTable, Delete },
  data() {
    return {
      tab: 'activePartners',
      isCreate: false,
      isDelete: false,
      updateId: '',
      learningPathId: '',
      typeCreate: '',
      PartnerID: ''
    }
  },
  created() {
    if (this.fetchlistPartners.length === 0 && this.searchByNameGetter.length === 0) {
      const data = {
        pagination: {},
        reset: true
      }
      this.fetchPartners(data)
    }
  },
  computed: {
    ...mapGetters('partner', ['fetchlistPartners', 'searchByNameGetter', 'plansOptionsGetter', 'fetchlistInActivePartners'])
  },
  methods: {
    ...mapActions('partner', [
      'fetchPartners',
      'fetchPartner',
      'deletePartner',
      'errorMsgReset',
      'fetchplansOptions',
      'fetchInActivePartners'
    ]),
    async showCreatePartner(event) {
      if (this.plansOptionsGetter.length === 0) {
        await this.fetchplansOptions({})
      }
      const errorMsgs = {
        partner_name: false,
        partner_name_msg: '',
        plans: false,
        plans_msg: '',
        start_date: false,
        start_date_msg: '',
        end_date: false,
        end_date_msg: '',
        num_users: false,
        num_users_msg: '',
        domains: false,
        domains_msg: ''
      }
      this.errorMsgReset(errorMsgs)
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.isCreate = true
          this.updateId = ''
        }
      }
    },
    async showUpdatePartner(event) {
      if (this.plansOptionsGetter.length === 0) {
        await this.fetchplansOptions({})
      }
      const errorMsgs = {
        Partner_name: false,
        Partner_name_msg: '',
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
          await this.fetchPartner({ partner_id: event.id })
          this.isCreate = true
        }
      }
    },
    showDeletePartner(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
        } else {
          this.isDelete = true
          this.PartnerID = ''
          this.PartnerID = event.id
        }
      }
    },
    partnerConfirmDeletion(event) {
      if (event.show) {
        this.deletePartner({ partner_id: this.PartnerID })
        this.isDelete = false
      }
    },
    tabInfo() {
      if (this.tab === 'inActivePartners' && this.fetchlistInActivePartners.length === 0) {
        this.fetchInActivePartners({ pagination: {}, reset: false })
      }
    },
    partnerConfirmDeleteCancel(event) {
      if (event.show) {
        this.isDelete = !this.isDelete
      }
    },
    cancelCreatePartner(event) {
      if (event.show) {
        this.isCreate = false
      }
    }
  }
}
</script>
