import { describe, it, expect } from 'vitest'
import { formatTime, formatDate, formatDateTime } from './dateFormat'

describe('dateFormat', () => {
  describe('formatTime', () => {
    it('should format Date object to time string', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatTime(date)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should format date string to time string', () => {
      const result = formatTime('2024-01-15T14:30:00')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should format timestamp to time string', () => {
      const timestamp = new Date('2024-01-15T14:30:00').getTime()
      const result = formatTime(timestamp)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return empty string for null', () => {
      expect(formatTime(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatTime(undefined)).toBe('')
    })
  })

  describe('formatDate', () => {
    it('should format Date object to date string', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDate(date)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should format date string to date string', () => {
      const result = formatDate('2024-01-15T14:30:00')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should format timestamp to date string', () => {
      const timestamp = new Date('2024-01-15T14:30:00').getTime()
      const result = formatDate(timestamp)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatDate(undefined)).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('should format Date object to datetime string', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDateTime(date)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should format date string to datetime string', () => {
      const result = formatDateTime('2024-01-15T14:30:00')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should format timestamp to datetime string', () => {
      const timestamp = new Date('2024-01-15T14:30:00').getTime()
      const result = formatDateTime(timestamp)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return empty string for null', () => {
      expect(formatDateTime(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatDateTime(undefined)).toBe('')
    })
  })
})
