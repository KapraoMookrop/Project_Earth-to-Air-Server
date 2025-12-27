import pool from '../Db';
import type { UserSystemData } from "../Data/UserSystemData";
import bcrypt from 'bcrypt';

class SystemUserService {
    async getAllSystemUsers() : Promise<UserSystemData[]> {
        const query = `SELECT id, username, email, tel, created_at FROM heatindex.tbl_system_user;`;
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (err) {
            throw err;
        }
    }

    async addSystemUser(user: UserSystemData) : Promise<number> {
        user.password = await bcrypt.hashSync(user.password || "", 10);

        const query = `INSERT INTO heatindex.tbl_system_user (username, email, password, tel, created_at)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING id;`;

        const values = [user.username, user.email, user.password, user.tel, new Date()];

        try {
            const result = await pool.query(query, values);
            return result.rows[0].id;
        } catch (err) {
            throw err;
        }
    }
    

    async updateSystemUser(id: number, user: UserSystemData) {
        const query = `UPDATE heatindex.tbl_system_user SET username = $1, tel = $2, email = $3
                        WHERE id = $4;`;
        const values = [user.username, user.tel, user.email, id];

        try {
            await pool.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    async deleteSystemUser(id: number) {
        const query = `DELETE FROM heatindex.tbl_system_user WHERE id = $1;`;
        try {
            await pool.query(query, [id]);
        } catch (err) {
            throw err;
        }
    }

    async login(username: string) {
        const query = `SELECT * FROM heatindex.tbl_system_user WHERE username = $1;`;
        try {
            const result = await pool.query(query, [username]);
            return result.rows[0] || null;
        } catch (err) {
            throw err;
        }
    }
}

export default new SystemUserService();
