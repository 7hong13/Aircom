import { PcProvider } from '@src/db/models/pc_provider';
import { PPAuthToken } from '@src/db/models/pp_authtoken';
import { SignupBody, SigninBody } from '@src/interfaces/pp_auth';
import { jwtSign, hash, getRandomAlphNum } from '@src/utils/crypto';
import { getUserIdFromIdToken } from './googleoauth';

export async function signup (ppUser: SignupBody) {
  const foundPPUser = await PcProvider.findOne({ where: { email: ppUser.email } });
  if (foundPPUser !== null) {
    return null;
  } else {
    return await PcProvider.create({
      ...ppUser,
      password: hash(ppUser.password), // password는 암호화해서 저장
      signinType: 'email'
    });
  }
}

export async function signin (ppUser: SigninBody) {
  const foundPPUser = await PcProvider.findOne({
    where: {
      signinType: 'email',
      ...ppUser,
      password: hash(ppUser.password) // password는 암호화해서 저장
    }
  });
  if (foundPPUser === null) {
    return null;
  } else {
    return jwtSign({ id: foundPPUser.id }, 1000 * 60 * 60 * 24);
  }
}

export async function signinOrSignupViaGoogleOAuth (idToken: string) {
  const ppUserId = await getUserIdFromIdToken(idToken);

  const foundPPUser = await PcProvider.findOne({
    where: {
      signinType: 'googleoauth',
      signinId: ppUserId
    }
  });

  let signedinId;
  if (foundPPUser !== null) { // 가입된 유저일 경우
    signedinId = foundPPUser.id;
  } else {
    const newUser = await PcProvider.create({
      signinType: 'googleoauth',
      signinId: ppUserId
    });
    signedinId = newUser.id;
  }

  return jwtSign({ id: signedinId }, 1000 * 60 * 60 * 24);
}

export const getAuthToken = async (ppId: number) => {
  let authToken = getRandomAlphNum(6).toUpperCase();

  // 기존에 있는 pcProviderId 삭제
  await PPAuthToken.destroy({
    where: {
      pcProviderId: ppId
    }
  });
  while (true) {
    try {
      await PPAuthToken.create({
        authToken,
        pcProviderId: ppId
      });
      break;
    } catch {
      authToken = getRandomAlphNum(6);
    }
  }

  setTimeout(async () => await PPAuthToken.destroy({
    where: {
      authToken
    }
  }), 1000 * 60 * 5 /* 5분간 유효 */);

  return authToken;
};

/**
 * @description AuthToken을 검증
 * @param authToken 검증할 authToken
 * @returns ppId if success to verify
 * @returns null if fail to verify
 */
export const verifyAuthToken = async (authToken: string) => {
  const ppId = await PPAuthToken.findByPk(authToken.toUpperCase());

  return ppId;
};
