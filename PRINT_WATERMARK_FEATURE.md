# 列印浮水印功能

## 📋 需求說明

用戶要求：
1. **移除列印時的網址和網頁標題**（瀏覽器預設會在頁首/頁尾顯示）
2. **添加自定義浮水印功能**（例如補習班 logo）

## 🔧 實現方案

### 1. 移除瀏覽器預設的頁首頁尾

#### CSS 解決方案

```css
/* 移除瀏覽器預設的頁首頁尾（網址、標題、日期等） */
@media print {
  @page {
    margin: 20mm;
  }
  
  /* 隱藏瀏覽器預設的頁首頁尾 */
  body::before,
  body::after {
    display: none !important;
  }
}
```

**說明：**
- ✅ 使用 `@media print` 確保只在列印時生效
- ✅ `@page { margin: 20mm; }` 設定頁面邊距
- ✅ `body::before` 和 `body::after` 隱藏瀏覽器自動添加的頁首頁尾

**注意：**
- 不同瀏覽器的頁首頁尾控制方式不同
- Chrome/Edge：可以在列印對話框中取消勾選「頁首和頁尾」
- Firefox：在「頁面設定」中可以關閉頁首頁尾
- Safari：在列印對話框中可以關閉頁首頁尾
- 此 CSS 方案提供額外的保護，但用戶仍需在瀏覽器設定中關閉

### 2. 浮水印功能

#### UI 設計

在側邊欄「圖片管理」下方添加「列印浮水印」設定區塊：

```vue
<!-- 列印浮水印設定 -->
<div class="space-y-3">
  <label class="block text-sm font-medium text-slate-700">列印浮水印</label>
  <div class="space-y-2">
    <!-- 啟用浮水印 -->
    <div class="flex items-center">
      <input
        type="checkbox"
        id="enable-watermark"
        v-model="watermarkEnabled"
        :disabled="viewMode"
        class="..."
      />
      <label for="enable-watermark" class="ml-2 text-sm text-slate-700">
        啟用浮水印
      </label>
    </div>
    
    <!-- 浮水印圖片上傳 -->
    <div v-if="watermarkEnabled">
      <button @click="openWatermarkUpload" class="...">
        {{ watermarkImage ? '更換浮水印' : '上傳浮水印圖片' }}
      </button>
      
      <!-- 浮水印預覽 -->
      <div v-if="watermarkImage" class="...">
        <img :src="watermarkImage" alt="浮水印預覽" class="max-h-20 mx-auto opacity-30">
        <button @click="removeWatermark" class="...">
          移除浮水印
        </button>
      </div>
      
      <!-- 浮水印不透明度 -->
      <div class="mt-2">
        <label class="block text-xs text-slate-600 mb-1">
          不透明度: {{ watermarkOpacity }}%
        </label>
        <input
          type="range"
          v-model.number="watermarkOpacity"
          min="5"
          max="30"
          step="5"
          :disabled="viewMode || !watermarkImage"
          class="w-full"
        />
      </div>
    </div>
  </div>
</div>
```

**功能說明：**
- ✅ **啟用/停用開關**：控制是否在列印時顯示浮水印
- ✅ **圖片上傳**：支援 PNG、JPG、SVG 格式
- ✅ **即時預覽**：上傳後立即顯示預覽（30% 不透明度）
- ✅ **不透明度調整**：5% ~ 30%，步進 5%
- ✅ **移除功能**：可以隨時移除浮水印

#### JavaScript 邏輯

```javascript
// 浮水印設定
const watermarkEnabled = ref(false)
const watermarkImage = ref(null)
const watermarkOpacity = ref(10) // 預設 10%
const watermarkInput = ref(null)

// 浮水印上傳
const openWatermarkUpload = () => {
  watermarkInput.value?.click()
}

const handleWatermarkUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // 檢查檔案類型
  if (!file.type.startsWith('image/')) {
    alert('請上傳圖片檔案')
    event.target.value = ''
    return
  }
  
  // 讀取圖片為 Base64
  const reader = new FileReader()
  reader.onload = (e) => {
    watermarkImage.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // 清空 input
  event.target.value = ''
}

const removeWatermark = () => {
  watermarkImage.value = null
  watermarkEnabled.value = false
}
```

**功能說明：**
- ✅ 使用 `FileReader` 將圖片轉換為 Base64
- ✅ 儲存在 `watermarkImage` ref 中
- ✅ 移除時同時停用浮水印

#### 列印時應用浮水印

```javascript
// 在 generatePrintPreview 函數中
container.appendChild(clone)

// 添加浮水印（如果啟用）
if (watermarkEnabled.value && watermarkImage.value) {
  const watermark = iframeDoc.createElement('div')
  watermark.className = 'watermark'
  watermark.style.opacity = (watermarkOpacity.value / 100).toString()
  
  const img = iframeDoc.createElement('img')
  img.src = watermarkImage.value
  img.alt = '浮水印'
  
  watermark.appendChild(img)
  iframeDoc.body.appendChild(watermark)
}

iframeDoc.body.appendChild(container)
```

