<template>
  <div>
    <DeliveryTable
      v-if="!isCreate && !isDelete"
      @createNewDelivery="showCreateDelivery($event)"
      @updateDelivery="showUpdateDelivery($event)"
      @deleteDelivery="showDeleteDelivery($event)"
    />
    <CreateDelivery
      v-if="isCreate && !isDelete"
      :id="updateId"
      :title="title"
      v-model:name="typeCreate"
      :show="isCreate"
      @onCacel="cancelCreateDelivery($event)"
    />
    <Delete
      v-if="isDelete"
      :show="isDelete"
      :header="'a Delivery'"
      @confirmDelete="deliveryConfirmDeletion($event)"
      @confirmDeleteCancel="deliveryConfirmDeleteCancel($event)"
    />
  </div>
</template>

<script setup>
import { useDeliveryStore } from 'app/src/stores'
import CreateDelivery from 'components/delivery/CreateDelivery'
import DeliveryTable from 'components/delivery/DeliveryTable'
import Delete from 'components/shared/Delete.vue'
import { computed, onMounted, ref } from 'vue'

const deliveryStore = useDeliveryStore()
// const store = useStore()
const isCreate = ref(false)
const isDelete = ref(false)
const deliveryId = ref('')
const updateId = ref('')
const title = ref('Create Delivery')
const typeCreate = ref('')

const fetchlistDelivery = computed(() => (deliveryStore.listDelivery.length > 0 ? [...new Set(deliveryStore.listDelivery)] : []))
const searchByNameGetter = computed(() => deliveryStore.searchByName)
const searchFireActive = computed(() => deliveryStore.searchFire)
onMounted(async () => {
  if (!fetchlistDelivery.value.length && !searchByNameGetter.value.length && !searchFireActive.value) {
    await deliveryStore.fetchDeliveries({ pagination: { length: 80, startIndex: 0 } })
  }
})

function showCreateDelivery(event) {
  if (event.show) {
    if (isCreate.value) {
      isCreate.value = false
    } else {
      title.value = ''
      title.value = 'Create Delivery'
      isCreate.value = true
      updateId.value = ''
    }
  }
}

function showUpdateDelivery(event) {
  if (event.show) {
    if (isCreate.value) {
      isCreate.value = false
      title.value = 'Create Delivery'
    } else {
      title.value = 'Update Delivery'
      isCreate.value = true
      updateId.value = event.row.id
    }
  }
}

function showDeleteDelivery(event) {
  if (event.show) {
    if (isDelete.value) {
      isDelete.value = false
    } else {
      isDelete.value = true
      deliveryId.value = ''
      deliveryId.value = event.row.id
    }
  }
}

async function deliveryConfirmDeletion(event) {
  if (event.show) {
    const data = {
      id: deliveryId.value
    }
    // await store.dispatch('delivery/deleteDelivery', data)
    await deliveryStore.deleteDelivery(data)
    deliveryId.value = ''
    isDelete.value = false
  }
}

function deliveryConfirmDeleteCancel(event) {
  if (event.show) {
    isDelete.value = !isDelete.value
  }
}

function cancelCreateDelivery(event) {
  if (event.show) {
    isCreate.value = false
  }
}
</script>
