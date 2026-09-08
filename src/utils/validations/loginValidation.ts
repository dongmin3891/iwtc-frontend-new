import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export const getLoginFormSchema = () =>
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
          "비밀번호 형식을 확인해주세요."
        ),
    })
  );
