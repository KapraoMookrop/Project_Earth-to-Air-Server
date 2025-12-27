CREATE TABLE devices (
    esp_id VARCHAR(50) PRIMARY KEY NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE current_sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(esp_id),
    temp_ambient NUMERIC(4, 2),    -- อุณหภูมิภายนอก
    temp_ground NUMERIC(4, 2),     -- อุณหภูมิหลังผ่านดิน
    humidity NUMERIC(4, 2),        -- ความชื้น
    pm1_0 NUMERIC(6, 2),           -- ค่าฝุ่น 1.0
    pm2_5 NUMERIC(6, 2),           -- ค่าฝุ่น 2.5
    voc_level NUMERIC(6, 3),       -- ค่า AOC/VOCs
    wind_speed NUMERIC(4, 2),      -- ความเร็วลมหลังกรอง
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dialy_sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(esp_id),
    temp_ambient NUMERIC(4, 2),    -- อุณหภูมิภายนอก
    temp_ground NUMERIC(4, 2),     -- อุณหภูมิหลังผ่านดิน
    humidity NUMERIC(4, 2),        -- ความชื้น
    pm1_0 NUMERIC(6, 2),           -- ค่าฝุ่น 1.0
    pm2_5 NUMERIC(6, 2),           -- ค่าฝุ่น 2.5
    voc_level NUMERIC(6, 3),       -- ค่า AOC/VOCs
    wind_speed NUMERIC(4, 2),      -- ความเร็วลมหลังกรอง
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางเก็บการตั้งค่า (Settings)
-- แยกออกมาเพื่อให้ Update ค่าได้โดยไม่ต้องไปยุ่งกับข้อมูลเซนเซอร์
CREATE TABLE device_settings (
    device_id VARCHAR(50) PRIMARY KEY REFERENCES devices(esp_id),
    is_auto_mode BOOLEAN DEFAULT TRUE,
    wind_speed_baseline NUMERIC(4, 2) DEFAULT 5.0, -- ค่าลมตอนฟิลเตอร์ใหม่
    filter_alert_threshold INTEGER DEFAULT 20,     -- เตือนตอนเหลือ % เท่าไหร่
    line_notify_token TEXT,
    electricity_rate NUMERIC(4, 2) DEFAULT 4.5,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางบันทึกการบำรุงรักษา (Maintenance)
-- เก็บประวัติการเปลี่ยนไส้กรอง
CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(esp_id),
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

