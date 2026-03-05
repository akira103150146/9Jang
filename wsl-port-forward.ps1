# WSL 端口轉發腳本
# 請以系統管理員身分在 Windows PowerShell 中執行此腳本

# 獲取 WSL IP 地址
$wslIp = (wsl hostname -I).Trim()
Write-Host "WSL IP: $wslIp"

# 獲取 Windows IP 地址（自動偵測）
$windowsIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and 
    $_.PrefixOrigin -eq "Dhcp"
} | Select-Object -First 1).IPAddress
Write-Host "Windows IP: $windowsIp"

# 定義需要轉發的端口
$ports = @(3000, 5173)

foreach ($port in $ports) {
    Write-Host "正在設定端口 $port 的轉發..."
    
    # 刪除舊的轉發規則（如果存在）
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0
    
    # 添加新的轉發規則
    netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIp
    
    Write-Host "端口 $port 轉發設定完成"
}

# 顯示所有轉發規則
Write-Host "`n目前的端口轉發規則:"
netsh interface portproxy show all

# 配置防火牆規則
Write-Host "`n正在配置防火牆規則..."
foreach ($port in $ports) {
    $ruleName = "WSL-9Jang-Port-$port"
    
    # 刪除舊規則（如果存在）
    Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    
    # 添加新規則
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow
    Write-Host "防火牆規則 $ruleName 已建立"
}

Write-Host "`n設定完成！"
Write-Host "學生可以透過以下網址訪問:"
Write-Host "前端: http://${windowsIp}:5173"
Write-Host "後端 API: http://${windowsIp}:3000/api"
Write-Host "Swagger 文檔: http://${windowsIp}:3000/api/docs"
