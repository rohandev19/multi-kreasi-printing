import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Konfigurasi Skenario Load Test
export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up: naikkan perlahan ke 50 Virtual Users (VU) dalam 10 detik
    { duration: '30s', target: 50 },  // Plateau: pertahankan 50 VU selama 30 detik
    { duration: '10s', target: 100 }, // Ramp up 2: naikkan ke 100 VU
    { duration: '30s', target: 100 }, // Plateau 2: pertahankan 100 VU
    { duration: '10s', target: 0 },   // Ramp down: turunkan ke 0 VU (selesai)
  ],
  thresholds: {
    // Kita menargetkan 95% request harus selesai di bawah 200ms
    http_req_duration: ['p(95)<200'],
    // Mentoleransi error rate, karena Rate Limiter (429) akan dianggap error oleh aplikasi jika melebihi kuota
    // Tapi kita pastikan tidak ada 5xx (Server Error)
  },
};

// 2. Fungsi Utama yang dijalankan oleh setiap Virtual User (VU)
export default function () {
  // Ganti URL dengan URL server kamu (misal http://localhost:3000 jika run lokal)
  const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

  // Skenario: User mengecek health endpoint
  const res = http.get(`${BASE_URL}/health`);

  // 3. Validasi Response
  // Karena kita mengimplementasikan Rate Limiting (Phase C), kita ekspektasi:
  // - Response awal 200 OK
  // - Response selanjutnya mungkin 429 Too Many Requests
  check(res, {
    'status is 200 (OK) or 429 (Rate Limited)': (r) => r.status === 200 || r.status === 429,
    'server is not crashing (No 5xx)': (r) => r.status < 500,
  });

  // Simulasi user membaca halaman sejenak sebelum request lagi
  sleep(1);
}
