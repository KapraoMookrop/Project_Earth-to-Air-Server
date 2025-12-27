export interface SensorData {
  device_id: number;
  temp_ambient: number;
  temp_ground: number;
  humidity: number;
  pm1_0: number;
  pm2_5: number;
  voc_level: number;
  wind_speed: number;
}

export interface DeviceSettings {
  device_id: number;
  is_auto_mode: boolean;
  wind_speed_baseline: number;
  filter_alert_threshold: number;
  line_notify_token: string;
  electricity_rate: number;
}