#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
นาสารอเมซิ่ง! — Local Server (Python)
- หา IP เครื่องอัตโนมัติ (รองรับหลาย adapter)
- ลอง bind หลาย port ถ้าตัวแรกชน
- แสดง QR Code (ASCII) เพื่อสแกนจากมือถือ
- รองรับ Windows / Mac / Linux
"""
import sys, os, socket, http.server, socketserver, ipaddress, time

# === FIX: บังคับ cd ไปที่โฟลเดอร์ที่มี start-server.py
# ไม่งั้น Windows อาจรันจาก System32 หรือที่อื่น → เปิด directory listing แทน index.html
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(SCRIPT_DIR)

# ตรวจว่ามี index.html ในโฟลเดอร์ปัจจุบัน
if not os.path.exists(os.path.join(SCRIPT_DIR, 'index.html')):
    print()
    print('❌ ไม่พบ index.html ในโฟลเดอร์:')
    print('   ' + SCRIPT_DIR)
    print()
    print('   กรุณาวาง start-server.py ไว้ในโฟลเดอร์เดียวกับเกม')
    print()
    input('   กด Enter เพื่อปิด...')
    sys.exit(1)

PORTS_TO_TRY = [5500, 8080, 8000, 3000, 8888]

def get_local_ip():
    """หา IP ที่อยู่ใน LAN (192.168.x / 10.x / 172.16-31.x)"""
    # วิธีที่ 1: เปิด UDP socket ไปยัง public IP (ไม่ได้ส่งจริง)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and ip != '127.0.0.1':
            return ip
    except: pass
    # วิธีที่ 2: hostname
    try:
        host = socket.gethostname()
        for info in socket.getaddrinfo(host, None):
            ip = info[4][0]
            try:
                a = ipaddress.ip_address(ip)
                if a.is_private and not a.is_loopback:
                    return ip
            except: continue
    except: pass
    return 'localhost'

def make_qr(text):
    """สร้าง ASCII QR code (ใช้ qrcode lib ถ้ามี, ไม่งั้นข้าม)"""
    try:
        import qrcode
        qr = qrcode.QRCode(version=1, box_size=1, border=1,
                            error_correction=qrcode.constants.ERROR_CORRECT_L)
        qr.add_data(text)
        qr.make(fit=True)
        # render ASCII (สลับ block สีดำ-ขาว)
        lines = []
        matrix = qr.get_matrix()
        for row in matrix:
            line = ''.join('██' if cell else '  ' for cell in row)
            lines.append(line)
        return '\n'.join(lines)
    except ImportError:
        return None

def try_port(port):
    """ลอง bind ดูว่า port ว่างไหม"""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        s.bind(('', port))
        s.close()
        return True
    except OSError:
        return False

def main():
    ip = get_local_ip()
    port = None
    for p in PORTS_TO_TRY:
        if try_port(p):
            port = p
            break
    if port is None:
        port = PORTS_TO_TRY[0]

    print()
    print("╔══════════════════════════════════════════════╗")
    print("║   🎮 นาสารอเมซิ่ง! — Local Server            ║")
    print("╚══════════════════════════════════════════════╝")
    print()
    print(f"  📱 บนมือถือ:    http://{ip}:{port}")
    print(f"  💻 บนคอม:       http://localhost:{port}")
    print()
    qr = make_qr(f'http://{ip}:{port}')
    if qr:
        print("  สแกน QR จากมือถือ:")
        print()
        for line in qr.split('\n'):
            print('    ' + line)
        print()
    else:
        print("  💡 ติดตั้ง qrcode lib เพื่อให้แสดง QR Code:")
        print("     pip install qrcode")
        print()
    print("  ──────────────────────────────────────────")
    print("  📋 ขั้นตอน:")
    print("     1. มือถือ + คอม Wi-Fi เดียวกัน")
    print("     2. เปิด Chrome/Safari บนมือถือ")
    print("     3. พิมพ์ URL ด้านบน (หรือสแกน QR)")
    print("  ──────────────────────────────────────────")
    print(f"  ⚠️  ถ้ายังเข้าไม่ได้ — ปิด Windows Firewall ชั่วคราว")
    print(f"     หรือ allow Python ใน firewall")
    print()
    print("  กด Ctrl+C เพื่อปิดเซิร์ฟเวอร์")
    print()

    # ปิด caching เพื่อให้เห็นการเปลี่ยนแปลงทันที
    class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            # ระบุ directory ชัดเจน — Python 3.7+
            super().__init__(*args, directory=SCRIPT_DIR, **kwargs)
        def end_headers(self):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            super().end_headers()
        def log_message(self, format, *args):
            # ปริ๊น log แค่ใน format สั้น ๆ
            if '200' in format % args or '304' in format % args:
                return
            print(f"  → {self.address_string()}: {format % args}")

    # bind '' = ทุก interface (0.0.0.0 + IPv6)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', port), NoCacheHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  👋 ปิดเซิร์ฟเวอร์แล้ว")

if __name__ == '__main__':
    main()
