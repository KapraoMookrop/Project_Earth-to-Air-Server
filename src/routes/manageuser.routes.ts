import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { UserData } from '../types/UserData.js';
import { RequestData } from '../types/RequestData.js';
import { ResponseData } from '../types/ResponseData.js';

const router = Router();

router.get('/test', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;
        const username = (req.query.username as string)?.trim();
        const deviceId = (req.query.deviceId as string)?.trim();

        const whereParams: any[] = [];
        const conditions: string[] = [];

        if (username) {
            whereParams.push(`%${username}%`);
            conditions.push(`username LIKE $${whereParams.length}`);
        }

        if (deviceId) {
            whereParams.push(`%${deviceId}%`);
            conditions.push(`device_id LIKE $${whereParams.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const dataQuery = `SELECT *
                           FROM users
                           ${whereClause}
                           ORDER BY id
                           LIMIT $${whereParams.length + 1}
                           OFFSET $${whereParams.length + 2}`;
        const dataParams = [...whereParams, pageSize, offset];
        const dataResult = await pool.query(dataQuery, dataParams);


        const countQuery = `SELECT COUNT(*)
                            FROM users
                            ${whereClause}`;
        const countResult = await pool.query(countQuery, whereParams);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / pageSize);

        res.json({
            page,
            pageSize,
            totalItems,
            totalPages,
            data: dataResult.rows
        } as ResponseData<UserData>);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
    }
});

export default router;