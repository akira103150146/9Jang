import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useTagManagement } from './useTagManagement'
import type { LearningResource, Tag } from '@9jang/shared'

describe('useTagManagement', () => {
  describe('with Ref resource and Ref tags', () => {
    it('should get tag name by id', () => {
      const resource = ref<LearningResource>({
        resource_id: 1,
        title: 'Test',
        tag_ids: []
      } as LearningResource)
      
      const availableTags = ref<Tag[]>([
        { tag_id: 1, tag_name: 'Tag 1' },
        { tag_id: 2, tag_name: 'Tag 2' }
      ])
      
      const { getTagName } = useTagManagement(resource, availableTags)
      
      expect(getTagName(1)).toBe('Tag 1')
      expect(getTagName(2)).toBe('Tag 2')
      expect(getTagName(999)).toBe('Unknown')
    })

    it('should add tag to resource', () => {
      const resource = ref<LearningResource>({
        resource_id: 1,
        title: 'Test',
        tag_ids: []
      } as LearningResource)
      
      const availableTags = ref<Tag[]>([])
      const { addTag } = useTagManagement(resource, availableTags)
      
      addTag(1)
      
      expect(resource.value.tag_ids).toEqual([1])
    })

    it('should not add duplicate tag', () => {
      const resource = ref<LearningResource>({
        resource_id: 1,
        title: 'Test',
        tag_ids: [1]
      } as LearningResource)
      
      const availableTags = ref<Tag[]>([])
      const { addTag } = useTagManagement(resource, availableTags)
      
      addTag(1)
      
      expect(resource.value.tag_ids).toEqual([1])
    })

    it('should add multiple tags', () => {
      const resource = ref<LearningResource>({
        resource_id: 1,
        title: 'Test',
        tag_ids: [1]
      } as LearningResource)
      
      const availableTags = ref<Tag[]>([])
      const { addTag } = useTagManagement(resource, availableTags)
      
      addTag(2)
      addTag(3)
      
      expect(resource.value.tag_ids).toEqual([1, 2, 3])
    })

    it('should remove tag from resource', () => {
      const resource = ref<LearningResource>({
        resource_id: 1,
        title: 'Test',
        tag_ids: [1, 2, 3]
      } as LearningResource)
      
      const availableTags = ref<Tag[]>([])
      const { removeTag } = useTagManagement(resource, availableTags)
      
      removeTag(2)
      
      expect(resource.value.tag_ids).toEqual([1, 3])
    })

    it('should handle removing non-existent tag', () => {
      const resource = ref<LearningResource>({
        resource_id: 1,
        title: 'Test',
        tag_ids: [1, 2]
      } as LearningResource)
      
      const availableTags = ref<Tag[]>([])
      const { removeTag } = useTagManagement(resource, availableTags)
      
      removeTag(999)
      
      expect(resource.value.tag_ids).toEqual([1, 2])
    })

    it('should handle resource without tag_ids', () => {
      const resource = ref<LearningResource>({
        resource_id: 1,
        title: 'Test'
      } as LearningResource)
      
      const availableTags = ref<Tag[]>([])
      const { addTag } = useTagManagement(resource, availableTags)
      
      addTag(1)
      
      expect(resource.value.tag_ids).toEqual([1])
    })

    it('should handle string tag id', () => {
      const resource = ref<LearningResource>({
        resource_id: 1,
        title: 'Test',
        tag_ids: []
      } as LearningResource)
      
      const availableTags = ref<Tag[]>([])
      const { addTag } = useTagManagement(resource, availableTags)
      
      addTag('1')
      
      expect(resource.value.tag_ids).toEqual([1])
    })
  })

  describe('with non-Ref resource and non-Ref tags', () => {
    it('should work with plain objects', () => {
      const resource: LearningResource = {
        resource_id: 1,
        title: 'Test',
        tag_ids: []
      } as LearningResource
      
      const availableTags: Tag[] = [
        { tag_id: 1, tag_name: 'Tag 1' }
      ]
      
      const { getTagName, addTag, removeTag } = useTagManagement(resource, availableTags)
      
      expect(getTagName(1)).toBe('Tag 1')
      
      addTag(1)
      expect(resource.tag_ids).toEqual([1])
      
      removeTag(1)
      expect(resource.tag_ids).toEqual([])
    })
  })
})
