import pool from '../Db';
import UserData from '../Data/UserData';

class SystemUserService {
    async getAllUsers() : Promise<UserData[]> {
        const query = `SELECT * FROM heatindex.tbl_user;`;
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (err) {
            throw err;
        }
    }

    async addUser(user: UserData) : Promise<number> {
        const query = `INSERT INTO heatindex.tbl_user (name, tel)
                        VALUES ($1, $2)
                        RETURNING id;`;

        const values = [user.name, user.tel];

        try {
            const result = await pool.query(query, values);
            return result.rows[0].id;
        } catch (err) {
            throw err;
        }
    }

    async updateUser(id: number, user: UserData) : Promise<number> {
        const query = `UPDATE heatindex.tbl_user SET name = $1, email = $2, tel = $3 WHERE id = $4 RETURNING id;`;
        const values = [user.name, user.tel, user.tel, id];
        try {
            const result = await pool.query(query, values);
            return result.rows[0].id;
        } catch (err) {
            throw err;
        }
    }
    
    async deleteUser(id: number) {
        const query = `DELETE FROM heatindex.tbl_user WHERE id = $1;`;
        try {
            var result = await pool.query(query, [id]);
        } catch (err) {
            throw err;
        }
    }
}

export default new SystemUserService();
