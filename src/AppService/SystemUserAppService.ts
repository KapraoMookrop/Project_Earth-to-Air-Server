import { app } from '../base';
import SystemUserService from '../Service/SystemUserService';
import bcrypt from 'bcrypt';

app.get('/SystemUserService/GetSystemUser', async (req, res) => {
    try {
        const users = await SystemUserService.getAllSystemUsers();
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/SystemUserService/AddSystemUser', async (req, res) => {
    try {
        const userId = await SystemUserService.addSystemUser(req.body);
        res.json(userId);
    } catch (err: any) {
        res.status(500).json({ error: err });
    }
});

app.put('/SystemUserService/UpdateSystemUser/:id', async (req, res) => {
    try {
        await SystemUserService.updateSystemUser(parseInt(req.params.id ?? -1), req.body);
        res.json({ message: 'User updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/SystemUserService/DeleteSystemUser/:id', async (req, res) => {
    try {
        await SystemUserService.deleteSystemUser(parseInt(req.params.id));
        res.json({ message: 'User deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/Login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await SystemUserService.login(username);

        if (!user) {
            return res.status(404).json({ message: 'ผู้ใช้นี้ยังไม่ได้ลงทะเบียน โปรดติดต่อผู้ดูแลระบบเพื่อลงทะเบียน' });
        }
        const checkPassword = await bcrypt.compare(password, user.password as string);
        if (!checkPassword) {
            return res.status(401).json({
                message: 'รหัสผ่านไม่ถูกต้อง',
                password: bcrypt.hashSync(password, 10)
            });
        }

        res.status(200).json(user);
    } catch (err: any) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
    }
});
