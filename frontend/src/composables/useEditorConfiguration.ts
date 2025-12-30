import type { EditorOptions } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {
  LaTeXBlock,
  InlineLatex,
  ImagePlaceholder,
  TemplateBlock,
  Diagram2DBlock,
  Diagram3DBlock,
  CircuitBlock,
  QuestionBlock,
  PageBreakBlock,
  SectionBlock
} from '../components/BlockEditor/extensions'
import { SlashCommands } from '../components/BlockEditor/extensions/SlashCommands'
import { KeyboardShortcuts } from '../components/BlockEditor/extensions/KeyboardShortcuts'
import { DragHandle } from '../components/BlockEditor/extensions/DragHandle'
import { Nesting } from '../components/BlockEditor/extensions/Nesting'

/**
 * 編輯器配置選項
 */
export interface EditorConfigurationOptions {
  isHandoutMode?: boolean
  editable?: boolean
}

/**
 * 編輯器配置 Composable
 * 提供統一的編輯器擴展配置
 */
export function useEditorConfiguration(options: EditorConfigurationOptions = {}) {
  const {
    isHandoutMode = false,
    editable = true
  } = options

  /**
   * 獲取編輯器擴展列表
   */
  const getExtensions = () => {
    return [
      StarterKit.configure({
        history: {
          depth: 100
        }
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'editor-image'
        }
      }),
      LaTeXBlock,
      InlineLatex,
      ImagePlaceholder,
      TemplateBlock,
      Diagram2DBlock,
      Diagram3DBlock,
      CircuitBlock,
      QuestionBlock,
      SectionBlock,
      PageBreakBlock,
      SlashCommands.configure({
        isHandoutMode
      }),
      KeyboardShortcuts,
      DragHandle,
      Nesting
    ]
  }

  /**
   * 獲取編輯器屬性配置
   */
  const getEditorProps = (): EditorOptions['editorProps'] => {
    return {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none'
      }
    }
  }

  /**
   * 獲取編輯器選項
   */
  const getEditorOptions = (): Partial<EditorOptions> => {
    return {
      extensions: getExtensions(),
      editable,
      editorProps: getEditorProps()
    }
  }

  return {
    getExtensions,
    getEditorProps,
    getEditorOptions
  }
}
