export const APP_NAME = "AeroPlan W&B";
export const APP_VERSION = "v1.0.1";
export const BUILD_DATE = "25.08.2026";
export const DEVELOPER = "Andrey Zubkov";

export function getFullVersionString() {
  return `${APP_NAME} ${APP_VERSION} (${BUILD_DATE}) • Разработчик: ${DEVELOPER}`;
}
