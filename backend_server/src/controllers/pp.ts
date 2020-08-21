import { wrapper } from '@src/utils/wrapper';
import * as PCServices from '@src/services/pc';

/** verifySignin 미들웨어 이후에 사용 */
export const registerPC = wrapper(async (req, res) => {
  const pc = await PCServices.registerPC(req.body);
  if (pc === -1) {
    return res.status(401).json({
      err: 'authToken is unathorized'
    });
  } else {
    return res.status(200).json({
      uuid: pc.uuid
    });
  }
});