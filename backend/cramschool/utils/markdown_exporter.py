"""
Markdown Exporter: 將 Tiptap JSON 格式轉換為 Markdown 字符串
"""
import re


def extract_text_from_node(node):
    """
    遞迴提取節點中的純文字內容
    """
    if not node:
        return ''
    
    text_parts = []
    
    # 如果是文字節點
    if node.get('type') == 'text':
        text = node.get('text', '')
        if text:
            # 檢查是否有 marks（粗體、斜體等）
            marks = node.get('marks', [])
            for mark in marks:
                if mark.get('type') == 'bold':
                    text = f'**{text}**'
                elif mark.get('type') == 'italic':
                    text = f'*{text}*'
                elif mark.get('type') == 'code':
                    text = f'`{text}`'
            text_parts.append(text)
    
    # 處理段落、標題等塊級元素
    node_type = node.get('type', '')
    
    if node_type == 'paragraph':
        content = extract_text_from_content(node.get('content', []))
        if content:
            text_parts.append(content)
    
    elif node_type == 'heading':
        level = node.get('attrs', {}).get('level', 1)
        content = extract_text_from_content(node.get('content', []))
        prefix = '#' * level + ' '
        text_parts.append(f'{prefix}{content}')
    
    elif node_type == 'bulletList' or node_type == 'orderedList':
        items = node.get('content', [])
        for item in items:
            item_content = extract_text_from_content(item.get('content', []))
            if item_content:
                prefix = '- ' if node_type == 'bulletList' else '1. '
                text_parts.append(f'{prefix}{item_content}')
    
    elif node_type == 'mathField':
        latex = node.get('attrs', {}).get('latex', '')
        if latex:
            text_parts.append(f'${latex}$')
    
    elif node_type == 'latexFormula':
        latex = node.get('attrs', {}).get('latex', '')
        display_mode = node.get('attrs', {}).get('displayMode', True)
        if latex:
            if display_mode:
                text_parts.append(f'$$\n{latex}\n$$')
            else:
                text_parts.append(f'${latex}$')
    
    elif node_type == 'codeBlock':
        language = node.get('attrs', {}).get('language', '')
        content = extract_text_from_content(node.get('content', []))
        text_parts.append(f'```{language}\n{content}\n```')
    
    elif node_type == 'image':
        src = node.get('attrs', {}).get('src', '')
        alt = node.get('attrs', {}).get('alt', '')
        if src:
            text_parts.append(f'![{alt}]({src})')
    
    elif node_type == 'diagram2D' or node_type == 'diagram3D':
        # 對於圖形節點，使用備援圖片或 SVG
        attrs = node.get('attrs', {})
        backup_image = attrs.get('backup_image', '')
        if backup_image:
            if backup_image.startswith('data:image/svg+xml'):
                # SVG 轉換為 HTML
                text_parts.append(f'<div class="diagram">{backup_image}</div>')
            else:
                text_parts.append(f'![Diagram]({backup_image})')
        else:
            text_parts.append('[Diagram]')
    
    elif node_type == 'circuit':
        # 電路圖節點
        attrs = node.get('attrs', {})
        backup_image = attrs.get('backup_image', '')
        if backup_image:
            if backup_image.startswith('data:image/svg+xml'):
                text_parts.append(f'<div class="circuit-diagram">{backup_image}</div>')
            else:
                text_parts.append(f'![Circuit]({backup_image})')
        else:
            text_parts.append('[Circuit Diagram]')
    
    else:
        # 遞迴處理子節點
        content = extract_text_from_content(node.get('content', []))
        if content:
            text_parts.append(content)
    
    return '\n'.join(text_parts)


def extract_text_from_content(content):
    """
    從內容數組中提取文字
    """
    if not content:
        return ''
    
    text_parts = []
    for item in content:
        text = extract_text_from_node(item)
        if text:
            text_parts.append(text)
    
    return '\n'.join(text_parts)


def solution_to_markdown(tiptap_json):
    """
    將 Tiptap JSON 轉換為 Markdown 字符串
    
    Args:
        tiptap_json: Tiptap JSON 格式的字典
        
    Returns:
        Markdown 字符串
    """
    if not tiptap_json:
        return ''
    
    # 提取文檔內容
    content = tiptap_json.get('content', [])
    
    if not content:
        return ''
    
    # 轉換每個節點
    markdown_parts = []
    for node in content:
        markdown = extract_text_from_node(node)
        if markdown:
            markdown_parts.append(markdown)
    
    return '\n\n'.join(markdown_parts)
