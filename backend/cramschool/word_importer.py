"""
Word 檔案匯入工具
支援解析 .docx 和 .doc 格式的題庫檔案
"""

import re
import io
import tempfile
import os
import uuid
from datetime import datetime
from typing import List, Dict, Optional, Tuple

try:
    from docx import Document
    from docx.document import Document as DocumentType
    from docx.oxml.ns import qn
except ImportError:
    Document = None
    DocumentType = None

try:
    import textract
except ImportError:
    textract = None

try:
    from officemath2latex import convert as omml_to_latex
except ImportError:
    omml_to_latex = None


class WordQuestionImporter:
    """
    從 Word 檔案中解析題目資訊
    """
    
    def __init__(self):
        self.difficulty_map = {
            '易': 1,
            '簡單': 1,
            'Easy': 1,
            '中': 3,
            '中等': 3,
            'Medium': 3,
            '難': 5,
            '困難': 5,
            'Hard': 5,
        }
    
    def extract_math_from_paragraph(self, para) -> str:
        """
        從段落中提取數學方程式並轉換為 LaTeX
        
        Args:
            para: python-docx Paragraph 對象
            
        Returns:
            包含 LaTeX 公式的文字（數學方程式用 $...$ 包裹）
        """
        if Document is None:
            try:
                return para.text if para.text else ''
            except:
                return ''
        
        # 如果沒有 officemath2latex，返回原始文字（可能包含 [pic]）
        if omml_to_latex is None:
            try:
                return para.text if para.text else ''
            except:
                return ''
        
        # 先獲取原始文字，確保即使後續處理失敗也能返回
        original_text = para.text or ''
        
        try:
            import xml.etree.ElementTree as ET
            
            # 獲取段落的 XML
            try:
                para_xml = para._element.xml
            except Exception:
                return original_text
            
            # 解析 XML
            try:
                root = ET.fromstring(para_xml)
            except Exception:
                return original_text
            
            # 定義命名空間
            namespaces = {
                'm': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
                'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
            }
            
            # 查找所有數學方程式（OMML）
            try:
                math_elements = root.findall('.//m:oMath', namespaces)
            except Exception:
                return original_text
            
            if not math_elements:
                return original_text
            
            # 獲取段落的文字（可能包含 [pic] 佔位符）
            text = original_text
            
            # 提取所有數學方程式的 LaTeX
            math_latex_list = []
            for math_elem in math_elements:
                try:
                    # 將 OMML 轉換為 LaTeX
                    omml_str = ET.tostring(math_elem, encoding='unicode')
                    if omml_to_latex:
                        latex_str = omml_to_latex(omml_str)
                        if latex_str and latex_str.strip():
                            math_latex_list.append(latex_str.strip())
                except Exception as e:
                    # 如果轉換失敗，跳過這個方程式，繼續處理其他內容
                    continue
            
            # 如果找到了數學方程式，替換 [pic] 佔位符
            if math_latex_list:
                # 計算 [pic] 的數量
                pic_count = text.count('[pic]')
                
                if pic_count > 0:
                    # 按順序替換 [pic] 為 LaTeX 公式
                    for latex in math_latex_list[:pic_count]:
                        # 使用行內公式格式 $...$
                        text = text.replace('[pic]', f'${latex}$', 1)
                else:
                    # 如果沒有 [pic] 佔位符，但找到了數學方程式
                    # 這可能意味著數學方程式在文字中顯示為空白
                    # 我們將 LaTeX 公式插入到文字中（在適當的位置）
                    # 為了簡單起見，我們將所有數學方程式添加到文字末尾
                    for latex in math_latex_list:
                        if text and not text.endswith(' '):
                            text += ' '
                        text += f'${latex}$'
            
            return text
            
        except Exception as e:
            # 如果提取失敗，返回原始文字
            # 確保即使出錯也能返回文字內容
            try:
                return para.text if para.text else ''
            except:
                return ''
    
    def extract_images_from_docx(self, doc: DocumentType, save_images_func) -> Dict[str, str]:
        """
        從 Word 文件中提取圖片並保存
        
        Args:
            doc: python-docx Document 對象
            save_images_func: 保存圖片的函數，接收 (image_bytes, filename) 返回保存的路徑或 URL
            
        Returns:
            圖片佔位符到實際圖片 URL 的映射字典
        """
        image_placeholders = {}
        
        if Document is None or save_images_func is None:
            return image_placeholders
        
        try:
            # 遍歷所有關係（relationships）來找到圖片
            image_index = 0
            
            # 從 Word 文件的 XML 關係中提取圖片
            # python-docx 將圖片存儲在 document.xml.rels 中
            for rel in doc.part.rels.values():
                # 檢查是否為圖片關係
                if "image" in rel.reltype:
                    try:
                        image_part = rel.target_part
                        image_bytes = image_part.blob
                        
                        # 從關係的內容類型確定圖片格式
                        content_type = image_part.content_type
                        ext = 'png'  # 默認
                        if 'jpeg' in content_type or 'jpg' in content_type:
                            ext = 'jpg'
                        elif 'png' in content_type:
                            ext = 'png'
                        elif 'gif' in content_type:
                            ext = 'gif'
                        elif 'bmp' in content_type:
                            ext = 'bmp'
                        elif 'webp' in content_type:
                            ext = 'webp'
                        
                        # 生成唯一文件名
                        filename = f"word_image_{uuid.uuid4().hex}.{ext}"
                        
                        # 保存圖片
                        image_url = save_images_func(image_bytes, filename)
                        
                        # 創建佔位符映射
                        # Word 文件中的圖片通常以 [pic] 文字形式出現
                        # 我們按順序提取圖片，並映射到 [pic], [pic], [pic] 等
                        # 使用簡單的順序匹配：第一個圖片對應第一個 [pic]，以此類推
                        placeholder = '[pic]'  # 所有 [pic] 都使用相同的佔位符
                        # 但我們需要按順序替換，所以使用列表
                        if placeholder not in image_placeholders:
                            image_placeholders[placeholder] = []
                        image_placeholders[placeholder].append(image_url)
                        image_index += 1
                    except Exception as e:
                        # 如果某個圖片提取失敗，繼續處理下一個
                        continue
        except Exception as e:
            # 如果圖片提取失敗，不影響文字解析
            pass
        
        return image_placeholders
    
    def parse_docx(self, file_content: bytes, save_images_func=None) -> Tuple[List[Dict], Dict[str, str]]:
        """
        解析 .docx 檔案
        
        Args:
            file_content: Word 檔案的二進位內容
            save_images_func: 可選的保存圖片函數，接收 (image_bytes, filename) 返回保存的路徑或 URL
            
        Returns:
            (題目列表, 圖片佔位符映射字典)
        """
        if Document is None:
            raise Exception("python-docx 套件未安裝，請執行: pip install python-docx")
        
        try:
            doc = Document(io.BytesIO(file_content))
            
            # 提取圖片
            image_placeholders = {}
            if save_images_func:
                try:
                    image_placeholders = self.extract_images_from_docx(doc, save_images_func)
                except Exception as e:
                    # 圖片提取失敗不影響文字解析
                    pass
            
            questions = []
            current_question = None
            paragraph_count = 0
            
            for para in doc.paragraphs:
                paragraph_count += 1
                try:
                    # 先嘗試提取文字和數學方程式
                    text = self.extract_math_from_paragraph(para)
                    if text:
                        text = text.strip()
                    else:
                        text = ''
                except Exception as e:
                    # 如果提取失敗，使用原始文字
                    try:
                        text = para.text.strip() if para.text else ''
                    except:
                        text = ''
                
                if not text:
                    continue
                
                # 檢測題目開始
                # 支援多種格式：
                # 1. 數字開頭：1. 或 1、 或 (1) 等
                # 2. 【題號】開頭：表示新題目開始（優先檢查）
                question_id_header_match = re.search(r'【題號】：\s*(\S+)', text)
                question_match = re.match(r'^(\d+)[\.、\)）]', text)
                
                # 如果找到【題號】標記，這表示新題目開始（優先於數字開頭格式）
                if question_id_header_match:
                    # 儲存上一題
                    if current_question:
                        questions.append(current_question)
                    
                    # 開始新題目
                    question_id = question_id_header_match.group(1)
                    current_question = {
                        'question_number': None,  # 稍後可能從題號中提取
                        'question_id': question_id,
                        'difficulty': 3,  # 預設中等，稍後從標頭中提取
                        'origin': '',
                        'origin_detail': '',
                        'content': '',
                        'options': [],
                        'answer': '',
                        'explanation': ''
                    }
                    # 繼續處理這個段落，提取其他信息（難易度、出處等）
                    # 不要 continue，讓下面的邏輯繼續處理
                elif question_match:
                    # 儲存上一題
                    if current_question:
                        questions.append(current_question)
                    
                    # 開始新題目（傳統格式：數字開頭）
                    current_question = {
                        'question_number': int(question_match.group(1)),
                        'question_id': None,
                        'difficulty': 3,  # 預設中等
                        'origin': '',
                        'origin_detail': '',
                        'content': '',
                        'options': [],
                        'answer': '',
                        'explanation': ''
                    }
                    continue
                
                # 解析題目標頭資訊（灰色背景或特殊格式）
                if current_question:
                    # 題號：07107522（如果還沒有設置，且不在題號標頭段落中）
                    if not current_question.get('question_id') and not question_id_header_match:
                        question_id_match = re.search(r'【題號】：\s*(\S+)', text)
                        if question_id_match:
                            current_question['question_id'] = question_id_match.group(1)
                            continue
                    
                    # 難易度：中
                    difficulty_match = re.search(r'【難易度】：\s*(\S+)', text)
                    if difficulty_match:
                        difficulty_text = difficulty_match.group(1)
                        current_question['difficulty'] = self.difficulty_map.get(
                            difficulty_text, 3
                        )
                        # 如果這是在題號標頭段落中，繼續處理其他信息，不要 continue
                        if not question_id_header_match:
                            continue
                    
                    # 出處：統測題
                    origin_match = re.search(r'【出處】：\s*(.+)', text)
                    if origin_match:
                        current_question['origin'] = origin_match.group(1).strip()
                        # 如果這是在題號標頭段落中，繼續處理其他信息，不要 continue
                        if not question_id_header_match:
                            continue
                    
                    # 題源：101統測B
                    origin_detail_match = re.search(r'【題源】：\s*(.+)', text)
                    if origin_detail_match:
                        current_question['origin_detail'] = origin_detail_match.group(1).strip()
                        # 如果這是在題號標頭段落中，繼續處理其他信息，不要 continue
                        if not question_id_header_match:
                            continue
                    
                    # 如果這是題號標頭段落，處理完所有標頭信息後，跳過這個段落
                    # 因為題目內容應該在下一個段落
                    if question_id_header_match:
                        continue
                    
                    # 答案：《答案》B
                    answer_match = re.search(r'《答案》\s*([A-Z])', text)
                    if answer_match:
                        current_question['answer'] = answer_match.group(1)
                        continue
                    
                    # 解析：《解析》
                    if '《解析》' in text or '解析' in text:
                        # 提取解析內容
                        explanation_text = re.sub(r'《解析》\s*', '', text)
                        if explanation_text:
                            current_question['explanation'] = explanation_text
                        continue
                    
                    # 選項檢測（A), (B), (C), (D)）
                    # 支援格式：(A) 或 A) 或 (A) 內容
                    option_match = re.match(r'^\(([A-Z])\)', text)
                    if option_match:
                        option_letter = option_match.group(1)
                        option_content = re.sub(r'^\([A-Z]\)\s*', '', text)
                        current_question['options'].append({
                            'letter': option_letter,
                            'content': option_content
                        })
                        continue
                    
                    # 檢測題目內容開始（以 "（　　　）" 或 "（" 開頭，可能包含數學方程式）
                    # 這通常表示題目內容的開始
                    question_content_match = re.match(r'^（\s*）', text) or re.match(r'^（', text)
                    
                    # 題目內容（累積）
                    # 保留 [pic] 佔位符，稍後在 convert_to_markdown 中替換為實際圖片
                    if not current_question['content']:
                        current_question['content'] = text
                    else:
                        # 如果已經有選項，則可能是解析
                        if current_question['options']:
                            if not current_question['explanation']:
                                current_question['explanation'] = text
                            else:
                                current_question['explanation'] += '\n\n' + text
                        else:
                            current_question['content'] += '\n\n' + text
            
            # 儲存最後一題
            if current_question:
                questions.append(current_question)
            
            return questions, image_placeholders
            
        except Exception as e:
            # 提供更詳細的錯誤信息
            error_msg = f"解析 Word 檔案失敗：{str(e)}"
            # 如果沒有提取到任何題目，提供額外的提示
            if 'questions' in locals() and len(questions) == 0:
                error_msg += "。請確認檔案格式正確，題目以數字開頭（如：1. 或 1、）。"
            raise Exception(error_msg)
    
    def parse_doc(self, file_content: bytes, save_images_func=None) -> Tuple[List[Dict], Dict[str, str]]:
        """
        解析舊的 .doc 檔案
        
        Args:
            file_content: Word 檔案的二進位內容
            save_images_func: 可選的保存圖片函數（.doc 格式可能無法提取圖片）
            
        Returns:
            (題目列表, 圖片佔位符映射字典)
        """
        if textract is None:
            raise Exception("textract 套件未安裝，請執行: pip install textract")
        
        # .doc 格式使用 textract，通常無法提取圖片
        image_placeholders = {}
        
        try:
            # textract.process() 需要文件路徑，不能使用 BytesIO
            # 創建臨時文件
            with tempfile.NamedTemporaryFile(delete=False, suffix='.doc') as tmp_file:
                tmp_file.write(file_content)
                tmp_file_path = tmp_file.name
            
            try:
                # 使用 textract 提取文字
                text = textract.process(tmp_file_path, extension='doc').decode('utf-8')
            finally:
                # 清理臨時文件
                if os.path.exists(tmp_file_path):
                    os.unlink(tmp_file_path)
            
            # 按行分割
            lines = text.split('\n')
            questions = []
            current_question = None
            
            # 檢測是否有 [pic] 佔位符（可能表示數學方程式）
            has_pic_placeholders = '[pic]' in text
            
            for line in lines:
                text = line.strip()
                if not text:
                    continue
                
                # 如果發現 [pic] 佔位符，添加提示說明這可能是數學方程式
                # 對於 .doc 格式，我們無法提取數學方程式，只能保留 [pic] 佔位符
                if '[pic]' in text and has_pic_placeholders:
                    # 可以選擇保留 [pic] 或替換為提示文字
                    # 這裡我們保留 [pic]，讓用戶知道這裡應該有內容
                    pass
                
                # 檢測題目開始（支援多種格式：1. 或 1、 或 (1) 等）
                question_match = re.match(r'^(\d+)[\.、\)）]', text)
                if question_match:
                    if current_question:
                        questions.append(current_question)
                    
                    current_question = {
                        'question_number': int(question_match.group(1)),
                        'question_id': None,
                        'difficulty': 3,
                        'origin': '',
                        'origin_detail': '',
                        'content': '',
                        'options': [],
                        'answer': '',
                        'explanation': ''
                    }
                    continue
                
                if current_question:
                    # 題號
                    question_id_match = re.search(r'【題號】：\s*(\S+)', text)
                    if question_id_match:
                        current_question['question_id'] = question_id_match.group(1)
                        continue
                    
                    # 難易度
                    difficulty_match = re.search(r'【難易度】：\s*(\S+)', text)
                    if difficulty_match:
                        difficulty_text = difficulty_match.group(1)
                        current_question['difficulty'] = self.difficulty_map.get(
                            difficulty_text, 3
                        )
                        continue
                    
                    # 出處
                    origin_match = re.search(r'【出處】：\s*(.+)', text)
                    if origin_match:
                        current_question['origin'] = origin_match.group(1).strip()
                        continue
                    
                    # 題源
                    origin_detail_match = re.search(r'【題源】：\s*(.+)', text)
                    if origin_detail_match:
                        current_question['origin_detail'] = origin_detail_match.group(1).strip()
                        continue
                    
                    # 答案
                    answer_match = re.search(r'《答案》\s*([A-Z])', text)
                    if answer_match:
                        current_question['answer'] = answer_match.group(1)
                        continue
                    
                    # 解析
                    if '《解析》' in text or '解析' in text:
                        explanation_text = re.sub(r'《解析》\s*', '', text)
                        if explanation_text:
                            current_question['explanation'] = explanation_text
                        continue
                    
                    # 選項
                    option_match = re.match(r'^\(([A-Z])\)', text)
                    if option_match:
                        option_letter = option_match.group(1)
                        option_content = re.sub(r'^\([A-Z]\)\s*', '', text)
                        current_question['options'].append({
                            'letter': option_letter,
                            'content': option_content
                        })
                        continue
                    
                    # 題目內容
                    if not current_question['content']:
                        current_question['content'] = text
                    else:
                        if current_question['options']:
                            if not current_question['explanation']:
                                current_question['explanation'] = text
                            else:
                                current_question['explanation'] += '\n\n' + text
                        else:
                            current_question['content'] += '\n\n' + text
            
            if current_question:
                questions.append(current_question)
            
            return questions, image_placeholders
            
        except Exception as e:
            raise Exception(f"解析 .doc 檔案失敗：{str(e)}")
    
    def escape_markdown_special_chars(self, text: str) -> str:
        """
        轉義 Markdown 特殊字符，避免被誤解析
        特別是避免 (C) 被轉換為版權符號 ©
        """
        if not text:
            return text
        
        # 轉義選項格式 (A), (B), (C), (D) 等，避免被 Markdown 解析器誤解析
        # 使用 HTML 實體或轉義符號
        text = re.sub(r'\(([A-Z])\)', r'\(\1\)', text)  # 轉義選項括號
        
        return text
    
    def replace_pic_placeholders(self, text: str, image_urls: list) -> Tuple[str, list]:
        """
        替換文字中的 [pic] 佔位符為實際圖片連結
        
        Args:
            text: 包含 [pic] 佔位符的文字
            image_urls: 圖片 URL 列表（會被消耗）
            
        Returns:
            (替換後的文字, 剩餘的圖片 URL 列表)
        """
        if not image_urls:
            return text, image_urls
        
        # 計算文字中有多少個 [pic]
        pic_count = text.count('[pic]')
        
        # 按順序替換
        for i in range(min(pic_count, len(image_urls))):
            text = text.replace('[pic]', f'![圖片]({image_urls[i]})', 1)
        
        # 返回剩餘的圖片 URL（跳過已使用的）
        remaining_urls = image_urls[min(pic_count, len(image_urls)):]
        
        return text, remaining_urls
    
    def convert_to_markdown(self, question: Dict, image_placeholders: Optional[Dict[str, list]] = None) -> Dict:
        """
        將解析出的題目轉換為 Markdown 格式
        
        Args:
            question: 原始題目字典
            image_placeholders: 圖片佔位符到實際圖片 URL 列表的映射（例如：{'[pic]': ['/media/image1.png', '/media/image2.png']}）
            
        Returns:
            轉換後的題目字典（content 和 correct_answer 為 Markdown）
        """
        # 獲取圖片 URL 列表（按順序使用）
        image_urls = []
        if image_placeholders and '[pic]' in image_placeholders:
            image_urls = image_placeholders['[pic]']
            if not isinstance(image_urls, list):
                image_urls = [image_urls]
        
        # 轉換題目內容為 Markdown
        content = question.get('content', '')
        content, image_urls = self.replace_pic_placeholders(content, image_urls)
        
        # 如果有選項，格式化為 Markdown 列表
        options = question.get('options', [])
        if options:
            content += '\n\n'
            for opt in options:
                option_content = opt['content']
                # 替換選項中的圖片佔位符 [pic]
                option_content, image_urls = self.replace_pic_placeholders(option_content, image_urls)
                # 使用轉義避免 (C) 被轉換為版權符號
                letter = opt['letter']
                # 對於選項標記，使用反斜線轉義避免被 Markdown 解析為版權符號
                content += f"\n**\\({letter}\\)** {option_content}"
        
        # 轉換答案為 Markdown
        answer = question.get('answer', '')
        if answer:
            answer = f"**答案：{answer}**"
        
        # 轉換解析為 Markdown
        explanation = question.get('explanation', '')
        if explanation:
            # 替換解析中的圖片佔位符 [pic]
            explanation, image_urls = self.replace_pic_placeholders(explanation, image_urls)
            answer += f"\n\n**解析：**\n\n{explanation}"
        
        return {
            **question,
            'content': content,
            'correct_answer': answer
        }
    
    def import_questions(
        self,
        file_content: bytes,
        filename: str,
        default_subject_id: Optional[int] = None,
        default_level: str = 'SHS',
        default_chapter: str = '',
        save_images_func: Optional[callable] = None
    ) -> Tuple[List[Dict], List[str]]:
        """
        匯入題目並轉換為系統格式
        
        Args:
            file_content: Word 檔案內容
            filename: 檔案名稱
            default_subject_id: 預設科目ID（如果無法從檔案中提取）
            default_level: 預設年級
            default_chapter: 預設章節
            
        Returns:
            (題目列表, 錯誤訊息列表)
        """
        errors = []
        questions = []
        
        try:
            # 根據檔案類型選擇解析方法
            if filename.endswith('.docx'):
                raw_questions, image_placeholders = self.parse_docx(file_content, save_images_func)
            elif filename.endswith('.doc'):
                raw_questions, image_placeholders = self.parse_doc(file_content, save_images_func)
            else:
                errors.append(f"不支援的檔案格式：{filename}")
                return [], errors
            
            # 轉換為 Markdown 格式
            for raw_q in raw_questions:
                try:
                    converted_q = self.convert_to_markdown(raw_q, image_placeholders)
                    
                    # 準備題目資料
                    question_data = {
                        'subject_id': default_subject_id,  # 使用 subject_id 作為 ForeignKey
                        'level': default_level,
                        'chapter': default_chapter or f"匯入-{filename}",
                        'content': converted_q.get('content', ''),
                        'correct_answer': converted_q.get('correct_answer', ''),
                        'difficulty': converted_q.get('difficulty', 3),
                        'source': 'imported_from_word',
                        'question_number': converted_q.get('question_id') or str(converted_q.get('question_number', '')),
                        'origin': converted_q.get('origin', ''),
                        'origin_detail': converted_q.get('origin_detail', ''),
                    }
                    
                    questions.append(question_data)
                    
                except Exception as e:
                    errors.append(f"轉換題目失敗（題號：{raw_q.get('question_number', '未知')}）：{str(e)}")
            
        except Exception as e:
            errors.append(f"匯入失敗：{str(e)}")
        
        return questions, errors
