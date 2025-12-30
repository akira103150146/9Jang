"""
Diagram Converter: 將前端 JSON 格式的圖形數據轉換為 LaTeX 代碼
"""
import base64
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime


def save_base64_image(base64_string, prefix='diagram'):
    """
    將 Base64 圖片字符串保存到文件系統，返回相對路徑
    """
    try:
        # 解析 Base64 字符串
        if ',' in base64_string:
            header, data = base64_string.split(',', 1)
            # 提取格式（如 image/png）
            format_type = header.split('/')[1].split(';')[0]
        else:
            data = base64_string
            format_type = 'png'
        
        # 解碼 Base64
        image_data = base64.b64decode(data)
        
        # 生成文件名
        now = datetime.now()
        date_folder = now.strftime('%Y/%m/%d')
        filename = f'{prefix}_{now.strftime("%Y%m%d_%H%M%S")}.{format_type}'
        relative_path = f'diagram_images/{date_folder}/{filename}'
        
        # 保存文件
        saved_path = default_storage.save(relative_path, ContentFile(image_data))
        
        return saved_path
    except Exception as e:
        raise ValueError(f"保存 Base64 圖片失敗: {str(e)}")


def json_to_tikz_2d(data):
    """
    將 2D 圖形 JSON 轉換為 TikZ/PGFPlots LaTeX 代碼
    
    Args:
        data: 包含 diagram_data 和 backup_image 的字典
        
    Returns:
        LaTeX 字符串
    """
    try:
        diagram_data = data.get('diagram_data', {})
        elements = diagram_data.get('elements', [])
        
        if not elements:
            return ''
        
        tikz_code = '\\begin{tikzpicture}\n'
        tikz_code += '  \\begin{axis}[xlabel=$x$, ylabel=$y$, grid=major]\n'
        
        for element in elements:
            element_type = element.get('type')
            element_data = element.get('data', {})
            
            if element_type == 'function':
                expression = element_data.get('expression', 'x')
                # 轉換 JSXGraph 表達式為 LaTeX
                expression = expression.replace('^', '**')  # 簡單轉換，實際需要更複雜的解析
                tikz_code += f'    \\addplot[domain=-5:5, samples=100] {{{expression}}};\n'
            
            elif element_type == 'point':
                x = element_data.get('x', 0)
                y = element_data.get('y', 0)
                tikz_code += f'    \\addplot[mark=*, mark size=2pt] coordinates {{({x},{y})}};\n'
            
            elif element_type == 'line':
                # 線需要兩個點，這裡簡化處理
                tikz_code += '    \\addplot[mark=none] coordinates {};\n'
            
            elif element_type == 'polygon':
                vertices = element_data.get('vertices', [])
                if len(vertices) >= 3:
                    coords = ' '.join([f'({v.get("x", 0)},{v.get("y", 0)})' for v in vertices[:3]])
                    tikz_code += f'    \\addplot[fill=green!30, draw=black] coordinates {{{coords}}} -- cycle;\n'
        
        tikz_code += '  \\end{axis}\n'
        tikz_code += '\\end{tikzpicture}'
        
        return tikz_code
        
    except Exception as e:
        # 轉換失敗，使用備援圖片
        if 'backup_image' in data and data['backup_image']:
            try:
                image_path = save_base64_image(data['backup_image'], 'diagram_2d')
                return f'\\includegraphics{{{image_path}}}'
            except Exception as img_error:
                raise ValueError(f"轉換失敗且無法保存備援圖片: {str(e)}, 圖片錯誤: {str(img_error)}")
        else:
            raise ValueError(f"轉換失敗且無備援圖片: {str(e)}")


def json_to_circuitikz(data):
    """
    將電路圖 JSON 轉換為 Circuitikz LaTeX 代碼
    
    Args:
        data: 包含 circuit_data 和 backup_image 的字典
        
    Returns:
        LaTeX 字符串
    """
    try:
        circuit_data = data.get('circuit_data', {})
        elements = circuit_data.get('elements', [])
        
        if not elements:
            return ''
        
        circuit_code = '\\begin{circuitikz}\n'
        
        for element in elements:
            element_type = element.get('type')
            element_data = element.get('data', {})
            
            if element_type == 'resistor':
                pos = element_data.get('position', [0, 0])
                circuit_code += f'  \\draw ({pos[0]},{pos[1]}) to[R] ({pos[0]+2},{pos[1]});\n'
            
            elif element_type == 'capacitor':
                pos = element_data.get('position', [0, 0])
                circuit_code += f'  \\draw ({pos[0]},{pos[1]}) to[C] ({pos[0]+2},{pos[1]});\n'
            
            elif element_type == 'voltage':
                pos = element_data.get('position', [0, 0])
                circuit_code += f'  \\draw ({pos[0]},{pos[1]}) to[V] ({pos[0]+2},{pos[1]});\n'
        
        circuit_code += '\\end{circuitikz}'
        
        return circuit_code
        
    except Exception as e:
        # 轉換失敗，使用備援圖片
        if 'backup_image' in data and data['backup_image']:
            try:
                image_path = save_base64_image(data['backup_image'], 'circuit')
                return f'\\includegraphics{{{image_path}}}'
            except Exception as img_error:
                raise ValueError(f"轉換失敗且無法保存備援圖片: {str(e)}, 圖片錯誤: {str(img_error)}")
        else:
            raise ValueError(f"轉換失敗且無備援圖片: {str(e)}")


def json_to_latex_3d(data):
    """
    將 3D 圖形 JSON 轉換為 TikZ-3Dplot LaTeX 代碼或使用圖片
    
    Args:
        data: 包含 diagram_data 和 backup_image 的字典
        
    Returns:
        LaTeX 字符串
    """
    try:
        diagram_data = data.get('diagram_data', {})
        objects = diagram_data.get('objects', [])
        
        if not objects:
            return ''
        
        # 對於複雜的 3D 圖形，直接使用圖片更可靠
        if 'backup_image' in data and data['backup_image']:
            image_path = save_base64_image(data['backup_image'], 'diagram_3d')
            return f'\\includegraphics{{{image_path}}}'
        
        # 簡單的 3D 向量可以使用 tikz-3dplot
        tikz_code = '\\begin{tikzpicture}[tdplot_main_coords]\n'
        
        for obj in objects:
            obj_type = obj.get('type')
            obj_data = obj.get('data', {})
            
            if obj_type == 'vector':
                start = obj_data.get('start', [0, 0, 0])
                end = obj_data.get('end', [1, 1, 1])
                tikz_code += f'  \\draw[->, red, thick] ({start[0]},{start[1]},{start[2]}) -- ({end[0]},{end[1]},{end[2]});\n'
        
        tikz_code += '\\end{tikzpicture}'
        
        return tikz_code
        
    except Exception as e:
        # 轉換失敗，使用備援圖片
        if 'backup_image' in data and data['backup_image']:
            try:
                image_path = save_base64_image(data['backup_image'], 'diagram_3d')
                return f'\\includegraphics{{{image_path}}}'
            except Exception as img_error:
                raise ValueError(f"轉換失敗且無法保存備援圖片: {str(e)}, 圖片錯誤: {str(img_error)}")
        else:
            raise ValueError(f"轉換失敗且無備援圖片: {str(e)}")
