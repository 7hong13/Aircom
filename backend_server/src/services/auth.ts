import { User } from '@src/db/models/user';
import { SignupBody, SigninBody } from '@src/interfaces/auth';
import { jwtSign, hash } from '@src/utils/crypto';
import { getUserIdFromIdToken } from './googleoauth';

export async function signup (user: SignupBody) {
  const foundUser = await User.findOne({ where: { email: user.email } });
  if (foundUser !== null) {
    return null;
  } else {
    return await User.create({
      ...user,
      password: hash(user.password), // password는 암호화해서 저장
      signinType: 'email'
    });
  }
}

export async function signin (user: SigninBody) {
  const foundUser = await User.findOne({
    where: {
      signinType: 'email',
      ...user,
      password: hash(user.password) // password는 암호화해서 저장
    }
  });
  if (foundUser === null) {
    return null;
  } else {
    return jwtSign({ id: foundUser.id }, 1000 * 60 * 60 * 24);
  }
}

export async function signinOrSignupViaGoogleOAuth (idToken: string) {
  const userId = await getUserIdFromIdToken(idToken);

  const foundUser = await User.findOne({
    where: {
      signinType: 'googleoauth',
      signinId: userId
    }
  });

  let signedinId;
  if (foundUser !== null) { // 가입된 유저일 경우
    signedinId = foundUser.id;
  } else {
    const newUser = await User.create({
      signinType: 'googleoauth',
      signinId: userId
    });
    signedinId = newUser.id;
  }

  return jwtSign({ id: signedinId }, 1000 * 60 * 60 * 24);
}
