<template>
  <FeedbackTable :coursename="nameCourse"></FeedbackTable>
</template>

<script>
import FeedbackTable from 'components/feedback/FeedbackTable'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'

export default {
  components: { FeedbackTable },
  data() {
    return {
      nameCourse: urlSafeBase64Decode(this.$route.params.courseName)
    }
  }
}
</script>
