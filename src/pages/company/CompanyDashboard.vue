<template>
  <section class="q-pa-sm">
    <div class="row">
      <div class="q-pa-xs col-12">
        <div class="row text-h6">
          <div class="col-10" v-if="detailedCompanyUsersInfo.company_info">
            <q-icon name="edit" class="cursor-pointer" @click="actionItem('changeObject')"></q-icon>
            {{ detailedCompanyUsersInfo.company_info ? detailedCompanyUsersInfo.company_info.company_name : '' }}

            <q-badge
              outline
              :color="detailedCompanyUsersInfo.company_info.cbstatus === 'cancelled' ? 'red' : 'green'"
              size="xs"
              v-if="detailedCompanyUsersInfo.company_info ? detailedCompanyUsersInfo.company_info.cbstatus : ''"
            >
              {{ detailedCompanyUsersInfo.company_info ? detailedCompanyUsersInfo.company_info.cbstatus : '' }}
            </q-badge>
          </div>
          <div class="col-2" align="right" v-if="detailedCompanyUsersInfo.company_info">
            <q-btn
              outline
              bordered
              size="sm"
              v-if="
                detailedCompanyUsersInfo.company_info.cbstatus === 'active' ||
                detailedCompanyUsersInfo.company_info.cbstatus === 'non_renewing'
              "
              @click="actionItemFly(detailedCompanyUsersInfo.company_info.cbstatus)"
            >
              Cancel
            </q-btn>
            <q-btn
              outline
              size="sm"
              v-if="detailedCompanyUsersInfo.company_info.cbstatus === 'cancelled'"
              @click="actionItemFly(detailedCompanyUsersInfo.company_info.cbstatus)"
            >
              Re-activate
            </q-btn>
            <q-btn
              outline
              size="sm"
              v-if="detailedCompanyUsersInfo.company_info.cbstatus === 'in_trial'"
              @click="actionItemFly(detailedCompanyUsersInfo.company_info.cbstatus)"
            >
              Upgrade
            </q-btn>
          </div>
        </div>
      </div>
      <div class="q-pa-xs col-12">
        <div class="row"></div>
      </div>
      <q-dialog v-model="showDialogSubscriptions" persistent>
        <q-card transition-show="flip-up" transition-hide="flip-down" dark style="width: 750px; max-width: 90vw">
          <q-card-section>
            <div class="text-subtitle1 ase-roboto text-weight-normal">
              <q-icon name="create" />
              {{ showDialogTitle === 'changeUsers' ? 'Increase Users Count' : '' }}
              {{ showDialogTitle === 'changeDowngrade' ? 'Downgrade' : '' }}
              {{ showDialogTitle === 'changePlan' ? 'Change Plan' : '' }}
              {{ showDialogTitle === 'changeObject' ? 'Update Name' : '' }}
              {{ showDialogTitle === 'changeDate' ? 'Extend Date' : '' }}
              {{ showDialogTitle === 'changeCancel' ? 'Cancel' : '' }}
              {{ showDialogTitle === 'changeDomain' ? 'Domain Update' : '' }}
              {{ showDialogTitle === 'changeParent' ? 'Update Parent' : '' }}
              {{
                showDialogTitle === 'changeReactive'
                  ? `${detailedCompanyUsersInfo.company_info.cbstatus === 'in_trial' ? 'Upgrade' : 'Re activate'}`
                  : ''
              }}
              {{ showDialogTitle === 'changeMins' ? 'Monthly minutes' : '' }}
              {{ showDialogTitle === 'setIdp' ? 'Set Idp' : '' }}
              <hr />
            </div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="onSubmitSubscriptions()">
              <div v-if="showDialogTitle === 'changeUsers'">
                <BaseInput label="Nº Users *" required :rules="[...number, ...min(1)]" v-model="company.numUsers" />
                <p v-if="fetchErrorMsgs.num_users" class="text-caption text-negative">{{ fetchErrorMsgs.num_users_msg }}</p>
              </div>
              <div v-if="showDialogTitle === 'changePlan'">
                <BaseSelect label="Plan Type *" :options="fetchlistPlans" v-model="company.plans" />

                <p v-if="fetchErrorMsgs.plans" class="text-caption text-negative">{{ fetchErrorMsgs.plans_msg }}</p>
                <BaseSelect label="Subscription Type *" :disable="true" :options="subcriptionTypeOptions" v-model="company.subType" />
                <p v-if="fetchErrorMsgs.subscription" class="text-caption text-negative">{{ fetchErrorMsgs.subscription_msg }}</p>
                <BaseInput label="Nº Users " required :rules="[...number, ...min(1)]" v-model="company.numUsers" />
                <p v-if="fetchErrorMsgs.num_users" class="text-caption text-negative">{{ fetchErrorMsgs.num_users_msg }}</p>

                <BaseToggle label="Pro-Rate" v-model="company.proRate" />
                <p v-if="fetchErrorMsgs.pro_rate" class="text-caption text-negative">{{ fetchErrorMsgs.pro_rate_msg }}</p>
              </div>
              <div v-if="showDialogTitle === 'changeParent'">
                <BaseInput label="Parent Email *" required :rules="email" v-model="company.parent" />
                <p v-if="fetchErrorMsgs.parent" class="text-caption text-negative">{{ fetchErrorMsgs.parent_msg }}</p>
              </div>

              <div v-if="showDialogTitle === 'changeDowngrade'">
                <div>Are you sure to cancel the subscription?</div>
              </div>
              <div v-if="showDialogTitle === 'changeCancel'">
                <div>Are you sure to cancel the subscription?</div>
              </div>
              <div v-if="showDialogTitle === 'changeMins'">
                <BaseInput
                  :label="
                    company.subType === 'Enterprise-Trial' || company.subType?.value === 'Enterprise-Trial'
                      ? 'Monthly mins *'
                      : 'Monthly mins'
                  "
                  :required="company.subType.value === 'Enterprise-Trial' || company.subType === 'Enterprise-Trial'"
                  :rules="
                    this.company.subType.value === 'Enterprise-Trial' || this.company.subType === 'Enterprise-Trial'
                      ? [...number, ...min(1)]
                      : []
                  "
                  type="number"
                  v-model="company.monthly_minutes"
                />
                <p v-if="fetchErrorMsgs.monthly_minutes" class="text-caption text-negative">{{ fetchErrorMsgs.monthly_minutes_msg }}</p>
              </div>

              <div v-if="showDialogTitle === 'setIdp'">
                <IdpModal :companyId="detailedCompanyUsersInfo.company_info.sk" @closemodal="onCancelSubscriptions()" />
              </div>

              <BaseInput
                autofocus
                v-if="showDialogTitle === 'changeObject'"
                label="Company Name *"
                :maxlength="150"
                required
                :rules="[...minLength(2), ...maxLength(150)]"
                v-model="company.name"
              />
              <p v-if="fetchErrorMsgs.company_name" class="text-caption text-negative">{{ fetchErrorMsgs.company_name_msg }}</p>

              <BaseSelect
                v-if="showDialogTitle === 'changeDomain'"
                :clearable="false"
                label="Domains"
                hide-hint
                :hint="domainValidation.hint ? domainValidation.hintLabel : ''"
                multiple
                newValueMode="add-unique"
                v-model="company.domains"
              />
              <p v-if="fetchErrorMsgs.domains" class="text-caption text-negative">{{ fetchErrorMsgs.domains_msg }}</p>

              <BaseInput
                clearable
                v-if="showDialogTitle === 'changeDate'"
                label="End Date *"
                :options="(date) => (company.startDate ? date > company.startDate : true)"
                required
                :rules="date"
                type="date"
                v-model="company.endDate"
              />
              <p v-if="fetchErrorMsgs.end_date" class="text-caption text-negative">{{ fetchErrorMsgs.end_date_msg }}</p>
              <div v-if="showDialogTitle === 'changeReactive'">
                <BaseInput
                  clearable
                  :label="`End Date ${company.subType.value === 'Enterprise' ? '' : '*'}`"
                  :options="(date) => (company.startDate ? date > company.startDate : true)"
                  required
                  :rules="date"
                  type="date"
                  v-model="company.endDate"
                />
                <p v-if="fetchErrorMsgs.end_date" class="text-caption text-negative">{{ fetchErrorMsgs.end_date_msg }}</p>
                <BaseSelect label="Plan Type *" :options="fetchlistPlans" v-model="company.plans" />
                <p v-if="fetchErrorMsgs.plans" class="text-caption text-negative">{{ fetchErrorMsgs.plans_msg }}</p>
                <BaseSelect label="Subscription Type *" :options="subcriptionTypeOptions" v-model="company.subType" />
                <p v-if="fetchErrorMsgs.subscription" class="text-caption text-negative">{{ fetchErrorMsgs.subscription_msg }}</p>
                <BaseInput label="Nº Users " required :rules="[...number, ...min(1)]" v-model="company.numUsers" />
                <p v-if="fetchErrorMsgs.num_users" class="text-caption text-negative">{{ fetchErrorMsgs.num_users_msg }}</p>
              </div>
              <q-card-actions v-if="showDialogTitle !== 'setIdp'" align="right">
                <q-btn class="text-capitalize bg-primary text-white" @click="onCancelSubscriptions()">Cancel</q-btn>
                <q-btn class="text-capitalize bg-primary text-white" type="submit">Save</q-btn>
              </q-card-actions>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>

    <div class="row">
      <div class="q-pa-xs col-3">
        <Statistics
          iconName="people"
          title="Users"
          :editIcon="true"
          :editIconName="'edit'"
          @editUsers="actionItem('changeUsers')"
          :count="company.numUsers || 0"
        />
      </div>
      <div class="q-pa-xs col-3">
        <Statistics iconName="notifications_active" title="Active Users" :count="detailedCompanyUsersInfo.no_of_active_users || 0" />
      </div>
      <div class="q-pa-xs col-3">
        <Statistics
          iconName="people_outline"
          title="Monthly mins"
          :editIconName="'edit'"
          :editIcon="true"
          @editUsers="actionItem('changeMins')"
          :showToolTip="true"
          :count="detailedCompanyUsersInfo.company_info ? detailedCompanyUsersInfo.company_info.monthly_minutes || 'N/A' : '-'"
        />
      </div>

      <div class="q-pa-xs col-3">
        <Statistics
          iconName="event_available"
          title="End date"
          :editIconName="'edit'"
          :editIcon="true"
          @editUsers="actionItem('changeDate')"
          :count="detailedCompanyUsersInfo.company_info ? dateFormatReadable(detailedCompanyUsersInfo.company_info.end_date) : '' || 0"
        />
      </div>
      <div class="q-pa-xs col-3">
        <Statistics
          iconName="people_outline"
          title="Plan"
          :editIconName="'edit'"
          :editIcon="true"
          @editUsers="actionItem('changePlan')"
          :showToolTip="true"
          :count="detailedCompanyUsersInfo.company_info?.plan ? detailedCompanyUsersInfo.company_info?.plan.toString() : ''"
        />
      </div>
      <div class="q-pa-xs col-3">
        <Statistics
          iconName="people_outline"
          title="Domain"
          :editIconName="'edit'"
          :editIcon="true"
          @editUsers="actionItem('changeDomain')"
          :showToolTip="true"
          :updateDomainInfo="true"
          :count="company.domains"
        />
      </div>
      <div class="q-pa-xs col-3">
        <Statistics
          iconName="user"
          title="Parent"
          :editIconName="'edit'"
          :editIcon="true"
          @editUsers="actionItem('changeParent')"
          :showToolTip="true"
          :count="detailedCompanyUsersInfo.company_info ? detailedCompanyUsersInfo.company_info.parent || 'N/A' : '-'"
        />
      </div>
      <div class="q-pa-xs col-3">
        <Statistics
          :title="detailedCompanyUsersInfo?.company_info?.idp_name ? 'Delete IDP' : 'Set IDP'"
          :editIconName="detailedCompanyUsersInfo?.company_info?.idp_name ? 'delete' : 'edit'"
          :editIcon="true"
          @editUsers="detailedCompanyUsersInfo?.company_info?.idp_name ? deleteIdp() : actionItem('setIdp')"
        />
      </div>
    </div>
    <div class="row">
      <div class="q-pa-xs col-12">
        <br />
        <q-tabs active-color="white" align="justify" class="text-grey" dense indicator-color="white" v-model="tab" @click="filteredInfo">
          <q-tab name="users" label="Users" />
          <q-tab name="admins" label="Administrators" />
          <q-tab name="popularCourses" label="Popular Courses" @click="statsInformation" />
          <q-tab name="popularTeams" label="Popular Teams" @click="statsInformation" />
        </q-tabs>
        <q-separator dark />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel class="bg-primary text-white" dark name="users">
            <CompanyUsers :companyId="this.$route.params.companyid" />
          </q-tab-panel>
          <q-tab-panel class="bg-primary text-white" name="admins">
            <CompanyAdmins :data="fetchCompanyAdminGetter ? fetchCompanyAdminGetter || [] : []" />
          </q-tab-panel>
          <q-tab-panel class="bg-primary text-white" name="popularCourses">
            <BarChart
              :barChartData="fetchTopCoursesGetter.data"
              :barChartLabels="fetchTopCoursesGetter.labels"
              :barChartName="fetchTopCoursesGetter.data.length > 0 ? fetchTopCoursesGetter.name : 'No data'"
              :title="isLoading ? 'Loading...' : fetchTopCoursesGetter.data.length > 0 ? fetchTopCoursesGetter.name : 'Popular Courses'"
              :idBarChart="'IDBARRRLPSCorpsortate'"
            />
          </q-tab-panel>
          <q-tab-panel class="bg-primary text-white" name="popularTeams">
            <TrendBar
              :title="isLoading ? 'Loading...' : fetchTopTeamsGetter.data.length > 0 ? fetchTopTeamsGetter.name : 'Popular Teams'"
              :bar_chart_categories="fetchTopTeamsGetter.categories ? fetchTopTeamsGetter.categories : [] || []"
              :bar_chart_data="fetchTopTeamsGetter.data ? fetchTopTeamsGetter.data : [] || []"
              :bar_chart_labels="fetchTopTeamsGetter.labels"
            />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </section>
