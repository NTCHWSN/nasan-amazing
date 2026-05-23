#!/bin/bash
# 🎮 นาสารอเมซิ่ง! — Mac/Linux
clear
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   🎮 นาสารอเมซิ่ง! — เปิดเล่นจากมือถือ        ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# ติดตั้ง qrcode ถ้ายังไม่มี
if command -v python3 &> /dev/null; then
  PYCMD=python3
elif command -v python &> /dev/null; then
  PYCMD=python
else
  echo "❌ ไม่พบ Python — ติดตั้งที่ https://www.python.org/"
  exit 1
fi

$PYCMD -c "import qrcode" 2>/dev/null
if [ $? -ne 0 ]; then
  echo "🔍 กำลังติดตั้ง qrcode (ครั้งเดียว)..."
  $PYCMD -m pip install --quiet qrcode 2>/dev/null || \
    $PYCMD -m pip install --quiet --break-system-packages qrcode 2>/dev/null
fi

$PYCMD start-server.py
