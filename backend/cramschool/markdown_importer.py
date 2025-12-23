# cramschool/markdown_importer.py

import re
from typing import List, Dict, Tuple, Optional, Callable


class MarkdownQuestionImporter:
    """
    從 Markdown 檔案匯入題目到題庫
    支援您提供的格式
    """
    
    def __init__(self):
        self.errors = []
    
    def parse_questions(
        self, 
        markdown_content: str,
        default_subject_id: int,
        default_level: str,
        default_chapter: str
    ) -> Tuple[List[Dict], List[str]]:
        """
        解析 Markdown 內容，提取題目
        
        Args:
            markdown_content: Markdown 檔案內容
            default_subject_id: 預設科目 ID
            default_level: 預設年級
            default_chapter: 預設章節
            
        Returns:
            (questions_list, errors_list)
        """
        # #region agent log
        import json
        with open('/home/akira/github/9Jang/.cursor/debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"initial","hypothesisId":"H1","location":"markdown_importer.py:parse_questions:entry","message":"開始解析","data":{"content_length":len(markdown_content),"content_preview":markdown_content[:300]},"timestamp":__import__('time').time()*1000}) + '\n')
        # #endregion
        
        self.errors = []
        questions = []
        
        # 分割題目（以**題型：**開始的部分）
        # 先找到所有題目段落
        lines = markdown_content.split('\n')
        current_lines = []
        in_question = False
        
        # #region agent log
        match_count = 0
        # #endregion
        
        for idx, line in enumerate(lines):
            # 檢測題目開始（數字開頭且包含【題號】）
            if re.match(r'^\d+\.\s+\*\*【題號】', line):
                # #region agent log
                match_count += 1
                with open('/home/akira/github/9Jang/.cursor/debug.log', 'a', encoding='utf-8') as f:
                    f.write(json.dumps({"sessionId":"debug-session","runId":"post-fix","hypothesisId":"H3","location":"markdown_importer.py:parse_questions:match","message":"找到題目開始行","data":{"line_index":idx,"line_content":line[:150],"match_count":match_count,"has_previous_lines":len(current_lines)>0},"timestamp":__import__('time').time()*1000}) + '\n')
                # #endregion
                
                # 如果有上一題，先處理（修復：只檢查 current_lines，不檢查不存在的 current_question）
                if current_lines:
                    parsed_q = self._parse_single_question(
                        current_lines,
                        default_subject_id,
                        default_level,
                        default_chapter
                    )
                    # #region agent log
                    with open('/home/akira/github/9Jang/.cursor/debug.log', 'a', encoding='utf-8') as f:
                        f.write(json.dumps({"sessionId":"debug-session","runId":"post-fix","hypothesisId":"H3","location":"markdown_importer.py:parse_questions:append","message":"添加解析的題目","data":{"question_added":parsed_q is not None,"total_questions_now":len(questions)+1 if parsed_q else len(questions)},"timestamp":__import__('time').time()*1000}) + '\n')
                    # #endregion
                    if parsed_q:
                        questions.append(parsed_q)
                
                # 開始新題目
                current_lines = [line]
                in_question = True
            elif in_question:
                current_lines.append(line)
        
        # #region agent log
        with open('/home/akira/github/9Jang/.cursor/debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"initial","hypothesisId":"H3","location":"markdown_importer.py:parse_questions:before_last","message":"處理最後一題前","data":{"total_matches":match_count,"current_lines_count":len(current_lines),"questions_so_far":len(questions)},"timestamp":__import__('time').time()*1000}) + '\n')
        # #endregion
        
        # 處理最後一題
        if current_lines:
            questions.append(self._parse_single_question(
                current_lines,
                default_subject_id,
                default_level,
                default_chapter
            ))
        
        # 過濾掉 None 值
        questions = [q for q in questions if q is not None]
        
        # #region agent log
        with open('/home/akira/github/9Jang/.cursor/debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"initial","hypothesisId":"H4","location":"markdown_importer.py:parse_questions:exit","message":"解析完成","data":{"final_questions_count":len(questions),"total_errors":len(self.errors),"errors":self.errors},"timestamp":__import__('time').time()*1000}) + '\n')
        # #endregion
        
        return questions, self.errors
    
    def _parse_single_question(
        self,
        lines: List[str],
        subject_id: int,
        level: str,
        chapter: str
    ) -> Optional[Dict]:
        """
        解析單一題目
        
        格式範例：
        1.  **【題號】：07107467 　　【難易度】：中　　【出處】：統測題　　【題源】：101統測C**
        
        > （　　）題目內容...
        > (A) 選項A　(B) 選項B
        
        《答案》C
        
        《解析》
        解析內容...
        
        分成三個部分：
        1. content: 題目內容（引用區塊內容）
        2. correct_answer: 答案 + 解析（合併後存入資料庫）
        3. options: 選項列表
        """
        try:
            content_str = '\n'.join(lines)
            
            # 提取題號、難度、出處等
            first_line = lines[0] if lines else ""
            
            # 題號
            question_number_match = re.search(r'【題號】：(\w+)', first_line)
            question_number = question_number_match.group(1) if question_number_match else ""
            
            # 難度
            difficulty_match = re.search(r'【難易度】：(易|中|難)', first_line)
            difficulty_str = difficulty_match.group(1) if difficulty_match else "中"
            difficulty = {'易': 1, '中': 3, '難': 5}.get(difficulty_str, 3)
            
            # 出處
            origin_match = re.search(r'【出處】：([^　]+)', first_line)
            origin = origin_match.group(1) if origin_match else ""
            
            # 題源
            source_match = re.search(r'【題源】：([^\*]+)', first_line)
            source = source_match.group(1).strip() if source_match else ""
            
            # === 第一部分：題目內容 ===
            # 提取題目內容（> 開頭的引用區塊）
            question_lines = []
            answer_section = []
            solution_section = []
            current_section = 'question'
            
            for line in lines[1:]:  # 跳過第一行（元資料）
                line_stripped = line.strip()
                
                if line_stripped.startswith('《答案》'):
                    current_section = 'answer'
                    answer_section.append(line)
                elif line_stripped.startswith('《解析》'):
                    current_section = 'solution'
                    solution_section.append(line)
                elif current_section == 'question':
                    # 題目區域：包含 > 引用和空行
                    if line_stripped.startswith('>'):
                        question_lines.append(line.lstrip('> ').strip())
                    elif line_stripped and not line_stripped.startswith('《'):
                        # 可能是圖片或其他內容
                        question_lines.append(line_stripped)
                elif current_section == 'answer':
                    answer_section.append(line)
                elif current_section == 'solution':
                    solution_section.append(line)
            
            # 組合題目內容（第一部分）
            question_content = '\n'.join(question_lines).strip()
            
            # === 第二部分：答案 ===
            # 提取答案文字
            answer_text = '\n'.join(answer_section).strip()
            answer_match = re.search(r'《答案》\s*([A-Z]|[A-Z,]+|\d+|[^\n《]+)', answer_text)
            answer_value = answer_match.group(1).strip() if answer_match else ""
            
            # === 第三部分：解析 ===
            # 組合解析內容
            solution_text = '\n'.join(solution_section).strip()
            # 移除《解析》標籤和反斜線
            solution_text = re.sub(r'《解析》\s*\\?', '', solution_text).strip()
            
            # === 合併答案和解析（存入 correct_answer 欄位）===
            # 格式：答案標題 + 答案值 + 解析內容
            if solution_text:
                full_answer_content = f"**《答案》{answer_value}**\n\n**《解析》**\n\n{solution_text}"
            else:
                full_answer_content = f"**《答案》{answer_value}**"
            
            # 判斷題型
            question_type = 'SINGLE_CHOICE'  # 預設單選題
            if '(A)' in question_content or '（A）' in question_content:
                question_type = 'SINGLE_CHOICE'
                # 檢查是否為多選（如果答案包含逗號或多個字母）
                if ',' in answer_value or len(answer_value) > 1:
                    question_type = 'MULTIPLE_CHOICE'
            
            # 提取選項
            options = []
            # 支援兩種格式：(A) 和 （A）
            option_pattern = r'[(\（]([A-Z])[)\）]\s*\$?([^(\（\n]+?)(?=\s*[(\（]|$)'
            option_matches = re.findall(option_pattern, question_content)
            
            for letter, text in option_matches:
                # 清理選項文字
                text_cleaned = text.strip()
                # 移除尾部的 $（LaTeX 符號）
                text_cleaned = re.sub(r'\$$', '', text_cleaned).strip()
                # 移除多餘的　和空白
                text_cleaned = text_cleaned.replace('　', ' ').strip()
                
                options.append({
                    'value': letter,
                    'label': text_cleaned
                })
            
            return {
                'subject_id': subject_id,
                'level': level,
                'chapter': chapter,
                'content': question_content,  # 第一部分：題目內容
                'correct_answer': full_answer_content,  # 第二+三部分：答案+解析
                'difficulty': difficulty,
                'question_type': question_type,
                'options': options,
                'question_number': question_number,
                'origin': origin,
                'origin_detail': source,
                'source': source if source else origin,
            }
            
        except Exception as e:
            self.errors.append(f"解析題目失敗（{first_line[:50] if 'first_line' in locals() else '未知'}）：{str(e)}")
            return None
    
    def import_questions_with_images(
        self,
        markdown_content: str,
        images_dict: Dict[str, bytes],
        default_subject_id: int,
        default_level: str,
        default_chapter: str,
        save_images_func: Optional[Callable] = None
    ) -> Tuple[List[Dict], List[str]]:
        """
        解析 Markdown 並上傳圖片
        
        Args:
            markdown_content: Markdown 內容
            images_dict: {filename: file_bytes} 圖片字典
            default_subject_id: 科目 ID
            default_level: 年級
            default_chapter: 章節
            save_images_func: 保存圖片的回調函數
            
        Returns:
            (questions_list, errors_list)
        """
        # 先解析題目
        questions, errors = self.parse_questions(
            markdown_content,
            default_subject_id,
            default_level,
            default_chapter
        )
        
        # 如果有圖片和保存函數，處理圖片上傳
        if save_images_func and images_dict:
            image_mapping = {}
            
            # 上傳所有圖片
            for filename, file_bytes in images_dict.items():
                try:
                    # 生成唯一檔名
                    import uuid
                    ext = filename.split('.')[-1]
                    unique_filename = f"{uuid.uuid4().hex}.{ext}"
                    
                    # 保存圖片並獲取 URL
                    image_url = save_images_func(file_bytes, unique_filename)
                    
                    # 建立映射（原始檔名 -> URL）
                    image_mapping[filename] = image_url
                    
                    # 也映射 ./media/filename 格式
                    image_mapping[f"./media/{filename}"] = image_url
                    
                except Exception as e:
                    errors.append(f"上傳圖片 {filename} 失敗：{str(e)}")
            
            # 替換題目和答案中的圖片路徑
            for question in questions:
                # 替換題目內容中的圖片
                question['content'] = self._replace_image_paths(
                    question['content'],
                    image_mapping
                )
                # 替換答案中的圖片
                question['correct_answer'] = self._replace_image_paths(
                    question['correct_answer'],
                    image_mapping
                )
        
        return questions, errors
    
    def _replace_image_paths(self, text: str, image_mapping: Dict[str, str]) -> str:
        """
        替換文字中的圖片路徑
        
        格式：![說明](./media/image.png) -> ![說明](https://...)
        """
        def replace_match(match):
            alt_text = match.group(1)
            original_path = match.group(2)
            
            # 嘗試找到對應的 URL
            # 先嘗試完整路徑
            if original_path in image_mapping:
                return f'![{alt_text}]({image_mapping[original_path]})'
            
            # 嘗試只用檔名
            filename = original_path.split('/')[-1]
            if filename in image_mapping:
                return f'![{alt_text}]({image_mapping[filename]})'
            
            # 如果找不到，保留原路徑
            return match.group(0)
        
        # 匹配 ![...](...) 格式
        pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        return re.sub(pattern, replace_match, text)

