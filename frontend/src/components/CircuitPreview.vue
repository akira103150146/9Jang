<template>
  <div class="circuit-preview">
    <div v-if="backupImage" class="backup-image" v-html="backupImageHtml"></div>
    <div v-else-if="svgHtml" class="svg" v-html="svgHtml"></div>
    <div v-else class="placeholder">[電路圖]（請提供 circuit_data.elements 或 backup_image）</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CircuitElement {
  type: string
  data?: {
    position?: [number, number]
    value?: string
    [key: string]: unknown
  }
  position?: [number, number]
  [key: string]: unknown
}

interface CircuitData {
  elements?: CircuitElement[]
  [key: string]: unknown
}

interface Data {
  circuit_data?: CircuitData
  circuitData?: CircuitData
  backup_image?: string
  backupImage?: string
  elements?: CircuitElement[]
  [key: string]: unknown
}

interface Props {
  data?: Data | CircuitData
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({})
})

const backupImage = computed<string>(() => {
  if (!props.data || typeof props.data !== 'object') return ''
  const data = props.data as Data
  return data.backup_image || data.backupImage || ''
})

const circuitData = computed<CircuitData | null>(() => {
  if (!props.data || typeof props.data !== 'object') return null
  const data = props.data as Data
  if (data.circuit_data) return data.circuit_data
  if (data.circuitData) return data.circuitData
  // 允許直接給 {elements:[...]}
  if (Array.isArray(data.elements)) return data as CircuitData
  return null
})

const backupImageHtml = computed<string>(() => {
  const src = backupImage.value
  if (!src) return ''
  if (typeof src === 'string' && src.startsWith('data:image/svg+xml')) {
    return `<img src="${src}" alt="電路圖" style="max-width: 100%; height: auto;" />`
  }
  if (typeof src === 'string' && src.startsWith('<svg')) return src
  return `<img src="${src}" alt="電路圖" style="max-width: 100%; height: auto;" />`
})

const svgHtml = computed<string>(() => {
  const cd = circuitData.value
  const els = cd?.elements

  if (!cd || !Array.isArray(els) || els.length === 0) return ''

  // 簡易 SVG renderer（依 position 畫符號；不處理連線，先以元件視覺化為主）
  const width = 900
  const height = 520
  const parts: string[] = []

  const esc = (s: unknown): string => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  els.forEach((el: CircuitElement) => {
    const type = el?.type
    const pos = el?.data?.position || el?.position || ([100, 100] as [number, number])
    const x = Number(pos[0]) || 100
    const y = Number(pos[1]) || 100
    const value = el?.data?.value

    switch (type) {
      case 'resistor': {
        parts.push(`<rect x="${x}" y="${y - 10}" width="60" height="20" fill="white" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x - 20}" y1="${y}" x2="${x}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x + 60}" y1="${y}" x2="${x + 80}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        if (value) parts.push(`<text x="${x + 30}" y="${y - 16}" text-anchor="middle" font-size="12" fill="#334155">${esc(value)}</text>`)
        break
      }
      case 'capacitor': {
        parts.push(`<line x1="${x}" y1="${y - 20}" x2="${x}" y2="${y + 20}" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x + 30}" y1="${y - 20}" x2="${x + 30}" y2="${y + 20}" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x - 20}" y1="${y}" x2="${x}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x + 30}" y1="${y}" x2="${x + 50}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        if (value) parts.push(`<text x="${x + 15}" y="${y - 26}" text-anchor="middle" font-size="12" fill="#334155">${esc(value)}</text>`)
        break
      }
      case 'inductor': {
        parts.push(`<line x1="${x - 20}" y1="${y}" x2="${x}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        for (let i = 0; i < 4; i++) {
          const cx = x + i * 15
          parts.push(`<circle cx="${cx}" cy="${y}" r="10" fill="none" stroke="#111827" stroke-width="2" />`)
        }
        parts.push(`<line x1="${x + 45}" y1="${y}" x2="${x + 65}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        if (value) parts.push(`<text x="${x + 20}" y="${y - 26}" text-anchor="middle" font-size="12" fill="#334155">${esc(value)}</text>`)
        break
      }
      case 'voltage': {
        parts.push(`<circle cx="${x}" cy="${y}" r="20" fill="white" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}" stroke="#111827" stroke-width="2" />`)
        if (value) parts.push(`<text x="${x}" y="${y - 28}" text-anchor="middle" font-size="12" fill="#334155">${esc(value)}</text>`)
        break
      }
      case 'current': {
        parts.push(`<circle cx="${x}" cy="${y}" r="20" fill="white" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        parts.push(`<polygon points="${x + 8},${y} ${x + 2},${y - 4} ${x + 2},${y + 4}" fill="#111827" />`)
        if (value) parts.push(`<text x="${x}" y="${y - 28}" text-anchor="middle" font-size="12" fill="#334155">${esc(value)}</text>`)
        break
      }
      case 'switch': {
        parts.push(`<line x1="${x - 20}" y1="${y}" x2="${x}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x}" y1="${y - 16}" x2="${x + 20}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        parts.push(`<line x1="${x + 20}" y1="${y}" x2="${x + 40}" y2="${y}" stroke="#111827" stroke-width="2" />`)
        break
      }
      default: {
        parts.push(`<rect x="${x}" y="${y - 12}" width="90" height="24" fill="white" stroke="#cbd5e1" />`)
        parts.push(`<text x="${x + 45}" y="${y + 5}" text-anchor="middle" font-size="12" fill="#475569">${esc(type || 'unknown')}</text>`)
        break
      }
    }
  })

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
    ${parts.join('\n')}
  </svg>`

  return svg
})
</script>

<style scoped>
.circuit-preview {
  border: 1px dashed rgb(203, 213, 225);
  border-radius: 0.5rem;
  background: rgb(248, 250, 252);
  padding: 0.75rem;
}

.placeholder {
  padding: 1.25rem;
  text-align: center;
  color: rgb(100, 116, 139);
}

.backup-image :deep(svg) {
  max-width: 100%;
  height: auto;
}

.svg :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>

