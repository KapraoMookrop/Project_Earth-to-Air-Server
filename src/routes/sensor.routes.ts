import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { NotifyService } from '../services/notify.service.js';
import { SensorData, DeviceSettings } from '../types/index.js';

const router = Router();

// 1. รับข้อมูลจาก Hardware
router.post('/sensor-data', async (req: Request, res: Response) => {
  const data: SensorData = req.body;

  try {
    await pool.query(
      `INSERT INTO sensor_readings 
       (device_id, temp_ambient, temp_ground, humidity, pm1_0, pm2_5, voc_level, wind_speed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [data.device_id, data.temp_ambient, data.temp_ground, data.humidity, data.pm1_0, data.pm2_5, data.voc_level, data.wind_speed]
    );

    const settingsResult = await pool.query('SELECT * FROM device_settings WHERE device_id = $1', [data.device_id]);
    const settings: DeviceSettings = settingsResult.rows[0];

    if (settings) {
      const health = (data.wind_speed / settings.wind_speed_baseline) * 100;
      if (health <= settings.filter_alert_threshold) {
        const message = `\n🚨 [Earth-To-Air Alert]\nเครื่อง: ${data.device_id}\nไส้กรองเริ่มตัน! ประสิทธิภาพเหลือ: ${health.toFixed(1)}%\nความเร็วลมปัจจุบัน: ${data.wind_speed} m/s`;
        await NotifyService.sendLineNotify(settings.line_notify_token, message);
      }
    }

    res.status(201).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' + error});
  }
});

// 2. ดึงข้อมูลล่าสุดสำหรับ Dashboard
router.get('/latest/:deviceId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM current_sensor_readings WHERE device_id = $1 LIMIT 1',
      [req.params.deviceId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database Error' });
  }
});

// 3. ดึงสถิติย้อนหลัง
router.get('/history/:deviceId', async (req: Request, res: Response) => {
  const hours = req.query.hours || 24;
  try {
    const result = await pool.query(
      `SELECT recorded_at as time, temp_ambient, temp_ground, pm2_5, voc_level, wind_speed 
       FROM dialy_sensor_readings 
       WHERE device_id = $1
       ORDER BY recorded_at ASC`,
      [req.params.deviceId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Database Error' });
  }
});

export default router;