<template>
  <div class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
      <div class="w-full bg-white rounded-lg shadow-xl p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ isEdit ? '編輯費用記錄' : '新增費用記錄' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">學生 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.student"
            :disabled="isEdit"
            :class="[
              'border-0 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150',
              isEdit 
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-900 focus:bg-gray-200'
            ]"
            :required="!isEdit"
          >
            <option value="">選擇學生</option>
            <option v-for="student in students" :key="student.student_id || student.id" :value="student.student_id || student.id">
              {{ student.name }} ({{ student.school }} - {{ student.grade }})
            </option>
          </select>

          <label class="block text-sm font-medium text-gray-700 mb-2">收費名目 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.item"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="">選擇收費名目</option>
            <option value="Tuition">學費</option>
            <option value="Transport">交通費</option>
            <option value="Meal">餐費</option>
            <option value="Book">書籍費</option>
            <option value="Other">其他</option>
          </select>

          <label class="block text-sm font-medium text-gray-700 mb-2">收費金額 <span class="text-red-500">*</span></label>
          <input 
            v-model.number="form.amount"
            type="number" 
            step="1"
            min="0"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150 font-mono text-right" 
            placeholder="0"
            required
          >

          <label class="block text-sm font-medium text-gray-700 mb-2">費用日期 <span class="text-red-500">*</span></label>
          <input 
            v-model="form.fee_date"
            type="date" 
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150" 
            required
          >

          <label class="block text-sm font-medium text-gray-700 mb-2">繳費狀態 <span class="text-red-500">*</span></label>
          <select 
            v-model="form.payment_status"
            class="bg-gray-100 text-gray-900 border-0 rounded-md p-3 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
            required
          >
            <option value="Unpaid">未繳費</option>
            <option value="Paid">已繳費</option>
          </select>

          <div class="flex space-x-4">
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-4 hover:from-indigo-700 hover:to-blue-700 transition ease-in-out duration-150 shadow-md disabled:opacity-50"
            >
              {{ loading ? '處理中...' : (isEdit ? '更新' : '新增') }}
            </button>
            <router-link 
              to="/fees"
              class="flex-1 bg-gray-300 text-gray-900 font-bold py-3 px-4 rounded-lg mt-4 hover:bg-gray-400 transition ease-in-out duration-150 shadow-md text-center"
            >
              取消
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { feeAPI, studentAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const students = ref([])

const form = ref({
  student: '',
  item: '',
  amount: '',
  fee_date: new Date().toISOString().split('T')[0], // 預設為今天
  payment_status: 'Unpaid'
})

const fetchStudents = async () => {
  try {
    const response = await studentAPI.getAll()
    const data = response.data.results || response.data
    students.value = data
  } catch (error) {
    console.warn('獲取學生列表失敗:', error)
  }
}

const fetchFee = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await feeAPI.getById(route.params.id)
    const fee = response.data
    let paymentStatus = fee.payment_status || 'Unpaid'
    // 如果遇到舊的 Partial 狀態（理論上不應該有），轉換為 Unpaid
    if (paymentStatus === 'Partial') {
      paymentStatus = 'Unpaid'
    }
    form.value = {
      student: fee.student || fee.student_id || '',
      item: fee.item,
      amount: Math.round(parseFloat(fee.amount || 0)),
      fee_date: fee.fee_date || new Date().toISOString().split('T')[0],
      payment_status: paymentStatus
    }
  } catch (error) {
    console.error('獲取費用記錄失敗:', error)
    alert('獲取費用記錄失敗，請稍後再試')
    router.push('/fees')
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const submitData = {
      item: form.value.item,
      amount: Math.round(parseFloat(form.value.amount || 0)),
      fee_date: form.value.fee_date,
      payment_status: form.value.payment_status
    }
    
    // 只有在新增時才包含 student 欄位
    if (!isEdit.value) {
      submitData.student = parseInt(form.value.student)
    }
    
    if (isEdit.value) {
      await feeAPI.update(route.params.id, submitData)
      alert('更新成功')
    } else {
      await feeAPI.create(submitData)
      alert('新增成功')
    }
    router.push('/fees')
  } catch (error) {
    console.error('操作失敗:', error)
    if (error.response?.data) {
      const errorMsg = error.response.data.detail || JSON.stringify(error.response.data)
      alert(`操作失敗：${errorMsg}`)
    } else {
      alert('操作失敗，請稍後再試')
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchStudents()
  if (isEdit.value) {
    await fetchFee()
  }
})
</script>

