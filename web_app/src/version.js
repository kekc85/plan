export const APP_NAME = "AeroPlan W&B";
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : "v1.0.168";
export const BUILD_DATE = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : "22.09.2026";
export const DEVELOPER = "Andrey Zubkov";

export function getFullVersionString() {
  return `${APP_NAME} ${APP_VERSION} (${BUILD_DATE}) • Разработчик: ${DEVELOPER}`;
}
