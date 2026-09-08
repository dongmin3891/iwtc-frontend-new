import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const getRegisterFormSchema = () =>
  yupResolver(
    yup.object({
      username: yup
        .string()
        .trim()
        .lowercase()
        .required("Username을 정확하게 입력해주세요.")
        .min(6, "6자리 이상 입력해주세요.")
        .max(10, "10자리 이하로 입력해주세요.")
        .matches(/^[a-zA-Z0-9]+$/, "영문과 숫자만 입력해주세요."),
      password: yup
        .string()
        .trim()
        .required("비밀번호를 입력해주세요.")
        .min(8, "최소 8자 이상 입력해주세요.")
        .max(16, "최대 16자를 입력해주세요.")
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!@#$%^&*()_+\-=])[A-Za-z\d~`!@#$%^&*()_+\-=]{8,16}$/,
          "비밀번호 생성 조건에 맞지 않습니다. 다시 입력해주세요."
        ),
      passwordConfirm: yup
        .string()
        .trim()
        .required("비밀번호를 확인해주세요.")
        .oneOf(
          [yup.ref("password")],
          "비밀번호가 일치하지 않습니다. 다시 입력해주세요."
        ),
      nickname: yup
        .string()
        .trim()
        .required("nickname을 정확하게 입력해주세요.")
        .min(2, "닉네임은 2자리 이상 입력해주세요.")
        .max(10, "닉네임은 10자리 이하로 입력해주세요.")
        .matches(/^\S+$/, "닉네임에는 공백을 사용할 수 없습니다."),
    })
  );
