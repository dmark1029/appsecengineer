import { defineStore } from 'pinia'
import axios from 'src/utils/aiChallenges'
import axios2 from 'src/utils/instance'
import { showLoader } from '../utils/loader'
import { Notify } from 'quasar'

export const useAiChallengesStore = defineStore('aiChallenges', {
  state: () => ({
    listAiChallenges: [],
    challengeDetails: [],
    filteredChallenges: [],
    pageInfo: [],
    isLoading: false
  }),

  getters: {},

  actions: {
    async fetchAiChallenges(payload) {
      showLoader(true)
      await axios
        .get(`admin/custom-challenges?page=${payload.page}`)
        .then((res) => {
          this.pageInfo = res.data
          if (payload.reset) {
            this.listAiChallenges = res.data.data
          } else {
            this.listAiChallenges.push(...res.data.data)
          }
        })
        .finally(() => showLoader(false))
    },

    async generateAiChallenges(payload) {
      this.isLoading = true
      await axios
        .post('admin/custom-challenge/generate', payload)
        .then((res) => {
          this.challengeDetails = res.data.data
        })
        .catch((error) => {
          Notify.create({
            color: 'negative',
            message: Object.keys(error.response.data.message)[0] + ': ' + Object.values(error.response.data.message)[0],
            position: 'top'
          })
          throw error
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    async saveAiChallenges(payload) {
      await axios.post('admin/custom-challenges', payload).then((res) => {
        this.listAiChallenges.unshift(res.data.data)
      })
    },

    async deleteAiChallenges(payload) {
      showLoader(true)
      await axios
        .delete('admin/custom-challenges/', {
          data: payload
        })
        .finally(() => showLoader(false))
    },

    async filterAiChallenges(payload) {
      showLoader(true)
      await axios
        .get('admin/custom-challenges', {
          params: {
            language: payload.language,
            framework: payload.framework,
            difficulty: payload.difficulty
          }
        })
        .then((res) => {
          this.filteredChallenges = res.data.data.map((challenge) => {
            return {
              ...challenge,
              value: challenge._key,
              label: challenge.name
            }
          })
        })
        .catch((error) => {
          console.log(error)
        })
        .finally(() => showLoader(false))
    },

    async attachAiChallenges(payload) {
      showLoader(true)
      await axios2.post('aiquiz/create', payload).finally(() => showLoader(false))
    }
  }
})
