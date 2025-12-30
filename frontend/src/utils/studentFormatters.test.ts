import { describe, it, expect } from 'vitest'
import { getDayDisplay, formatTime, formatDate, formatAmount } from './studentFormatters'

describe('studentFormatters', () => {
  describe('getDayDisplay', () => {
    it('should convert English day abbreviation to Chinese', () => {
      expect(getDayDisplay('Mon')).toBe('週一')
      expect(getDayDisplay('Tue')).toBe('週二')
      expect(getDayDisplay('Wed')).toBe('週三')
      expect(getDayDisplay('Thu')).toBe('週四')
      expect(getDayDisplay('Fri')).toBe('週五')
      expect(getDayDisplay('Sat')).toBe('週六')
      expect(getDayDisplay('Sun')).toBe('週日')
    })

    it('should return original value if not in map', () => {
      expect(getDayDisplay('Monday')).toBe('Monday')
      expect(getDayDisplay('Invalid')).toBe('Invalid')
      expect(getDayDisplay('')).toBe('')
    })
  })

  describe('formatTime', () => {
    it('should format time string to HH:MM format', () => {
      expect(formatTime('14:30:00')).toBe('14:30')
      expect(formatTime('09:05:30')).toBe('09:05')
      expect(formatTime('23:59:59')).toBe('23:59')
    })

    it('should handle time string shorter than 5 characters', () => {
      expect(formatTime('14:3')).toBe('14:3')
      expect(formatTime('9:5')).toBe('9:5')
    })

    it('should return empty string for null', () => {
      expect(formatTime(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatTime(undefined)).toBe('')
    })

    it('should convert number to string', () => {
      expect(formatTime(1430 as any)).toBe('1430')
    })
  })

  describe('formatDate', () => {
    it('should replace dashes with slashes in date string', () => {
      expect(formatDate('2024-01-15')).toBe('2024/01/15')
      expect(formatDate('2023-12-31')).toBe('2023/12/31')
    })

    it('should handle date string with time', () => {
      expect(formatDate('2024-01-15T14:30:00')).toBe('2024/01/15T14:30:00')
    })

    it('should convert Date object to string', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(typeof result).toBe('string')
      expect(result).toBeTruthy()
    })

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatDate(undefined)).toBe('')
    })

    it('should handle date string without dashes', () => {
      expect(formatDate('2024/01/15')).toBe('2024/01/15')
    })
  })

  describe('formatAmount', () => {
    it('should format number with thousand separators', () => {
      expect(formatAmount(1000)).toBe('1,000')
      expect(formatAmount(10000)).toBe('10,000')
      expect(formatAmount(100000)).toBe('100,000')
      expect(formatAmount(1234567)).toBe('1,234,567')
    })

    it('should format string number with thousand separators', () => {
      expect(formatAmount('1000')).toBe('1,000')
      expect(formatAmount('12345')).toBe('12,345')
    })

    it('should handle zero', () => {
      expect(formatAmount(0)).toBe('0')
      expect(formatAmount('0')).toBe('0')
    })

    it('should handle negative numbers', () => {
      expect(formatAmount(-1000)).toBe('-1,000')
      expect(formatAmount(-12345)).toBe('-12,345')
    })

    it('should round decimal numbers', () => {
      expect(formatAmount(1234.56)).toBe('1,235')
      expect(formatAmount(1234.4)).toBe('1,234')
      expect(formatAmount(999.9)).toBe('1,000')
    })

    it('should return 0 for null', () => {
      expect(formatAmount(null)).toBe('0')
    })

    it('should return 0 for undefined', () => {
      expect(formatAmount(undefined)).toBe('0')
    })

    it('should handle empty string', () => {
      expect(formatAmount('')).toBe('0')
    })

    it('should handle invalid string', () => {
      // parseFloat('invalid') returns NaN, Math.round(NaN) returns NaN
      // NaN.toLocaleString() returns '非數值' in zh-TW locale
      const result = formatAmount('invalid')
      expect(result).toBeTruthy()
      // 可能是 '0' 或 '非數值'，取決於環境
      expect(['0', '非數值']).toContain(result)
    })
  })
})
