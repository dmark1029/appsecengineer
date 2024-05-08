import { defineStore } from 'pinia'
import { LocalStorage, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { showLoader } from 'src/utils/loader'
import { ref } from 'vue'

export const useDeliveryStore = defineStore('delivery', () => {
  const loading = ref(false)
  const totalDeliveries = ref(0)
  const listDelivery = ref([])
  const listOptionsDelivery = ref([])
  const fetchlistDelivery = ref([])
  const deliveryInfo = ref([])
  const designList = ref([])
  const listTemplates = ref([])
  const detailsList = ref([])
  const totalDesigns = ref(0)
  const detailInfo = ref({})
  const totalDetails = ref(0)
  const statusOfApi = ref(false)
  const deliverySuccessInfo = ref({})
  const error_msgs = ref({
    status: false,
    title: false,
    title_msg: '',
    _type: false,
    _type_msg: '',
    mailSubject: false,
    mailSubject_msg: '',
    designId: false,
    designId_msg: '',
    detailId: false,
    detailId_msg: '',
    details: {
      title: false,
      title_msg: '',
      duration: false,
      duration_msg: '',
      level: false,
      level_msg: '',
      duration_type: false,
      duration_type_msg: '',
      criteria: false,
      criteria_msg: '',
      skills: false,
      skills_msg: ''
    },
    emailTemplateId: false,
    emailTemplateId_msg: '',
    emailFromName: false,
    emailFromName_msg: '',
    step1: false,
    step1_msg: '',
    step2: false,
    step2_msg: '',
    step3: false,
    step3_msg: ''
  })
  const listDesigns = ref([])
  const error_msgs_designs = ref({ status: true })
  const error_msgs_details = ref({ status: true })
  const listDetails = ref([])
  const error_msgs_templates = ref({ status: true })
  const listDetailSkills = ref([])
  async function fetchDeliveries(payload) {
    showLoader(true)
    await api
      .post('delivery/list', payload.pagination)
      .then((res) => {
        if (res.data.success) {
          totalDeliveries.value = res.data.data.total

          const deliveryList = res.data.data.results.map((delivery) => delivery)
          const deliveryOptions = deliveryList.map((delivery) => ({ label: delivery.title, value: delivery.id, type: delivery._type }))

          if (payload.reset) {
            fetchlistDelivery.value = [...new Set(deliveryList)]
            listDelivery.value = deliveryList
            listOptionsDelivery.value = deliveryOptions
          } else {
            const prev = listDelivery.value
            listDelivery.value = [...prev, ...deliveryList]
            fetchlistDelivery.value = [...new Set(listDelivery.value)]

            const prevOptions = listOptionsDelivery.value
            listOptionsDelivery.value = [...prevOptions, ...deliveryOptions]
          }
        }
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      })
      .finally(() => showLoader(false))
  }

  async function fetchDelivery(payload) {
    showLoader(true)
    await api
      .post('delivery/get', payload)
      .then((res) => {
        if (res.data.success) {
          deliveryInfo.value = res.data.data
        }
      })
      .catch((error) => {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      })
      .finally(() => showLoader(false))
  }

  async function fetchlistDesigns(payload) {
    showLoader(true)
    await api
      .post('design/list', payload)
      .then((res) => {
        const listDesigns = res.data.data.results.map((design) => ({
          value: design.id,
          label: design.title
        }))

        const prev = designList.value
        designList.value = [...prev, ...listDesigns]
        totalDesigns.value = res.data.data.total
      })
      .catch((error) => {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      })
      .finally(() => showLoader(false))
  }

  async function fetchlistDetails(payload) {
    showLoader(true)
    await api
      .post('details/list', payload)
      .then((res) => {
        const listDetails = res.data.data.results.map((details) => ({
          value: details.id,
          label: details.title
        }))

        const prev = detailsList.value
        detailsList.value = [...prev, ...listDetails]
        totalDetails.value = res.data.data.total
      })
      .catch((error) => {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      })
      .finally(() => showLoader(false))
  }

  async function fetchlistTemplates() {
    showLoader(true)
    await api
      .post('templates/list')
      .then((res) => {
        listTemplates.value = res.data.data.results.map((temp) => ({
          value: temp.id,
          label: temp.title
        }))
      })
      .catch((error) => {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      })
      .finally(() => showLoader(false))
  }

  async function updateDelivery(payload) {
    showLoader(true)
    statusOfApi.value = true
    await api
      .post('delivery/update', payload, {
        headers: {
          Authorization: LocalStorage.getItem('token')
        }
      })
      .then((res) => {
        listDelivery.value = listDelivery.value.map((delivery) => {
          if (delivery.id === payload.Id) {
            return { ...delivery, ...payload }
          }
          return delivery
        })

        statusOfApi.value = true
        Notify.create({ message: 'Badge has been successfully updated', color: 'green', position: 'top' })
      })
      .catch((error) => {
        statusOfApi.value = false
        Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
      })
      .finally(() => showLoader(false))
  }

  async function createDelivery(payload) {
    showLoader(true)
    statusOfApi.value = true
    deliverySuccessInfo.value = {}
    await api
      .post('delivery/create', payload)
      .then((res) => {
        if (res.data.success) {
          listDelivery.value.unshift(res.data.data)
          deliverySuccessInfo.value = res.data
          statusOfApi.value = true
          Notify.create({ message: 'Delivery has been successfully created', type: 'positive', color: 'green', position: 'top' })
        }
      })
      .catch((error) => {
        deliverySuccessInfo.value = {}
        statusOfApi.value = false
        Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
      })
      .finally(() => showLoader(false))
  }

  async function deleteDelivery(payload) {
    showLoader(true)
    await api
      .post('delivery/delete', payload)
      .then((res) => {
        listDelivery.value = listDelivery.value.filter((delivery) => delivery.id !== payload.id)
        Notify.create({ message: 'Delivery is deleted successfully.', color: 'red', position: 'top' })
      })
      .catch((error) => {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      })
      .finally(() => showLoader(false))
  }

  return {
    loading,
    totalDeliveries,
    listDelivery,
    deliverySuccessInfo,
    detailInfo,
    error_msgs,
    error_msgs_designs,
    error_msgs_details,
    error_msgs_templates,
    statusOfApi,
    listDesigns,
    listDetailSkills,
    listDetails,
    listOptionsDelivery,
    fetchlistDelivery,
    deliveryInfo,
    fetchDeliveries,
    fetchDelivery,
    fetchlistDesigns,
    designList,
    totalDesigns,
    fetchlistDetails,
    detailsList,
    totalDetails,
    fetchlistTemplates,
    listTemplates,
    updateDelivery,
    createDelivery,
    deleteDelivery
  }
})
