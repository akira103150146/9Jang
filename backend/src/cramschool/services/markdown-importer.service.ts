import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface ParsedMarkdownQuestion {
  subject_id: number;
  level: string;
  chapter: string;
  content: string;
  correct_answer: string;
  solution_content?: {
    format: 'markdown';
    text: string;
  };
  difficulty: number;
  question_type: string;
  options: Array<{ value: string; label: string }>;
  question_number: string;
  origin: string;
  origin_detail: string;
  source: string;
}

@Injectable()
export class MarkdownImporterService {
  async importQuestions(
    markdownContent: string,
    imagesDict: Record<string, Buffer>,
    defaultSubjectId: number,
    defaultLevel: string,
    defaultChapter: string,
    saveImagesFunc?: (imageBytes: Buffer, filename: string) => Promise<string>,
  ): Promise<{ questions: ParsedMarkdownQuestion[]; errors: string[] }> {
    const errors: string[] = [];
    const questions: ParsedMarkdownQuestion[] = [];

    try {
      const lines = markdownContent.split('\n');
      let currentLines: string[] = [];
      let inQuestion = false;

      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];

        // 檢測題目開始（數字開頭且包含【題號】）
        if (/^\d+\.\s+\*\*【題號】/.test(line)) {
          // 如果有上一題，先處理
          if (currentLines.length > 0) {
            const parsedQ = this.parseSingleQuestion(
              currentLines,
              defaultSubjectId,
              defaultLevel,
              defaultChapter,
            );
            if (parsedQ) {
              questions.push(parsedQ);
            }
          }

          // 開始新題目
          currentLines = [line];
          inQuestion = true;
        } else if (inQuestion) {
          currentLines.push(line);
        }
      }

      // 處理最後一題
      if (currentLines.length > 0) {
        const parsedQ = this.parseSingleQuestion(
          currentLines,
          defaultSubjectId,
          defaultLevel,
          defaultChapter,
        );
        if (parsedQ) {
          questions.push(parsedQ);
        }
      }

      // 處理圖片替換
      if (saveImagesFunc && imagesDict && Object.keys(imagesDict).length > 0) {
        const imageMapping: Record<string, string> = {};

        // 上傳所有圖片並建立映射
        for (const [filename, fileBytes] of Object.entries(imagesDict)) {
          try {
            const ext = filename.split('.').pop() || 'png';
            const uniqueFilename = `${uuidv4().replace(/-/g, '')}.${ext}`;
            const imageUrl = await saveImagesFunc(fileBytes, uniqueFilename);
            imageMapping[filename] = imageUrl;
            imageMapping[`./media/${filename}`] = imageUrl;
          } catch (error: any) {
            errors.push(`上傳圖片 ${filename} 失敗：${error.message}`);
          }
        }

        // 替換題目、答案和解析中的圖片路徑
        for (const question of questions) {
          question.content = this.replaceImagePaths(question.content, imageMapping);
          question.correct_answer = this.replaceImagePaths(question.correct_answer, imageMapping);
          if (question.solution_content?.text) {
            question.solution_content.text = this.replaceImagePaths(
              question.solution_content.text,
              imageMapping,
            );
          }
        }
      }

