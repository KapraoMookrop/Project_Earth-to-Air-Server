import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { NotifyService } from '../services/notify.service.js';
import { SensorData } from '../types/SensorDate.js';
import { SettingsData } from '../types/SettingsData.js';
import axios from 'axios';
import { UserData } from '../types/UserData.js';
import bcrypt from "bcrypt";

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
        const userId = settings.line_notify_token;
        await NotifyService.sendLineMessage(userId, message);
      }
    }

    res.status(201).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' + error });
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
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' + error });
  }
});

router.get('/info', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM configuration'
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' + error});
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
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' + error });
  }
});

router.get('/history/:deviceId/:type', async (req: Request, res: Response) => {
  const { deviceId, type } = req.params;

  let sql = '';

  try {
    if (type === '1') {
      sql = `
        SELECT *
        FROM vw_sensor_daily_avg
        WHERE device_id = $1
        ORDER BY time ASC
      `;
    }
    else if (type === '2') {
      sql = `
        SELECT *
        FROM vw_sensor_hourly_avg
        WHERE device_id = $1
        ORDER BY time ASC
      `;
    }
    else {
      return res.status(400).json({ error: 'Invalid type (1=daily, 2=hourly)' });
    }

    const result = await pool.query(sql, [deviceId]);
    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' + error});
  }
});

router.post('/signup', async (req, res) => {
  const data: UserData = req.body;
  const hashPassword = await bcrypt.hash(data.password, 10);
  try {
    const checkDevice = await pool.query(
      `select * from devices where esp_id = $1`,
      [data.deviceId]
    );

    if (checkDevice.rows.length == 0) {
      return res.status(400).json({ error: 'ไม่พบ Device ID นี้ในระบบ' });
    }

    await pool.query(
      `insert into users (username, password, device_id) values ($1, $2, $3)`,
      [data.username, hashPassword, data.deviceId]
    );

    res.status(201).json({ status: 'success' });

  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' + error });
  }
});

router.post('/login', async (req, res) => {
  const data: UserData = req.body;
  try {
    const result = await pool.query(
      `select * from users where username = $1`,
      [data.username]
    );

    if (result.rows.length == 0) {
      return res.status(401).json({ error: 'ไม่พบชื่อผู้ใช้งานนี้ในระบบ' });
    }

    const checkPassword = await bcrypt.compare(data.password, result.rows[0].password);
    if (!checkPassword) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    } else {
      const UserData = {
        username: result.rows[0].username,
        is_connected_line: result.rows[0].line_user_id ? true : false,
      } as UserData;

      return res.status(200).json({ userData: UserData });
    }

  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' + error });
  }
});


const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID;
const CALLBACK_URL = process.env.LINE_CALLBACK_URL;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
router.get('/auth/line', (req, res) => {
  if (!LINE_CHANNEL_ID || !CALLBACK_URL) {
    return res.status(500).send('LINE env config missing');
  }

  const state = Math.random().toString(36).substring(2);
  const redirectUri = encodeURIComponent(CALLBACK_URL as string);

  const lineLoginUrl =
    'https://access.line.me/oauth2/v2.1/authorize' +
    '?response_type=code' +
    `&client_id=${LINE_CHANNEL_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}` +
    '&scope=profile%20openid';

  res.redirect(lineLoginUrl);
});


router.get('/auth/line/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const tokenRes = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: CALLBACK_URL as string,
        client_id: LINE_CHANNEL_ID as string,
        client_secret: LINE_CHANNEL_SECRET as string
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenRes.data.access_token;
    const profileRes = await axios.get(
      'https://api.line.me/v2/profile',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const lineUserId = profileRes.data.userId;
    const displayName = profileRes.data.displayName;

    // 3. SAVE ลง DB (ตัวอย่าง console ก่อน)
    console.log('LINE USER ID:', lineUserId);
    console.log('DISPLAY NAME:', displayName);

    // ตรงนี้เอาไปผูกกับ user ในระบบคุณ
    // saveLineUser(userId, lineUserId);

    res.send(`
      <h2>เชื่อมต่อ LINE สำเร็จ 🎉</h2>
      <p>ชื่อ: ${displayName}</p>
      <p>LINE UserId: ${lineUserId}</p>
    `);

  } catch (err: any) {
    console.error(err.response?.data || err);
    res.status(500).send('LINE Login Failed');
  }
});



export default router;