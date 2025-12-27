import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { NotifyService } from '../services/notify.service.js';
import { SensorData } from '../types/SensorDate.js';
import { SettingsData } from '../types/SettingsData.js';

const router = Router();

router.post('/sensor-data', async (req: Request, res: Response) => {
  const data: SensorData = req.body;

  try {
    await pool.query(
      `UPDATE current_sensor_readings 
       SET temp_ambient = $2, temp_ground = $3, humidity = $4, pm1_0 = $5, pm2_5 = $6, voc_level = $7, wind_speed = $8, recorded_at = NOW() 
       WHERE device_id = $1`,
      [data.device_id, data.temp_ambient, data.temp_ground, data.humidity, data.pm1_0, data.pm2_5, data.voc_level, data.wind_speed]
    );

    const settingsResult = await pool.query('SELECT * FROM device_settings WHERE device_id = $1', [data.device_id]);
    const settings: SettingsData = settingsResult.rows[0];

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

router.get('/latest/:deviceId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM current_sensor_readings WHERE device_id = $1 LIMIT 1',
      [req.params.deviceId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database Error' + error });
  }
});

router.get('/settings/:deviceId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM device_settings WHERE device_id = $1 LIMIT 1',
      [req.params.deviceId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database Error' + error });
  }
});

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
    res.status(500).json({ error: 'Database Error' + error});
  }
});

export default router;