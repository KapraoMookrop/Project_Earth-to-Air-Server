import pool from '../Db';
import InfoData from '../Data/InfoData';
import UserForSearchData from '../Data/UserForSearchData';

class InfoService {
    async getInfoDaily(espId: number): Promise<InfoData[]> {
        const query = `WITH recent AS (
                            SELECT temp, humidity, heat_index, date
                            FROM heatindex.tbl_daily_avg
                            WHERE esp_id = $1
                            ORDER BY date DESC
                            LIMIT 7
                        )
                        SELECT * FROM recent ORDER BY date ASC;`;
        try {
            const result = await pool.query(query, [espId]);
            return result.rows as InfoData[];
        } catch (err) {
            throw err;
        }
    }

    async getInfoCurrent(espId: number): Promise<InfoData> {
        const query = `SELECT temp, humidity, heat_index FROM heatindex.tbl_esp32_status WHERE esp_id = $1`;
        try {
            const result = await pool.query(query, [espId]);
            return result.rows[0] as InfoData;
        } catch (err) {
            throw err;
        }
    }

    async getUserForSearch(): Promise<UserForSearchData[]> {
        const query = `SELECT 
                            esp.esp_id as espId,
                            users.id as userId,
                            users.name as Name
                        FROM heatindex.tbl_esp32_status esp
                        LEFT JOIN heatindex.tbl_user users ON esp.user_id = users.id`;
        try {
            const result = await pool.query(query);
            return result.rows as UserForSearchData[];
        } catch (err) {
            throw err;
        }
    }
}

export default new InfoService();
