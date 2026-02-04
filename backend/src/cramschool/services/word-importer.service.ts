import { Injectable, BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';

export interface ParsedQuestion {
  question_number?: string;
  question_id?: string;
  difficulty: number;
  origin: string;
  origin_detail: string;
  content: string;
  options: Array<{ letter: string; content: string }>;
  answer: string;
  explanation: string;
  image_paths?: string[];
}

@Injectable()
export class WordImporterService {
  private difficultyMap: Record<string, number> = {
    易: 1,
    簡單: 1,
    Easy: 1,
    中: 3,
    中等: 3,
    Medium: 3,
    難: 5,
    困難: 5,
    Hard: 5,
  };

  async importQuestions(
    fileContent: Buffer,
    filename: string,
    _defaultSubjectId: number,
    _defaultLevel: string,
    _defaultChapter: string,
    saveImagesFunc?: (imageBytes: Buffer, filename: string) => Promise<string>,
  ): Promise<{ questions: ParsedQuestion[]; errors: string[] }> {
    const errors: string[] = [];
    const questions: ParsedQuestion[] = [];

    try {
      // 檢查文件格式
      if (!filename.endsWith('.docx') && !filename.endsWith('.doc')) {
        throw new BadRequestException('不支援的檔案格式，請上傳 .docx 或 .doc 檔案');
      }

      // 使用 mammoth 解析 .docx 文件
      if (filename.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer: fileContent });
        const htmlResult = await mammoth.convertToHtml({ buffer: fileContent });

        // 提取圖片
        const imageMap: Record<string, string> = {};
        if (saveImagesFunc) {
          try {
            // mammoth 的圖片提取需要使用 extractRawText 的選項
            // 目前先跳過圖片處理，後續可以實現
            // TODO: 實現圖片提取和保存功能
          } catch (e) {
            // 圖片提取失敗不影響文字解析
          }
        }

        // 解析題目
        const parsed = this.parseDocxContent(result.value, htmlResult.value, imageMap);
        questions.push(...parsed.questions);
        errors.push(...parsed.errors);
      } else {
        // .doc 格式需要 textract 或其他工具
        throw new BadRequestException('.doc 格式需要額外的依賴，目前僅支援 .docx');
      }

      // 為每個題目設置預設值
      for (const q of questions) {
        if (!q.origin) {
          q.origin = '';
        }
        if (!q.origin_detail) {
          q.origin_detail = '';
        }
      }

      return { questions, errors };
    } catch (error: any) {
      errors.push(`解析檔案失敗：${error.message}`);
      return { questions, errors };
    }
  }

  private parseDocxContent(
    rawText: string,
    _htmlContent: string,
    _imageMap: Record<string, string>,
  ): { questions: ParsedQuestion[]; errors: string[] } {
    const questions: ParsedQuestion[] = [];
    const errors: string[] = [];
    const lines = rawText.split('\n').filter((line) => line.trim());

    let currentQuestion: ParsedQuestion | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // 檢測題目開始：數字開頭或【題號】
      const questionIdMatch = trimmed.match(/【題號】：\s*(\S+)/);
      const questionNumberMatch = trimmed.match(/^(\d+)[\.、\)）]/);

      if (questionIdMatch) {
        // 保存上一題
        if (currentQuestion) {
          questions.push(currentQuestion);
        }

        // 開始新題目
        currentQuestion = {
          question_number: undefined,
          question_id: questionIdMatch[1],
          difficulty: 3,
          origin: '',
          origin_detail: '',
          content: '',
          options: [],
          answer: '',
          explanation: '',
        };

        // 繼續解析這一行中的其他信息
        this.parseQuestionHeader(trimmed, currentQuestion);
        continue;
      } else if (questionNumberMatch) {
        // 保存上一題
        if (currentQuestion) {
          questions.push(currentQuestion);
        }

        // 開始新題目（數字開頭格式）
        currentQuestion = {
          question_number: questionNumberMatch[1],
          question_id: undefined,
          difficulty: 3,
          origin: '',
          origin_detail: '',
          content: '',
          options: [],
          answer: '',
          explanation: '',
        };
        continue;
      }

      // 解析題目內容
      if (currentQuestion) {
        // 題號
        if (!currentQuestion.question_id) {
          const qIdMatch = trimmed.match(/【題號】：\s*(\S+)/);
          if (qIdMatch) {
            currentQuestion.question_id = qIdMatch[1];
            continue;
          }
        }

        // 難易度
        const difficultyMatch = trimmed.match(/【難易度】：\s*(\S+)/);
        if (difficultyMatch) {
          const difficultyText = difficultyMatch[1];
          currentQuestion.difficulty = this.difficultyMap[difficultyText] || 3;
          continue;
        }

        // 出處
        const originMatch = trimmed.match(/【出處】：\s*(.+)/);
        if (originMatch) {
          currentQuestion.origin = originMatch[1].trim();
          continue;
        }

        // 題源
        const originDetailMatch = trimmed.match(/【題源】：\s*(.+)/);
        if (originDetailMatch) {
          currentQuestion.origin_detail = originDetailMatch[1].trim();
          continue;
        }

        // 答案
        const answerMatch = trimmed.match(/《答案》\s*([A-Z])/);
        if (answerMatch) {
          currentQuestion.answer = answerMatch[1];
          continue;
        }

        // 解析
        if (trimmed.includes('《解析》')) {
          const explanationText = trimmed.replace(/《解析》\s*/, '');
          if (explanationText) {
            currentQuestion.explanation = explanationText;
          }
          continue;
        }

        // 選項
        const optionMatch = trimmed.match(/^\(([A-Z])\)/);
        if (optionMatch) {
          const optionLetter = optionMatch[1];
          const optionContent = trimmed.replace(/^\([A-Z]\)\s*/, '');
          currentQuestion.options.push({
            letter: optionLetter,
            content: optionContent,
          });
          continue;
        }

        // 題目內容
        if (!currentQuestion.content) {
          currentQuestion.content = trimmed;
        } else {
          // 如果已經有選項，則可能是解析
          if (currentQuestion.options.length > 0) {
            if (!currentQuestion.explanation) {
              currentQuestion.explanation = trimmed;
            } else {
              currentQuestion.explanation += '\n\n' + trimmed;
            }
          } else {
            currentQuestion.content += '\n' + trimmed;
          }
        }
      }
    }

    // 保存最後一題
    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return { questions, errors };
  }

  private parseQuestionHeader(line: string, question: ParsedQuestion): void {
    // 難易度
    const difficultyMatch = line.match(/【難易度】：\s*(\S+)/);
    if (difficultyMatch) {
      const difficultyText = difficultyMatch[1];
      question.difficulty = this.difficultyMap[difficultyText] || 3;
    }

    // 出處
    const originMatch = line.match(/【出處】：\s*([^　]+)/);
    if (originMatch) {
      question.origin = originMatch[1].trim();
    }

    // 題源
    const originDetailMatch = line.match(/【題源】：\s*([^\*]+)/);
    if (originDetailMatch) {
      question.origin_detail = originDetailMatch[1].trim();
    }
  }
}
