import { app } from "../base";
import InfoService from "../Service/InfoService";

app.get('/InfoDataService/GetDataDaily/:espId', async (req, res) => {
    try {
        const result = await InfoService.getInfoDaily(parseInt(req.params.espId));
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/InfoDataService/GetDataCurrent/:espId', async (req, res) => {
    try {
        const result = await InfoService.getInfoCurrent(parseInt(req.params.espId));
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/InfoDataService/GetUserForSearch', async (req, res) => {
    try {
        const result = await InfoService.getUserForSearch();
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});