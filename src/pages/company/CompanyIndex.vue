<template>
  <q-tabs active-color="white" align="justify" class="text-grey" dense indicator-color="white" v-model="tab" @click="tabInfo">
    <q-tab name="activeCompanies" label="Active" />
    <q-tab name="inActiveCompanies" label="Expired" />
  </q-tabs>
  <q-separator dark />
  <q-tab-panels v-model="tab" animated>
    <q-tab-panel class="bg-dark text-white" dark name="activeCompanies">
      <CompanyTable
        v-if="!isCreate && !isCompanyDashboard"
        :tableData="companiesData"
        title="Company"
        @createPage="showCreateCompany"
        @deletePage="showCompanyDelete"
        @updatePage="showUpdateCompany"
        @viewCompany="showCompanyInfo"
        @viewCompanyInfo="showCompanyInfo"
      />
    </q-tab-panel>
    <q-tab-panel class="bg-dark text-white" dark name="inActiveCompanies">
      <InActiveCompanyTable
        v-if="!isCreate && !isCompanyDashboard"
        :tableData="companiesData"
        title="Company"
        @createPage="showCreateCompany"
        @deletePage="showCompanyDelete"
        @updatePage="showUpdateCompany"
        @viewCompany="showCompanyInfo"
        @viewCompanyInfo="showCompanyInfo"
      />
    </q-tab-panel>
  </q-tab-panels>

  <CreateCompany
    v-if="isCreate"
    :id="updateId"
    :show="isCreate"
    :title="'Create Company'"
    @openWarning="openDialogWarning"
    @onCacel="cancelCreateCompany"
  />
  <Delete
    v-if="isDelete"
    :show="isDelete"
    :header="'a Company'"
    @confirmDelete="companyConfirmDeletion"
    @confirmDeleteCancel="companyConfirmDeleteCancel"
  />
  <q-dialog v-model="showDialog" persistent style="min-width: 550px">
    <q-card style="min-width: 550px">
      <q-card-section class="bg-primary">
        <q-list class="row">
          <q-item class="col-12">
            <q-item-section class="text-subtitle1 text-weight-bold ase-roboto ase-black-light padding_12 text-center">
              {{ errorMessageDialogGetter.message }}
            </q-item-section>
          </q-item>
        </q-list>
        <q-card-actions align="right">
          <q-btn class="text-capitalize bg-primary text-white" @click="onCancelDialog()">Cancel</q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import CompanyTable from 'components/company/CompanyTable'
import CreateCompany from 'components/company/CreateCompany'
import InActiveCompanyTable from 'components/company/InActiveCompanyTable'
import Delete from 'components/shared/Delete.vue'
import { urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CompanyIndex',
  components: { CompanyTable, CreateCompany, InActiveCompanyTable, Delete },
  data() {
    return {
      tab: 'activeCompanies',
      isCompanyDashboard: false,
      isCreate: false,
      updateId: '',
      isDelete: false,
      companyId: '',
      showDialog: false
    }
  },
  created() {
    if (this.companiesData.length === 0 && this.searchByNameGetter.length === 0 && !this.searchFireActive) {
      this.fetchCompanies({ pagination: {}, reset: false })
    }
  },
  methods: {
    ...mapActions('company', ['deleteCompany', 'errorMsgReset', 'fetchCompanies', 'fetchInActiveCompanies']),
    async showCreateCompany(event) {
      this.errorMsgReset({
        status: true,
        company_name: false,
        company_name_msg: '',
        monthly_minutes: false,
        monthly_minutes_msg: '',
        parent: false,
        parent_msg: '',
        is_event: false,
        is_event_msg: '',
        num_users: false,
        num_users_msg: '',
        minutes_per_user: false,
        minutes_per_user_msg: '',
        start_date: false,
        start_date_msg: '',
        end_date: false,
        end_date_msg: '',
        payment_complete: false,
        payment_complete_msg: '',
        domains: false,
        domains_msg: '',
        events: false,
        events_msg: '',
        subscription: false,
        subscription_msg: '',
        email: false,
        email_msg: '',
        first_name: false,
        first_name_msg: '',
        last_name: false,
        last_name_msg: '',
        plans: false,
        plans_msg: ''
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
    onCancelDialog() {
      this.showDialog = false
    },
    openDialogWarning() {
      this.showDialog = true
    },
    async showUpdateCompany(event) {
      this.errorMsgReset({
        status: true,
        company_name: false,
        company_name_msg: '',
        monthly_minutes: false,
        monthly_minutes_msg: '',
        parent: false,
        parent_msg: '',
        is_event: false,
        is_event_msg: '',
        num_users: false,
        num_users_msg: '',
        minutes_per_user: false,
        minutes_per_user_msg: '',
        start_date: false,
        start_date_msg: '',
        end_date: false,
        end_date_msg: '',
        payment_complete: false,
        payment_complete_msg: '',
        domains: false,
        domains_msg: '',
        events: false,
        events_msg: '',
        subscription: false,
        subscription_msg: '',
        email: false,
        email_msg: '',
        first_name: false,
        first_name_msg: '',
        last_name: false,
        last_name_msg: '',
        plans: false,
        plans_msg: ''
      })
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.isCreate = true
          this.updateId = ''
          this.updateId = event.id
        }
      }
    },
    showCompanyDelete(event) {
      if (event.show) {
        this.companyId = ''
        this.companyId = event.id
        this.isDelete = true
      }
    },
    tabInfo() {
      if (
        this.tab === 'inActiveCompanies' &&
        this.companiesDataInActive.length === 0 &&
        this.searchByNameInActiveGetter.length === 0 &&
        !this.searchFireActiveInActive
      ) {
        this.fetchInActiveCompanies({ pagination: {}, reset: true })
      }
    },
    showCompanyInfo(event) {
      this.$router.push({ path: `/portal/company/dashboard/${urlSafeBase64Encode(event.prop.id)}` })
    },
    cancelCreateCompany(event) {
      if (event.show) {
        this.isCreate = !this.isCreate
      }
      if (event.dialog) {
        this.showDialog = true
      }
    },
    companyConfirmDeletion(event) {
      if (event.show) {
        this.deleteCompany({ company_id: this.companyId })
        this.companyId = ''
        this.isDelete = false
      }
    },
    companyConfirmDeleteCancel(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
          this.companyId = ''
        } else {
          this.isDelete = true
        }
      }
    }
  },
  computed: {
    ...mapGetters('company', [
      'companiesData',
      'companiesDataInActive',
      'errorMessageDialogGetter',
      'searchByNameGetter',
      'searchByNameInActiveGetter',
      'searchFireActive',
      'searchFireActiveInActive'
    ])
  }
}
</script>