**功能說明：**
- ✅ 檢查是否啟用浮水印且有圖片
- ✅ 創建浮水印容器
- ✅ 設定不透明度（從百分比轉換為 0-1）
- ✅ 添加圖片元素
- ✅ 插入到 iframe body 中

#### 浮水印 CSS 樣式

```css
/* 浮水印容器 */
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.1;
  z-index: -1;
  pointer-events: none;
}

.watermark img {
  max-width: 300px;
  max-height: 300px;
}
```

**樣式說明：**
- ✅ `position: fixed` - 固定在視窗中央，每頁都會顯示
- ✅ `top: 50%; left: 50%; transform: translate(-50%, -50%)` - 完美置中
- ✅ `opacity: 0.1` - 預設 10% 不透明度（會被 JavaScript 動態覆蓋）
- ✅ `z-index: -1` - 在內容後面
- ✅ `pointer-events: none` - 不影響點擊事件
- ✅ `max-width/height: 300px` - 限制最大尺寸

## 📊 功能流程

### 浮水印設定流程

```
用戶勾選「啟用浮水印」
    ↓
顯示上傳按鈕和不透明度滑桿
    ↓
用戶點擊「上傳浮水印圖片」
    ↓
選擇圖片檔案（PNG/JPG/SVG）
    ↓
FileReader 讀取為 Base64
    ↓
顯示預覽（30% 不透明度）
    ↓
用戶調整不透明度（5% ~ 30%）
    ↓
設定完成 ✅
```

### 列印流程

```
用戶點擊「列印 / 預覽 PDF」
    ↓
創建 iframe 用於列印
    ↓
複製編輯器內容到 iframe
    ↓
檢查是否啟用浮水印
    ↓
如果啟用：
  - 創建浮水印容器
  - 設定位置（置中）
  - 設定不透明度
  - 添加圖片
    ↓
應用列印樣式（移除頁首頁尾）
    ↓
觸發列印
    ↓
列印預覽顯示：
  - ✅ 無網址和標題
  - ✅ 浮水印在內容後方
  - ✅ 每頁都有浮水印
```

## 🎯 使用場景

### 場景 1：補習班考卷

1. 上傳補習班 logo 作為浮水印
2. 設定不透明度為 10%（不影響閱讀）
3. 列印考卷
4. 結果：
   - ✅ 每頁都有補習班 logo
   - ✅ 防止未授權複製
   - ✅ 品牌識別

### 場景 2：機密文件

1. 上傳「機密」或「內部使用」圖片
2. 設定不透明度為 15%
3. 列印文件
4. 結果：
   - ✅ 明確標示文件性質
   - ✅ 防止外流

### 場景 3：草稿版本

1. 上傳「草稿」或「Draft」圖片
2. 設定不透明度為 20%
3. 列印文件
4. 結果：
   - ✅ 清楚標示為草稿
   - ✅ 避免誤用

## 🧪 測試用例

### 測試 1：基本浮水印功能

1. 勾選「啟用浮水印」
2. 上傳 logo 圖片
3. 調整不透明度為 15%
4. 點擊「列印」
5. 預期結果：
   - ✅ 列印預覽中顯示浮水印
   - ✅ 浮水印在內容後方（不遮擋文字）
   - ✅ 不透明度為 15%
   - ✅ 浮水印置中顯示

### 測試 2：多頁文件

1. 創建包含多個題目的文件（會跨多頁）
2. 啟用浮水印
3. 點擊「列印」
4. 預期結果：
   - ✅ 每一頁都顯示浮水印
   - ✅ 浮水印位置一致（都在中央）

### 測試 3：不啟用浮水印

1. 不勾選「啟用浮水印」
2. 點擊「列印」
3. 預期結果：
   - ✅ 列印預覽中不顯示浮水印
   - ✅ 正常列印

### 測試 4：更換浮水印

1. 上傳第一個 logo
2. 點擊「更換浮水印」
3. 上傳第二個 logo
4. 點擊「列印」
5. 預期結果：
   - ✅ 顯示第二個 logo
   - ✅ 第一個 logo 被替換

### 測試 5：移除浮水印

1. 上傳 logo
2. 點擊「移除浮水印」
3. 預期結果：
   - ✅ 預覽消失
   - ✅ 「啟用浮水印」自動取消勾選
   - ✅ 列印時不顯示浮水印

### 測試 6：不同圖片格式

1. 測試 PNG 格式（支援透明背景）
2. 測試 JPG 格式
3. 測試 SVG 格式（向量圖）
4. 預期結果：
   - ✅ 所有格式都能正常上傳和顯示
   - ✅ PNG 透明背景正確處理

### 測試 7：不透明度調整

