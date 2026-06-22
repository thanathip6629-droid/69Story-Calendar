# 69STORY Event Calendar V1

เว็บปฏิทินคอนเสิร์ตแบบ Real-time สำหรับ 69STORY

## ไฟล์สำคัญ
- `index.html` หน้าเว็บลูกค้า
- `admin.html` หน้าแอดมิน
- `schema.sql` คำสั่งสร้างฐานข้อมูล Supabase
- `config.js` ใส่ Supabase URL และ anon key

## วิธีติดตั้งแบบฟรี
1. สมัคร Supabase แล้วสร้าง Project ใหม่
2. ไปที่ SQL Editor แล้ววางคำสั่งจาก `schema.sql` แล้วกด Run
3. ไปที่ Authentication > Users แล้วสร้าง user สำหรับแอดมิน
4. ไปที่ Project Settings > API แล้วเอา `Project URL` และ `anon public key` มาใส่ใน `config.js`
5. เอาโฟลเดอร์นี้ขึ้น GitHub
6. Deploy ผ่าน Vercel แบบ Static Website

## การใช้งาน
- ลูกค้าดูที่ `index.html`
- แอดมินแก้ที่ `admin.html`
- เมื่อเพิ่ม/แก้/ลบงาน ทุกหน้าจะอัปเดตแบบ Real-time

## หมายเหตุ
เวอร์ชันนี้โฟกัสเฉพาะปฏิทิน ยังไม่รวมระบบจองโต๊ะ
