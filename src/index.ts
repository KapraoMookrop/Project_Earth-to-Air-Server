// index.ts
import { app } from './base';
import './AppService/UserAppService';
import './AppService/SystemUserAppService';
import './AppService/InfoAppService';

const PORT = parseInt(process.env.PORT || '8800', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});