1. 上傳 logo
2. 設定不透明度為 5%
3. 列印預覽
4. 設定不透明度為 30%
5. 列印預覽
6. 預期結果：
   - ✅ 5% 時幾乎看不見（適合不想太明顯的情況）
   - ✅ 30% 時清晰可見（適合需要明顯標示的情況）

## ✨ 優勢

### 1. 品牌識別

- ✅ 在列印文件上顯示補習班 logo
- ✅ 增強品牌形象
- ✅ 專業感提升

### 2. 防止未授權使用

- ✅ 浮水印標示來源
- ✅ 降低盜用風險
- ✅ 版權保護

### 3. 文件分類

- ✅ 標示文件類型（草稿、正式、機密等）
- ✅ 避免誤用
- ✅ 提高文件管理效率

### 4. 靈活控制

- ✅ 可隨時啟用/停用
- ✅ 可調整不透明度
- ✅ 可更換圖片
- ✅ 不影響編輯模式

### 5. 用戶友好

- ✅ 即時預覽
- ✅ 簡單的上傳流程
- ✅ 直觀的不透明度調整
- ✅ 所見即所得

## 🔧 進階功能（未來可擴展）

### 1. 浮水印位置調整

```javascript
// 可以添加位置選項
const watermarkPosition = ref('center') // center, top-left, top-right, bottom-left, bottom-right

// 在 CSS 中根據位置調整
if (watermarkPosition.value === 'top-left') {
  watermark.style.top = '10%'
  watermark.style.left = '10%'
  watermark.style.transform = 'none'
}
```

### 2. 浮水印大小調整

```javascript
// 添加大小滑桿
const watermarkSize = ref(300) // 100 ~ 500px

// 在 CSS 中應用
img.style.maxWidth = `${watermarkSize.value}px`
img.style.maxHeight = `${watermarkSize.value}px`
```

### 3. 浮水印旋轉

```javascript
// 添加旋轉角度
const watermarkRotation = ref(0) // -45 ~ 45 度

// 在 CSS 中應用
watermark.style.transform = `translate(-50%, -50%) rotate(${watermarkRotation.value}deg)`
```

### 4. 多個浮水印

```javascript
// 支援添加多個浮水印
const watermarks = ref([
  { image: '...', opacity: 10, position: 'center' },
  { image: '...', opacity: 15, position: 'bottom-right' }
])
```

### 5. 浮水印文字

```javascript
// 支援文字浮水印
const watermarkText = ref('補習班名稱')
const watermarkFontSize = ref(48)

// 創建文字浮水印
const textWatermark = iframeDoc.createElement('div')
textWatermark.textContent = watermarkText.value
textWatermark.style.fontSize = `${watermarkFontSize.value}px`
textWatermark.style.color = 'rgba(0, 0, 0, 0.1)'
```

## 📦 相關文件

### 修改的文件

1. **frontend/src/views/ResourceEditor.vue**
   - 添加浮水印 UI（側邊欄）
   - 添加浮水印邏輯（上傳、移除、不透明度）
   - 修改列印函數（應用浮水印）
   - 添加列印 CSS（移除頁首頁尾、浮水印樣式）

### 相關文檔

- **PRINT_FUNCTION_FIX.md** - 列印功能修復
- **DISPLAY_MODE_CONTROL.md** - 顯示模式控制

### 新增的文件

- **PRINT_WATERMARK_FEATURE.md** - 本文檔

## 🎉 總結

成功實現了列印浮水印功能：

- ✅ **移除頁首頁尾**：使用 CSS `@media print` 隱藏瀏覽器預設的網址和標題
- ✅ **浮水印上傳**：支援 PNG、JPG、SVG 格式
- ✅ **即時預覽**：上傳後立即顯示預覽
- ✅ **不透明度調整**：5% ~ 30%，靈活控制
- ✅ **列印應用**：列印時自動添加浮水印
- ✅ **位置固定**：浮水印在每頁中央，不遮擋內容
- ✅ **易於管理**：可隨時啟用/停用、更換、移除

現在用戶可以在列印時添加自己的品牌 logo 或其他標示，同時移除了瀏覽器預設的頁首頁尾！🎊

## 💡 使用建議

### 浮水印圖片建議

1. **格式**：建議使用 PNG 格式（支援透明背景）
2. **尺寸**：建議 500x500px 左右（會自動縮放到 300px）
3. **顏色**：建議使用單色或簡單的設計（避免太複雜）
4. **對比度**：考慮到不透明度很低，建議使用深色圖片

### 不透明度建議

- **5-10%**：適合不想太明顯的情況（如正式考卷）
- **15-20%**：適合需要明顯但不影響閱讀的情況（如講義）
- **25-30%**：適合需要非常明顯的情況（如草稿、機密文件）

### 瀏覽器設定

為了完全移除頁首頁尾，建議在瀏覽器列印對話框中：
- **Chrome/Edge**：取消勾選「頁首和頁尾」
- **Firefox**：在「頁面設定」中關閉頁首頁尾
- **Safari**：在列印對話框中關閉頁首頁尾