</template>

<script>
import { showLoader } from 'app/src/utils/loader'
import IdpModal from 'components/IdpModal/Index.vue'
import Statistics from 'components/company/Statistics'
import CompanyAdmins from 'components/company/tables/companyAdmins'
import CompanyUsers from 'components/company/tables/users'
import BarChart from 'components/echarts-latest/bar'
import TrendBar from 'components/echarts-latest/trendBarMultiple'
import BaseInput from 'components/shared/BaseInput.vue'
import BaseSelect from 'components/shared/BaseSelect.vue'
import BaseToggle from 'components/shared/BaseToggle.vue'
import { dateFormatReadable, todayDate, urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { date, domainName, email, maxLength, min, minLength, number, shortName } from 'src/utils/rules'
import { compareFunction } from 'src/utils/validateSeralizer'
import { mapActions, mapGetters, useStore } from 'vuex'

export default {
  name: 'CompanyDashboard',
  components: { Statistics, CompanyAdmins, CompanyUsers, BarChart, TrendBar, BaseInput, BaseSelect, BaseToggle, IdpModal },
  data() {
    return {
      tab: 'users',
      companyData: {},
      typeSend: '',
      isSend: false,
      eventIdInfo: '',
      toggleMonthly: true,
      domainValidation: { hint: 'true', hintLabel: 'Optional' },
      json_fields: {
        'Complete name': 'name',
        Date: 'date'
      },
      step: 1,
      showDialog: false,
      showDialogSubscriptions: false,
      showDialogTitle: '',
      qty: 3,
      company: {
        name: '',
        plans: [],
        email: '',
        parent: '',
        first_name: '',
        last_name: '',
        courses: null,
        numUsers: 0,
        minutesPerUser: 0,
        monthly_minutes: undefined,
        startDate: '',
        endDate: '',
        domains: null,
        isPayment: false,
        isEvent: false,
        subType: '',
        proRate: false
      },
      showChangeParent: false,
      subcriptionTypeOptions: [
        { value: 'Enterprise', label: 'Enterprise' },
        { value: 'Enterprise-Trial', label: 'Enterprise-Trial' }
      ],
      idpStep: 1,
      date,
      email,
      min,
      minLength,
      maxLength,
      number,
      shortName,
      domainName,
      todayDate
    }
  },
  async created() {
    this.tab = 'users'

    await this.fetchCompanyUserStats({
      company_id: urlSafeBase64Decode(this.$route.params.companyid)
    })
    this.qty = this.detailedCompanyUsersInfo.no_of_users
    await this.updateChanges()
  },
  computed: {
    ...mapGetters('company', [
      'isLoading',
      'detailedCompanyUsersInfo',
      'fetchCompanyAdminGetter',
      'fetchStatusOfApiCompany',
      'fetchErrorMsgs',
      'fetchlistPlans',
      'errorMessageDialogGetter'
    ]),
    ...mapGetters('analyticsStats', ['fetchTopCoursesGetter', 'fetchTopTeamsGetter']),
    ...mapGetters('course', ['coursesOption'])
  },
  methods: {
    ...mapActions('company', [
      'fetchCompanyUserStats',
      'fetchCompanyAdmins',
      'createCompany',
      'updateCompanyInfo',
      'errorMsgReset',
      'actionCompany',
      'fetchPlanOptions'
    ]),
    ...mapActions('analyticsStats', ['fetchCompanyStatsAction']),
    dateFormatReadable(data) {
      return dateFormatReadable(data)
    },
    async actionItemFly(data) {
      if (data === 'cancelled') {
        this.actionItem('changeReactive')
      } else if (data === 'in_trial ') {
        this.actionUpgrade()
      } else if (data === 'active' || data === 'non_renewing') {
        this.actionItem('changeCancel')
      } else {
        this.actionItem('changeReactive')
      }
    },
    async actionItem(data) {
      if (data) {
        this.showDialogTitle = data
        if (data === 'changePlan') {
          await this.fetchPlanOptions({})
          await this.updateChanges()
        }
        if (data === 'changeObject') {
          if (this.detailedCompanyUsersInfo.company_info) {
            this.company.name = this.detailedCompanyUsersInfo.company_info.company_name
          }
        }
        if (data === 'changeParent') {
          if (this.detailedCompanyUsersInfo.company_info) {
            this.company.parent = this.detailedCompanyUsersInfo.company_info.parent
          }
        }
        if (data === 'changeReactive') {
          await this.fetchPlanOptions({})
          await this.updateChanges()
        }

        this.showDialogSubscriptions = true
      }
    },
    onCancelSubscriptions() {
      this.showDialogSubscriptions = false
    },
    statsInformation() {
      this.fetchCompanyStatsAction({
        company_id: urlSafeBase64Decode(this.$route.params.companyid)
      })
    },
    async updateChanges() {
      if (this.detailedCompanyUsersInfo.company_info?.courses) {
        const coursesList = []
        this.coursesOption.forEach((course) => {
          this.detailedCompanyUsersInfo.company_info.courses.forEach((icheck) => {
            if (course.value === icheck) {
              coursesList.push({ label: course.label, value: course.value })
            }
          })
        })
        this.company.courses = coursesList
      }

      if (this.detailedCompanyUsersInfo.company_info) {
        this.company.name = this.detailedCompanyUsersInfo.company_info.company_name
        this.company.startDate = this.detailedCompanyUsersInfo.company_info.start_date.replace(/-/g, '/')
        this.company.endDate = this.detailedCompanyUsersInfo.company_info.end_date.replace(/-/g, '/')
        this.company.domains = this.detailedCompanyUsersInfo.company_info.domains
        this.fetchlistPlans.forEach((plan) => {
          if (plan.value === this.detailedCompanyUsersInfo.company_info.plan) {
            this.company.plans = { label: plan.label, value: plan.value }
          }
        })
        this.company.numUsers = this.detailedCompanyUsersInfo.company_info.num_users
        this.company.isPayment = this.detailedCompanyUsersInfo.company_info.payment_complete
        this.company.minutesPerUser = this.detailedCompanyUsersInfo.company_info.minutes_per_user
        this.company.first_name = this.detailedCompanyUsersInfo.company_info.first_name
        this.company.last_name = this.detailedCompanyUsersInfo.company_info.last_name
        this.company.parent = this.detailedCompanyUsersInfo.company_info.parent
        this.company.subType = {
          label: this.detailedCompanyUsersInfo.company_info.subscription,
          value: this.detailedCompanyUsersInfo.company_info.subscription
        }
        this.company.proRate = this.detailedCompanyUsersInfo.company_info.pro_rate

        this.company.monthly_minutes = this.detailedCompanyUsersInfo.company_info.monthly_minutes
      }
    },
    filteredInfo() {
      if (this.tab === 'admins') {
        this.fetchCompanyAdmins({
          pagination: { company_id: urlSafeBase64Decode(this.$route.params.companyid) },
          reset: true
        })
      }
    },
    async onSubmit() {
      if (this.company.endDate <= this.company.startDate) {
        this.$q.notify({
          message: 'End date should be greater than start date',
          color: 'negative',
          position: 'top',
          timeout: 2000
        })
        return
      }
      const data = {
        company_name: this.company.name,
        first_name: this.company.first_name,
        last_name: this.company.last_name,
        parent: this.company.parent,
        num_users: parseInt(this.company.numUsers),
        start_date: this.company.startDate.replace(/\//g, '-'),
        end_date: this.company.endDate.replace(/\//g, '-'),
        subscription: this.company.subType.value,
        prorate: this.company.proRate
      }
      if (this.company.domains) {
        data.domains = this.company.domains
      }
      if (this.company.monthly_minutes > 0) {
        data.monthly_minutes = parseInt(this.company.monthly_minutes)
      }
      if (this.company.plans) {
        if (this.company.plans.length > 0) {
          data.plans = this.company.plans.map((plan) => plan.value)
        }
      }
      if (this.id) {
        data.company_id = this.id
        await this.updateCompanyInfo(compareFunction('company', data, this.detailedCompanyUsersInfo.company_info))
      } else {
        await this.createCompany(data)
      }
      if (this.fetchStatusOfApiCompany) {
        this.company = {
          name: '',
          courses: null,
          parent: '',
          first_name: '',
          last_name: '',
          numUsers: 0,
          minutesPerUser: 0,
          monthly_minutes: undefined,
          startDate: '',
          endDate: '',
          domains: null,
          isPayment: false,
          isEvent: false,
          subscription: '',
          pro_rate: ''
        }
        this.showChangeParent = false
        if (this.errorMessageDialogGetter.status) {
          this.$emit('openWarning', { show: true, dialog: true })
          this.showDialog = true
        }
        this.onCancel()
      }
    },
    async onSubmitSubscriptions() {
      if (this.showDialogTitle === 'changeUsers') {
        const end_date =
          this.detailedCompanyUsersInfo.company_info.subscription === 'Enterprise-Trial'
            ? this.detailedCompanyUsersInfo.company_info.end_date
            : undefined
        const payload = {
          type: 'change',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          subscription: this.detailedCompanyUsersInfo.company_info.subscription,
          num_users: parseInt(this.company.numUsers),
          end_date
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }
      if (this.showDialogTitle === 'changePlan') {
        const payload = {
          type: 'change',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          subscription: this.detailedCompanyUsersInfo.company_info.subscription,
          plan: this.company.plans.value,
          prorate: this.company.proRate,
          num_users: parseInt(this.company.numUsers)
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }
      if (this.showDialogTitle === 'changeCancel') {
        const payload = {
          type: 'cancel',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          subscription: this.detailedCompanyUsersInfo.company_info.subscription,
          plan: this.detailedCompanyUsersInfo.company_info.plan,
          prorate: this.company.proRate
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }
      if (this.showDialogTitle === 'changeObject') {
        const payload = {
          type: 'object',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          company_name: this.company.name
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }
      if (this.showDialogTitle === 'changeParent') {
        const payload = {
          type: 'parent',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          parent: this.company.parent
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }
      if (this.showDialogTitle === 'changeDomain') {
        const payload = {
          type: 'object',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          company_name: this.company.name,
          domains: this.company.domains
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }
      if (this.showDialogTitle === 'changeMins') {
        const payload = {
          type: 'object',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          monthly_minutes: parseInt(this.company.monthly_minutes)
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }

      if (this.showDialogTitle === 'changeDate') {
        const payload = {
          type: 'extend',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          end_date: this.company.endDate.replace(/\//g, '-')
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }

      if (this.showDialogTitle === 'changeDowngrade') {
        const payload = {
          type: 'cancel',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          credit_option: 'prorate'
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }
      if (this.showDialogTitle === 'changeReactive') {
        const payload = {
          type: 'change',
          company_id: this.detailedCompanyUsersInfo.company_info.sk,
          end_date: this.company.endDate.replace(/\//g, '-'),
          subscription: this.company.subType.value,
          plan: this.company.plans.value,
          num_users: parseInt(this.company.numUsers)
        }
        await this.actionCompany(payload)
        if (this.fetchStatusOfApiCompany) {
          this.showDialogSubscriptions = false
        }
      }

      await this.updateChanges()
    },

    async actionUpgrade() {
      const payload = {
        type: 'upgrade',
        company_id: this.detailedCompanyUsersInfo.company_info.sk,
        subscription: this.company.subType.value
      }
      await this.actionCompany(payload)
      if (this.fetchStatusOfApiCompany) {
        this.showDialogSubscriptions = false
      }
    },
    updateChange() {
      this.showChangeParent = true
      this.company.first_name = ''
      this.company.last_name = ''
      this.company.parent = ''
    },
    undoChange() {
      this.showChangeParent = false
      this.company.first_name = this.detailedCompanyUsersInfo.company_info.first_name
      this.company.last_name = this.detailedCompanyUsersInfo.company_info.last_name
      this.company.parent = this.detailedCompanyUsersInfo.company_info.parent
    },
    onCancel() {
      this.$emit('onCacel', { show: true })
      this.company = {}
    },
    async deleteIdp() {
      showLoader(true)
      const success = await this.store.dispatch('company/deleteIdp', {
        company_id: this.detailedCompanyUsersInfo.company_info.sk
      })
      this.$q.notify({
        type: success ? 'positive' : 'negative',
        position: 'top',
        progress: true,
        icon: success ? 'success' : 'error',
        timeout: 1100,
        message: success ? 'Successfully deleted IDP' : 'Failed to delete IDP'
      })
      success && this.onCancelSubscriptions()
      showLoader(false)
    }
  },
  setup() {
    const store = useStore()
    return {
      store
    }
  }
}
</script>
<style scoped>
.bordered_info {
  border: 1px solid #1c1c1c;
  padding: 14px;
  border-radius: 0px;
  box-shadow: inset 0px, 1px rgba(0, 0, 0, 0.05);
}
</style>
