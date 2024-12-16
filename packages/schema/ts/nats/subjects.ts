const projectNamespace = "ficlib.v1.";

export enum Subject {
    UserCreate = projectNamespace + "user.create",
    UserGet = projectNamespace + "user.get",

    AuthCallbackTelegram = projectNamespace + "telegram-login-callback",
}