      return { questions, errors };
    } catch (error: any) {
      errors.push(`解析 Markdown 失敗：${error.message}`);
      return { questions, errors };
    }
  }

  private parseSingleQuestion(
    lines: string[],
    subjectId: number,
    level: string,
    chapter: string,
  ): ParsedMarkdownQuestion | null {
    try {
      const firstLine = lines[0] || '';

      // 提取題號
      const questionNumberMatch = firstLine.match(/【題號】：(\w+)/);
      const questionNumber = questionNumberMatch ? questionNumberMatch[1] : '';

      // 難度
      const difficultyMatch = firstLine.match(/【難易度】：(易|中|難)/);
      const difficultyStr = difficultyMatch ? difficultyMatch[1] : '中';
      const difficulty = { 易: 1, 中: 3, 難: 5 }[difficultyStr] || 3;

      // 出處
      const originMatch = firstLine.match(/【出處】：([^　]+)/);
      const origin = originMatch ? originMatch[1] : '';

      // 題源
      const sourceMatch = firstLine.match(/【題源】：([^\*]+)/);
      const source = sourceMatch ? sourceMatch[1].trim() : '';

      // 提取題目內容、答案、解析
      const questionLines: string[] = [];
      const answerSection: string[] = [];
      const solutionSection: string[] = [];
      let currentSection: 'question' | 'answer' | 'solution' = 'question';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const stripped = line.trim();

        if (stripped.startsWith('《答案》')) {
          currentSection = 'answer';
          answerSection.push(line);
        } else if (stripped.startsWith('《解析》')) {
          currentSection = 'solution';
          solutionSection.push(line);
        } else if (currentSection === 'question') {
          if (stripped.startsWith('>')) {
            questionLines.push(line.replace(/^>\s*/, '').trim());
          } else if (stripped && !stripped.startsWith('《')) {
            questionLines.push(stripped);
          }
        } else if (currentSection === 'answer') {
          answerSection.push(line);
        } else if (currentSection === 'solution') {
          solutionSection.push(line);
        }
      }

      // 組合題目內容
      const questionContent = questionLines.join('\n').trim();

      // 提取答案
      const answerText = answerSection.join('\n').trim();
      const answerMatch = answerText.match(/《答案》\s*([A-Z]|[A-Z,]+|\d+|[^\n《]+)/);
      const answerValue = answerMatch ? answerMatch[1].trim() : '';

      // 提取解析
      let solutionText = solutionSection.join('\n').trim();
      solutionText = solutionText.replace(/《解析》\s*\\?/, '').trim();

      // 判斷題型
      let questionType = 'SINGLE_CHOICE';
      if (questionContent.includes('(A)') || questionContent.includes('（A）')) {
        if (answerValue.includes(',') || answerValue.length > 1) {
          questionType = 'MULTIPLE_CHOICE';
        }
      }

      // 提取選項
      const options: Array<{ value: string; label: string }> = [];
      const optionPattern = /[(\（]([A-Z])[)\）]\s*\$?([^(\（\n]+?)(?=\s*[(\（]|$)/g;
      let optionMatch;
      while ((optionMatch = optionPattern.exec(questionContent)) !== null) {
        const letter = optionMatch[1];
        let text = optionMatch[2].trim();
        text = text.replace(/\$$/, '').replace(/　/g, ' ').trim();
        options.push({ value: letter, label: text });
      }

      // 構建答案和解析
      const correctAnswerContent = `**《答案》${answerValue}**`;
      const solutionContent = solutionText
        ? {
            format: 'markdown' as const,
            text: solutionText,
          }
        : undefined;

      return {
        subject_id: subjectId,
        level,
        chapter,
        content: questionContent,
        correct_answer: correctAnswerContent,
        solution_content: solutionContent,
        difficulty,
        question_type: questionType,
        options,
        question_number: questionNumber,
        origin,
        origin_detail: source,
        source: source || origin,
      };
    } catch (error: any) {
      return null;
    }
  }

  private replaceImagePaths(text: string, imageMapping: Record<string, string>): string {
    // 替換 Markdown 圖片格式：![alt](./media/filename.png) -> ![alt](actual_url)
    return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, originalPath) => {
      // 嘗試找到對應的 URL
      if (originalPath in imageMapping) {
        return `![${altText}](${imageMapping[originalPath]})`;
      }
      // 嘗試 ./media/filename 格式
      if (`./media/${originalPath}` in imageMapping) {
        return `![${altText}](${imageMapping[`./media/${originalPath}`]})`;
      }
      // 如果找不到映射，保留原始路徑
      return match;
    });
  }
}
