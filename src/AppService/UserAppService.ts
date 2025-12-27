import { app } from "../base";
import UserService from "../Service/UserService";

app.get('/UserService/GetUser', async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/UserService/AddUser', async (req, res) => {
    try {
        const userId = await UserService.addUser(req.body);
        res.json(userId);
    } catch (err: any) {
        res.status(500).json({ error: err });
    }
});

app.put('/UserService/UpdateUser/:id', async (req, res) => {
    try {
        await UserService.updateUser(parseInt(req.params.id ?? -1), req.body);
        res.json({ message: 'User updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/UserService/DeleteUser/:id', async (req, res) => {
    try {
        await UserService.deleteUser(parseInt(req.params.id));
        res.json({ message: 'User deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});